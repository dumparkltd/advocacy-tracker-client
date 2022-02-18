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

import Scrollable from 'components/styled/Scrollable';
import Icon from 'components/Icon';
import Button from 'components/buttons/Button';
import SupTitle from 'components/SupTitle';

import Sidebar from 'components/styled/Sidebar';
import SidebarHeader from 'components/styled/SidebarHeader';

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

const ToggleHide = styled(Button)`
  position: absolute;
  right:0;
  top:0;
`;
// color: ${palette('link', 3)};
// &:hover {
//   color: ${palette('linkHover', 3)};
// }
const SidebarWrapper = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  z-index: 100;
  left: 0;
  @media (min-width: ${(props) => props.theme.breakpoints.small}) {
    left: auto;
  }
`;

const STATE_INITIAL = {
  expandedGroups: {
    taxonomies: true,
    taxonomies_1: true,
    taxonomies_2: true,
    taxonomies_3: true,
    taxonomies_4: true,
    taxonomies_5: true,
    taxonomies_6: true,
    taxonomies_7: true,
    taxonomies_8: true,
    taxonomies_9: true,
    taxonomies_10: true,
    taxonomies_11: true,
    taxonomies_12: true,
    // connectedTaxonomies: true,
    actors: true,
    actions: true,
    targets: true,
    indicators: true,
    members: false,
    associations: false,
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
    } = this.props;
    const { intl } = this.context;
    return (
      <SidebarWrapper onClick={onHideSidebar}>
        <Sidebar onClick={(evt) => evt.stopPropagation()}>
          <ScrollableWrapper>
            <SidebarHeader>
              {isEditPanel && <SupTitle title={intl.formatMessage(messages.header.edit)} />}
              {!isEditPanel && <SupTitle title={intl.formatMessage(messages.header.filter)} />}
              <ToggleHide onClick={onHideSidebar}>
                <Icon name="close" />
              </ToggleHide>
            </SidebarHeader>
            <div>
              { (!isEditPanel || (isEditPanel && hasSelected && hasEntities)) && (
                <EntityListSidebarGroups
                  groups={fromJS(panelGroups)}
                  onShowForm={this.onShowForm}
                  onToggleGroup={this.onToggleGroup}
                  expanded={this.state.expandedGroups}
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
  setActiveOption: PropTypes.func,
};

EntityListSidebar.contextTypes = {
  intl: PropTypes.object.isRequired,
};

export default EntityListSidebar;
