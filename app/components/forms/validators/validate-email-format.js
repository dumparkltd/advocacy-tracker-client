// very basic email validation
export default function validateEmailFormat(val) {
  /* eslint-disable no-useless-escape */
  const re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
  return !val || val === '' || re.test(val);
}
