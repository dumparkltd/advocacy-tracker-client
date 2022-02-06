/*
 *
 * ResourceImport constants
 *
 */
import { fromJS } from 'immutable';

export const SAVE = 'impactoss/ResourceImport/SAVE';
export const RESET_FORM = 'impactoss/ResourceImport/RESET_FORM';
export const FORM_INITIAL = fromJS({
  import: null,
});
