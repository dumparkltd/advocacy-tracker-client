import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { Box, Text } from 'grommet';
import appMessages from 'containers/App/messages';
import Dot from 'components/styled/Dot';

const LabelWrap = styled((p) => <Box direction="row" gap="xsmall" align="center" {...p} />)``;

export function CellHeaderInfoOverlay({ info }) {
  return (
    <>
      {info.type === 'key-categorical' && (
        <Box
          pad="small"
          margin={{ horizontal: 'xsmall', vertical: 'xsmall' }}
          background="white"
          elevation="small"
          overflow={{
            vertical: 'auto',
            horizontal: 'hidden',
          }}
        >
          <Box border="bottom" flex={{ shrink: 0 }} margin={{ bottom: 'small' }}>
            <Text size="small" weight={600}>
              {info.title}
              {!info.title && (<FormattedMessage {...appMessages.attributes[info.attribute]} />)}
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
      {info.type === 'text' && (
        <Box
          pad="small"
          margin={{ horizontal: 'xsmall', vertical: 'xsmall' }}
          background="white"
          elevation="small"
          overflow={{
            vertical: 'auto',
            horizontal: 'hidden',
          }}
        >
          {info.title && (
            <Box border="bottom" flex={{ shrink: 0 }} margin={{ bottom: 'small' }}>
              <Text size="small" weight={600}>
                {info.title}
              </Text>
            </Box>
          )}
          <Box gap="small">
            <Text size="small" weight={500}>
              {info.text}
            </Text>
          </Box>
        </Box>
      )}
    </>
  );
}

CellHeaderInfoOverlay.propTypes = {
  info: PropTypes.object,
};

export default CellHeaderInfoOverlay;
