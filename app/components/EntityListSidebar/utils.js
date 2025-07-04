import asList from 'utils/as-list';
import qe from 'utils/quasi-equals';

import { STATES as CHECKBOX } from 'components/forms/IndeterminateCheckbox';

export const optionChecked = (queryValue, value) => !!(
  queryValue
  && asList(queryValue).some(
    (qv) => qe(qv.split('>')[0], value.toString())
  )
);

// attribute checked
export const attributeOptionChecked = (queryValue, value) => !!(
  queryValue
  && queryValue.substr(0, value.length) === value.toString()
);

export const checkedState = (count, length) => {
  if (count === length) {
    return CHECKBOX.CHECKED;
  } if (count < length && count > 0) {
    return CHECKBOX.INDETERMINATE;
  }
  return CHECKBOX.UNCHECKED;
};
