import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import { Box } from 'grommet';

import ConnectionPopup from './ConnectionPopup';

const ConnectionGroupLabel = styled.span`
  color: ${palette('text', 1)};
  font-size: ${(props) => props.theme.sizes && props.theme.sizes.text.smaller};
  padding-top: 2px;
  @media print {
    font-size: ${(props) => props.theme.sizes.print.smaller};
  }
`;
export function EntityListItemMainConnections({ connection, wrapper }) {
  return (
    <Box direction="row" gap="hair">
      <ConnectionGroupLabel>
        {`${connection.groupLabel}: `}
      </ConnectionGroupLabel>
      <Box direction="row" gap="xsmall">
        {connection.connectionsByType.map((type, i) => {
          const entitiesTotal = type.entities ? type.entities.length : 0;
          return entitiesTotal > 0 && (
            <ConnectionPopup
              key={i}
              entities={type.entities}
              label={type.option.label(entitiesTotal)}
              option={type.option}
              wrapper={wrapper}
              draft
            />
          );
        })}
      </Box>
    </Box>
  );
}

EntityListItemMainConnections.propTypes = {
  connection: PropTypes.object,
  wrapper: PropTypes.object,
};

export default EntityListItemMainConnections;
