
import { fromJS } from 'immutable';

export const FORM_INITIAL = fromJS({
  attributes: {
    draft: true,
    measuretype_id: '',
    actortype_id: '',
    resourcetype_id: '',
    taxonomy_id: '',
    manager_id: '',
    parent_id: '',
    title: '',
    code: '',
    description: '',
    comment: '',
    status: '',
    url: '',
    date_start: '',
    date_end: '',
    date_comment: '',
    publication_date: '',
    access_date: '',
    target_comment: '',
    status_comment: '',
    activity_summary: '',
    short_title: '',
  },
});
