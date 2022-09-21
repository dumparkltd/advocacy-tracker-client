/*
 *
 * MapKeySimple
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, Text } from 'grommet';

import Dot from 'components/styled/Dot';

const LabelWrap = styled((p) => <Box direction="row" gap="xsmall" align="center" {...p} />)``;

const Styled = styled((p) => <Box pad={{ top: 'small', bottom: 'small' }} gap="xsmall" {...p} />)``;

export function MapKeySimple({
  title,
  options,
}) {
  return (
    <Styled>
      {title && (
        <Text weight={600} size="small">{title}</Text>
      )}
      <Box style={{ maxWidth: '300px' }} gap="xxsmall">
        {options.map(
          (option) => (
            <LabelWrap key={option.order || option.value} direction="row" fill="horizontal">
              <Dot color={option.color} />
              <Box direction="row" justify="between" gap="xsmall" fill="horizontal">
                <Text size="small">
                  {`${option.label}${typeof option.count !== 'undefined' ? ':' : ''}`}
                </Text>
                {typeof option.count !== 'undefined' && (
                  <Text size="small" weight={600}>
                    {option.count}
                  </Text>
                )}
              </Box>
            </LabelWrap>
          )
        )}
      </Box>
    </Styled>
  );
}

MapKeySimple.propTypes = {
  options: PropTypes.array,
  title: PropTypes.string,
};

export default MapKeySimple;
