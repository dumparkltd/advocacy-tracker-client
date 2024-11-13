/*
 *
 * EntityListDownload
 *
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl, FormattedMessage } from 'react-intl';
import { palette } from 'styled-theme';
import DebounceInput from 'react-debounce-input';
import { snakeCase } from 'lodash/string';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import CsvDownloader from 'react-csv-downloader';

import {
  Box,
  Text,
  ResponsiveContext,
} from 'grommet';

import appMessages from 'containers/App/messages';
import { CONTENT_MODAL } from 'containers/App/constants';
import {
  ACTIONTYPE_ACTORTYPES,
  INDICATOR_ACTIONTYPES,
  ACTIONTYPE_ACTIONTYPES,
  ACTIONTYPE_RESOURCETYPES,
  MEMBERSHIPS,
  USER_ACTIONTYPES,
  USER_ACTORTYPES,
  ACTION_INDICATOR_SUPPORTLEVELS,
} from 'themes/config';
import Content from 'components/Content';
import ContentHeader from 'containers/ContentHeader';
import ButtonForm from 'components/buttons/ButtonForm';
import ButtonSubmit from 'components/buttons/ButtonSubmit';

import Checkbox from 'components/styled/Checkbox';

import { filterEntitiesByKeywords } from 'utils/entities';
import { isMinSize } from 'utils/responsive';

import OptionsForActions from './OptionsForActions';
import OptionsForActors from './OptionsForActors';
import OptionsForIndicators from './OptionsForIndicators';

import messages from './messages';
import {
  prepareDataForActions,
  prepareDataForActors,
  prepareDataForIndicators,
  getAttributes,
  getDateSuffix,
  // getTaxonomies,
} from './utils';


const Footer = styled.div`
  width: 100%;
`;

// color: white;
const StyledButtonCancel = styled(ButtonForm)`
  opacity: 0.9;
  &:hover {
    opacity: 0.8;
  }
`;

const Main = styled.div`
  padding: 0 0 10px;
  margin: 0 0 30px;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    padding: 20px 24px;
    margin: 0 0 50px;
  }
`;

const Select = styled.div`
  width: 20px;
  text-align: center;
  padding-right: 6px;
`;

const TextInput = styled(DebounceInput)`
  background-color: ${palette('background', 0)};
  padding: 3px;
  flex: 1;
  font-size: 0.85em;
  width: 200px;
  border-radius: 0.5em;
  &:focus {
    outline: none;
  }
`;

const StyledInput = styled.input`
  accent-color: ${({ theme }) => theme.global.colors.highlight};
`;

const OptionLabel = styled((p) => <Text as="label" {...p} />)`
  opacity: ${({ disabled }) => disabled ? 0.5 : 1};
`;

export function EntityListDownload({
  typeId,
  config,
  fields,
  entities,
  taxonomies,
  connections,
  onClose,
  typeNames,
  intl,
  isAdmin,
  searchQuery,
  entityIdsSelected,
}) {
  const [typeTitle, setTypeTitle] = useState('entities');
  const [csvFilename, setCSVFilename] = useState('csv');
  const [csvSuffix, setCSVSuffix] = useState(true);
  const [ignoreSearch, setIgnoreSearch] = useState(false);
  const [ignoreSelection, setIgnoreSelection] = useState(false);
  const [includeUsers, setIncludeUsers] = useState(false);
  const [attributes, setAttributes] = useState({});
  const [taxonomyColumns, setTaxonomies] = useState({});
  // for actions
  const [actortypes, setActortypes] = useState({});
  const [actorsAsRows, setActorsAsRows] = useState(false);
  const [indicatorsAsRows, setIndicatorsAsRows] = useState(false);
  const [indicatorsActive, setIndicatorsActive] = useState(false);
  const [parenttypes, setParenttypes] = useState({});
  const [childtypes, setChildtypes] = useState({});
  const [resourcetypes, setResourcetypes] = useState({});
  // for actors
  const [actiontypes, setActiontypes] = useState({});
  const [actionsAsRows, setActionsAsRows] = useState(false);
  const [membertypes, setMembertypes] = useState({});
  const [associationtypes, setAssociationtypes] = useState({});
  // for indicators
  const [includeSupport, setIncludeSupport] = useState(false);
  // figure out export options
  const hasAttributes = !!config.attributes;
  const hasTaxonomies = !!config.taxonomies;
  let hasUsers;
  // check action relationships
  let hasActors;
  let hasIndicators;
  let hasParentActions;
  let hasChildActions;
  let hasResources;

  if (config.types === 'actiontypes') {
    hasActors = config.connections
      && config.connections.actors
      && ACTIONTYPE_ACTORTYPES[typeId]
      && ACTIONTYPE_ACTORTYPES[typeId].length > 0;

    hasIndicators = config.connections
      && config.connections.indicators
      && INDICATOR_ACTIONTYPES.indexOf(typeId) > -1
      && !!connections.get('indicators');

    hasParentActions = config.connections
      && config.connections.parents
      && ACTIONTYPE_ACTIONTYPES[typeId]
      && ACTIONTYPE_ACTIONTYPES[typeId].length > 0;

    hasChildActions = config.connections
      && config.connections.children
      && !!Object.keys(ACTIONTYPE_ACTIONTYPES).find((childtypeId) => {
        const parenttypeIds = ACTIONTYPE_ACTIONTYPES[childtypeId];
        return parenttypeIds.indexOf(typeId) > -1;
      });

    hasResources = config.connections
      && config.connections.resources
      && ACTIONTYPE_RESOURCETYPES[typeId]
      && ACTIONTYPE_RESOURCETYPES[typeId].length > 0;

    hasUsers = isAdmin
      && config.connections
      && config.connections.users
      && USER_ACTIONTYPES.indexOf(typeId) > -1;
  }
  // check actor relationships
  let hasActions;
  let hasMembers;
  let hasAssociations;

  if (config.types === 'actortypes') {
    hasActions = config.connections
      && config.connections.actions
      && !!Object.keys(ACTIONTYPE_ACTORTYPES).find((actiontypeId) => {
        const actiontypeIds = ACTIONTYPE_ACTORTYPES[actiontypeId];
        return actiontypeIds.indexOf(typeId) > -1;
      });

    hasAssociations = config.connections
      && config.connections.associations
      && MEMBERSHIPS[typeId]
      && MEMBERSHIPS[typeId].length > 0;

    hasMembers = config.connections
      && config.connections.members
      && !!Object.keys(MEMBERSHIPS).find((membertypeId) => {
        const membertypeIds = MEMBERSHIPS[membertypeId];
        return membertypeIds.indexOf(typeId) > -1;
      });

    hasUsers = isAdmin
      && config.connections
      && config.connections.users
      && USER_ACTORTYPES.indexOf(typeId) > -1;
  }

  // figure out options for each relationship type
  useEffect(() => {
    // set initial config values
    if (hasAttributes && fields) {
      setAttributes(
        getAttributes({
          typeId, // optional
          fieldAttributes: fields && fields.ATTRIBUTES,
          isAdmin,
          intl,
        })
      );
    }
    if (hasTaxonomies && taxonomies) {
      setTaxonomies(
        taxonomies.map((tax) => {
          const label = intl.formatMessage(appMessages.entities.taxonomies[tax.get('id')].plural);
          return ({
            id: tax.get('id'),
            label,
            active: false,
            column: snakeCase(label),
          });
        }).toJS()
      );
    }
    if (config.types === 'actiontypes') {
      // actors
      if (hasActors && typeNames.actortypes) {
        setActortypes(
          ACTIONTYPE_ACTORTYPES[typeId].reduce((memo, actortypeId) => {
            const label = intl.formatMessage(appMessages.entities[`actors_${actortypeId}`].pluralLong);
            return {
              ...memo,
              [actortypeId]: {
                id: actortypeId,
                label,
                active: false,
                column: `actors_${snakeCase(label)}`,
              },
            };
          }, {})
        );
      }
      // parents
      if (hasParentActions && typeNames.actiontypes) {
        setParenttypes(
          ACTIONTYPE_ACTIONTYPES[typeId].reduce((memo, actiontypeId) => {
            const label = intl.formatMessage(appMessages.entities[`actions_${actiontypeId}`].pluralLong);
            return {
              ...memo,
              [actiontypeId]: {
                id: actiontypeId,
                label,
                active: false,
                column: `parents_${snakeCase(label)}`,
              },
            };
          }, {})
        );
      }
      // children
      if (hasChildActions && typeNames.actiontypes) {
        const childtypeIds = Object.keys(ACTIONTYPE_ACTIONTYPES).filter(
          (childtypeId) => ACTIONTYPE_ACTIONTYPES[childtypeId].indexOf(typeId) > -1
        );
        setChildtypes(
          childtypeIds.reduce((memo, actiontypeId) => {
            const label = intl.formatMessage(appMessages.entities[`actions_${actiontypeId}`].pluralLong);
            return {
              ...memo,
              [actiontypeId]: {
                id: actiontypeId,
                label,
                active: false,
                column: `children_${snakeCase(label)}`,
              },
            };
          }, {})
        );
      }
      // resources
      if (hasResources) {
        setResourcetypes(
          ACTIONTYPE_RESOURCETYPES[typeId].reduce((memo, resourcetypeId) => {
            const label = intl.formatMessage(appMessages.entities[`resources_${resourcetypeId}`].pluralLong);
            return {
              ...memo,
              [resourcetypeId]: {
                id: resourcetypeId,
                label,
                active: false,
                column: `resources_${snakeCase(label)}`,
              },
            };
          }, {})
        );
      }
    }
    if (config.types === 'actortypes') {
      // actions
      if (hasActions && typeNames.actiontypes) {
        const actiontypeIds = Object.keys(ACTIONTYPE_ACTORTYPES).filter(
          (actiontypeId) => ACTIONTYPE_ACTORTYPES[actiontypeId].indexOf(typeId) > -1
        );
        setActiontypes(
          actiontypeIds.reduce((memo, actiontypeId) => {
            const label = intl.formatMessage(appMessages.entities[`actions_${actiontypeId}`].pluralLong);
            return {
              ...memo,
              [actiontypeId]: {
                id: actiontypeId,
                label,
                active: false,
                column: `actions_${snakeCase(label)}`,
              },
            };
          }, {})
        );
      }
      // associations/parents
      if (hasAssociations && typeNames.actortypes) {
        setAssociationtypes(
          MEMBERSHIPS[typeId].reduce((memo, actortypeId) => {
            const label = intl.formatMessage(appMessages.entities[`actors_${actortypeId}`].pluralLong);
            return {
              ...memo,
              [actortypeId]: {
                id: actortypeId,
                label,
                active: false,
                column: `member-of_${snakeCase(label)}`,
              },
            };
          }, {})
        );
      }
      // children
      if (hasMembers && typeNames.actortypes) {
        const membertypeIds = Object.keys(MEMBERSHIPS).filter(
          (membertypeId) => MEMBERSHIPS[membertypeId].indexOf(typeId) > -1
        );
        setMembertypes(
          membertypeIds.reduce((memo, actortypeId) => {
            const label = intl.formatMessage(appMessages.entities[`actors_${actortypeId}`].pluralLong);
            return {
              ...memo,
              [actortypeId]: {
                id: actortypeId,
                label,
                active: false,
                column: `members_${snakeCase(label)}`,
              },
            };
          }, {})
        );
      }
    }
  }, [
    taxonomies,
    hasAttributes,
    hasTaxonomies,
    hasActors,
    hasIndicators,
    hasParentActions,
    hasChildActions,
    hasResources,
    hasActions,
    hasMembers,
    hasAssociations,
  ]);

  const totalCount = entities ? entities.size : 0;
  // check if should keep prefiltered search options
  const hasSearchQuery = !!searchQuery;
  const selectedCount = entityIdsSelected ? entityIdsSelected.size : 0;
  const hasSelectedEntities = entityIdsSelected && selectedCount > 0;
  // filter out list items according to keyword search or selection
  let entitiesToExport = entities;
  if (hasSearchQuery && !ignoreSearch) {
    const searchAttributes = (
      config.views
      && config.views.list
      && config.views.list.search
    ) || ['title'];

    entitiesToExport = filterEntitiesByKeywords(
      entitiesToExport,
      searchQuery,
      searchAttributes,
    );
  }
  if (hasSelectedEntities && !ignoreSelection) {
    entitiesToExport = entitiesToExport.filter((entity) => entityIdsSelected.includes(entity.get('id')));
  }
  const count = entitiesToExport.size;

  // set initial csv file name
  useEffect(() => {
    let title = 'unspecified';
    let tTitle = 'unspecified';
    if (config.types === 'actiontypes') {
      title = intl.formatMessage(appMessages.entities[`actions_${typeId}`].plural);
      tTitle = count !== 1 ? title : intl.formatMessage(appMessages.entities[`actions_${typeId}`].single);
    }
    if (config.types === 'actortypes') {
      title = intl.formatMessage(appMessages.entities[`actors_${typeId}`].plural);
      tTitle = count !== 1 ? title : intl.formatMessage(appMessages.entities[`actors_${typeId}`].single);
    }
    if (config.types === 'indicators') {
      title = intl.formatMessage(appMessages.entities.indicators.plural);
      tTitle = count !== 1 ? title : intl.formatMessage(appMessages.entities.indicators.single);
    }
    setTypeTitle(tTitle);
    setCSVFilename(snakeCase(title));
  }, [count]);

  let relationships = connections;

  // figure out columns
  let csvColumns = [{ id: 'id' }];
  if (hasAttributes && count > 0) {
    csvColumns = Object.keys(attributes).reduce((memo, attKey) => {
      if (attributes[attKey].active) {
        let displayName = attributes[attKey].column;
        if (!displayName || attributes[attKey].column === '') {
          displayName = attKey;
        }
        return [
          ...memo,
          { id: attKey, displayName },
        ];
      }
      return memo;
    }, csvColumns);
  }
  if (hasTaxonomies && count > 0) {
    csvColumns = Object.keys(taxonomyColumns).reduce((memo, taxId) => {
      if (taxonomyColumns[taxId].active) {
        let displayName = taxonomyColumns[taxId].column;
        if (!displayName || taxonomyColumns[taxId].column === '') {
          displayName = taxId;
        }
        return [
          ...memo,
          { id: `taxonomy_${taxId}`, displayName },
        ];
      }
      return memo;
    }, csvColumns);
  }
  let csvData;
  if (entities && count > 0) {
    // for actions ///////////////////////////////////////////////////////////////
    if (config.types === 'actiontypes') {
      if (hasActors) {
        if (!actorsAsRows) {
          csvColumns = Object.keys(actortypes).reduce((memo, actortypeId) => {
            if (actortypes[actortypeId].active) {
              let displayName = actortypes[actortypeId].column;
              if (!displayName || actortypes[actortypeId].column === '') {
                displayName = actortypeId;
              }
              return [
                ...memo,
                { id: `actors_${actortypeId}`, displayName },
              ];
            }
            return memo;
          }, csvColumns);
        } else {
          csvColumns = [
            ...csvColumns,
            { id: 'actor_id', displayName: 'actor_id' },
            { id: 'actortype_id', displayName: 'actor_type' },
            { id: 'actor_code', displayName: 'actor_code' },
            { id: 'actor_title', displayName: 'actor_title' },
          ];
          if (isAdmin) {
            csvColumns = [
              ...csvColumns,
              { id: 'actor_draft', displayName: 'actor_draft' },
              { id: 'actor_private', displayName: 'actor_private' },
            ];
          }
        }
      }
      if (hasParentActions) {
        relationships = relationships.set('parents', relationships.get('measures'));

        csvColumns = Object.keys(parenttypes).reduce((memo, parenttypeId) => {
          if (parenttypes[parenttypeId].active) {
            let displayName = parenttypes[parenttypeId].column;
            if (!displayName || parenttypes[parenttypeId].column === '') {
              displayName = parenttypeId;
            }
            return [
              ...memo,
              { id: `parents_${parenttypeId}`, displayName },
            ];
          }
          return memo;
        }, csvColumns);
      }
      if (hasChildActions) {
        relationships = relationships.set('children', relationships.get('measures'));
        csvColumns = Object.keys(childtypes).reduce((memo, childtypeId) => {
          if (childtypes[childtypeId].active) {
            let displayName = childtypes[childtypeId].column;
            if (!displayName || childtypes[childtypeId].column === '') {
              displayName = childtypeId;
            }
            return [
              ...memo,
              { id: `children_${childtypeId}`, displayName },
            ];
          }
          return memo;
        }, csvColumns);
      }
      if (hasResources) {
        csvColumns = Object.keys(resourcetypes).reduce((memo, resourcetypeId) => {
          if (resourcetypes[resourcetypeId].active) {
            let displayName = resourcetypes[resourcetypeId].column;
            if (!displayName || resourcetypes[resourcetypeId].column === '') {
              displayName = resourcetypeId;
            }
            return [
              ...memo,
              { id: `resources_${resourcetypeId}`, displayName },
            ];
          }
          return memo;
        }, csvColumns);
      }
      if (hasIndicators && indicatorsActive) {
        if (!indicatorsAsRows) {
          const indicatorColumns = relationships
            && relationships.get('indicators')
            && relationships.get('indicators').reduce((memo, indicator) => {
              let displayName = 'position_topic_';
              if (indicator.getIn(['attributes', 'code']) && indicator.getIn(['attributes', 'code']).trim() !== '') {
                displayName += indicator.getIn(['attributes', 'code']);
              } else {
                displayName += indicator.get('id');
              }
              if (indicator.getIn(['attributes', 'draft'])) {
                displayName += '_DRAFT';
              }
              if (indicator.getIn(['attributes', 'private'])) {
                displayName += '_PRIVATE';
              }
              return [
                ...memo,
                {
                  id: `indicator_${indicator.get('id')}`,
                  displayName,
                },
              ];
            }, []);
          csvColumns = [
            ...csvColumns,
            ...indicatorColumns,
          ];
        } else {
          csvColumns = [
            ...csvColumns,
            { id: 'indicator_id', displayName: 'topic_id' },
            { id: 'indicator_code', displayName: 'topic_code' },
            { id: 'indicator_title', displayName: 'topic_title' },
            { id: 'indicator_supportlevel', displayName: 'topic_position' },
          ];
          if (isAdmin) {
            csvColumns = [
              ...csvColumns,
              { id: 'indicator_draft', displayName: 'topic_draft' },
              { id: 'indicator_private', displayName: 'topic_private' },
            ];
          }
        }
      }
      if (hasUsers && includeUsers) {
        csvColumns = [
          ...csvColumns,
          { id: 'users', displayName: 'assigned_users' },
        ];
      }
      csvData = prepareDataForActions({
        entities: entitiesToExport,
        relationships,
        attributes,
        taxonomies,
        taxonomyColumns,
        typeNames,
        hasActors,
        actorsAsRows,
        actortypes,
        hasParentActions,
        parenttypes,
        hasChildActions,
        childtypes,
        hasResources,
        resourcetypes,
        hasIndicators: hasIndicators && indicatorsActive,
        indicatorsAsRows,
        hasUsers: hasUsers && includeUsers,
      });
    }
    // for actors ///////////////////////////////////////////////////////////////
    if (config.types === 'actortypes') {
      if (hasActions) {
        if (!actionsAsRows) {
          csvColumns = Object.keys(actiontypes).reduce((memo, actiontypeId) => {
            if (actiontypes[actiontypeId].active) {
              let displayName = actiontypes[actiontypeId].column;
              if (!displayName || actiontypes[actiontypeId].column === '') {
                displayName = actiontypeId;
              }
              return [
                ...memo,
                { id: `actions_${actiontypeId}`, displayName },
              ];
            }
            return memo;
          }, csvColumns);
        } else {
          csvColumns = [
            ...csvColumns,
            { id: 'action_id', displayName: 'action_id' },
            { id: 'actiontype_id', displayName: 'action_type' },
            { id: 'action_code', displayName: 'action_code' },
            { id: 'action_title', displayName: 'action_title' },
          ];
          if (isAdmin) {
            csvColumns = [
              ...csvColumns,
              { id: 'action_draft', displayName: 'action_draft' },
              { id: 'action_private', displayName: 'action_private' },
            ];
          }
        }
      }
      if (hasAssociations) {
        relationships = relationships.set('associations', relationships.get('actors'));
        csvColumns = Object.keys(associationtypes).reduce((memo, actortypeId) => {
          if (associationtypes[actortypeId].active) {
            let displayName = associationtypes[actortypeId].column;
            if (!displayName || associationtypes[actortypeId].column === '') {
              displayName = actortypeId;
            }
            return [
              ...memo,
              { id: `associations_${actortypeId}`, displayName },
            ];
          }
          return memo;
        }, csvColumns);
      }
      if (hasMembers) {
        relationships = relationships.set('members', relationships.get('actors'));
        csvColumns = Object.keys(membertypes).reduce((memo, actortypeId) => {
          if (membertypes[actortypeId].active) {
            let displayName = membertypes[actortypeId].column;
            if (!displayName || membertypes[actortypeId].column === '') {
              displayName = actortypeId;
            }
            return [
              ...memo,
              { id: `members_${actortypeId}`, displayName },
            ];
          }
          return memo;
        }, csvColumns);
      }
      if (hasUsers && includeUsers) {
        csvColumns = [
          ...csvColumns,
          { id: 'users', displayName: 'assigned_users' },
        ];
      }
      csvData = prepareDataForActors({
        entities: entitiesToExport,
        relationships,
        attributes,
        taxonomies,
        taxonomyColumns,
        typeNames,
        hasActions,
        actionsAsRows,
        actiontypes,
        hasAssociations,
        associationtypes,
        hasMembers,
        membertypes,
        hasUsers: hasUsers && includeUsers,
      });
    }
    if (config.types === 'indicators') {
      if (includeSupport) {
        const supportColumns = Object.values(ACTION_INDICATOR_SUPPORTLEVELS).reduce((memo, level) => {
          if (level.value === '0') {
            return memo;
          }
          return [
            ...memo,
            {
              id: `support_level_${level.value}`,
              displayName: `no_countries_support_${level.value}`,
            },
          ];
        }, []);
        csvColumns = [
          ...csvColumns,
          { id: 'statement_count', displayName: 'no_statements' },
          ...supportColumns,
        ];
      }
      csvData = prepareDataForIndicators({
        entities: entitiesToExport,
        relationships,
        attributes,
        includeSupport,
      });
    }
  }
  const csvDateSuffix = `_${getDateSuffix()}`;
  const size = React.useContext(ResponsiveContext);
  return (
    <Content inModal>
      <ContentHeader
        title={intl.formatMessage(messages.downloadCsvTitle)}
        type={CONTENT_MODAL}
        buttons={[{
          type: 'cancel',
          onClick: () => onClose(),
        }]}
      />
      <Main margin={{ bottom: 'large' }}>
        <Box margin={{ bottom: 'small' }}>
          <Text size="xxlarge" weight={700}>
            {count > 0 && (
              <FormattedMessage {...messages.exportAsTitle} values={{ typeTitle, count }} />
            )}
            {count === 0 && (
              <FormattedMessage {...messages.exportAsTitleNone} values={{ typeTitle }} />
            )}
          </Text>
        </Box>
        {(hasSearchQuery || hasSelectedEntities) && (
          <Box margin={{ bottom: 'large' }}>
            {hasSearchQuery && (
              <Box direction="row" align="center" fill={false}>
                <Box direction="row" align="center">
                  <Select>
                    <Checkbox
                      id="check-filter-keyword"
                      checked={ignoreSearch}
                      onChange={(evt) => setIgnoreSearch(evt.target.checked)}
                    />
                  </Select>
                </Box>
                <Text size="small" as="label" htmlFor="check-filter-keyword">
                  <FormattedMessage {...messages.ignoreKeyword} values={{ searchQuery }} />
                </Text>
              </Box>
            )}
            {hasSelectedEntities && (
              <Box direction="row" align="center" fill={false}>
                <Box direction="row" align="center">
                  <Select>
                    <Checkbox
                      id="check-filter-selection"
                      checked={ignoreSelection}
                      onChange={(evt) => setIgnoreSelection(evt.target.checked)}
                    />
                  </Select>
                </Box>
                <Text size="small" as="label" htmlFor="check-filter-selection">
                  <FormattedMessage {...messages.ignoreSelected} values={{ selectedCount, totalCount }} />
                </Text>
              </Box>
            )}
          </Box>
        )}
        {count > 0 && (
          <>
            <Box margin={{ bottom: 'large' }} gap="small">
              <Text>
                <FormattedMessage {...messages.exportDescription} />
              </Text>
            </Box>
            {config.types === 'actiontypes' && (
              <OptionsForActions
                typeTitle={typeTitle}
                hasActors={hasActors}
                hasParentActions={hasParentActions}
                hasChildActions={hasChildActions}
                hasResources={hasResources}
                hasUsers={hasUsers}
                hasIndicators={hasIndicators}
                hasAttributes={hasAttributes}
                hasTaxonomies={hasTaxonomies}
                actorsAsRows={actorsAsRows}
                setActorsAsRows={setActorsAsRows}
                indicatorsAsRows={indicatorsAsRows}
                setIndicatorsAsRows={setIndicatorsAsRows}
                indicatorsActive={indicatorsActive}
                setIndicatorsActive={setIndicatorsActive}
                includeUsers={includeUsers}
                setIncludeUsers={setIncludeUsers}
                attributes={attributes}
                setAttributes={setAttributes}
                taxonomyColumns={taxonomyColumns}
                setTaxonomies={setTaxonomies}
                actortypes={actortypes}
                setActortypes={setActortypes}
                parenttypes={parenttypes}
                setParenttypes={setParenttypes}
                childtypes={childtypes}
                setChildtypes={setChildtypes}
                resourcetypes={resourcetypes}
                setResourcetypes={setResourcetypes}
              />
            )}
            {config.types === 'actortypes' && (
              <OptionsForActors
                typeTitle={typeTitle}
                hasActions={hasActions}
                actionsAsRows={actionsAsRows}
                setActionsAsRows={setActionsAsRows}
                actiontypes={actiontypes}
                setActiontypes={setActiontypes}
                hasMembers={hasMembers}
                membertypes={membertypes}
                setMembertypes={setMembertypes}
                hasAssociations={hasAssociations}
                associationtypes={associationtypes}
                setAssociationtypes={setAssociationtypes}
                hasUsers={hasUsers}
                includeUsers={includeUsers}
                setIncludeUsers={setIncludeUsers}
                hasAttributes={hasAttributes}
                attributes={attributes}
                setAttributes={setAttributes}
                hasTaxonomies={hasTaxonomies}
                setTaxonomies={setTaxonomies}
                taxonomyColumns={taxonomyColumns}
              />
            )}
            {config.types === 'indicators' && (
              <OptionsForIndicators
                hasAttributes={hasAttributes}
                attributes={attributes}
                setAttributes={setAttributes}
                includeSupport={includeSupport}
                setIncludeSupport={setIncludeSupport}
              />
            )}
            <Box
              gap="small"
              margin={{ top: 'xlarge' }}
            >
              <Box
                direction={(isMinSize(size, 'medium') || !csvSuffix) ? 'row' : 'column'}
                align={(isMinSize(size, 'medium') || !csvSuffix) ? 'center' : 'start'}
                gap="small"
                fill={false}
              >
                <OptionLabel htmlFor="input-filename">
                  <FormattedMessage {...messages.filenameLabel} />
                </OptionLabel>
                <Box
                  direction={(isMinSize(size, 'medium') || !csvSuffix) ? 'row' : 'column'}
                  align={(isMinSize(size, 'medium') || !csvSuffix) ? 'center' : 'start'}
                  gap={(isMinSize(size, 'medium') || !csvSuffix) ? 'none' : 'small'}
                >
                  <TextInput
                    minLength={1}
                    debounceTimeout={500}
                    value={csvFilename}
                    onChange={(evt) => setCSVFilename(evt.target.value)}
                    style={{ maxWidth: '250px', textAlign: isMinSize(size, 'medium') ? 'right' : 'left' }}
                  />
                  <Text size="xsmall">
                    {`${csvSuffix ? csvDateSuffix : ''}.csv`}
                  </Text>
                </Box>
              </Box>
              <Box direction="row" align="center" fill={false}>
                <Box direction="row" align="center">
                  <Select>
                    <Checkbox
                      id="check-timestamp"
                      checked={csvSuffix}
                      onChange={(evt) => setCSVSuffix(evt.target.checked)}
                    />
                  </Select>
                </Box>
                <Text size="small" as="label" htmlFor="check-timestamp">
                  <FormattedMessage {...messages.includeTimestamp} />
                </Text>
              </Box>
            </Box>
          </>
        )}
      </Main>
      {count > 0 && (
        <Footer>
          <Box direction="row" justify="end">
            <StyledButtonCancel type="button" onClick={() => onClose()}>
              <FormattedMessage {...appMessages.buttons.cancel} />
            </StyledButtonCancel>
            <CsvDownloader
              datas={csvData}
              columns={csvColumns}
              filename={`${csvFilename}${csvSuffix ? csvDateSuffix : ''}`}
              bom={false}
            >
              <ButtonSubmit
                type="button"
                onClick={(evt) => {
                  evt.preventDefault();
                  onClose();
                }}
              >
                <FormattedMessage {...messages.buttonDownload} />
              </ButtonSubmit>
            </CsvDownloader>
          </Box>
        </Footer>
      )}
    </Content>
  );
}

EntityListDownload.propTypes = {
  fields: PropTypes.object,
  config: PropTypes.object,
  typeNames: PropTypes.object,
  typeId: PropTypes.string,
  entities: PropTypes.instanceOf(List),
  taxonomies: PropTypes.instanceOf(Map),
  connections: PropTypes.instanceOf(Map),
  onClose: PropTypes.func,
  isAdmin: PropTypes.bool,
  searchQuery: PropTypes.string,
  entityIdsSelected: PropTypes.object,
  intl: intlShape,
};

export default injectIntl(EntityListDownload);
