import React from 'react';
import PropTypes from 'prop-types';
import { Box, Text } from 'grommet';
import styled from 'styled-components';

const LabelWrap = styled((p) => (
  <Box
    direction="column"
    gap="xsmall"
    align="start"
    {...p}
  />
))``;

export function CellBodyPlainWithDate({ entity }) {
  const { value, date } = entity;
  return (
    <LabelWrap>
      {date && (
        <Box flex={{ shrink: 0 }}>
          <Text size="xsmall" weight={500} wordBreak="keep-all">
            {date}
          </Text>
        </Box>
      )}
      <Text size="xsmall" wordBreak="keep-all">
        {value}
      </Text>
    </LabelWrap>
  );
}

CellBodyPlainWithDate.propTypes = {
  entity: PropTypes.object,
};

export default CellBodyPlainWithDate;
