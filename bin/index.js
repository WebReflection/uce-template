#!/usr/bin/env node

'use strict';

const {existsSync, readFileSync, writeFileSync} = require('fs');
const {join, resolve} = require('path');

const {minify} = require('html-minifier-terser');
const {minify: terser} = require('terser');
const {minify: csso} = require('csso');

const {transform: babel} = require('@babel/core');

let BABEL = false;
let DEBUG = false;
let SOURCE = '';
let DEST = '';

for (let {argv} = process, i = 2, {length} = argv; i < length; i++) {
  if (/^-/.test(argv[i])) {
    const equal = argv[i].indexOf('=');
    const key = equal < 0 ? argv[i] : argv[i].slice(0, equal);
    const value = () => equal < 0 ? (++i < length ? argv[i] : '') : argv[i].slice(equal + 1);
    switch (key) {
      case '-h':
      case '--help':
        let version = '';
        try { version = require(join(__dirname, '..', 'package.json')).version }
        catch (o_O) {}
        console.log('');
        console.log(' \x1b[1muce-template\x1b[0m v' + version);
        console.log(' \x1b[2mhttps://github.com/webreflection/uce-template\x1b[0m');
        console.log('');
        console.log(' \x1b[4musage\x1b[0m');
        console.log('');
        console.log('   uce-template [options] file.html');
        console.log('   cat file.html | uce-template [options]');
        console.log('');
        console.log(' \x1b[4moptions\x1b[0m');
        console.log('');
        console.log('   -h --help       this message');
        console.log('   --babel         targets ES5');
        console.log('   --debug         to not minify JS');
        console.log('   -o              output file');
        console.log('');
        process.exit(0);
      case '-o':
        const dest = value();
        if (!dest) {
          console.error('invalid destination path');
          process.exit(1);
        }
        DEST = resolve(process.cwd(), dest);
        break;
      case '--babel':
        BABEL = true;
        break;
      case '--debug':
        DEBUG = true;
        break;
      default:
        console.error('unknown flag ' + key);
        process.exit(1);
        break;
    }
  }
  else {
    if (SOURCE) {
      console.error('multiple sources are not allowed');
      process.exit(1);
    }
    SOURCE = resolve(process.cwd(), argv[i]);
    if (!existsSync(SOURCE)) {
      console.error('unable to parse ' + SOURCE);
      process.exit(1);
    }
  }
}

const scripts = [];

const options = {
  preserveLineBreaks: true,
  collapseBooleanAttributes: true,
  collapseWhitespace: true,
  html5: true,
  keepClosingSlash: true,
  removeAttributeQuotes: true,
  removeComments: true,
  minifyJS(text) {
    return '\x00' + (scripts.push(text) - 1);
  },
  minifyCSS(text) {
    return csso(text).css;
  }
};

const content = readFileSync(SOURCE || 0, 'utf-8').toString().trim();
const outcome = minify(content, options);
const chunks = [];
const re = /\x00(\d+)/g;
let match;
while (match = re.exec(outcome)) {
  const [_, index] = match;
  let text = scripts[index];
  const expression = /^\{\{/.test(text);
  if (expression)
    text = text.replace(/(?:^\{\{|\}\}$)/g, '');
  chunks.push(new Promise($ => {
    if (BABEL)
      text = babel(text, {
        babelrc: false,
        sourceType: 'module',
        presets: ['@babel/preset-env']
      })
      .code.trim()
      .replace(/^(['"])use strict\1;/gm, '').trim()
    ;
    if (DEBUG)
      $(expression ? `{{${text.trim()}}}` : text);
    else {
      terser(text, {mangle: {toplevel: true}, format: {semicolons: false}})
        .then(({code}) => {
          code = code.replace('Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0', '');
          $(expression ? `{{${code.trim()}}}` : code);
        })
        .catch(exit)
      ;
    }
  }));
}

Promise.all(chunks).then(scripts => {
  const result = outcome.replace(re, (_, i) => scripts[i]);
  if (DEST)
    writeFileSync(DEST, result);
  else
    process.stdout.write(result);
});

function exit(error) {
  console.error(error);
  process.exit(1);
}
