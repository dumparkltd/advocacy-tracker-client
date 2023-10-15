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
import { ACTIONTYPE_ACTORTYPES, INDICATOR_ACTIONTYPES } from 'themes/config';
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
}) {
  const [attributes, setAttributes] = useState({});
  const [expandAttributes, setExpandAttributes] = useState(false);
  const [taxonomyColumns, setTaxonomies] = useState({});
  const [expandTaxonomies, setExpandTaxonomies] = useState(false);
  const [actortypes, setActortypes] = useState({});
  const [expandActortypes, setExpandActortypes] = useState(false);
  const [actorsAsRows, setActorsAsRows] = useState(false);
  const [indicatorsAsRows, setIndicatorsAsRows] = useState(false);
  const [expandIndicators, setExpandIndicators] = useState(false);
  // const [actiontypes, setActiontypes] = useState({});
  // const [expandActiontypes, setExpandActiontypes] = useState(false);
  // const [actiontypesAsTarget, setActiontypesAsTarget] = useState({});
  // const [expandActiontypesAsTarget, setExpandActiontypesAsTarget] = useState(false);
  // const [parenttypes, setParenttypes] = useState({});
  // const [expandParenttypes, setExpandParenttypes] = useState(false);
  // const [childtypes, setChildtypes] = useState({});
  // const [expandChildtypes, setExpandChildtypes] = useState(false);
  // const [resourcetypes, setResourcetypes] = useState({});
  // const [expandResourcetypes, setExpandResourcetypes] = useState(false);
  // const [membertypes, setMembertypes] = useState({});
  // const [expandMembertypes, setExpandMembertypes] = useState(false);
  // const [expandUsers, setExpandUsers] = useState(false);
  useEffect(() => {
    // set initial config values
    if (config.attributes && fields && typeId) {
      setAttributes(
        getAttributes({
          typeId,
          fieldAttributes: fields && fields.ATTRIBUTES,
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
            active: true,
            column: snakeCase(name),
          });
        }).toJS()
      );
    }
    if (config.connections && config.connections.actors && typeNames.actortypes && ACTIONTYPE_ACTORTYPES[typeId]) {
      setActortypes(
        ACTIONTYPE_ACTORTYPES[typeId].reduce((memo, actortypeId) => {
          const name = intl.formatMessage(appMessages.entities[`actors_${actortypeId}`].pluralLong);
          return {
            ...memo,
            [actortypeId]: {
              id: actortypeId,
              name,
              active: true,
              column: `actors_${snakeCase(name)}`,
            },
          };
        }, {})
      );
    }
  }, []);

  const hasAttributes = config.attributes && Object.keys(attributes).length > 0;
  const hasTaxonomies = config.taxonomies && Object.keys(taxonomyColumns).length > 0;
  const hasActors = config.connections && config.connections.actors && Object.keys(actortypes).length > 0;
  const hasIndicators = config.connections
    && config.connections.indicators
    && INDICATOR_ACTIONTYPES.indexOf(typeId) > -1
    && connections.get('indicators');
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
  if (hasIndicators) {
    if (!indicatorsAsRows) {
      const indicatorColumns = connections
        && connections.get('indicators')
        && connections.get('indicators').reduce((memo, indicator) => [
          ...memo,
          {
            id: `indicator_${indicator.get('id')}`,
            displayName: `topic_${indicator.getIn(['attributes', 'code'])}_supportlevel`,
          },
        ], []);
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
        { id: 'indicator_supportlevel', displayName: 'topic_supportlevel' },
      ];
    }
  }
  const csvData = entities && prepareData({
    typeId,
    config,
    attributes,
    entities,
    taxonomies,
    taxonomyColumns,
    connections,
    typeNames,
    hasActors,
    actorsAsRows,
    actortypes,
    hasIndicators,
    indicatorsAsRows,
  });
  // console.log('columns', csvColumns)
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
          <Text size="xlarge">
            Configure export
          </Text>
          <Text>
            You can optionally customise your data export below
          </Text>
        </Box>
        {hasAttributes && (
          <Group>
            <OptionGroupToggle
              label="Attributes"
              onToggle={() => setExpandAttributes(!expandAttributes)}
              expanded={expandAttributes}
              activeCount={activeAttributeCount === Object.keys(attributes).length ? 'all' : `${activeAttributeCount}`}
            />
            {expandAttributes && (
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
                          <Text as="label" htmlFor={`check-attribute-${attKey}`}>
                            {`${intl.formatMessage(appMessages.attributes[attKey])}${attributes[attKey].exportRequired ? ' (required)' : ''}`}
                          </Text>
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
              onToggle={() => setExpandTaxonomies(!expandTaxonomies)}
              expanded={expandTaxonomies}
              activeCount={activeTaxonomyCount === Object.keys(taxonomyColumns).length ? 'all' : `${activeTaxonomyCount}`}
            />
            {expandTaxonomies && (
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
                          <Text as="label" htmlFor={`check-taxonomy-${taxId}`}>
                            {taxonomyColumns[taxId].name}
                          </Text>
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
              onToggle={() => setExpandActortypes(!expandActortypes)}
              expanded={expandActortypes}
              activeCount={activeActortypeCount === Object.keys(actortypes).length ? 'all' : `${activeActortypeCount}`}
            />
            {expandActortypes && (
              <Box gap="small" margin={{ vertical: 'medium' }}>
                <Box gap="small">
                  <Text size="small">
                    By default, the resulting CSV file will have one column for each type of actor selected. Alternatively you can chose to include actors as rows, resulting in one row per activity and actor
                  </Text>
                </Box>
                <Box margin={{ top: 'medium' }}>
                  <Box direction="row" gap="small" align="center" justify="start">
                    <Select>
                      <StyledInput
                        id="check-actors-as-rows"
                        type="checkbox"
                        checked={actorsAsRows}
                        onChange={(evt) => setActorsAsRows(evt.target.checked)}
                      />
                    </Select>
                    <Text as="label" htmlFor="check-actors-as-rows">
                      Include actors as rows (one row for each activity and actor)
                    </Text>
                  </Box>
                </Box>
                <Box margin={{ top: 'medium' }}>
                  <OptionListHeader
                    labels={{
                      attributes: 'Select actor types',
                    }}
                  />
                  <Box gap="xsmall">
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
                          <Text as="label" htmlFor={`check-actortype-${actortypeId}`}>
                            {actortypes[actortypeId].name}
                          </Text>
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
              onToggle={() => setExpandIndicators(!expandIndicators)}
              expanded={expandIndicators}
            />
            {expandIndicators && (
              <Box gap="small" margin={{ vertical: 'medium' }}>
                <Box gap="small">
                  <Text size="small">
                    By default, the resulting CSV file will have one column for each topic. Alternatively you can chose to include topics as rows, resulting in one row per activity and topic
                  </Text>
                </Box>
                <Box margin={{ top: 'medium' }}>
                  <Box direction="row" gap="small" align="center" justify="start">
                    <Select>
                      <StyledInput
                        id="check-indicators-as-rows"
                        type="checkbox"
                        checked={indicatorsAsRows}
                        onChange={(evt) => setIndicatorsAsRows(evt.target.checked)}
                      />
                    </Select>
                    <Text as="label" htmlFor="check-indicators-as-rows">
                      Include topics as rows (one row for each activity and indicator)
                    </Text>
                  </Box>
                </Box>
              </Box>
            )}
          </Group>
        )}
      </Main>
      <Footer>
        <Box direction="row" justify="end">
          <StyledButtonCancel type="button" onClick={() => onClose()}>
            <FormattedMessage {...appMessages.buttons.cancel} />
          </StyledButtonCancel>
          <CsvDownloader
            datas={csvData}
            columns={csvColumns}
            filename="csv"
            bom={false}
            suffix
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
  intl: intlShape,
};

export default injectIntl(EntityListDownload);
