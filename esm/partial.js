export default str => {
  const {length} = str;
  const template = [];
  const values = [];
  const args = [template];
  let start = 0;
  for (let open = false, p = 0, $ = 0, i = 0; i < length; i++) {
    const chunk = str.substr(i, 2);
    if (chunk === '{{') {
      if (!open) {
        open = !open;
        p = 2 + i++;
      }
      $++;
    }
    else if (open && chunk === '}}' && !--$) {
      open = !open;
      template.push(str.slice(start, p - 2));
      values.push(str.slice(p, i));
      start = 2 + i++;
    }
  }
  template.push(str.slice(start));
  const rest = Function(
    'return function(){with(arguments[0])return[' + values + ']}'
  )();
  return object => args.concat(rest(object));
};
