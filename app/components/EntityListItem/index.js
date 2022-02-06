import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import { Map, List } from 'immutable';
import { Box } from 'grommet';

import Messages from 'components/Messages';

import EntityListItemMain from './EntityListItemMain';
import EntityListItemSelect from './EntityListItemSelect';

// import messages from './messages';

const Styled = styled((p) => <Box {...p} />)``;
const Item = styled((p) => <Box direction="row" align="start" {...p} />)`
  color: ${palette('mainListItem', 0)};
  background-color: ${palette('mainListItem', 1)};
  border-bottom: ${(props) => props.error ? '1px solid' : 0};
  border-left: ${(props) => props.error ? '1px solid' : 0};
  border-right: ${(props) => props.error ? '1px solid' : 0};
  border-color: ${palette('error', 0)};
`;

class EntityListItem extends React.Component { // eslint-disable-line react/prefer-stateless-function
  shouldComponentUpdate(nextProps) {
    return this.props.entity !== nextProps.entity
      || this.props.isSelected !== nextProps.isSelected
      || this.props.wrapper !== nextProps.wrapper
      || this.props.error !== nextProps.error;
  }

  transformMessage = (type, msg) => msg;

  render() {
    const {
      entity,
      isManager,
      isSelected,
      onSelect,
      entityIcon,
      config,
      taxonomies,
      onEntityClick,
      connections,
      error,
      inSingleView,
      entityPath,
      url,
      showCode,
    } = this.props;
    return (
      <Styled>
        { error && error.map((updateError, i) => (
          <Messages
            key={i}
            type="error"
            messages={
              updateError
                .getIn(['error', 'messages'])
                .map((msg) => this.transformMessage(updateError.get('type'), msg))
                .valueSeq()
                .toArray()
            }
            onDismiss={() => this.props.onDismissError(updateError.get('key'))}
            preMessage={false}
            details
          />
        ))}
        <Item error={error}>
          {isManager && (
            <EntityListItemSelect checked={isSelected} onSelect={onSelect} />
          )}
          <EntityListItemMain
            entity={entity}
            taxonomies={taxonomies}
            connections={connections}
            entityIcon={entityIcon}
            config={config}
            onEntityClick={onEntityClick}
            wrapper={this.props.wrapper}
            isManager={isManager}
            inSingleView={inSingleView}
            entityPath={entityPath}
            url={url}
            showCode={showCode}
          />
        </Item>
      </Styled>
    );
  }
}

EntityListItem.propTypes = {
  entity: PropTypes.instanceOf(Map).isRequired,
  taxonomies: PropTypes.instanceOf(Map),
  connections: PropTypes.instanceOf(Map),
  error: PropTypes.instanceOf(List),
  isManager: PropTypes.bool,
  isSelected: PropTypes.bool,
  inSingleView: PropTypes.bool,
  onSelect: PropTypes.func,
  entityIcon: PropTypes.func,
  config: PropTypes.object,
  onEntityClick: PropTypes.func,
  onDismissError: PropTypes.func,
  wrapper: PropTypes.object,
  entityPath: PropTypes.string,
  url: PropTypes.string,
  showCode: PropTypes.bool,
};

EntityListItem.defaultProps = {
  isSelected: false,
};

EntityListItem.contextTypes = {
  intl: PropTypes.object,
};

export default EntityListItem;
