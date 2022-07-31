/*
 *
 * EntityListSidebar
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import { fromJS } from 'immutable';
import { Box, Button } from 'grommet';

import Scrollable from 'components/styled/Scrollable';
import Icon from 'components/Icon';
import SupTitle from 'components/SupTitle';

import Sidebar from 'components/styled/Sidebar';
import SidebarHeader from 'components/styled/SidebarHeader';
import MapMemberOption from 'containers/MapContainerOLD/MapInfoOptions/MapMemberOption';

import EntityListSidebarGroups from './EntityListSidebarGroups';

import messages from './messages';

// const Main = styled.div``;
const ScrollableWrapper = styled(Scrollable)`
  background-color: ${palette('aside', 0)};
`;

const ListEntitiesEmpty = styled.div`
  font-size: 1.2em;
  padding: 1.5em;
  color: ${palette('text', 1)};
  @media print {
    font-size: ${(props) => props.theme.sizes.print.large};
  }
`;

const SidebarWrapper = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  z-index: 100;
  width: 100%;
  @media (min-width: ${(props) => props.theme.breakpoints.medium}) {
    width: auto;
  }
`;

const STATE_INITIAL = {
  expandedGroups: {
    taxonomies: false,
    taxonomies_1: false,
    taxonomies_2: false,
    taxonomies_3: false,
    taxonomies_4: false,
    taxonomies_5: false,
    taxonomies_6: false,
    taxonomies_7: false,
    taxonomies_8: false,
    taxonomies_9: false,
    taxonomies_10: false,
    taxonomies_11: false,
    taxonomies_12: false,
    taxonomies_13: false,
    actors: false,
    actions: false,
    targets: false,
    members: false,
    associations: false,
    indicators: false,
    users: false,
    resources: false,
    parents: false,
    attributes: false,
  },
};

export class EntityListSidebar extends React.Component { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();
    this.state = STATE_INITIAL;
  }

  UNSAFE_componentWillMount() {
    this.setState(STATE_INITIAL);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.activePanel !== this.props.activePanel) {
      // close and reset option panel
      this.props.setActiveOption(null);
    }
  }

  onShowForm = (option) => this.props.setActiveOption(option.active ? null : option);

  onToggleGroup = (groupId, expanded) => {
    this.setState((prevState) => {
      const expandedGroups = { ...prevState.expandedGroups };
      expandedGroups[groupId] = expanded;
      return ({
        expandedGroups,
        activeOption: null,
      });
    });
  }

  render() {
    const {
      isEditPanel,
      hasEntities,
      hasSelected,
      panelGroups,
      onHideSidebar,
      onHideOptions,
      onUpdateQuery,
      memberOption,
    } = this.props;
    const { intl } = this.context;
    return (
      <SidebarWrapper onClick={onHideSidebar}>
        <Sidebar onClick={(evt) => evt.stopPropagation()}>
          <ScrollableWrapper>
            <SidebarHeader>
              <Box direction="row" justify="between" align="center">
                {isEditPanel && <SupTitle title={intl.formatMessage(messages.header.edit)} />}
                {!isEditPanel && <SupTitle title={intl.formatMessage(messages.header.filter)} />}
                <Button plain onClick={onHideSidebar}>
                  <Icon name="close" />
                </Button>
              </Box>
              {memberOption && (
                <Box margin={{ top: 'small' }}>
                  <MapMemberOption option={memberOption} />
                </Box>
              )}
            </SidebarHeader>
            <div>
              { (!isEditPanel || (isEditPanel && hasSelected && hasEntities)) && (
                <EntityListSidebarGroups
                  groups={fromJS(panelGroups)}
                  onShowForm={this.onShowForm}
                  onHideOptions={onHideOptions}
                  onToggleGroup={this.onToggleGroup}
                  expanded={this.state.expandedGroups}
                  onUpdateQuery={onUpdateQuery}
                />
              )}
              { isEditPanel && hasEntities && !hasSelected && (
                <ListEntitiesEmpty>
                  <FormattedMessage {...messages.entitiesNotSelected} />
                </ListEntitiesEmpty>
              )}
            </div>
          </ScrollableWrapper>
        </Sidebar>
      </SidebarWrapper>
    );
  }
}
EntityListSidebar.propTypes = {
  activePanel: PropTypes.string,
  isEditPanel: PropTypes.bool,
  hasEntities: PropTypes.bool,
  hasSelected: PropTypes.bool,
  panelGroups: PropTypes.object,
  onHideSidebar: PropTypes.func,
  onHideOptions: PropTypes.func,
  setActiveOption: PropTypes.func,
  onUpdateQuery: PropTypes.func,
  memberOption: PropTypes.object,
};

EntityListSidebar.contextTypes = {
  intl: PropTypes.object.isRequired,
};

export default EntityListSidebar;
