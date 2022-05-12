import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { palette } from 'styled-theme';
// import { isEqual } from 'lodash/lang'
import { Map } from 'immutable';
import { Box } from 'grommet';

import EntityListItemMainTitle from './EntityListItemMainTitle';
import EntityListItemMainTopReference from './EntityListItemMainTopReference';


const Styled = styled((p) => (
  <Box
    fill="horizontal"
    gap="xsmall"
    pad={{ vertical: 'small' }}
    margin={{ vertical: 'xsmall' }}
    {...p}
  />
))`
  border-bottom: 1px solid ${({ theme }) => theme.global.colors['light-3']};
`;
const EntityListItemMainTitleWrap = styled.a`
  text-decoration: none;
  display: block;
  color: ${palette('mainListItem', 0)};
  &:hover {
    color: ${palette('mainListItemHover', 0)};
  }
  @media print {
    padding: 1px 0 5px;
  }
`;

class EntityListItem extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  mapToEntityListItem = ({
    config,
    entity,
    entityPath,
    // taxonomies
  }) => ({
    id: entity.get('id'),
    title: entity.getIn(['attributes', 'name']) || entity.getIn(['attributes', 'title']),
    reference: entity.getIn(['attributes', 'code']),
    draft: entity.getIn(['attributes', 'draft']),
    path: (config && config.clientPath) || entityPath,
  });

  render() {
    const {
      onEntityClick, url, showCode,
    } = this.props;
    const entity = this.mapToEntityListItem(this.props);
    return (
      <Styled>
        <Box direction="row" justify="between">
          <Box>
            <EntityListItemMainTitleWrap
              onClick={(evt) => {
                evt.preventDefault();
                onEntityClick(entity.id, entity.path);
              }}
              href={url || `${entity.path}/${entity.id}`}
            >
              {entity.reference && showCode && (
                <EntityListItemMainTopReference>
                  {entity.reference}
                </EntityListItemMainTopReference>
              )}
              <EntityListItemMainTitle>
                {entity.title}
              </EntityListItemMainTitle>
            </EntityListItemMainTitleWrap>
          </Box>
        </Box>
      </Styled>
    );
  }
}

EntityListItem.propTypes = {
  entity: PropTypes.instanceOf(Map).isRequired, // eslint-disable-line react/no-unused-prop-types
  config: PropTypes.object, // eslint-disable-line react/no-unused-prop-types
  entityPath: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
  url: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
  onEntityClick: PropTypes.func,
  showCode: PropTypes.bool,
};

export default EntityListItem;
