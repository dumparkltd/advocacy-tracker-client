import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, Text } from 'grommet';
import { FormattedMessage } from 'react-intl';
import { ROUTES } from 'themes/config';

import EntitiesTable from 'containers/EntityListTable/EntitiesTable';

import messages from './messages';

const SectionTitle = styled((p) => <Text size="xsmall" {...p} />)`
  text-transform: uppercase;
  font-weight: bold;
`;
export function PreviewCountryTopicStatementList({ content, onUpdatePath }) {
  const { indicatorPositions, indicatorPositionsTableColumns } = content.toJS();
  return (
    <Box
      gap="xlarge"
      responsive={false}
      flex={{ shrink: 0 }}
    >
      {indicatorPositions && indicatorPositions.length > 0 && (
        <Box gap="medium">
          <Box>
            <SectionTitle>
              <FormattedMessage {...messages.countryTopicStatementList.latestSectionTitle} />
            </SectionTitle>
          </Box>
          <Box>
            <EntitiesTable
              visibleHeaderColumns={indicatorPositionsTableColumns}
              visibleColumns={indicatorPositionsTableColumns}
              entities={[indicatorPositions[0]]}
              entityPath={ROUTES.ACTION}
              inSingleView
              onEntityClick={(idOrPath, path) => {
                onUpdatePath(path ? `${path}/${idOrPath}` : idOrPath);
              }}
            />
          </Box>
        </Box>
      )}
      {indicatorPositions && indicatorPositions.length > 1 && (
        <Box gap="medium">
          <Box>
            <SectionTitle>
              <FormattedMessage {...messages.countryTopicStatementList.previousSectionTitle} />
            </SectionTitle>
          </Box>
          {indicatorPositions && (
            <Box>
              <EntitiesTable
                visibleHeaderColumns={indicatorPositionsTableColumns}
                visibleColumns={indicatorPositionsTableColumns}
                entities={indicatorPositions.slice(1)}
                entityPath={ROUTES.ACTION}
                inSingleView
                onEntityClick={(idOrPath, path) => {
                  onUpdatePath(path ? `${path}/${idOrPath}` : idOrPath);
                }}
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
