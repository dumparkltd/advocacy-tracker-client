/*
 *
 * ActorImport constants
 *
 */
import { fromJS } from 'immutable';

export const SAVE = 'impactoss/ActorImport/SAVE';
export const RESET_FORM = 'impactoss/ActorImport/RESET_FORM';
export const FORM_INITIAL = fromJS({
  import: null,
});
