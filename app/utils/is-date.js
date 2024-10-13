export default function isDate(test) {
  /* eslint-disable no-restricted-globals */
  return new Date(test) instanceof Date && !isNaN(new Date(test));
}
