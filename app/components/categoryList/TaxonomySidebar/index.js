import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import styled, { withTheme } from 'styled-components';

import { map } from 'lodash/collection';

import { VIEWPORTS } from 'containers/App/constants';

import SupTitle from 'components/SupTitle';
import TaxonomySidebarItem from 'components/categoryList/TaxonomySidebarItem';
import Icon from 'components/Icon';

import Button from 'components/buttons/Button';
import ButtonDefault from 'components/buttons/ButtonDefault';

import Component from 'components/styled/Component';
import SidebarHeader from 'components/styled/SidebarHeader';
import SidebarGroupLabel from 'components/styled/SidebarGroupLabel';
import Sidebar from 'components/styled/Sidebar';
import Scrollable from 'components/styled/Scrollable';
import PrintHide from 'components/styled/PrintHide';

import { prepareTaxonomyGroups } from 'utils/taxonomies';

import appMessages from 'containers/App/messages';
import messages from './messages';

const ToggleShow = styled(ButtonDefault)`
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 100;
  padding: 0.75em 1em;
  letter-spacing: 0;
  border-radius: 0;
  box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.5);
  font-size: 0.85em;
  width: 100%;
  @media (min-width: ${(props) => props.theme.breakpoints.small}) {
    padding: 0.75em 1em;
    font-size: 0.85em;
    width: ${(props) => props.theme.sizes.aside.width.large}px;
  }
  @media print {
    font-size: ${(props) => props.theme.sizes.print.smaller};
  }
`;

const ToggleHide = styled(Button)`
  position: absolute;
  right:0;
  top:0;
`;

const STATE_INITIAL = {
  visible: false,
};

class TaxonomySidebar extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();
    this.state = STATE_INITIAL;
  }

  UNSAFE_componentWillMount() {
    this.setState(STATE_INITIAL);
  }

  componentDidMount() {
    this.updateViewport();
    window.addEventListener('resize', this.resize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
  }

  onShowSidebar = (evt) => {
    if (evt !== undefined && evt.preventDefault) evt.preventDefault();
    this.setState({ visible: true });
  };

  onHideSidebar = (evt) => {
    if (evt !== undefined && evt.preventDefault) evt.preventDefault();
    this.setState({ visible: false });
  };

  resize = () => {
    // reset
    this.setState(STATE_INITIAL);
    this.updateViewport();
    this.forceUpdate();
  };

  updateViewport() {
    let viewport = VIEWPORTS.MOBILE;
    if (window.innerWidth >= parseInt(this.props.theme.breakpoints.large, 10)) {
      viewport = VIEWPORTS.LARGE;
    } else if (window.innerWidth >= parseInt(this.props.theme.breakpoints.medium, 10)) {
      viewport = VIEWPORTS.MEDIUM;
    } else if (window.innerWidth >= parseInt(this.props.theme.breakpoints.small, 10)) {
      viewport = VIEWPORTS.SMALL;
    }
    this.setState({ viewport });
  }

  render() {
    const {
      taxonomies,
      active,
      onTaxonomyLink,
      actortypes,
      actiontypes,
    } = this.props;
    const actorTaxonomyGroups = actortypes && taxonomies && prepareTaxonomyGroups(
      taxonomies.filter((tax) => tax.get('actortypeIds').size > 0),
      active,
      onTaxonomyLink,
      actortypes,
    );
    const actionTaxonomyGroups = actiontypes && taxonomies && prepareTaxonomyGroups(
      taxonomies.filter((tax) => tax.get('actiontypeIds').size > 0),
      active,
      onTaxonomyLink,
      actiontypes,
    );
    const { intl } = this.context;
    return (
      <PrintHide>
        { (!this.state.visible && this.state.viewport < VIEWPORTS.SMALL)
          && (
            <ToggleShow onClick={this.onShowSidebar}>
              <FormattedMessage {...messages.show} />
            </ToggleShow>
          )
        }
        { (this.state.visible || this.state.viewport >= VIEWPORTS.SMALL)
          && (
            <Sidebar responsiveSmall>
              <Scrollable>
                <Component>
                  <SidebarHeader responsiveSmall taxonomies>
                    <SupTitle title={intl.formatMessage(messages.titleActions)} />
                    { this.state.viewport < VIEWPORTS.SMALL
                    && (
                      <ToggleHide onClick={this.onHideSidebar}>
                        <Icon name="close" />
                      </ToggleHide>
                    )
                    }
                  </SidebarHeader>
                  {actionTaxonomyGroups && map(actionTaxonomyGroups, (group) => (
                    <div key={group.id}>
                      <SidebarGroupLabel>
                        {group.typeId && (
                          <FormattedMessage
                            {... appMessages.taxonomyGroups.actions}
                            values={{
                              type: intl.formatMessage(
                                appMessages.entities[`actions_${group.typeId}`].plural
                              ),
                            }}
                          />
                        )}
                        {!group.typeId && (
                          <FormattedMessage {... appMessages.taxonomyGroups[group.id]} />
                        )}
                      </SidebarGroupLabel>
                      <div>
                        {map(group.taxonomies, (taxonomy) => (
                          <div key={taxonomy.id}>
                            <TaxonomySidebarItem taxonomy={taxonomy} onTaxonomyClick={this.onHideSidebar} />
                            <div>
                              { taxonomy.children && taxonomy.children.length > 0 && map(taxonomy.children, (child) => <TaxonomySidebarItem key={child.id} nested taxonomy={child} onTaxonomyClick={this.onHideSidebar} />)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <SidebarHeader responsiveSmall taxonomies>
                    <SupTitle title={intl.formatMessage(messages.titleActors)} />
                  </SidebarHeader>
                  {actorTaxonomyGroups && map(actorTaxonomyGroups, (group) => (
                    <div key={group.id}>
                      <SidebarGroupLabel>
                        {group.typeId && (
                          <FormattedMessage
                            {... appMessages.taxonomyGroups.actors}
                            values={{
                              type: intl.formatMessage(
                                appMessages.entities[`actors_${group.typeId}`].plural
                              ),
                            }}
                          />
                        )}
                        {!group.typeId && (
                          <FormattedMessage {... appMessages.taxonomyGroups[group.id]} />
                        )}
                      </SidebarGroupLabel>
                      <div>
                        {map(group.taxonomies, (taxonomy) => (
                          <div key={taxonomy.id}>
                            <TaxonomySidebarItem taxonomy={taxonomy} onTaxonomyClick={this.onHideSidebar} />
                            <div>
                              { taxonomy.children && taxonomy.children.length > 0 && map(taxonomy.children, (child) => <TaxonomySidebarItem key={child.id} nested taxonomy={child} onTaxonomyClick={this.onHideSidebar} />)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </Component>
              </Scrollable>
            </Sidebar>
          )
        }
      </PrintHide>
    );
  }
}

TaxonomySidebar.propTypes = {
  taxonomies: PropTypes.object,
  actortypes: PropTypes.object,
  actiontypes: PropTypes.object,
  onTaxonomyLink: PropTypes.func,
  active: PropTypes.string,
  theme: PropTypes.object,
};
TaxonomySidebar.contextTypes = {
  intl: PropTypes.object.isRequired,
};
export default withTheme(TaxonomySidebar);
