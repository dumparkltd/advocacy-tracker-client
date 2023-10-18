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
import OptionGroup from './OptionGroup';

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
  const [expandGroup, setExpandGroup] = useState(null);
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
        const childtypeIds = Object.keys(ACTIONTYPE_ACTIONTYPES).filter((childtypeId) => {
          const parenttypeIds = ACTIONTYPE_ACTIONTYPES[childtypeId];
          return parenttypeIds.indexOf(typeId) > -1;
        });
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
  let hasParentActions;
  let hasChildActions;
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

    hasParentActions = config.connections
      && config.connections.parents
      && ACTIONTYPE_ACTIONTYPES[typeId]
      && ACTIONTYPE_ACTIONTYPES[typeId].length > 0;
    relationships = relationships.set('parents', relationships.get('measures'));

    hasChildActions = config.connections
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
  const activeParenttypeCount = hasParentActions && Object.keys(parenttypes).reduce((counter, parenttypeId) => {
    if (parenttypes[parenttypeId].active) return counter + 1;
    return counter;
  }, 0);
  const activeChildtypeCount = hasChildActions && Object.keys(childtypes).reduce((counter, childtypeId) => {
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
        <Box margin={{ bottom: 'large' }}>
          {hasAttributes && (
            <OptionGroup
              groupId="attributes"
              label="Attributes"
              expandedId={expandGroup}
              onExpandGroup={(val) => setExpandGroup(val)}
              activeOptionCount={activeAttributeCount}
              optionCount={Object.keys(attributes).length}
              intro="The resulting CSV file will have one column for each attribute selected"
              options={attributes}
              optionListLabels={{
                attributes: 'Select attributes',
                columns: 'Customise column name',
              }}
              onSetOptions={(options) => setAttributes(options)}
              editColumnNames
            />
          )}
          {hasTaxonomies && (
            <OptionGroup
              groupId="taxonomies"
              label="Categories"
              expandedId={expandGroup}
              onExpandGroup={(val) => setExpandGroup(val)}
              activeOptionCount={activeTaxonomyCount}
              optionCount={Object.keys(taxonomyColumns).length}
              intro="The resulting CSV file will have one column for each category group (taxonomy) selected"
              options={taxonomyColumns}
              optionListLabels={{
                attributes: 'Select category groups',
                columns: 'Customise column name',
              }}
              onSetOptions={(options) => setTaxonomies(options)}
              editColumnNames
            />
          )}
          {hasActors && (
            <OptionGroup
              groupId="actors"
              label="Actors"
              expandedId={expandGroup}
              onExpandGroup={(val) => setExpandGroup(val)}
              activeOptionCount={activeActortypeCount}
              optionCount={Object.keys(actortypes).length}
              introNode={(
                <div>
                  <Text size="small">
                    By default, the resulting CSV file will have one column for each type of actor selected.
                  </Text>
                  <Text size="small">
                    {(!indicatorsAsRows || !indicatorsActive) && ' Alternatively you can chose to include actors as rows, resulting in one row per activity and actor'}
                    {indicatorsAsRows && indicatorsActive && ' Alternatively you can chose to include actors as rows, resulting in one row per activity, topic and actor'}
                  </Text>
                </div>
              )}
              options={actortypes}
              optionListLabels={{
                attributes: 'Select actor types',
              }}
              onSetOptions={(options) => setActortypes(options)}
              onSetAsRows={(val) => setActorsAsRows(val)}
              asRows={actorsAsRows}
              asRowsDisabled={activeActortypeCount === 0}
              asRowsLabels={{
                columns: 'Include actors as columns (one column for each actor type)',
                rows: indicatorsAsRows
                  ? 'Include actors as rows (one row for each activity, topic and actor)'
                  : 'Include actors as rows (one row for each activity and actor)',
              }}
            />
          )}
          {hasTargets && (
            <OptionGroup
              groupId="targets"
              label="Targets"
              expandedId={expandGroup}
              onExpandGroup={(val) => setExpandGroup(val)}
              activeOptionCount={activeTargettypeCount}
              optionCount={Object.keys(targettypes).length}
              intro="By default, the resulting CSV file will have one column for each type of target selected"
              options={targettypes}
              optionListLabels={{
                attributes: 'Select target types',
              }}
              onSetOptions={(options) => setTargettypes(options)}
            />
          )}
          {hasParentActions && (
            <OptionGroup
              groupId="parents"
              label="Parent activities"
              expandedId={expandGroup}
              onExpandGroup={(val) => setExpandGroup(val)}
              activeOptionCount={activeParenttypeCount}
              optionCount={Object.keys(parenttypes).length}
              intro="By default, the resulting CSV file will have one column for each type of parent activity selected."
              options={parenttypes}
              optionListLabels={{
                attributes: 'Select parent activity types',
              }}
              onSetOptions={(options) => setParenttypes(options)}
            />
          )}
          {hasChildActions && (
            <OptionGroup
              groupId="children"
              label="Child activities"
              expandedId={expandGroup}
              onExpandGroup={(val) => setExpandGroup(val)}
              activeOptionCount={activeChildtypeCount}
              optionCount={Object.keys(childtypes).length}
              intro="By default, the resulting CSV file will have one column for each type of child activity selected."
              options={childtypes}
              optionListLabels={{
                attributes: 'Select child activity types',
              }}
              onSetOptions={(options) => setChildtypes(options)}
            />
          )}
          {hasResources && (
            <OptionGroup
              groupId="resources"
              label="Resources"
              expandedId={expandGroup}
              onExpandGroup={(val) => setExpandGroup(val)}
              activeOptionCount={activeResourcetypeCount}
              optionCount={Object.keys(resourcetypes).length}
              intro="By default, the resulting CSV file will have one column for each type of resource selected."
              options={resourcetypes}
              optionListLabels={{
                attributes: 'Select resource types',
              }}
              onSetOptions={(options) => setResourcetypes(options)}
            />
          )}
          {hasIndicators && (
            <OptionGroup
              groupId="indicators"
              label="Topics"
              expandedId={expandGroup}
              onExpandGroup={(val) => setExpandGroup(val)}
              activeOptionCount={indicatorsActive ? 1 : 0}
              optionCount={1}
              introNode={(
                <div>
                  <Text size="small">
                    By default, the resulting CSV file will have one column for each topic.
                  </Text>
                  <Text size="small">
                    {!actorsAsRows && ' Alternatively you can chose to include topics as rows, resulting in one row per activity and topic'}
                    {actorsAsRows && ' Alternatively you can chose to include topics as rows, resulting in one row per activity, actor and topic'}
                  </Text>
                </div>
              )}
              active={indicatorsActive}
              onSetActive={(val) => setIndicatorsActive(val)}
              onActiveLabel="Include topics"
              onSetAsRows={(val) => setIndicatorsAsRows(val)}
              asRows={indicatorsAsRows}
              asRowsDisabled={!indicatorsActive}
              asRowsLabels={{
                columns: 'Include topics as columns (one column for each topic)',
                rows: actorsAsRows
                  ? 'Include topics as rows (one row for each activity, actor and topic)'
                  : 'Include topics as rows (one row for each activity and topic)',
              }}
            />
          )}
          {hasUsers && (
            <OptionGroup
              groupId="users"
              label="Users"
              expandedId={expandGroup}
              onExpandGroup={(val) => setExpandGroup(val)}
              activeOptionCount={usersActive ? 1 : 0}
              optionCount={1}
              active={usersActive}
              onSetActive={(val) => setUsersActive(val)}
              onActiveLabel="Include users"
            />
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
