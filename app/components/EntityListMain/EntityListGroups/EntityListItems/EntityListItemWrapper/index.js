import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import { Map, List } from 'immutable';

import EntityListItem from 'components/EntityListItem';

const ItemWrapper = styled.div`
  padding: ${({ separated }) => separated ? '5px 0 10px' : '0'};
  margin-top: 10px;
  @media print {
    margin-top: 20px;
    margin-bottom: 20px;
    page-break-inside: avoid;
    border-top: 1px solid ${palette('light', 1)};
  }
`;

export class EntityListItemWrapper extends React.Component { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    this.state = { wrapper: null };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.entity !== nextProps.entity
    || this.props.errors !== nextProps.errors
    || this.props.entityIdsSelected !== nextProps.entityIdsSelected
    || this.state.wrapper !== nextState.wrapper;
  }

  render() {
    const {
      isManager,
      onEntitySelect,
      entityIcon,
      entityIdsSelected,
      taxonomies,
      connections,
      config,
      onEntityClick,
      entity,
      entityPath,
      inSingleView,
      url,
      showCode,
    } = this.props;
    return (
      <ItemWrapper
        ref={(node) => {
          if (!this.state.wrapper) {
            this.setState({ wrapper: node });
          }
        }}
      >
        {this.state.wrapper
          && (
            <div>
              <EntityListItem
                entity={entity}
                error={this.props.errors ? this.props.errors.get(entity.get('id')) : null}
                onDismissError={this.props.onDismissError}
                isManager={isManager}
                inSingleView={inSingleView}
                isSelected={isManager && entityIdsSelected.includes(entity.get('id'))}
                onSelect={(checked) => onEntitySelect(entity.get('id'), checked)}
                entityIcon={entityIcon}
                taxonomies={taxonomies}
                connections={connections}
                config={config}
                onEntityClick={onEntityClick}
                entityPath={entityPath}
                url={url}
                wrapper={this.state.wrapper}
                showCode={showCode}
              />
            </div>
          )
        }
      </ItemWrapper>
    );
  }
}

EntityListItemWrapper.propTypes = {
  showCode: PropTypes.bool,
  entity: PropTypes.instanceOf(Map).isRequired,
  taxonomies: PropTypes.instanceOf(Map),
  connections: PropTypes.instanceOf(Map),
  errors: PropTypes.instanceOf(Map),
  entityIdsSelected: PropTypes.instanceOf(List),
  config: PropTypes.object,
  isManager: PropTypes.bool,
  onEntityClick: PropTypes.func,
  onEntitySelect: PropTypes.func,
  onDismissError: PropTypes.func,
  entityPath: PropTypes.string,
  url: PropTypes.string,
  entityIcon: PropTypes.func,
  inSingleView: PropTypes.bool,
};

export default EntityListItemWrapper;
