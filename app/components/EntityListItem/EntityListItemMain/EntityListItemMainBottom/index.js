import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Map } from 'immutable';
import { Box } from 'grommet';
import { palette } from 'styled-theme';

import { truncateText } from 'utils/string';
import { TEXT_TRUNCATE } from 'themes/config';

import EntityListItemMainConnection from './EntityListItemMainConnection';
import EntityListItemMainTag from './EntityListItemMainTag';

const Styled = styled((p) => <Box direction="row" gap="small" wrap {...p} />)`
  border-top: 1px solid ${palette('light', 1)};
  padding-top: 3px;
`;

const getEntityTags = (categories, taxonomies, onClick) => {
  const tags = [];
  if (categories) {
    taxonomies
      .filter((tax) => !tax.getIn(['attributes', 'is_smart']))
      .forEach((tax) => {
        tax
          .get('categories')
          .sortBy((category) => category.getIn(['attributes', 'draft']))
          .forEach((category, catId) => {
            if (categories.includes(parseInt(catId, 10))) {
              const label = (category.getIn(['attributes', 'short_title']) && category.getIn(['attributes', 'short_title']).trim().length > 0
                ? category.getIn(['attributes', 'short_title'])
                : category.getIn(['attributes', 'title']));
              tags.push({
                id: `${catId}-${tax.get('id')}`,
                taxId: tax.get('id'),
                title: category.getIn(['attributes', 'title']),
                label: truncateText(label, TEXT_TRUNCATE.ENTITY_TAG, categories.size < 5),
                onClick: () => onClick(catId, 'category'),
              });
            }
          });
      });
  }
  return tags;
};

function EntityListItemMainBottom({
  connections, wrapper, categories, taxonomies, onEntityClick,
}) {
  const entityTags = categories && categories.size > 0 && getEntityTags(categories, taxonomies, onEntityClick);
  return (
    <Styled>
      {entityTags && (
        <Box direction="row" gap="hair" wrap>
          {entityTags && entityTags.map((tag) => (
            <EntityListItemMainTag tag={tag} key={tag.id} />
          ))}
        </Box>
      )}
      {connections && connections.length > 0 && connections.map((connection, i) => (
        <EntityListItemMainConnection
          key={i}
          connection={connection}
          wrapper={wrapper}
        />
      ))}
    </Styled>
  );
}

EntityListItemMainBottom.propTypes = {
  connections: PropTypes.array,
  wrapper: PropTypes.object,
  categories: PropTypes.instanceOf(Map), // eslint-disable-line react/no-unused-prop-types
  taxonomies: PropTypes.instanceOf(Map), // eslint-disable-line react/no-unused-prop-types
  onEntityClick: PropTypes.func,
};

export default EntityListItemMainBottom;
