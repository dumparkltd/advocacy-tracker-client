import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, Text } from 'grommet';
import isNumber from 'utils/is-number';
import { formatNumber } from 'utils/fields';

const Styled = styled((p) => <Box {...p} />)``;

const TTSectionTitle = styled.div`
  margin: 15px 0 3px;
  font-size: ${({ theme }) => theme.text.small.size};
  font-weight: 500;
`;
const TTContent = styled((p) => <Text size="xsmall" {...p} />)``;

const TooltipContent = ({
  stats,
  isCount,
}) => (
  <Styled>
    {stats && stats.map((stat, i) => (
      <Box key={i}>
        {stat.title && (
          <TTSectionTitle>
            {stat.title}
          </TTSectionTitle>
        )}
        {stat.values && (
          <Box gap="xsmall">
            {stat.values.map((value, j) => {
              let formatted = value.value;
              if (!isCount && isNumber(value.value)) {
                formatted = formatNumber(
                  value.value,
                  {
                    unit: value.unit,
                    digits: parseFloat(value.value, 10) > 1 ? 1 : 3,
                  },
                );
              }
              return (
                <Box direction="row" wrap key={j} gap="xsmall">
                  <TTContent>{`${value.label}: ${formatted}`}</TTContent>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    ))}
  </Styled>
);

TooltipContent.propTypes = {
  stats: PropTypes.array,
  isCount: PropTypes.bool,
};

export default TooltipContent;
