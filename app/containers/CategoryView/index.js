/*
 *
 * CategoryView
 *
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';

import {
  getTitleField,
  getCategoryShortTitleField,
  getStatusField,
  getStatusFieldIf,
  getMetaField,
  getMarkdownField,
  getLinkField,
  getActionConnectionField,
  // getActionConnectionGroupsField,
  getActorConnectionField,
  // getActorConnectionGroupsField,
  getManagerField,
  getEntityLinkField,
  getTaxonomyFields,
  hasTaxonomyCategories,
  getDateField,
  getReferenceField,
} from 'utils/fields';

import {
  getEntityTitle,
  getEntityTitleTruncated,
  getEntityReference,
} from 'utils/entities';

import { keydownHandlerPrint } from 'utils/print';
import qe from 'utils/quasi-equals';

import {
  loadEntitiesIfNeeded, updatePath, closeEntity, printView,
} from 'containers/App/actions';

import { ROUTES } from 'themes/config';
import { PRINT_TYPES } from 'containers/App/constants';

import Loading from 'components/Loading';
import Content from 'components/Content';
import EntityView from 'components/EntityView';

import {
  selectReady,
  selectIsUserMember,
  selectActorConnections,
  selectActionConnections,
  selectTaxonomiesWithCategories,
  selectIsUserAdmin,
  selectSessionUserId,
} from 'containers/App/selectors';


import appMessages from 'containers/App/messages';
import messages from './messages';

import {
  selectViewEntity,
  selectActorsByType,
  selectActionsByType,
  selectParentTaxonomy,
  selectChildTaxonomies,
  selectChildActorsByType,
  selectChildActionsByType,
} from './selectors';

import { DEPENDENCIES } from './constants';

const getHeaderMainFields = (entity, isMember) => {
  const groups = [];
  groups.push(
    { // fieldGroup
      fields: [
        // getReferenceField(entity, isMember),
        getReferenceField(entity, isMember),
        getTitleField(entity, isMember),
        getCategoryShortTitleField(entity, isMember),
      ],
    },
  );
  return groups;
};
const getHeaderAsideFields = (entity, isMember, isAdmin, isMine, intl) => {
  const groups = isMember
    ? [
      {
        fields: [
          isMember && getStatusField(entity),
          (isAdmin || isMine) && getStatusFieldIf({
            entity,
            attribute: 'private',
          }),
          isAdmin && getStatusFieldIf({
            entity,
            attribute: 'is_archive',
          }),
          getMetaField(entity),
        ],
      },
    ]
    : []; // fieldGroups

  if (
    entity.getIn(['taxonomy', 'attributes', 'tags_users'])
    && entity.getIn(['attributes', 'user_only'])
  ) {
    groups.push({
      type: 'dark',
      fields: [{
        type: 'text',
        value: intl.formatMessage(appMessages.textValues.user_only),
        label: appMessages.attributes.user_only,
      }],
    });
  }
  return groups.length > 0 ? groups : null;
};
const getBodyMainFields = (
  entity,
  taxonomies,
  actorsByActortype,
  actionsByActiontype,
  childActorsByActortype,
  childActionsByActiontype,
  actorConnections,
  actionConnections,
  onEntityClick,
) => {
  // console.log(entity && entity.toJS())
  // console.log(childActorsByActortype && childActorsByActortype.toJS())
  const fields = [];
  // own attributes
  fields.push({
    fields: [getMarkdownField(entity, 'description', true)],
  });
  // connections
  if (!entity.getIn(['attributes', 'user_only'])) {
    // child taxonomies tag actors
    // child categories related actors
    const actorConnectionsLocal = [];
    // show actors of child categories
    if (childActorsByActortype && childActorsByActortype.size > 0) {
      childActorsByActortype.forEach((actors, actortypeid) => {
        actorConnectionsLocal.push(
          getActorConnectionField({
            actors,
            taxonomies,
            onEntityClick,
            connections: actorConnections,
            typeid: actortypeid,
          }),
        );
      });
      // show actors of category
      // } else if (entity.getIn(['taxonomy', 'attributes', 'tags_actors']) && actorsByActortype) {
    } else if (actorsByActortype) {
      actorsByActortype.forEach((actors, actortypeid) => {
        actorConnectionsLocal.push(
          getActorConnectionField({
            actors,
            taxonomies,
            onEntityClick,
            connections: actorConnections,
            typeid: actortypeid,
          }),
        );
      });
    }
    fields.push({
      label: appMessages.nav.actors,
      fields: actorConnectionsLocal,
    });

    const actionConnectionsLocal = [];
    // show actors of child categories
    if (childActionsByActiontype && childActionsByActiontype.size > 0) {
      childActionsByActiontype.forEach((actions, actiontypeid) => {
        actionConnectionsLocal.push(
          getActionConnectionField({
            actions,
            taxonomies,
            onEntityClick,
            connections: actionConnections,
            typeid: actiontypeid,
          }),
        );
      });
      // show actors of category
    } else if (actionsByActiontype) {
      actionsByActiontype.forEach((actions, actiontypeid) => {
        actionConnectionsLocal.push(
          getActionConnectionField({
            actions,
            taxonomies,
            onEntityClick,
            connections: actionConnections,
            typeid: actiontypeid,
          }),
        );
      });
    }
    fields.push({
      label: appMessages.nav.actions,
      fields: actionConnectionsLocal,
    });
  }
  return fields;
};
const getBodyAsideFields = (entity, isMember, childTaxonomies, parentTaxonomy) => {
  const groups = [];
  // include parent link
  if (entity.get('category') && parentTaxonomy) {
    groups.push({
      label: appMessages.entities.taxonomies.parent,
      icon: 'categories',
      fields: [
        getEntityLinkField(
          entity.get('category'),
          ROUTES.CATEGORY,
          '',
          getEntityTitle(parentTaxonomy)
        ),
      ],
    });
  }
  // include children links
  if (childTaxonomies && hasTaxonomyCategories(childTaxonomies)) {
    groups.push({ // fieldGroup
      label: appMessages.entities.taxonomies.children,
      icon: 'categories',
      fields: getTaxonomyFields(childTaxonomies, true),
    });
  }
  const showLink = entity.getIn(['attributes', 'url'])
    && entity.getIn(['attributes', 'url']).trim().length > 0;
  const showDate = entity.getIn(['taxonomy', 'attributes', 'has_date']);
  if (showLink || showDate) {
    groups.push({
      type: 'dark',
      fields: [
        showDate && getDateField(entity, 'date', { showEmpty: true }),
        showLink && getLinkField(entity),
      ],
    });
  }
  if (isMember && !!entity.getIn(['taxonomy', 'attributes', 'has_manager'])) {
    groups.push({
      type: 'dark',
      fields: [getManagerField(
        entity,
        appMessages.attributes.manager_id.categories,
        appMessages.attributes.manager_id.categoriesEmpty
      )],
    });
  }
  return groups.length > 0 ? groups : null;
};
/* eslint-disable react/destructuring-assignment */
const getTaxTitle = (id, intl) => intl.formatMessage(
  appMessages.entities.taxonomies[id].single
);
/* eslint-ensable react/destructuring-assignment */

function CategoryView({
  onLoadEntitiesIfNeeded,
  viewEntity,
  dataReady,
  isMember,
  parentTaxonomy,
  childTaxonomies,
  actionsByActiontype,
  childActionsByActiontype,
  taxonomies,
  onEntityClick,
  actionConnections,
  actorsByActortype,
  childActorsByActortype,
  actorConnections,
  handleEdit,
  handleTypeClick,
  handleClose,
  isAdmin,
  myId,
  onSetPrintView,
  intl,
}) {
  useEffect(() => {
    // kick off loading of data
    onLoadEntitiesIfNeeded();
  }, []);
  const mySetPrintView = () => onSetPrintView({
    printType: PRINT_TYPES.SINGLE,
    printOrientation: 'portrait',
    printSize: 'A4',
  });
  const keydownHandler = (e) => {
    keydownHandlerPrint(e, mySetPrintView);
  };
  useEffect(() => {
    document.addEventListener('keydown', keydownHandler);
    return () => {
      document.removeEventListener('keydown', keydownHandler);
    };
  }, []);

  let buttons = [];
  if (dataReady) {
    if (window.print) {
      buttons = [
        ...buttons,
        {
          type: 'icon',
          onClick: mySetPrintView,
          title: 'Print',
          icon: 'print',
        },
      ];
    }
    if (isMember) {
      buttons = [
        ...buttons,
        {
          type: 'edit',
          onClick: () => handleEdit(viewEntity.get('id')),
        },
      ];
    }
  }

  let pageTitle = intl.formatMessage(messages.pageTitle);
  let metaTitle = pageTitle;
  if (
    viewEntity
    && viewEntity.get('taxonomy')
  ) {
    pageTitle = getTaxTitle(viewEntity.getIn(['taxonomy', 'id']), intl);
    const ref = getEntityReference(viewEntity, false);
    metaTitle = ref
      ? `${pageTitle} ${ref}: ${getEntityTitleTruncated(viewEntity)}`
      : `${pageTitle}: ${getEntityTitleTruncated(viewEntity)}`;
  }
  // console.log('taxonomies', taxonomies && taxonomies.toJS())
  // console.log('actionsByActiontype', actionsByActiontype && actionsByActiontype.toJS())
  // console.log('childActionsByActiontype', childActionsByActiontype && childActionsByActiontype.toJS())
  // console.log('actorsByActortype', actorsByActortype && actorsByActortype.toJS())
  // console.log('childActorsByActortype', childActorsByActortype && childActorsByActortype.toJS())
  // console.log('actortypes', actortypes && actortypes.toJS())
  const isMine = viewEntity && qe(viewEntity.getIn(['attributes', 'created_by_id']), myId);
  return (
    <div>
      <Helmet
        title={metaTitle}
        meta={[
          { name: 'description', content: intl.formatMessage(messages.metaDescription) },
        ]}
      />
      <Content isSingle>
        {!dataReady
          && <Loading />
        }
        {!viewEntity && dataReady
          && (
            <div>
              <FormattedMessage {...messages.notFound} />
            </div>
          )
        }
        {viewEntity && dataReady
          && (
            <EntityView
              header={{
                title: pageTitle,
                onClose: handleClose,
                buttons,
                onTypeClick: viewEntity && isMember
                  ? () => handleTypeClick(viewEntity.getIn(['taxonomy', 'id']))
                  : null,
              }}
              fields={{
                header: {
                  main: getHeaderMainFields(viewEntity, isMember),
                  aside: getHeaderAsideFields(viewEntity, isMember, isAdmin, isMine),
                },
                body: {
                  main: getBodyMainFields(
                    viewEntity,
                    taxonomies,
                    actorsByActortype,
                    actionsByActiontype,
                    childActorsByActortype,
                    childActionsByActiontype,
                    actorConnections,
                    actionConnections,
                    onEntityClick,
                  ),
                  aside: getBodyAsideFields(
                    viewEntity,
                    isMember,
                    childTaxonomies,
                    parentTaxonomy,
                  ),
                },
              }}
            />
          )
        }
      </Content>
    </div>
  );
}

CategoryView.propTypes = {
  onLoadEntitiesIfNeeded: PropTypes.func,
  handleEdit: PropTypes.func,
  handleClose: PropTypes.func,
  onEntityClick: PropTypes.func,
  handleTypeClick: PropTypes.func,
  onSetPrintView: PropTypes.func,
  viewEntity: PropTypes.object,
  dataReady: PropTypes.bool,
  params: PropTypes.object,
  isMember: PropTypes.bool,
  parentTaxonomy: PropTypes.object,
  actorsByActortype: PropTypes.object,
  actionsByActiontype: PropTypes.object,
  childActorsByActortype: PropTypes.object,
  childActionsByActiontype: PropTypes.object,
  taxonomies: PropTypes.object,
  childTaxonomies: PropTypes.object,
  actorConnections: PropTypes.object,
  actionConnections: PropTypes.object,
  isAdmin: PropTypes.bool,
  myId: PropTypes.string,
  intl: intlShape,
};


const mapStateToProps = (state, props) => ({
  isMember: selectIsUserMember(state),
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  viewEntity: selectViewEntity(state, props.params.id),
  taxonomies: selectTaxonomiesWithCategories(state),
  parentTaxonomy: selectParentTaxonomy(state, props.params.id),
  childTaxonomies: selectChildTaxonomies(state, props.params.id),
  actorConnections: selectActorConnections(state),
  actionConnections: selectActionConnections(state),
  actorsByActortype: selectActorsByType(state, props.params.id),
  actionsByActiontype: selectActionsByType(state, props.params.id),
  childActorsByActortype: selectChildActorsByType(state, props.params.id),
  childActionsByActiontype: selectChildActionsByType(state, props.params.id),
  isAdmin: selectIsUserAdmin(state),
  myId: selectSessionUserId(state),
});

function mapDispatchToProps(dispatch) {
  return {
    onLoadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    onEntityClick: (id, path) => {
      dispatch(updatePath(`${path}/${id}`));
    },
    handleEdit: (categoryId) => {
      dispatch(updatePath(`${ROUTES.CATEGORY}${ROUTES.EDIT}/${categoryId}`, { replace: true }));
    },
    handleClose: (taxId) => {
      dispatch(closeEntity(`${ROUTES.TAXONOMIES}/${taxId}`));
    },
    handleTypeClick: (taxId) => {
      dispatch(updatePath(`${ROUTES.TAXONOMIES}/${taxId}`));
    },
    onSetPrintView: (config) => {
      dispatch(printView(config));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(CategoryView));
