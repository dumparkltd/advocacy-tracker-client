import React from 'react';
import PropTypes from 'prop-types';
import { Box } from 'grommet';
import styled from 'styled-components';
import { fromJS } from 'immutable';
import CellBodyStackedBarChartBarOverlay from './CellBodyStackedBarChartBarOverlay';

const BarWrapper = styled.div`
  width: 100%;
  height: 20px;
  display: block;
  position: relative;
`;

export function CellBodyStackedBarChart({
  values,
  maxvalue,
  entityType,
  onEntityClick,
}) {
  let offset = 0;
  return (
    <Box>
      {values && (
        <Box direction="row" flex={{ shrink: 0 }} align="center">
          <BarWrapper>
            {values.sort((a, b) => a.order < b.order ? -1 : 1).map((value) => {
              const count = value.count || 0;
              offset += count;
              return count > 0
                ? (
                  <CellBodyStackedBarChartBarOverlay
                    key={value.value}
                    value={value}
                    count={count}
                    offset={offset - count}
                    maxvalue={maxvalue}
                    tooltipConfig={value.tooltip && fromJS(value.tooltip)}
                    onEntityClick={onEntityClick}
                    entityType={entityType}
                  />
                )
                : null;
            })}
          </BarWrapper>
        </Box>
      )}
    </Box>
  );
}

CellBodyStackedBarChart.propTypes = {
  values: PropTypes.array,
  maxvalue: PropTypes.number,
  entityType: PropTypes.string,
  onEntityClick: PropTypes.func,
};

export default CellBodyStackedBarChart;
