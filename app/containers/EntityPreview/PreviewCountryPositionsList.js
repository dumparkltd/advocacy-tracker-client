import React from 'react';
import PropTypes from 'prop-types';
// import styled from 'styled-components';
import { Box } from 'grommet';

import EntityListTable from 'containers/EntityListTable';
import MapOption from 'containers/MapContainer/MapInfoOptions/MapOption';

export function PreviewCountryPositionsList({ content, onUpdatePath }) {
  const indicators = content.get('indicators');
  const columns = content.get('countryPositionsTableColumns').toJS();
  const options = content.get('options').toJS();
  const entityTitle = content.get('entityTitle').toJS();
  // const key = content.get('key').toJS();
  // console.log(content)
  return (
    <Box
      gap="medium"
      responsive={false}
      flex={{ shrink: 0 }}
    >
      <Box fill="horizontal" direction="row" justify="between" align="end">
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
      {indicators && (
        <Box>
          <EntityListTable
            columns={columns}
            entities={indicators.toList()}
            entityTitle={entityTitle}
            onEntityClick={onUpdatePath}
            inSingleView
          />
        </Box>
      )}
    </Box>
  );
}
// columns={field.columns}

PreviewCountryPositionsList.propTypes = {
  content: PropTypes.object,
  onUpdatePath: PropTypes.func,
};
export default PreviewCountryPositionsList;
