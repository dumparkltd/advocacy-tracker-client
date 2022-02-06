// These are the pages you can go to.
// They are all wrapped in the App component, which should contain the navbar etc
// See http://blog.mxstbr.com/2016/01/react-apps-with-pages for more information
// about the code splitting business
import { getAsyncInjectors } from 'utils/asyncInjectors';
import { getRedirects } from 'utils/redirects';

import { ROUTES, USER_ROLES, DEFAULT_TAXONOMY } from 'themes/config';

const errorLoading = (err) => {
  console.error('Dynamic page loading failed', err); // eslint-disable-line no-console
};

const loadModule = (cb) => (componentModule) => {
  cb(null, componentModule.default);
};

export default function createRoutes(store) {
  // Create reusable async injectors using getAsyncInjectors factory
  const { injectReducer, injectSagas } = getAsyncInjectors(store); // eslint-disable-line no-unused-vars
  const {
    redirectIfSignedIn,
    redirectIfNotSignedIn,
    redirectIfNotPermitted,
    redirect,
  } = getRedirects(store);

  return [
    {
      path: '/',
      name: 'home',
      onEnter: redirectIfSignedIn(ROUTES.ACTIONS),
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/HomePage'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: ROUTES.LOGOUT,
      name: 'userLogout',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/UserLogout'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: ROUTES.LOGIN,
      name: 'userLogin',
      onEnter: redirectIfSignedIn(),
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/UserLogin/reducer'),
          import('containers/UserLogin/sagas'),
          import('containers/UserLogin'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([reducer, sagas, component]) => {
          injectReducer('userLogin', reducer.default);
          injectSagas(sagas.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: ROUTES.REGISTER,
      name: 'userRegister',
      onEnter: redirectIfSignedIn(),
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/UserRegister/reducer'),
          import('containers/UserRegister/sagas'),
          import('containers/UserRegister'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([reducer, sagas, component]) => {
          injectReducer('userRegister', reducer.default);
          injectSagas(sagas.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: ROUTES.USERS,
      name: 'userList',
      onEnter: redirectIfNotPermitted(USER_ROLES.MANAGER.value),
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/UserList'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: ROUTES.BOOKMARKS,
      name: 'bookmarkList',
      onEnter: redirectIfNotSignedIn(),
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/BookmarkList/sagas'),
          import('containers/BookmarkList'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([sagas, component]) => {
          injectSagas(sagas.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: `${ROUTES.USERS}${ROUTES.ID}`,
      name: 'userView',
      onEnter: redirectIfNotSignedIn(),
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/UserView'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: `${ROUTES.USERS}${ROUTES.EDIT}${ROUTES.ID}`,
      name: 'userEdit',
      onEnter: redirectIfNotSignedIn(),
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/UserEdit/reducer'),
          import('containers/UserEdit/sagas'),
          import('containers/UserEdit'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([reducer, sagas, component]) => {
          injectReducer('userEdit', reducer.default);
          injectSagas(sagas.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: `${ROUTES.USERS}${ROUTES.PASSWORD}${ROUTES.ID}`,
      name: 'userPassword',
      onEnter: redirectIfNotSignedIn(),
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/UserPassword/reducer'),
          import('containers/UserPassword/sagas'),
          import('containers/UserPassword'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([reducer, sagas, component]) => {
          injectReducer('userPassword', reducer.default);
          injectSagas(sagas.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: `${ROUTES.ACTIONS}${ROUTES.IMPORT}`,
      name: 'actionImport',
      onEnter: redirectIfNotPermitted(USER_ROLES.MANAGER.value),
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/ActionImport/reducer'),
          import('containers/ActionImport/sagas'),
          import('containers/ActionImport'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([reducer, sagas, component]) => {
          injectReducer('actionImport', reducer.default);
          injectSagas(sagas.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      // ROUTES.ID: actiontype, ROUTES.VIEW: map, list or stats
      path: `${ROUTES.ACTIONS}${ROUTES.ID}`,
      name: 'actionListForType',
      onEnter: redirectIfNotPermitted(USER_ROLES.ANALYST.value),
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/ActionList'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: ROUTES.ACTIONS,
      name: 'actiontypes',
      onEnter: redirectIfNotPermitted(USER_ROLES.ANALYST.value),
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/ActionsOverview'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: `${ROUTES.ACTIONS}${ROUTES.ID}${ROUTES.NEW}`, // the type id
      name: 'actionNew',
      onEnter: redirectIfNotPermitted(USER_ROLES.MANAGER.value),
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/ActionNew/reducer'),
          import('containers/ActionNew/sagas'),
          import('containers/ActionNew'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([reducer, sagas, component]) => {
          injectReducer('actionNew', reducer.default);
          injectSagas(sagas.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: `${ROUTES.ACTION}${ROUTES.ID}`,
      name: 'actionView',
      onEnter: redirectIfNotPermitted(USER_ROLES.ANALYST.value),
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/ActionView'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: `${ROUTES.ACTION}${ROUTES.EDIT}${ROUTES.ID}`,
      name: 'actionEdit',
      onEnter: redirectIfNotPermitted(USER_ROLES.MANAGER.value),
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/ActionEdit/reducer'),
          import('containers/ActionEdit/sagas'),
          import('containers/ActionEdit'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([reducer, sagas, component]) => {
          injectReducer('actionEdit', reducer.default);
          injectSagas(sagas.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: `${ROUTES.ACTORS}`,
      name: 'actortypes',
      onEnter: redirectIfNotPermitted(USER_ROLES.ANALYST.value),
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/ActorsOverview'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: `${ROUTES.ACTORS}${ROUTES.IMPORT}`,
      name: 'actorImport',
      onEnter: redirectIfNotPermitted(USER_ROLES.MANAGER.value),
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/ActorImport/reducer'),
          import('containers/ActorImport/sagas'),
          import('containers/ActorImport'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([reducer, sagas, component]) => {
          injectReducer('actorImport', reducer.default);
          injectSagas(sagas.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: `${ROUTES.ACTORS}${ROUTES.ID}`,
      name: 'actorListForType',
      onEnter: redirectIfNotPermitted(USER_ROLES.ANALYST.value),
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/ActorList'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: `${ROUTES.ACTORS}${ROUTES.ID}${ROUTES.NEW}`, // the type id
      name: 'actorNew',
      onEnter: redirectIfNotPermitted(USER_ROLES.MANAGER.value),
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/ActorNew/reducer'),
          import('containers/ActorNew/sagas'),
          import('containers/ActorNew'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([reducer, sagas, component]) => {
          injectReducer('actorNew', reducer.default);
          injectSagas(sagas.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: `${ROUTES.ACTOR}${ROUTES.ID}`,
      name: 'actorView',
      onEnter: redirectIfNotPermitted(USER_ROLES.ANALYST.value),
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/ActorView'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: `${ROUTES.ACTOR}${ROUTES.EDIT}${ROUTES.ID}`,
      name: 'actorEdit',
      onEnter: redirectIfNotPermitted(USER_ROLES.MANAGER.value),
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/ActorEdit/reducer'),
          import('containers/ActorEdit/sagas'),
          import('containers/ActorEdit'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([reducer, sagas, component]) => {
          injectReducer('actorEdit', reducer.default);
          injectSagas(sagas.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: `${ROUTES.RESOURCES}${ROUTES.IMPORT}`,
      name: 'resourceImport',
      onEnter: redirectIfNotPermitted(USER_ROLES.MANAGER.value),
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/ResourceImport/reducer'),
          import('containers/ResourceImport/sagas'),
          import('containers/ResourceImport'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([reducer, sagas, component]) => {
          injectReducer('resourceImport', reducer.default);
          injectSagas(sagas.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: ROUTES.RESOURCES,
      name: 'resources',
      onEnter: redirectIfNotPermitted(USER_ROLES.ANALYST.value),
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/ResourcesOverview'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: `${ROUTES.RESOURCES}${ROUTES.ID}`,
      name: 'resourceListForType',
      onEnter: redirectIfNotPermitted(USER_ROLES.ANALYST.value),
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/ResourceList'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: `${ROUTES.RESOURCES}${ROUTES.ID}${ROUTES.NEW}`, // the type id
      name: 'resourceNew',
      onEnter: redirectIfNotPermitted(USER_ROLES.MANAGER.value),
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/ResourceNew/reducer'),
          import('containers/ResourceNew/sagas'),
          import('containers/ResourceNew'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([reducer, sagas, component]) => {
          injectReducer('resourceNew', reducer.default);
          injectSagas(sagas.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: `${ROUTES.RESOURCE}${ROUTES.ID}`,
      name: 'resourceView',
      onEnter: redirectIfNotPermitted(USER_ROLES.ANALYST.value),
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/ResourceView'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: `${ROUTES.RESOURCE}${ROUTES.EDIT}${ROUTES.ID}`,
      name: 'resourceEdit',
      onEnter: redirectIfNotPermitted(USER_ROLES.MANAGER.value),
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/ResourceEdit/reducer'),
          import('containers/ResourceEdit/sagas'),
          import('containers/ResourceEdit'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([reducer, sagas, component]) => {
          injectReducer('resourceEdit', reducer.default);
          injectSagas(sagas.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: `${ROUTES.INDICATORS}${ROUTES.IMPORT}`,
      name: 'indicatorImport',
      onEnter: redirectIfNotPermitted(USER_ROLES.MANAGER.value),
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/IndicatorImport/reducer'),
          import('containers/IndicatorImport/sagas'),
          import('containers/IndicatorImport'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([reducer, sagas, component]) => {
          injectReducer('indicatorImport', reducer.default);
          injectSagas(sagas.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      // ROUTES.ID: actiontype, ROUTES.VIEW: map, list or stats
      path: ROUTES.INDICATORS,
      name: 'indicators',
      onEnter: redirectIfNotPermitted(USER_ROLES.ANALYST.value),
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/IndicatorList'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: `${ROUTES.INDICATORS}${ROUTES.NEW}`, // no type id
      name: 'indicatorNew',
      onEnter: redirectIfNotPermitted(USER_ROLES.MANAGER.value),
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/IndicatorNew/reducer'),
          import('containers/IndicatorNew/sagas'),
          import('containers/IndicatorNew'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([reducer, sagas, component]) => {
          injectReducer('indicatorNew', reducer.default);
          injectSagas(sagas.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: `${ROUTES.INDICATOR}${ROUTES.ID}`,
      name: 'indicatorView',
      onEnter: redirectIfNotPermitted(USER_ROLES.ANALYST.value),
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/IndicatorView'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: `${ROUTES.INDICATOR}${ROUTES.EDIT}${ROUTES.ID}`,
      name: 'indicatorEdit',
      onEnter: redirectIfNotPermitted(USER_ROLES.MANAGER.value),
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/IndicatorEdit/reducer'),
          import('containers/IndicatorEdit/sagas'),
          import('containers/IndicatorEdit'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([reducer, sagas, component]) => {
          injectReducer('indicatorEdit', reducer.default);
          injectSagas(sagas.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: `${ROUTES.TAXONOMIES}`, // the taxonomy id
      name: 'categoryList',
      onEnter: redirect(`${ROUTES.TAXONOMIES}/${DEFAULT_TAXONOMY}`),
    }, {
      path: `${ROUTES.TAXONOMIES}${ROUTES.ID}`, // the taxonomy id
      name: 'categoryList',
      onEnter: redirectIfNotPermitted(USER_ROLES.MANAGER.value, ROUTES.ACTIONS),
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/CategoryList/sagas'),
          import('containers/CategoryList'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([sagas, component]) => {
          injectSagas(sagas.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: `${ROUTES.TAXONOMIES}${ROUTES.ID}${ROUTES.NEW}`, // the taxonomy id
      name: 'categoryNew',
      onEnter: redirectIfNotPermitted(USER_ROLES.MANAGER.value),
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/CategoryNew/reducer'),
          import('containers/CategoryNew/sagas'),
          import('containers/CategoryNew'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([reducer, sagas, component]) => {
          injectReducer('categoryNew', reducer.default);
          injectSagas(sagas.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: `${ROUTES.CATEGORY}${ROUTES.ID}`,
      name: 'categoryView',
      onEnter: redirectIfNotPermitted(USER_ROLES.ANALYST.value),
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/CategoryView'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: `${ROUTES.CATEGORY}${ROUTES.EDIT}${ROUTES.ID}`,
      name: 'categoryEdit',
      onEnter: redirectIfNotPermitted(USER_ROLES.MANAGER.value),
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/CategoryEdit/reducer'),
          import('containers/CategoryEdit/sagas'),
          import('containers/CategoryEdit'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([reducer, sagas, component]) => {
          injectReducer('categoryEdit', reducer.default);
          injectSagas(sagas.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: ROUTES.PAGES,
      name: 'pageList',
      onEnter: redirectIfNotPermitted(USER_ROLES.ANALYST.value),
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/PageList'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: `${ROUTES.PAGES}${ROUTES.NEW}`,
      name: 'pageNew',
      onEnter: redirectIfNotPermitted(USER_ROLES.ADMIN.value),
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/PageNew/reducer'),
          import('containers/PageNew/sagas'),
          import('containers/PageNew'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([reducer, sagas, component]) => {
          injectReducer('pageNew', reducer.default);
          injectSagas(sagas.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: `${ROUTES.PAGES}${ROUTES.ID}`,
      onEnter: redirectIfNotPermitted(USER_ROLES.ANALYST.value),
      name: 'pageView',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/PageView'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: `${ROUTES.PAGES}${ROUTES.EDIT}${ROUTES.ID}`,
      name: 'pageEdit',
      onEnter: redirectIfNotPermitted(USER_ROLES.ADMIN.value),
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/PageEdit/reducer'),
          import('containers/PageEdit/sagas'),
          import('containers/PageEdit'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([reducer, sagas, component]) => {
          injectReducer('pageEdit', reducer.default);
          injectSagas(sagas.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: ROUTES.SEARCH,
      name: 'search',
      onEnter: redirectIfNotPermitted(USER_ROLES.ANALYST.value),
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/Search/sagas'),
          import('containers/Search'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([sagas, component]) => {
          injectSagas(sagas.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: ROUTES.UNAUTHORISED,
      name: 'unauthorised',
      getComponent(nextState, cb) {
        import('containers/Unauthorised')
          .then(loadModule(cb))
          .catch(errorLoading);
      },
    }, {
      path: '*',
      name: 'notfound',
      getComponent(nextState, cb) {
        import('containers/NotFoundPage')
          .then(loadModule(cb))
          .catch(errorLoading);
      },
    },
  ];
}
