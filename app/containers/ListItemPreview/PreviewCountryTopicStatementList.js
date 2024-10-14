import React from 'react';
import PropTypes from 'prop-types';
// import styled from 'styled-components';
import { Box, Text } from 'grommet';

import EntitiesTable from 'containers/EntityListTable/EntitiesTable';
import MapOption from 'containers/MapContainer/MapInfoOptions/MapOption';

export function PreviewCountryTopicStatementList({ content }) {
  const { options, indicatorPositions, indicatorPositionsTableColumns } = content;
  // console.log(content)
  return (
    <Box
      gap="medium"
      responsive={false}
      flex={{ shrink: 0 }}
    >
      <Box fill="horizontal" direction="row" justify="between" align="end">
        <Box>
          <Text weight={500}>Country statements on topic</Text>
        </Box>
        {options && (
          <Box direction="column" justify="end">
            {options.map((option) => (
              <MapOption
                key={option.id}
                option={option}
              />
            ))}
          </Box>
        )}
      </Box>
      {indicatorPositions && (
        <Box>
          <EntitiesTable
            headerColumns={indicatorPositionsTableColumns}
            columns={indicatorPositionsTableColumns}
            entities={indicatorPositions}
            inSingleView
          />
        </Box>
      )}
    </Box>
  );
}
// columns={field.columns}

PreviewCountryTopicStatementList.propTypes = {
  content: PropTypes.object,
};
export default PreviewCountryTopicStatementList;
