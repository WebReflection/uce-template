'use strict';
const {keys} = Object;

const strict = '"use strict;"\n';

Object.defineProperty(exports, '__esModule', {value: true}).default = extras => {
  const args = keys(extras);
  const values = args.map(k => extras[k]);
  return content => {
    const exports = {};
    const module = {exports};
    const params = args.concat('module', 'exports', strict + content);
    const fn = Function.apply(null, params);
    fn.apply(null, values.concat(module, exports));
    return module.exports;
  };
};
