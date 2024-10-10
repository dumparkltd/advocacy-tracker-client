import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Box } from 'grommet';

import appMessages from 'containers/App/messages';

import Icon from 'components/Icon';
import ScreenReaderOnly from 'components/styled/ScreenReaderOnly';

import ToggleMenu from './ToggleMenus/ToggleButton';
import LinkInHiddenMenu from './ToggleMenus/LinkInHiddenMenu';
import HiddenMenu from './ToggleMenus/HiddenMenu';
import Section from './ToggleMenus/Section';

const UserMenu = ({ navItems, onHideMenu, onClick }) => (
  <>
    <Box flex={{ grow: 1 }} direction="row" align="center" justify="end" pad={{ right: 'small' }}>
      <ToggleMenu onClick={onHideMenu}>
        <ScreenReaderOnly>
          <FormattedMessage {...appMessages.buttons.showSecondaryNavigation} />
        </ScreenReaderOnly>
        <Icon name="close" size="39px" />
      </ToggleMenu>
    </Box>
    <HiddenMenu flex={{ grow: 1 }} direction="column" align="start" justify="start" wide={false} elevation="medium">
      {navItems && navItems.user && navItems.user.length > 0 && (
        <Section fill="horizontal" align="start" justify="start">
          {navItems.user.map((item, i) => (
            <LinkInHiddenMenu
              key={i}
              href={item.path}
              active={item.active}
              onClick={(evt) => {
                evt.stopPropagation();
                onHideMenu();
                onClick(evt, item.path);
              }}
            >
              {item.title}
            </LinkInHiddenMenu>
          ))}
        </Section>
      )}
    </HiddenMenu>
  </>
);

UserMenu.propTypes = {
  navItems: PropTypes.object,
  onHideMenu: PropTypes.func,
  onClick: PropTypes.func,
};

export default UserMenu;
