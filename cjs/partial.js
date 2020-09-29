'use strict';
module.exports = html => {
  const template = [];
  const values = [];
  const {length} = html;
  let s = 0, e = 0, p = 0;
  while (
    s < length &&
    -1 < (s = html.indexOf('{{', p)) &&
    -1 < (e = html.indexOf('}}', s + 2))
  ) {
    template.push(html.slice(p, s));
    values.push(html.slice(s + 2, e));
    p = e + 2;
  }
  template.push(html.slice(p));
  const args = [template];
  const rest = Function(
    'return function(){with(arguments[0])return[' + values + ']}'
  )();
  return (self, object) => args.concat(rest.call(self, object));
};
