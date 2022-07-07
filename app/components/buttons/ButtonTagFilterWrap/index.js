import React from 'react';
import PropTypes from 'prop-types';
import { Box, Text } from 'grommet';
import { FormClose } from 'grommet-icons';

import Dot from 'components/styled/Dot';

import ButtonTagFilter from '../ButtonTagFilter';
import ButtonTagFilterInverse from '../ButtonTagFilterInverse';

function ButtonTagFilterWrap({ filter, label, onClick }) {
  if (!filter) return null;
  return (filter.inverse || filter.dot)
    ? (
      <ButtonTagFilterInverse
        onClick={onClick || filter.onClick}
        palette={filter.type || 'attributes'}
        paletteHover={`${filter.type || 'attributes'}Hover`}
        pIndex={parseInt(filter.id, 10) || 0}
        disabled={!filter.onClick}
      >
        <Box direction="row" gap="xsmall" align="center">
          {filter.dot && (
            <Dot color={filter.dot} />
          )}
          <Text size="xsmall">
            { label }
          </Text>
          { filter.onClick && (
            <FormClose size="xsmall" color="inherit" />
          )}
        </Box>
      </ButtonTagFilterInverse>
    ) : (
      <ButtonTagFilter
        onClick={onClick || filter.onClick}
        palette={filter.type || 'attributes'}
        paletteHover={`${filter.type || 'attributes'}Hover`}
        pIndex={parseInt(filter.id, 10) || 0}
        disabled={!filter.onClick}
      >
        <Box direction="row" gap="xsmall" align="center">
          <Text size="xsmall">
            { label }
          </Text>
          { filter.onClick && (
            <FormClose size="xsmall" color="inherit" />
          )}
        </Box>
      </ButtonTagFilter>
    );
}

ButtonTagFilterWrap.propTypes = {
  onClick: PropTypes.func,
  filter: PropTypes.object,
  label: PropTypes.string,
};

export default ButtonTagFilterWrap;
