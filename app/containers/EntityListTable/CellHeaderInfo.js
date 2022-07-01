import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { Box, Text } from 'grommet';
import appMessages from 'containers/App/messages';

const LabelWrap = styled((p) => <Box direction="row" gap="xsmall" align="center" {...p} />)``;
const Dot = styled.div`
  display: block;
  width: 14px;
  height: 14px;
  border-radius: 99999px;
  background: ${({ color }) => color || 'red'};
  border: 2px solid white;
`;

export function CellHeaderInfo({ info }) {
  return (
    <>
      {info.type === 'key-categorical' && (
        <Box
          background="light-1"
          pad="small"
        >
          <Box border="bottom" flex={{ shrink: 0 }} margin={{ bottom: 'small' }}>
            <Text size="small" weight={500}>
              <FormattedMessage {...appMessages.attributes[info.attribute]} />
            </Text>
          </Box>
          <Box gap="small">
            {info.options.map((option) => (
              <LabelWrap key={option.value}>
                <Dot color={option.color} />
                <Text size="small" weight={500}>
                  {option.label}
                </Text>
              </LabelWrap>
            ))}
          </Box>
        </Box>
      )}
    </>
  );
}

CellHeaderInfo.propTypes = {
  info: PropTypes.object,
};

export default CellHeaderInfo;
