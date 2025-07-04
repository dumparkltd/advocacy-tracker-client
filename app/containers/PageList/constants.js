import {
  API,
  ROUTES,
  USER_ROLES,
  ATTRIBUTE_STATUSES,
} from 'themes/config';

// specify the filter and query  options
export const DEPENDENCIES = [
  API.PAGES,
  API.USER_ROLES,
];

export const CONFIG = {
  types: 'pages',
  serverPath: API.PAGES,
  clientPath: ROUTES.PAGES,
  views: {
    list: {
      search: ['title', 'description'],
    },
  },
  attributes: { // filter by attribute value
    options: [
      {
        search: false,
        message: 'attributes.draft',
        attribute: 'draft',
        options: ATTRIBUTE_STATUSES.draft,
        role: USER_ROLES.MEMBER.value,
        filterUI: 'checkboxes',
      },
      {
        search: false,
        message: 'attributes.private',
        attribute: 'private',
        options: ATTRIBUTE_STATUSES.private,
        role: USER_ROLES.MEMBER.value,
        roleEdit: USER_ROLES.ADMIN.value,
        filterUI: 'checkboxes',
      },
    ],
  },
};
