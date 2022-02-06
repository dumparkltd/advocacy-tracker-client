/*
 *
 * CategoryView
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';

import {
  getTitleField,
  getCategoryShortTitleField,
  getStatusField,
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
} from 'utils/fields';

import {
  getEntityTitle,
  getEntityTitleTruncated,
  getEntityReference,
} from 'utils/entities';

// import qe from 'utils/quasi-equals';

import { loadEntitiesIfNeeded, updatePath, closeEntity } from 'containers/App/actions';

import { CONTENT_SINGLE } from 'containers/App/constants';
import { ROUTES } from 'themes/config';

import Loading from 'components/Loading';
import Content from 'components/Content';
import ContentHeader from 'components/ContentHeader';
import EntityView from 'components/EntityView';

import {
  selectReady,
  selectIsUserManager,
  selectActorConnections,
  selectActionConnections,
  selectTaxonomiesWithCategories,
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

export class CategoryView extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  UNSAFE_componentWillMount() {
    this.props.loadEntitiesIfNeeded();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // reload entities if invalidated
    if (!nextProps.dataReady) {
      this.props.loadEntitiesIfNeeded();
    }
  }

  getHeaderMainFields = (entity, isManager) => {
    const groups = [];
    groups.push(
      { // fieldGroup
        fields: [
          // getReferenceField(entity, isManager),
          getTitleField(entity, isManager),
          getCategoryShortTitleField(entity, isManager),
        ],
      },
    );
    return groups;
  };

  getHeaderAsideFields = (entity, isManager, parentTaxonomy) => {
    const { intl } = this.context;
    const groups = [
      {
        fields: [
          isManager && getStatusField(entity),
          getMetaField(entity),
        ],
      },
    ]; // fieldGroups

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
    return groups.length > 0 ? groups : null;
  }

  getBodyMainFields = (
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

  getBodyAsideFields = (entity, isManager, childTaxonomies) => {
    const fields = [];
    // include children links
    if (childTaxonomies && hasTaxonomyCategories(childTaxonomies)) {
      fields.push({ // fieldGroup
        label: appMessages.entities.taxonomies.children,
        icon: 'categories',
        fields: getTaxonomyFields(childTaxonomies, true),
      });
    }
    const showLink = entity.getIn(['attributes', 'url'])
      && entity.getIn(['attributes', 'url']).trim().length > 0;
    const showDate = entity.getIn(['taxonomy', 'attributes', 'has_date']);
    if (showLink || showDate) {
      fields.push({
        type: 'dark',
        fields: [
          showDate && getDateField(entity, 'date', true),
          showLink && getLinkField(entity),
        ],
      });
    }
    if (isManager && !!entity.getIn(['taxonomy', 'attributes', 'has_manager'])) {
      fields.push({
        type: 'dark',
        fields: [getManagerField(
          entity,
          appMessages.attributes.manager_id.categories,
          appMessages.attributes.manager_id.categoriesEmpty
        )],
      });
    }
    return fields.length > 0 ? fields : null;
  };

  /* eslint-disable react/destructuring-assignment */
  getTaxTitle = (id) => this.context.intl.formatMessage(
    appMessages.entities.taxonomies[id].single
  );
  /* eslint-ensable react/destructuring-assignment */

  render() {
    const { intl } = this.context;
    const {
      viewEntity,
      dataReady,
      isManager,
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
    } = this.props;
    let buttons = [];
    if (dataReady) {
      buttons.push({
        type: 'icon',
        onClick: () => window.print(),
        title: 'Print',
        icon: 'print',
      });
      buttons = isManager
        ? buttons.concat([
          {
            type: 'edit',
            onClick: () => this.props.handleEdit(this.props.params.id),
          },
          {
            type: 'close',
            onClick: () => this.props.handleClose(
              this.props.viewEntity && this.props.viewEntity.getIn(['taxonomy', 'id'])
            ),
          },
        ])
        : buttons.concat([{
          type: 'close',
          onClick: () => this.props.handleClose(
            this.props.viewEntity && this.props.viewEntity.getIn(['taxonomy', 'id'])
          ),
        }]);
    }

    let pageTitle = intl.formatMessage(messages.pageTitle);
    let metaTitle = pageTitle;
    if (
      viewEntity
      && viewEntity.get('taxonomy')
    ) {
      pageTitle = this.getTaxTitle(viewEntity.getIn(['taxonomy', 'id']));
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
    return (
      <div>
        <Helmet
          title={metaTitle}
          meta={[
            { name: 'description', content: intl.formatMessage(messages.metaDescription) },
          ]}
        />
        <Content>
          <ContentHeader
            title={pageTitle}
            type={CONTENT_SINGLE}
            icon="categories"
            buttons={buttons}
          />
          { !dataReady
            && <Loading />
          }
          { !viewEntity && dataReady
            && (
              <div>
                <FormattedMessage {...messages.notFound} />
              </div>
            )
          }
          { viewEntity && dataReady
            && (
              <EntityView
                fields={{
                  header: {
                    main: this.getHeaderMainFields(viewEntity, isManager),
                    aside: this.getHeaderAsideFields(viewEntity, isManager, parentTaxonomy),
                  },
                  body: {
                    main: this.getBodyMainFields(
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
                    aside: this.getBodyAsideFields(
                      viewEntity,
                      isManager,
                      childTaxonomies,
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
}

CategoryView.propTypes = {
  loadEntitiesIfNeeded: PropTypes.func,
  handleEdit: PropTypes.func,
  handleClose: PropTypes.func,
  onEntityClick: PropTypes.func,
  viewEntity: PropTypes.object,
  dataReady: PropTypes.bool,
  params: PropTypes.object,
  isManager: PropTypes.bool,
  parentTaxonomy: PropTypes.object,
  actorsByActortype: PropTypes.object,
  actionsByActiontype: PropTypes.object,
  childActorsByActortype: PropTypes.object,
  childActionsByActiontype: PropTypes.object,
  taxonomies: PropTypes.object,
  childTaxonomies: PropTypes.object,
  actorConnections: PropTypes.object,
  actionConnections: PropTypes.object,
};

CategoryView.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state, props) => ({
  isManager: selectIsUserManager(state),
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
});

function mapDispatchToProps(dispatch) {
  return {
    loadEntitiesIfNeeded: () => {
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
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CategoryView);
