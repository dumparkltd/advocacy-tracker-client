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
} from 'grommet';

import appMessages from 'containers/App/messages';
import { CONTENT_MODAL } from 'containers/App/constants';
import {
  ACTIONTYPE_ACTORTYPES,
  INDICATOR_ACTIONTYPES,
  ACTIONTYPE_ACTIONTYPES,
  ACTIONTYPE_RESOURCETYPES,
  ACTIONTYPE_TARGETTYPES,
  USER_ACTIONTYPES,
} from 'themes/config';
import Content from 'components/Content';
import ContentHeader from 'components/ContentHeader';
import ButtonForm from 'components/buttons/ButtonForm';
import ButtonSubmit from 'components/buttons/ButtonSubmit';
import OptionsForActions from './OptionsForActions';
import OptionsForActors from './OptionsForActors';

import messages from './messages';
import {
  prepareDataForActions,
  prepareDataForActors,
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
  @media (min-width: ${(props) => props.theme.breakpoints.medium}) {
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
}) {
  // console.log('connections', connections && connections.toJS())
  const [typeTitle, setTypeTitle] = useState('entities');
  const [csvFilename, setCSVFilename] = useState('csv');
  const [csvSuffix, setCSVSuffix] = useState(true);
  const [usersActive, setUsersActive] = useState(false);
  const [attributes, setAttributes] = useState({});
  const [taxonomyColumns, setTaxonomies] = useState({});
  // for actions
  const [actortypes, setActortypes] = useState({});
  const [actorsAsRows, setActorsAsRows] = useState(false);
  const [indicatorsAsRows, setIndicatorsAsRows] = useState(false);
  const [indicatorsActive, setIndicatorsActive] = useState(false);
  const [targettypes, setTargettypes] = useState({});
  const [parenttypes, setParenttypes] = useState({});
  const [childtypes, setChildtypes] = useState({});
  const [resourcetypes, setResourcetypes] = useState({});
  // for actors
  const [actiontypes, setActiontypes] = useState({});
  const [actionsAsRows, setActionsAsRows] = useState(false);
  const [actiontypesAsTarget, setActiontypesAsTarget] = useState({});
  const [membertypes, setMembertypes] = useState({});
  const [associationtypes, setAssociationtypes] = useState({});

  useEffect(() => {
    // set initial config values
    if (config.attributes && fields && typeId) {
      setAttributes(
        getAttributes({
          typeId,
          fieldAttributes: fields && fields.ATTRIBUTES,
          isAdmin,
          intl,
        })
      );
    }
    if (config.taxonomies && taxonomies) {
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
      if (config.connections && config.connections.actors && typeNames.actortypes && ACTIONTYPE_ACTORTYPES[typeId]) {
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
      // targets
      if (config.connections && config.connections.targets && typeNames.actortypes && ACTIONTYPE_TARGETTYPES[typeId]) {
        setTargettypes(
          ACTIONTYPE_TARGETTYPES[typeId].reduce((memo, actortypeId) => {
            const label = intl.formatMessage(appMessages.entities[`actors_${actortypeId}`].pluralLong);
            return {
              ...memo,
              [actortypeId]: {
                id: actortypeId,
                label,
                active: false,
                column: `targets_${snakeCase(label)}`,
              },
            };
          }, {})
        );
      }
      // parents
      if (
        config.connections
        && config.connections.parents
        && typeNames.actiontypes
        && ACTIONTYPE_ACTIONTYPES[typeId]
        && ACTIONTYPE_ACTIONTYPES[typeId].length > 0
      ) {
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
      if (
        config.connections
        && config.connections.children
        && typeNames.actiontypes
      ) {
        const childtypeIds = Object.keys(ACTIONTYPE_ACTIONTYPES).filter(
          (childtypeId) => ACTIONTYPE_ACTIONTYPES[childtypeId].indexOf(typeId) > -1
        );
        if (childtypeIds && childtypeIds.length > 0) {
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
      }
      // resources
      if (
        config.connections
        && config.connections.resources
        && ACTIONTYPE_RESOURCETYPES[typeId]
        && ACTIONTYPE_RESOURCETYPES[typeId].length > 0
      ) {
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
      // //
      // if (
      //   config.connections
      //   && config.connections.
      //   && INDICATOR_ACTIONTYPES.indexOf(typeId) > -1
      // ) {
      //   setIndicators(false);
      // }
    }
    if (config.types === 'actortypes') {
      // actions
      if (
        config.connections
        && config.connections.actions
        && typeNames.actiontypes
        && !!Object.keys(ACTIONTYPE_ACTORTYPES).find(
          (actiontypeId) => ACTIONTYPE_ACTORTYPES[actiontypeId].indexOf(typeId) > -1
        )
      ) {
        const actiontypeIds = Object.keys(ACTIONTYPE_ACTORTYPES).filter(
          (actiontypeId) => ACTIONTYPE_ACTORTYPES[actiontypeId].indexOf(typeId) > -1
        );
        if (actiontypeIds && actiontypeIds.length > 0) {
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
      }
      // actions as target
      if (
        config.connections
        && config.connections.targets
        && typeNames.actiontypes
        && !!Object.keys(ACTIONTYPE_TARGETTYPES).find(
          (actiontypeId) => ACTIONTYPE_TARGETTYPES[actiontypeId].indexOf(typeId) > -1
        )
      ) {
        const actiontypeIds = Object.keys(ACTIONTYPE_TARGETTYPES).filter(
          (actiontypeId) => ACTIONTYPE_TARGETTYPES[actiontypeId].indexOf(typeId) > -1
        );
        if (actiontypeIds && actiontypeIds.length > 0) {
          setActiontypesAsTarget(
            actiontypeIds.reduce((memo, actiontypeId) => {
              const label = intl.formatMessage(appMessages.entities[`actions_${actiontypeId}`].pluralLong);
              return {
                ...memo,
                [actiontypeId]: {
                  id: actiontypeId,
                  label,
                  active: false,
                  column: `actions-as-target_${snakeCase(label)}`,
                },
              };
            }, {})
          );
        }
      }
    //   // targets
    //   if (config.connections && config.connections.targets && typeNames.actortypes && ACTIONTYPE_TARGETTYPES[typeId]) {
    //     setTargettypes(
    //       ACTIONTYPE_TARGETTYPES[typeId].reduce((memo, actortypeId) => {
    //         const label = intl.formatMessage(appMessages.entities[`actors_${actortypeId}`].pluralLong);
    //         return {
    //           ...memo,
    //           [actortypeId]: {
    //             id: actortypeId,
    //             label,
    //             active: false,
    //             column: `targets_${snakeCase(label)}`,
    //           },
    //         };
    //       }, {})
    //     );
    //   }
    //   // parents
    //   if (
    //     config.connections
    //     && config.connections.parents
    //     && typeNames.actiontypes
    //     && ACTIONTYPE_ACTIONTYPES[typeId]
    //     && ACTIONTYPE_ACTIONTYPES[typeId].length > 0
    //   ) {
    //     setParenttypes(
    //       ACTIONTYPE_ACTIONTYPES[typeId].reduce((memo, actiontypeId) => {
    //         const label = intl.formatMessage(appMessages.entities[`actions_${actiontypeId}`].pluralLong);
    //         return {
    //           ...memo,
    //           [actiontypeId]: {
    //             id: actiontypeId,
    //             label,
    //             active: false,
    //             column: `parents_${snakeCase(label)}`,
    //           },
    //         };
    //       }, {})
    //     );
    //   }
    //   // children
    //   if (
    //     config.connections
    //     && config.connections.children
    //     && typeNames.actiontypes
    //   ) {
    //     const childtypeIds = Object.keys(ACTIONTYPE_ACTIONTYPES).filter((childtypeId) => {
    //       const parenttypeIds = ACTIONTYPE_ACTIONTYPES[childtypeId];
    //       return parenttypeIds.indexOf(typeId) > -1;
    //     });
    //     if (childtypeIds && childtypeIds.length > 0) {
    //       setChildtypes(
    //         childtypeIds.reduce((memo, actiontypeId) => {
    //           const label = intl.formatMessage(appMessages.entities[`actions_${actiontypeId}`].pluralLong);
    //           return {
    //             ...memo,
    //             [actiontypeId]: {
    //               id: actiontypeId,
    //               label,
    //               active: false,
    //               column: `children_${snakeCase(label)}`,
    //             },
    //           };
    //         }, {})
    //       );
    //     }
    //   }
    //   // resources
    //   if (
    //     config.connections
    //     && config.connections.resources
    //     && ACTIONTYPE_RESOURCETYPES[typeId]
    //     && ACTIONTYPE_RESOURCETYPES[typeId].length > 0
    //   ) {
    //     setResourcetypes(
    //       ACTIONTYPE_RESOURCETYPES[typeId].reduce((memo, resourcetypeId) => {
    //         const label = intl.formatMessage(appMessages.entities[`resources_${resourcetypeId}`].pluralLong);
    //         return {
    //           ...memo,
    //           [resourcetypeId]: {
    //             id: resourcetypeId,
    //             label,
    //             active: false,
    //             column: `resources_${snakeCase(label)}`,
    //           },
    //         };
    //       }, {})
    //     );
    //   }
    //   // //
    //   // if (
    //   //   config.connections
    //   //   && config.connections.
    //   //   && INDICATOR_ACTIONTYPES.indexOf(typeId) > -1
    //   // ) {
    //   //   setIndicators(false);
    //   // }
    }
  }, []);

  useEffect(() => {
    if (config.types === 'actiontypes') {
      const title = intl.formatMessage(appMessages.entities[`actions_${typeId}`].plural);
      setTypeTitle(title);
      setCSVFilename(snakeCase(title));
    }
    if (config.types === 'actortypes') {
      const title = intl.formatMessage(appMessages.entities[`actors_${typeId}`].plural);
      setTypeTitle(title);
      setCSVFilename(snakeCase(title));
    }
  }, []);

  let relationships = connections;
  // figure out export options
  const hasAttributes = config.attributes && Object.keys(attributes).length > 0;
  const hasTaxonomies = config.taxonomies && Object.keys(taxonomyColumns).length > 0;
  // figure out columns
  let csvColumns = [{ id: 'id' }];
  if (hasAttributes) {
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
  if (hasTaxonomies) {
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
  // for actions ///////////////////////////////////////////////////////////////
  let hasActors;
  let hasTargets;
  let hasIndicators;
  let hasParentActions;
  let hasChildActions;
  let hasResources;
  let hasUsers;

  let csvData;

  if (config.types === 'actiontypes') {
    hasActors = config.connections
      && config.connections.actors
      && Object.keys(actortypes).length > 0;

    hasTargets = config.connections
      && config.connections.targets
      && ACTIONTYPE_TARGETTYPES[typeId]
      && ACTIONTYPE_TARGETTYPES[typeId].length > 0
      && Object.keys(targettypes).length > 0;

    hasIndicators = config.connections
      && config.connections.indicators
      && INDICATOR_ACTIONTYPES.indexOf(typeId) > -1
      && !!connections.get('indicators');

    hasParentActions = config.connections
      && config.connections.parents
      && ACTIONTYPE_ACTIONTYPES[typeId]
      && ACTIONTYPE_ACTIONTYPES[typeId].length > 0;
    relationships = relationships.set('parents', relationships.get('measures'));

    hasChildActions = config.connections
      && config.connections.children
      && !!Object.keys(ACTIONTYPE_ACTIONTYPES).find((childtypeId) => {
        const parenttypeIds = ACTIONTYPE_ACTIONTYPES[childtypeId];
        return parenttypeIds.indexOf(typeId) > -1;
      });
    relationships = relationships.set('children', relationships.get('measures'));

    hasResources = config.connections
      && config.connections.resources
      && ACTIONTYPE_RESOURCETYPES[typeId]
      && ACTIONTYPE_RESOURCETYPES[typeId].length > 0;

    hasUsers = isAdmin
      && config.connections
      && config.connections.users
      && USER_ACTIONTYPES.indexOf(typeId) > -1;
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
    if (hasTargets) {
      csvColumns = Object.keys(targettypes).reduce((memo, actortypeId) => {
        if (targettypes[actortypeId].active) {
          let displayName = targettypes[actortypeId].column;
          if (!displayName || targettypes[actortypeId].column === '') {
            displayName = actortypeId;
          }
          return [
            ...memo,
            { id: `targets_${actortypeId}`, displayName },
          ];
        }
        return memo;
      }, csvColumns);
    }
    if (hasParentActions) {
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
    if (hasUsers && usersActive) {
      csvColumns = [
        ...csvColumns,
        { id: 'users', displayName: 'assigned_users' },
      ];
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
            { id: 'indicator_draft', displayName: 'indicator_draft' },
            { id: 'indicator_private', displayName: 'indicator_private' },
          ];
        }
      }
    }

    csvData = entities && prepareDataForActions({
      attributes,
      entities,
      taxonomies,
      taxonomyColumns,
      relationships,
      typeNames,
      hasActors,
      actorsAsRows,
      actortypes,
      hasTargets,
      targettypes,
      hasParentActions,
      parenttypes,
      hasChildActions,
      childtypes,
      hasResources,
      resourcetypes,
      hasIndicators: hasIndicators && indicatorsActive,
      indicatorsAsRows,
      hasUsers: hasUsers && usersActive,
    });
  }
  // for actors ///////////////////////////////////////////////////////////////
  let hasActions;
  let hasActionsAsTarget;
  let hasMembers;
  let hasAssociations;
  if (config.types === 'actortypes') {
    hasActions = config.connections
      && config.connections.actions
      && Object.keys(actiontypes).length > 0;
    hasActionsAsTarget = config.connections
      && config.connections.targets
      && !!Object.keys(ACTIONTYPE_TARGETTYPES).find((actiontypeId) => {
        const actiontypeIds = ACTIONTYPE_TARGETTYPES[actiontypeId];
        return actiontypeIds.indexOf(typeId) > -1;
      });
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
    if (hasActionsAsTarget) {
      csvColumns = Object.keys(actiontypesAsTarget).reduce((memo, actiontypeId) => {
        if (actiontypesAsTarget[actiontypeId].active) {
          let displayName = actiontypesAsTarget[actiontypeId].column;
          if (!displayName || actiontypesAsTarget[actiontypeId].column === '') {
            displayName = actiontypeId;
          }
          return [
            ...memo,
            { id: `targeted-by-actions_${actiontypeId}`, displayName },
          ];
        }
        return memo;
      }, csvColumns);
    }
    csvData = entities && prepareDataForActors({
      attributes,
      entities,
      taxonomies,
      taxonomyColumns,
      relationships,
      typeNames,
      hasActions,
      actionsAsRows,
      actiontypes,
      hasActionsAsTarget,
      actiontypesAsTarget,
    });
  }

  // console.log('entities', entities && entities.toJS())
  const csvDateSuffix = `_${getDateSuffix()}`;
  return (
    <Content inModal>
      <ContentHeader
        title="Download CSV"
        type={CONTENT_MODAL}
        buttons={[{
          type: 'cancel',
          onClick: () => onClose(),
        }]}
      />
      <Main margin={{ bottom: 'large' }}>
        <Box margin={{ bottom: 'large' }} gap="small">
          <Text size="xxlarge">
            <strong>{`Export ${typeTitle} as CSV`}</strong>
          </Text>
          <Text>
            Please select the attributes, categories and/or connections you would like to include
          </Text>
        </Box>
        {config.types === 'actiontypes' && (
          <OptionsForActions
            hasActors={hasActors}
            hasTargets={hasTargets}
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
            includeUsers={usersActive}
            setUsersActive={setUsersActive}
            attributes={attributes}
            setAttributes={setAttributes}
            taxonomyColumns={taxonomyColumns}
            setTaxonomies={setTaxonomies}
            actortypes={actortypes}
            setActortypes={setActortypes}
            targettypes={targettypes}
            setTargettypes={setTargettypes}
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
            hasActions={hasActions}
            actionsAsRows={actionsAsRows}
            setActionsAsRows={setActionsAsRows}
            actiontypes={actiontypes}
            setActiontypes={setActiontypes}
            hasActionsAsTarget={hasActionsAsTarget}
            actiontypesAsTarget={actiontypesAsTarget}
            setActiontypesAsTarget={setActiontypesAsTarget}
            hasMembers={hasMembers}
            membertypes={membertypes}
            setMembertypes={setMembertypes}
            hasAssociations={hasAssociations}
            associationtypes={associationtypes}
            setAssociationtypes={setAssociationtypes}
            hasUsers={hasUsers}
            includeUsers={usersActive}
            setUsersActive={setUsersActive}
            hasAttributes={hasAttributes}
            attributes={attributes}
            setAttributes={setAttributes}
            hasTaxonomies={hasTaxonomies}
            setTaxonomies={setTaxonomies}
            taxonomyColumns={taxonomyColumns}
          />
        )}
        <Box direction="row" gap="medium" align="center" margin={{ top: 'xlarge' }}>
          <Box direction="row" gap="small" align="center" fill={false}>
            <OptionLabel htmlFor="input-filename">
              Enter filename
            </OptionLabel>
            <Box direction="row" align="center">
              <TextInput
                minLength={1}
                debounceTimeout={500}
                value={csvFilename}
                onChange={(evt) => setCSVFilename(evt.target.value)}
                style={{ maxWidth: '250px', textAlign: 'right' }}
              />
              <Text>
                {`${csvSuffix ? csvDateSuffix : ''}.csv`}
              </Text>
            </Box>
          </Box>
          <Box direction="row" align="center" fill={false}>
            <Box direction="row" align="center">
              <Select>
                <StyledInput
                  id="check-timestamp"
                  type="checkbox"
                  checked={csvSuffix}
                  onChange={(evt) => setCSVSuffix(evt.target.checked)}
                />
              </Select>
            </Box>
            <Text size="small" as="label" htmlFor="check-timestamp">
              Include timestamp
            </Text>
          </Box>
        </Box>
      </Main>
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
  intl: intlShape,
};

export default injectIntl(EntityListDownload);
