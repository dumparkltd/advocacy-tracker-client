import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box } from 'grommet';

import NumberField from 'components/fields/NumberField';

import appMessages from 'containers/App/messages';

const Styled = styled((p) => <Box {...p} />)``;

const TTSectionTitle = styled.div`
  margin: 5px 0 3px;
  font-size: ${({ theme }) => theme.text.small.size};
  font-weight: 500;
`;

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
          <Box gap="xxsmall">
            {stat.values.map((value, j) => (
              <NumberField
                key={j}
                field={{
                  title: value.label,
                  value: value.value,
                  unit: value.unit,
                  isCount,
                  showEmpty: !isCount && appMessages.labels.noIndicatorValue,
                }}
              />
            ))}
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
