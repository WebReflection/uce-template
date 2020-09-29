#!/usr/bin/env node

'use strict';

const {promises, readFileSync} = require('fs');
const {join, resolve} = require('path');

const {minify} = require('html-minifier-terser');
const {minify: terser} = require('terser');
const {minify: csso} = require('csso');

const {transform: babel} = require('@babel/core');

const exit = error => {
  console.error(error);
  process.exit(1);
};

const {lstat, mkdir, readdir, readFile, writeFile} = promises;

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
        console.log('   uce-template [options] ./source-dir -o ./dest-dir');
        console.log('');
        console.log(' \x1b[4moptions\x1b[0m');
        console.log('');
        console.log('   -h --help       this message');
        console.log('   --babel         targets ES5');
        console.log('   --debug         does not minify JS');
        console.log('   -o              output file/folder');
        console.log('');
        process.exit(0);
      case '-o':
        const dest = value();
        if (!dest)
          exit('invalid destination path');
        DEST = resolve(process.cwd(), dest);
        break;
      case '--babel':
        BABEL = true;
        break;
      case '--debug':
        DEBUG = true;
        break;
      default:
        exit('unknown flag ' + key);
        break;
    }
  }
  else {
    if (SOURCE)
      exit('multiple sources are not allowed');
    SOURCE = resolve(process.cwd(), argv[i]);
  }
}

const parse = source => lstat(source).then(
  async stats => stats.isDirectory() ?
                  await parseDir(source) :
                  [await parseFile(source)],
  () => exit('unable to parse ' + source)
);

const parseDir = async source => {
  const code = [];
  for (const file of await readdir(source)) {
    if (!/^\./.test(file)) {
      const path = join(source, file);
      if (/\.(?:uce|html?)$/i.test(file))
        code.push(await parseFile(path));
      else {
        const stats = await lstat(path);
        if (stats.isDirectory())
          code.push.apply(code, await parseDir(path));
      }
    }
  }
  return code;
};

const parseFile = source => readFile(source, 'utf-8')
                              .then(transform, exit);

const saveFile = (dest, code) => writeFile(dest, code).catch(exit);

const saveDir = async (source, dest, code) => {
  for (const file of await readdir(source)) {
    if (!/^\./.test(file)) {
      const path = join(source, file);
      if (/\.(?:uce|html?)$/i.test(file)) {
        await mkdir(dest, {recursive: true});
        await saveFile(join(dest, file), code.shift());
      }
      else {
        const stats = await lstat(path);
        if (stats.isDirectory())
          await saveDir(path, join(dest, file), code);
      }
    }
  }
};

const transform = buffer => {
  const re = /\x00(\d+)/g;
  const chunks = [];
  const scripts = [];
  const outcome = minify(buffer.toString().trim(), {
    preserveLineBreaks: true,
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
    html5: true,
    keepClosingSlash: true,
    removeAttributeQuotes: true,
    removeComments: true,
    minifyJS: text => ('\x00' + (scripts.push(text) - 1)),
    minifyCSS: text => csso(text).css
  });
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
  return Promise.all(chunks).then(scripts => outcome.replace(re, (_, i) => scripts[i]));
};

(SOURCE ?
  parse(SOURCE) :
  transform(readFileSync(0, 'utf-8')).then(code => [code])
).then(async code => {
  if (DEST) {
    const stats = await lstat(SOURCE);
    if (stats.isDirectory())
      saveDir(SOURCE, DEST, code);
    else
      saveFile(DEST, code.join('\n\n'));
  }
  else
    process.stdout.write(code.join('\n\n'));
});
