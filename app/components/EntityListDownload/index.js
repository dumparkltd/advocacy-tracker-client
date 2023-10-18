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
import OptionGroupToggle from './OptionGroupToggle';
import OptionListHeader from './OptionListHeader';

import messages from './messages';
import {
  prepareData,
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

const Group = styled((p) => (
  <Box {...p} />
))`
  border-top: 1px solid ${palette('light', 2)};
  &:last-child {
    border-bottom: 1px solid ${palette('light', 2)};
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
  const [actorsAsRows, setActorsAsRows] = useState(false);
  const [indicatorsAsRows, setIndicatorsAsRows] = useState(false);
  const [indicatorsActive, setIndicatorsActive] = useState(false);
  const [usersActive, setUsersActive] = useState(false);
  const [attributes, setAttributes] = useState({});
  const [taxonomyColumns, setTaxonomies] = useState({});
  const [actortypes, setActortypes] = useState({});
  const [targettypes, setTargettypes] = useState({});
  const [parenttypes, setParenttypes] = useState({});
  const [childtypes, setChildtypes] = useState({});
  const [resourcetypes, setResourcetypes] = useState({});
  const [expandGroup, setExpandGroup] = useState([]);
  // const [actiontypes, setActiontypes] = useState({});
  // const [actiontypesAsTarget, setActiontypesAsTarget] = useState({});
  // const [membertypes, setMembertypes] = useState({});
  useEffect(() => {
    // set initial config values
    if (config.attributes && fields && typeId) {
      setAttributes(
        getAttributes({
          typeId,
          fieldAttributes: fields && fields.ATTRIBUTES,
          isAdmin,
        })
      );
    }
    if (config.taxonomies && taxonomies) {
      setTaxonomies(
        taxonomies.map((tax) => {
          const name = intl.formatMessage(appMessages.entities.taxonomies[tax.get('id')].plural);
          return ({
            id: tax.get('id'),
            name,
            active: false,
            column: snakeCase(name),
          });
        }).toJS()
      );
    }
    if (config.types === 'actiontypes') {
      // actors
      if (config.connections && config.connections.actors && typeNames.actortypes && ACTIONTYPE_ACTORTYPES[typeId]) {
        setActortypes(
          ACTIONTYPE_ACTORTYPES[typeId].reduce((memo, actortypeId) => {
            const name = intl.formatMessage(appMessages.entities[`actors_${actortypeId}`].pluralLong);
            return {
              ...memo,
              [actortypeId]: {
                id: actortypeId,
                name,
                active: false,
                column: `actors_${snakeCase(name)}`,
              },
            };
          }, {})
        );
      }
      // targets
      if (config.connections && config.connections.targets && typeNames.actortypes && ACTIONTYPE_TARGETTYPES[typeId]) {
        setTargettypes(
          ACTIONTYPE_TARGETTYPES[typeId].reduce((memo, actortypeId) => {
            const name = intl.formatMessage(appMessages.entities[`actors_${actortypeId}`].pluralLong);
            return {
              ...memo,
              [actortypeId]: {
                id: actortypeId,
                name,
                active: false,
                column: `targets_${snakeCase(name)}`,
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
            const name = intl.formatMessage(appMessages.entities[`actions_${actiontypeId}`].pluralLong);
            return {
              ...memo,
              [actiontypeId]: {
                id: actiontypeId,
                name,
                active: false,
                column: `parents_${snakeCase(name)}`,
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
        const childtypeIds = Object.keys(ACTIONTYPE_ACTIONTYPES).filter((childtypeId) => {
          const parenttypeIds = ACTIONTYPE_ACTIONTYPES[childtypeId];
          return parenttypeIds.indexOf(typeId) > -1;
        });
        if (childtypeIds && childtypeIds.length > 0) {
          setChildtypes(
            childtypeIds.reduce((memo, actiontypeId) => {
              const name = intl.formatMessage(appMessages.entities[`actions_${actiontypeId}`].pluralLong);
              return {
                ...memo,
                [actiontypeId]: {
                  id: actiontypeId,
                  name,
                  active: false,
                  column: `children_${snakeCase(name)}`,
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
            const name = intl.formatMessage(appMessages.entities[`resources_${resourcetypeId}`].pluralLong);
            return {
              ...memo,
              [resourcetypeId]: {
                id: resourcetypeId,
                name,
                active: false,
                column: `resources_${snakeCase(name)}`,
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
  let hasActors;
  let hasTargets;
  let hasIndicators;
  let hasParents;
  let hasChildren;
  let hasResources;
  let hasUsers;
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
      && connections.get('indicators');

    hasParents = config.connections
      && config.connections.parents
      && ACTIONTYPE_ACTIONTYPES[typeId]
      && ACTIONTYPE_ACTIONTYPES[typeId].length > 0;
    relationships = relationships.set('parents', relationships.get('measures'));

    hasChildren = config.connections
      && config.connections.children
      && Object.keys(ACTIONTYPE_ACTIONTYPES).find((childtypeId) => {
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
  }

  // count active export options
  const activeAttributeCount = hasAttributes && Object.keys(attributes).reduce((counter, attKey) => {
    if (attributes[attKey].active) return counter + 1;
    return counter;
  }, 0);
  const activeTaxonomyCount = hasTaxonomies && Object.keys(taxonomyColumns).reduce((counter, taxId) => {
    if (taxonomyColumns[taxId].active) return counter + 1;
    return counter;
  }, 0);
  const activeActortypeCount = hasActors && Object.keys(actortypes).reduce((counter, actortypeId) => {
    if (actortypes[actortypeId].active) return counter + 1;
    return counter;
  }, 0);
  const activeTargettypeCount = hasTargets && Object.keys(targettypes).reduce((counter, actortypeId) => {
    if (targettypes[actortypeId].active) return counter + 1;
    return counter;
  }, 0);
  const activeParenttypeCount = hasParents && Object.keys(parenttypes).reduce((counter, parenttypeId) => {
    if (parenttypes[parenttypeId].active) return counter + 1;
    return counter;
  }, 0);
  const activeChildtypeCount = hasChildren && Object.keys(childtypes).reduce((counter, childtypeId) => {
    if (childtypes[childtypeId].active) return counter + 1;
    return counter;
  }, 0);
  const activeResourcetypeCount = hasResources && Object.keys(resourcetypes).reduce((counter, resourcetypeId) => {
    if (resourcetypes[resourcetypeId].active) return counter + 1;
    return counter;
  }, 0);

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
  if (hasParents) {
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
  if (hasChildren) {
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
    }
  }
  // console.log('entities', entities && entities.toJS())
  const csvData = entities && prepareData({
    typeId,
    config,
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
    hasParents,
    parenttypes,
    hasChildren,
    childtypes,
    hasResources,
    resourcetypes,
    hasIndicators: hasIndicators && indicatorsActive,
    indicatorsAsRows,
    hasUsers: hasUsers && usersActive,
  });
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
            You can optionally customise your data export below
          </Text>
        </Box>
        <Box margin={{ bottom: 'large' }}>
          {hasAttributes && (
            <Group>
              <OptionGroupToggle
                label="Attributes"
                onToggle={() => setExpandGroup(expandGroup !== 'attributes' ? 'attributes' : null)}
                expanded={expandGroup === 'attributes'}
                activeCount={activeAttributeCount}
                optionCount={Object.keys(attributes).length}
              />
              {expandGroup === 'attributes' && (
                <Box gap="small" margin={{ vertical: 'medium' }}>
                  <Box gap="small">
                    <Text size="small">
                      The resulting CSV file will have one column for each attribute selected
                    </Text>
                  </Box>
                  <Box margin={{ top: 'medium' }}>
                    <OptionListHeader
                      labels={{
                        attributes: 'Select attributes',
                        columns: 'Customise column name',
                      }}
                    />
                    <Box gap="xsmall">
                      {Object.keys(attributes).map((attKey) => (
                        <Box key={attKey} direction="row" gap="small" align="center" justify="between">
                          <Box direction="row" gap="small" align="center" justify="start">
                            <Select>
                              <StyledInput
                                id={`check-attribute-${attKey}`}
                                type="checkbox"
                                checked={attributes[attKey].exportRequired || attributes[attKey].active}
                                disabled={attributes[attKey].exportRequired}
                                onChange={(evt) => {
                                  setAttributes({
                                    ...attributes,
                                    [attKey]: {
                                      ...attributes[attKey],
                                      active: evt.target.checked,
                                    },
                                  });
                                }}
                              />
                            </Select>
                            <OptionLabel htmlFor={`check-attribute-${attKey}`}>
                              {`${intl.formatMessage(appMessages.attributes[attKey])}${attributes[attKey].exportRequired ? ' (required)' : ''}`}
                            </OptionLabel>
                          </Box>
                          <Box>
                            <TextInput
                              minLength={1}
                              debounceTimeout={500}
                              value={attributes[attKey].column}
                              onChange={(evt) => {
                                setAttributes({
                                  ...attributes,
                                  [attKey]: {
                                    ...attributes[attKey],
                                    column: evt.target.value,
                                  },
                                });
                              }}
                            />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              )}
            </Group>
          )}
          {hasTaxonomies && (
            <Group>
              <OptionGroupToggle
                label="Categories"
                onToggle={() => setExpandGroup(expandGroup !== 'taxonomies' ? 'taxonomies' : null)}
                expanded={expandGroup === 'taxonomies'}
                activeCount={activeTaxonomyCount}
                optionCount={Object.keys(taxonomyColumns).length}
              />
              {expandGroup === 'taxonomies' && (
                <Box gap="small" margin={{ vertical: 'medium' }}>
                  <Box gap="small">
                    <Text size="small">
                      The resulting CSV file will have one column for each category group (taxonomy) selected
                    </Text>
                  </Box>
                  <Box margin={{ top: 'medium' }}>
                    <OptionListHeader
                      labels={{
                        attributes: 'Select category groups',
                        columns: 'Customise column name',
                      }}
                    />
                    <Box gap="xsmall">
                      {Object.keys(taxonomyColumns).map((taxId) => (
                        <Box key={taxId} direction="row" gap="small" align="center" justify="between">
                          <Box direction="row" gap="small" align="center" justify="start">
                            <Select>
                              <StyledInput
                                id={`check-taxonomy-${taxId}`}
                                type="checkbox"
                                checked={taxonomyColumns[taxId].active}
                                onChange={(evt) => {
                                  setTaxonomies({
                                    ...taxonomyColumns,
                                    [taxId]: {
                                      ...taxonomyColumns[taxId],
                                      active: evt.target.checked,
                                    },
                                  });
                                }}
                              />
                            </Select>
                            <OptionLabel htmlFor={`check-taxonomy-${taxId}`}>
                              {taxonomyColumns[taxId].name}
                            </OptionLabel>
                          </Box>
                          <Box>
                            <TextInput
                              minLength={1}
                              debounceTimeout={500}
                              value={taxonomyColumns[taxId].column}
                              onChange={(evt) => {
                                setTaxonomies({
                                  ...taxonomyColumns,
                                  [taxId]: {
                                    ...taxonomyColumns[taxId],
                                    column: evt.target.value,
                                  },
                                });
                              }}
                            />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              )}
            </Group>
          )}
          {hasActors && (
            <Group>
              <OptionGroupToggle
                label="Actors"
                onToggle={() => setExpandGroup(expandGroup !== 'actors' ? 'actors' : '')}
                expanded={expandGroup === 'actors'}
                activeCount={activeActortypeCount}
                optionCount={Object.keys(actortypes).length}
              />
              {expandGroup === 'actors' && (
                <Box gap="medium" margin={{ vertical: 'medium' }}>
                  <Box>
                    <div>
                      <Text size="small">
                        By default, the resulting CSV file will have one column for each type of actor selected.
                      </Text>
                      <Text size="small">
                        {(!indicatorsAsRows || !indicatorsActive) && ' Alternatively you can chose to include actors as rows, resulting in one row per activity and actor'}
                        {indicatorsAsRows && indicatorsActive && ' Alternatively you can chose to include actors as rows, resulting in one row per activity, topic and actor'}
                      </Text>
                    </div>
                  </Box>
                  <Box>
                    <OptionListHeader
                      labels={{
                        attributes: 'Select actor types',
                      }}
                    />
                    <Box gap="edge">
                      {Object.keys(actortypes).map((actortypeId) => (
                        <Box key={actortypeId} direction="row" gap="small" align="center" justify="between">
                          <Box direction="row" gap="small" align="center" justify="start">
                            <Select>
                              <StyledInput
                                id={`check-actortype-${actortypeId}`}
                                type="checkbox"
                                checked={actortypes[actortypeId].active}
                                onChange={(evt) => {
                                  setActortypes({
                                    ...actortypes,
                                    [actortypeId]: {
                                      ...actortypes[actortypeId],
                                      active: evt.target.checked,
                                    },
                                  });
                                }}
                              />
                            </Select>
                            <OptionLabel htmlFor={`check-actortype-${actortypeId}`}>
                              {actortypes[actortypeId].name}
                            </OptionLabel>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                  <Box gap="edge">
                    <Box direction="row" gap="small" align="center" justify="start">
                      <Select>
                        <StyledInput
                          id="check-actors-as-columns"
                          type="radio"
                          checked={!actorsAsRows}
                          onChange={(evt) => setActorsAsRows(!evt.target.checked)}
                          disabled={activeActortypeCount === 0}
                        />
                      </Select>
                      <OptionLabel htmlFor="check-actors-as-columns" disabled={activeActortypeCount === 0}>
                        Include actors as columns (one column for each actor type)
                      </OptionLabel>
                    </Box>
                    <Box direction="row" gap="small" align="center" justify="start">
                      <Select>
                        <StyledInput
                          id="check-actors-as-rows"
                          type="radio"
                          checked={actorsAsRows}
                          onChange={(evt) => setActorsAsRows(evt.target.checked)}
                          disabled={activeActortypeCount === 0}
                        />
                      </Select>
                      <OptionLabel htmlFor="check-actors-as-rows" disabled={activeActortypeCount === 0}>
                        {!indicatorsAsRows && 'Include actors as rows (one row for each activity and actor)'}
                        {indicatorsAsRows && 'Include actors as rows (one row for each activity, topic and actor)'}
                      </OptionLabel>
                    </Box>
                  </Box>
                </Box>
              )}
            </Group>
          )}
          {hasTargets && (
            <Group>
              <OptionGroupToggle
                label="Targets"
                onToggle={() => setExpandGroup(expandGroup !== 'targets' ? 'targets' : '')}
                expanded={expandGroup === 'targets'}
                activeCount={activeTargettypeCount}
                optionCount={Object.keys(targettypes).length}
              />
              {expandGroup === 'targets' && (
                <Box gap="small" margin={{ vertical: 'medium' }}>
                  <div>
                    <Text size="small">
                      By default, the resulting CSV file will have one column for each type of target selected.
                    </Text>
                  </div>
                  <Box margin={{ top: 'medium' }}>
                    <OptionListHeader
                      labels={{
                        attributes: 'Select target types',
                      }}
                    />
                    <Box gap="xsmall">
                      {Object.keys(targettypes).map((actortypeId) => (
                        <Box key={actortypeId} direction="row" gap="small" align="center" justify="between">
                          <Box direction="row" gap="small" align="center" justify="start">
                            <Select>
                              <StyledInput
                                id={`check-targettype-${actortypeId}`}
                                type="checkbox"
                                checked={targettypes[actortypeId].active}
                                onChange={(evt) => {
                                  setTargettypes({
                                    ...targettypes,
                                    [actortypeId]: {
                                      ...targettypes[actortypeId],
                                      active: evt.target.checked,
                                    },
                                  });
                                }}
                              />
                            </Select>
                            <OptionLabel htmlFor={`check-targettype-${actortypeId}`}>
                              {targettypes[actortypeId].name}
                            </OptionLabel>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              )}
            </Group>
          )}
          {hasParents && (
            <Group>
              <OptionGroupToggle
                label="Parent activities"
                onToggle={() => setExpandGroup(expandGroup !== 'parents' ? 'parents' : '')}
                expanded={expandGroup === 'parents'}
                activeCount={activeParenttypeCount}
                optionCount={Object.keys(parenttypes).length}
              />
              {expandGroup === 'parents' && (
                <Box gap="small" margin={{ vertical: 'medium' }}>
                  <div>
                    <Text size="small">
                      By default, the resulting CSV file will have one column for each type of parent activity selected.
                    </Text>
                  </div>
                  <Box margin={{ top: 'medium' }}>
                    <OptionListHeader
                      labels={{
                        attributes: 'Select parent activity types',
                      }}
                    />
                    <Box gap="xsmall">
                      {Object.keys(parenttypes).map((parenttypeId) => (
                        <Box key={parenttypeId} direction="row" gap="small" align="center" justify="between">
                          <Box direction="row" gap="small" align="center" justify="start">
                            <Select>
                              <StyledInput
                                id={`check-parenttype-${parenttypeId}`}
                                type="checkbox"
                                checked={parenttypes[parenttypeId].active}
                                onChange={(evt) => {
                                  setParenttypes({
                                    ...parenttypes,
                                    [parenttypeId]: {
                                      ...parenttypes[parenttypeId],
                                      active: evt.target.checked,
                                    },
                                  });
                                }}
                              />
                            </Select>
                            <OptionLabel htmlFor={`check-parenttype-${parenttypeId}`}>
                              {parenttypes[parenttypeId].name}
                            </OptionLabel>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              )}
            </Group>
          )}
          {hasChildren && (
            <Group>
              <OptionGroupToggle
                label="Child activities"
                onToggle={() => setExpandGroup(expandGroup !== 'children' ? 'children' : '')}
                expanded={expandGroup === 'children'}
                activeCount={activeChildtypeCount}
                optionCount={Object.keys(childtypes).length}
              />
              {expandGroup === 'children' && (
                <Box gap="small" margin={{ vertical: 'medium' }}>
                  <div>
                    <Text size="small">
                      By default, the resulting CSV file will have one column for each type of child activity selected.
                    </Text>
                  </div>
                  <Box margin={{ top: 'medium' }}>
                    <OptionListHeader
                      labels={{
                        attributes: 'Select child activity types',
                      }}
                    />
                    <Box gap="xsmall">
                      {Object.keys(childtypes).map((childtypeId) => (
                        <Box key={childtypes} direction="row" gap="small" align="center" justify="between">
                          <Box direction="row" gap="small" align="center" justify="start">
                            <Select>
                              <StyledInput
                                id={`check-childtype-${childtypeId}`}
                                type="checkbox"
                                checked={childtypes[childtypeId].active}
                                onChange={(evt) => {
                                  setChildtypes({
                                    ...childtypes,
                                    [childtypeId]: {
                                      ...childtypes[childtypeId],
                                      active: evt.target.checked,
                                    },
                                  });
                                }}
                              />
                            </Select>
                            <OptionLabel htmlFor={`check-childtype-${childtypeId}`}>
                              {childtypes[childtypeId].name}
                            </OptionLabel>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              )}
            </Group>
          )}
          {hasResources && (
            <Group>
              <OptionGroupToggle
                label="Resources"
                onToggle={() => setExpandGroup(expandGroup !== 'resources' ? 'resources' : '')}
                expanded={expandGroup === 'resources'}
                activeCount={activeResourcetypeCount}
                optionCount={Object.keys(resourcetypes).length}
              />
              {expandGroup === 'resources' && (
                <Box gap="small" margin={{ vertical: 'medium' }}>
                  <div>
                    <Text size="small">
                      By default, the resulting CSV file will have one column for each type of resource selected.
                    </Text>
                  </div>
                  <Box margin={{ top: 'medium' }}>
                    <OptionListHeader
                      labels={{
                        attributes: 'Select resource types',
                      }}
                    />
                    <Box gap="xsmall">
                      {Object.keys(resourcetypes).map((resourcetypeId) => (
                        <Box key={resourcetypeId} direction="row" gap="small" align="center" justify="between">
                          <Box direction="row" gap="small" align="center" justify="start">
                            <Select>
                              <StyledInput
                                id={`check-resourcetype-${resourcetypeId}`}
                                type="checkbox"
                                checked={resourcetypes[resourcetypeId].active}
                                onChange={(evt) => {
                                  setResourcetypes({
                                    ...resourcetypes,
                                    [resourcetypeId]: {
                                      ...resourcetypes[resourcetypeId],
                                      active: evt.target.checked,
                                    },
                                  });
                                }}
                              />
                            </Select>
                            <OptionLabel htmlFor={`check-resourcetype-${resourcetypeId}`}>
                              {resourcetypes[resourcetypeId].name}
                            </OptionLabel>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              )}
            </Group>
          )}
          {hasIndicators && (
            <Group>
              <OptionGroupToggle
                label="Topics"
                onToggle={() => setExpandGroup(expandGroup !== 'indicators' ? 'indicators' : '')}
                expanded={expandGroup === 'indicators'}
                activeCount={indicatorsActive ? 1 : 0}
                optionCount={1}
              />
              {expandGroup === 'indicators' && (
                <Box gap="medium" margin={{ vertical: 'medium' }}>
                  <Box>
                    <div>
                      <Text size="small">
                        By default, the resulting CSV file will have one column for each topic.
                      </Text>
                      <Text size="small">
                        {!actorsAsRows && ' Alternatively you can chose to include topics as rows, resulting in one row per activity and topic'}
                        {actorsAsRows && ' Alternatively you can chose to include topics as rows, resulting in one row per activity, actor and topic'}
                      </Text>
                    </div>
                  </Box>
                  <Box gap="small">
                    <Box direction="row" gap="small" align="center" justify="start">
                      <Select>
                        <StyledInput
                          id="check-indicators"
                          type="checkbox"
                          checked={indicatorsActive}
                          onChange={(evt) => setIndicatorsActive(evt.target.checked)}
                        />
                      </Select>
                      <OptionLabel htmlFor="check-indicators">Include topics</OptionLabel>
                    </Box>
                    <Box gap="edge">
                      <Box direction="row" gap="small" align="center" justify="start">
                        <Select>
                          <StyledInput
                            id="check-indicators-as-columns"
                            type="radio"
                            checked={!indicatorsAsRows}
                            onChange={(evt) => setIndicatorsAsRows(!evt.target.checked)}
                            disabled={!indicatorsActive}
                          />
                        </Select>
                        <OptionLabel disabled={!indicatorsActive} htmlFor="check-indicators-as-columns">
                          Include topics as columns (one column for each topic)
                        </OptionLabel>
                      </Box>
                      <Box direction="row" gap="small" align="center" justify="start">
                        <Select>
                          <StyledInput
                            id="check-indicators-as-rows"
                            type="radio"
                            checked={indicatorsAsRows}
                            onChange={(evt) => setIndicatorsAsRows(evt.target.checked)}
                            disabled={!indicatorsActive}
                          />
                        </Select>
                        <OptionLabel disabled={!indicatorsActive} htmlFor="check-indicators-as-rows">
                          {!actorsAsRows && 'Include topics as rows (one row for each activity and topic)'}
                          {actorsAsRows && 'Include topics as rows (one row for each activity, actor and topic)'}
                        </OptionLabel>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )}
            </Group>
          )}
          {hasUsers && (
            <Group>
              <OptionGroupToggle
                label="Users"
                onToggle={() => setExpandGroup(expandGroup !== 'users' ? 'users' : '')}
                expanded={expandGroup === 'users'}
                activeCount={usersActive ? 1 : 0}
                optionCount={1}
              />
              {expandGroup === 'users' && (
                <Box gap="medium" margin={{ vertical: 'medium' }}>
                  <Box direction="row" gap="small" align="center" justify="start">
                    <Select>
                      <StyledInput
                        id="check-users"
                        type="checkbox"
                        checked={usersActive}
                        onChange={(evt) => setUsersActive(evt.target.checked)}
                      />
                    </Select>
                    <OptionLabel htmlFor="check-users">Include users</OptionLabel>
                  </Box>
                </Box>
              )}
            </Group>
          )}
        </Box>
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
