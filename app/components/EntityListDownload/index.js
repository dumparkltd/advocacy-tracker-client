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

import styled from 'styled-components';
import { List, Map } from 'immutable';
import CsvDownloader from 'react-csv-downloader';
import {
  Box,
  Text,
} from 'grommet';

import appMessages from 'containers/App/messages';
import { CONTENT_MODAL } from 'containers/App/constants';
import Content from 'components/Content';
import ContentHeader from 'components/ContentHeader';
import ButtonForm from 'components/buttons/ButtonForm';
import ButtonSubmit from 'components/buttons/ButtonSubmit';
import OptionGroupToggle from './OptionGroupToggle';
import messages from './messages';
import { prepareDatas, getAttributes } from './utils';


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

// const TextInput = styled.input`
//   background-color: ${palette('background', 0)};
//   width: 200px;
//   border: 1px solid ${palette('light', 1)};
//   padding: 0.2em;
//   border-radius: 0.5em;
// `;

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

export function EntityListDownload({
  typeId,
  config,
  fields,
  entities,
  taxonomies,
  connections,
  onClose,
  types,
  intl,
}) {
  const [attributes, setAttributes] = useState({});
  const [expandAttributes, setExpandAttributes] = useState(false);
  useEffect(() => {
    // kick off loading of data
    setAttributes(
      getAttributes({
        typeId,
        fieldAttributes: fields && fields.ATTRIBUTES,
      })
    );
  }, []);
  const datas = prepareDatas({
    typeId,
    config,
    attributes,
    entities,
    taxonomies,
    connections,
    types,
  });
  const activeAttributeCount = Object.keys(attributes).reduce((counter, attKey) => {
    if (attributes[attKey].active) return counter + 1;
    return counter;
  }, 0);
  const columns = Object.keys(attributes).reduce((memo, attKey) => {
    let displayName = attributes[attKey].column;
    if (!displayName || attributes[attKey].column === '') {
      displayName = attKey;
    }
    return [
      ...memo,
      { id: attKey, displayName },
    ];
  }, [{ id: 'id' }]);
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
        {Object.keys(attributes).length > 0 && (
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
                  <Box
                    direction="row"
                    gap="small"
                    align="center"
                    justify="between"
                    pad={{ bottom: 'small' }}
                    margin={{ bottom: 'small' }}
                    border={{ side: 'bottom', color: 'rgba(0,0,0,0.33)' }}
                  >
                    <Text style={{ fontWeight: 700 }}>Select attributes</Text>
                    <Text style={{ fontWeight: 700 }}>Customise column name</Text>
                  </Box>
                  <Box gap="xsmall">
                    {Object.keys(attributes).map((attKey) => (
                      <Box key={attKey} direction="row" gap="small" align="center" justify="between">
                        <Box direction="row" gap="small" align="center" justify="start">
                          <Select>
                            <input
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
      </Main>
      <Footer>
        <Box direction="row" justify="end">
          <StyledButtonCancel type="button" onClick={() => onClose()}>
            <FormattedMessage {...appMessages.buttons.cancel} />
          </StyledButtonCancel>
          <CsvDownloader
            datas={datas}
            columns={columns}
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
  types: PropTypes.object,
  typeId: PropTypes.string,
  entities: PropTypes.instanceOf(List),
  taxonomies: PropTypes.instanceOf(Map),
  connections: PropTypes.instanceOf(Map),
  onClose: PropTypes.func,
  intl: intlShape,
};

export default injectIntl(EntityListDownload);
