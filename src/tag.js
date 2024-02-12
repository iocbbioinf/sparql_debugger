function idn(strings, ...values) {
  const regexp = new RegExp('\n' + " ".repeat(strings[1].search(/\S|$/) - 1), 'g');
  const indent = '\n' + " ".repeat(parseInt(values[0]));

  return strings.slice(1).map((string, i) => string.replace(regexp, indent) + (values[i + 1] || '')).join('').substring(1);
}


export { idn };
