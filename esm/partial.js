const re = /\{\{([^\2]+?)(\}\})/g;
export default html => {
  const template = [];
  const values = [];
  let i = 0, match = null;
  while (match = re.exec(html)) {
    const {index} = match;
    const code = match[1];
    template.push(html.slice(i, index));
    values.push(code);
    i = index + code.length + 4;
  }
  template.push(html.slice(i));
  const args = [template];
  const rest = Function(
    'return function(){with(arguments[0])return[' + values + ']}'
  )();
  return object => args.concat(rest(object));
};

/* this might map brackets in a slightly better way
const map = (str, end, search) => {
  const {length} = search;
  const positions = [];
  let position = 0;
  do {
    position = str.indexOf(search, position);
    if (position < 0)
      position = end;
    else {
      positions.push(position);
      position += length;
    }
  } while (position < end);
  return positions;
};

const {length} = str;
const start = map(str, length, '{{');
const end = map(str, length, '}}');
// */

