import React from 'react';
import PropTypes from 'prop-types';
import { Box, Text } from 'grommet';
import styled from 'styled-components';

const Value = styled.div`
  width: 30px !important;
  display: block;
  text-align: right;
`;
const BarWrapper = styled.div`
  width: 100%;
  height: 20px;
  display: block;
  position: relative;
`;
const Bar = styled.div`
  width: ${({ value, maxvalue }) => value / maxvalue * 100}%;
  min-width: 1px;
  height: 20px;
  background-color: ${({ theme, subject }) => theme.global.colors[subject] || theme.global.colors.primary};
  opacity: ${({ issecondary }) => issecondary ? 0.6 : 1};
  display: block;
  position: absolute;
  left: 0;
  top: 0;
`;

export function CellBodyPlain({
  value,
  maxvalue,
  issecondary,
  subject,
}) {
  return (
    <Box>
      {value && (
        <Box direction="row" gap="xsmall" flex={{ shrink: 0 }} align="center">
          <Value>
            <Text size="small" weight={500} textAlign="end">
              {value}
            </Text>
          </Value>
          <BarWrapper>
            <Bar value={value} maxvalue={maxvalue} issecondary={issecondary} subject={subject} />
          </BarWrapper>
        </Box>
      )}
    </Box>
  );
}

CellBodyPlain.propTypes = {
  value: PropTypes.number,
  maxvalue: PropTypes.number,
  issecondary: PropTypes.bool,
  subject: PropTypes.string,
};

export default CellBodyPlain;
