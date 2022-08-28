
import { fromJS } from 'immutable';

export const RESET_FORM = 'impactoss/EntityNew/RESET_FORM';

export const FORM_INITIAL = fromJS({
  attributes: {
    draft: true,
    private: false,
    is_archive: false,
  },
});
