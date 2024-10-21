import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, Text } from 'grommet';
import { FormattedMessage } from 'react-intl';

import EntitiesTable from 'containers/EntityListTable/EntitiesTable';
import MapOption from 'containers/MapContainer/MapInfoOptions/MapOption';

import messages from './messages';

const SectionTitle = styled((p) => <Text size="xsmall" {...p} />)`
  text-transform: uppercase;
  font-weight: bold;
`;
export function PreviewCountryTopicStatementList({ content, onUpdatePath }) {
  const { options, indicatorPositions, indicatorPositionsTableColumns } = content;
  return (
    <Box
      gap="xlarge"
      responsive={false}
      flex={{ shrink: 0 }}
    >
      <Box gap="medium">
        <Box fill="horizontal" direction="row" justify="between" align="end">
          <Box>
            <SectionTitle>
              <FormattedMessage {...messages.countryTopicStatementList.latestSectionTitle} />
            </SectionTitle>
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
              entities={[indicatorPositions[0]]}
              inSingleView
              onEntityClick={(path) => onUpdatePath(path)}
            />
          </Box>
        )}
      </Box>
      {indicatorPositions && indicatorPositions.length > 1 && (
        <Box gap="medium">
          <Box fill="horizontal" direction="row" justify="between" align="end">
            <Box>
              <SectionTitle>
                <FormattedMessage {...messages.countryTopicStatementList.previousSectionTitle} />
              </SectionTitle>
            </Box>
          </Box>
          {indicatorPositions && (
            <Box>
              <EntitiesTable
                headerColumns={indicatorPositionsTableColumns}
                columns={indicatorPositionsTableColumns}
                entities={indicatorPositions.slice(1)}
                inSingleView
                onEntityClick={(path) => onUpdatePath(path)}
              />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
// columns={field.columns}

PreviewCountryTopicStatementList.propTypes = {
  content: PropTypes.object,
  onUpdatePath: PropTypes.func,
};
export default PreviewCountryTopicStatementList;
