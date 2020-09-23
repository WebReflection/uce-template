#!/usr/bin/env node

const {readFileSync} = require('fs');

const {minify} = require('html-minifier-terser');
const {minify: terser} = require('terser');
const {minify: csso} = require('csso');

const options = {
  collapseBooleanAttributes: true,
  collapseWhitespace: true,
  preserveLineBreaks: true,
  html5: true,
  keepClosingSlash: true,
  removeAttributeQuotes: true,
  removeComments: true,
  minifyJS(text) {
    const expression = /^\{\{/.test(text);
    if (expression)
      text = `this['💩']=${text.replace(/(?:^\{\{|\}\}$)/g, '')}`;
    text = terser(text).code;
    if (expression)
      text = text.replace(/(?:^this[^=]+?=|;$)/g, '');
    return expression ?
            `{{${text}}}` :
            (text.replace(/\b(import|export)\b/g, '\n$1') + '\n');
  },
  minifyCSS(text) {
    text = csso(text).css;
    return text;
  }
};

const content = readFileSync(0, 'utf-8').toString().trim();
const outcome = minify(content, options);
process.stdout.write(outcome);
