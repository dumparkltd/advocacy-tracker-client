import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { palette } from 'styled-theme';
// import { isEqual } from 'lodash/lang';
import { Map } from 'immutable';
import { USER_ROLES, API } from 'themes/config';
import appMessages from 'containers/App/messages';
import { Box } from 'grommet';

import ItemStatus from 'components/ItemStatus';
import EntityListItemMainTop from './EntityListItemMainTop';
import EntityListItemMainTitle from './EntityListItemMainTitle';
import EntityListItemMainBottom from './EntityListItemMainBottom';
import EntityListItemMainTopReference from './EntityListItemMainTopReference';


const Styled = styled((p) => <Box fill="horizontal" gap="small" {...p} />)`
  padding-right: 6px;
  padding-bottom: ${({ inSingleView }) => inSingleView ? 10 : 6}px;
  padding-left: ${({ isManager }) => isManager ? 0 : 6}px;
  padding-top: ${({ theme }) => theme.sizes && theme.sizes.mainListItem.paddingTop}px;
  box-shadow: ${({ inSingleView }) => inSingleView ? '0px 0px 6px 0px rgba(0,0,0,0.1)' : 'none'};
  @media (min-width: ${({ theme }) => theme && theme.breakpoints ? theme.breakpoints.small : '769px'}) {
    padding-right: ${({ theme }) => (!theme.sizes)
    ? 0
    : theme.sizes.mainListItem.paddingHorizontal
}px;
    padding-left: ${({ theme, isManager }) => (!theme.sizes || isManager)
    ? 0
    : theme.sizes.mainListItem.paddingHorizontal
}px;
  }
  @media print {
    box-shadow: none;
    padding-left: 0;
    padding-right: 0;
  }
`;

const EntityListItemMainTitleWrap = styled.a`
  text-decoration: none;
  display: block;
  padding: 0 15px 0 0;
  color: ${palette('mainListItem', 0)};
  &:hover {
    color: ${palette('mainListItemHover', 0)};
  }
  @media print {
    padding: 1px 15px 5px 0;
  }
`;

class EntityListItemMain extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  getConnections = (entity, connectionOptions, connections) => {
    const { intl } = this.context;
    // console.log(connectionOptions)
    // console.log(connections && connections.toJS())
    // console.log(entity && entity.toJS())
    return Object.values(connectionOptions)
      .filter((option) => {
        if (option.path === API.INDICATORS) {
          return !option.listItemHide
            && connections.get(option.path)
            && entity.get(option.entityTypeAs || option.entityType)
            && entity.get(option.entityTypeAs || option.entityType).size > 0;
        }
        return !option.listItemHide
          && connections.get(option.path)
          && entity.get(`${option.entityTypeAs || option.entityType}ByType`)
          && entity.get(`${option.entityTypeAs || option.entityType}ByType`).size > 0;
      })
      .map((option) => {
        if (option.path === API.INDICATORS) {
          const entityConnections = entity.get(option.entityTypeAs || option.entityType).toJS();
          return ({
            groupLabel: intl.formatMessage(appMessages.nav[option.entityTypeAs || option.entityType]),
            connections: {
              option: {
                label: (size, short) => intl
                  && intl.formatMessage(
                    size === 1
                      ? appMessages.entities[option.entityType][short ? 'singleShort' : 'single']
                      : appMessages.entities[option.entityType][short ? 'pluralShort' : 'plural']
                  ),
                style: option.entityType,
                clientPath: option.clientPath,
              },
              entities: Object.values(entityConnections).map(
                (connectionId) => connections.getIn([option.path, connectionId.toString()])
              ),
            },
          });
        }
        const connectionsByType = entity.get(`${option.entityTypeAs || option.entityType}ByType`).toJS();
        return ({
          groupLabel: intl.formatMessage(appMessages.nav[option.entityTypeAs || option.entityType]),
          connectionsByType: Object.keys(connectionsByType)
            .filter((typeId) => Object.keys(connectionsByType[typeId]).length > 0)
            .map((typeId) => {
              const typeentities = connectionsByType[typeId];
              const connectedEntities = Object.values(typeentities).map(
                (connectionId) => connections.getIn([option.path, connectionId.toString()])
              );
              const path = `${option.entityType}_${typeId}`;
              return ({
                option: {
                  label: (size, short) => intl
                    && intl.formatMessage(
                      size === 1
                        ? appMessages.entities[path][short ? 'singleShort' : 'single']
                        : appMessages.entities[path][short ? 'pluralShort' : 'plural']
                    ),
                  style: option.entityType,
                  clientPath: option.clientPath,
                },
                entities: connectedEntities,
              });
            }),
        });
      });
  };

  getRole = (entityRoles, roles) => {
    const role = roles.find((r) => parseInt(r.get('id'), 10) === entityRoles.first());
    // console.log('roles entityRoles.first()', entityRoles.first())
    // console.log('roles role', role)
    return role ? parseInt(role.get('id'), 10) : USER_ROLES.DEFAULT.value;
  }

  getReference = (entity) => entity.getIn(['attributes', 'code']);

  mapToEntityListItem = ({
    config,
    entity,
    connections,
    entityPath,
    // taxonomies,
  }) => {
    const { intl } = this.context;
    const connectedCounts = config && config.connections
      ? this.getConnections(entity, config.connections, connections)
      : [];
    return ({
      id: entity.get('id'),
      title: entity.getIn(['attributes', 'name']) || entity.getIn(['attributes', 'title']),
      reference: this.getReference(entity, config),
      draft: entity.getIn(['attributes', 'draft']),
      role: entity.get('roles') && connections.get('roles') && this.getRole(entity.get('roles'), connections.get('roles')),
      path: (config && config.clientPath) || entityPath,
      categories: entity.get('categories'),
      connectedCounts,
      assignedUser: entity.get('manager') && ({ name: entity.getIn(['manager', 'attributes', 'name']) }),
      targetDate: entity.getIn(['attributes', 'target_date'])
        && intl
        && intl.formatDate(entity.getIn(['attributes', 'target_date'])),
    });
  }

  render() {
    const {
      onEntityClick, taxonomies, inSingleView, url, showCode,
    } = this.props;
    const entity = this.mapToEntityListItem(this.props);
    const hasTop = entity.role;
    const hasBottom = ((entity.categories && entity.categories.size > 0)
      || (this.props.wrapper && entity.connectedCounts && entity.connectedCounts.length > 0));
    return (
      <Styled isManager={this.props.isManager} inSingleView={inSingleView}>
        {hasTop && (
          <EntityListItemMainTop
            entity={entity}
          />
        )}
        <Box direction="row" justify="between">
          <Box>
            <EntityListItemMainTitleWrap
              onClick={(evt) => {
                evt.preventDefault();
                onEntityClick(entity.id, entity.path);
              }}
              href={url || `${entity.path}/${entity.id}`}
            >
              {entity.reference && showCode && (
                <EntityListItemMainTopReference>
                  {entity.reference}
                </EntityListItemMainTopReference>
              )}
              <EntityListItemMainTitle>
                {entity.title}
              </EntityListItemMainTitle>
            </EntityListItemMainTitleWrap>
          </Box>
          {entity.draft && (
            <Box flex={{ shrink: 0 }}>
              <ItemStatus draft={entity.draft} float="none" />
            </Box>
          )}
        </Box>
        {hasBottom && (
          <EntityListItemMainBottom
            connections={entity.connectedCounts}
            wrapper={this.props.wrapper}
            taxonomies={taxonomies}
            categories={entity.categories}
            onEntityClick={onEntityClick}
          />
        )}
      </Styled>
    );
  }
}

EntityListItemMain.propTypes = {
  entity: PropTypes.instanceOf(Map).isRequired, // eslint-disable-line react/no-unused-prop-types
  taxonomies: PropTypes.instanceOf(Map), // eslint-disable-line react/no-unused-prop-types
  connections: PropTypes.instanceOf(Map), // eslint-disable-line react/no-unused-prop-types
  config: PropTypes.object, // eslint-disable-line react/no-unused-prop-types
  entityPath: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
  url: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
  isManager: PropTypes.bool,
  wrapper: PropTypes.object,
  onEntityClick: PropTypes.func,
  inSingleView: PropTypes.bool,
  showCode: PropTypes.bool,
};
EntityListItemMain.contextTypes = {
  intl: PropTypes.object,
};

export default EntityListItemMain;
