
import { fromJS } from 'immutable';

export const FORM_INITIAL = fromJS({
  attributes: {
    draft: true,
    private: false,
    is_archive: false,
  },
});
