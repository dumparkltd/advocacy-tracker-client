import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Box } from 'grommet';

import appMessages from 'containers/App/messages';

import Icon from 'components/Icon';
import ScreenReaderOnly from 'components/styled/ScreenReaderOnly';

import LinkInHiddenMenu from './ToggleMenus/LinkInHiddenMenu';
import HiddenMenu from './ToggleMenus/HiddenMenu';
import Section from './ToggleMenus/Section';
import ToggleMenu from './ToggleMenus/ToggleButton';

const MainMenu = ({
  navItems,
  wide,
  onHideMenu,
  onClick,
}) => (
  <>
    <Box
      flex={{ grow: 1 }}
      direction="row"
      align="center"
      justify="end"
      pad={{ right: 'small' }}
    >
      <ToggleMenu onClick={() => onHideMenu()}>
        <ScreenReaderOnly>
          <FormattedMessage {...appMessages.buttons.showSecondaryNavigation} />
        </ScreenReaderOnly>
        <Icon name="close" size="39px" />
      </ToggleMenu>
    </Box>
    <HiddenMenu
      flex={{ grow: 1 }}
      direction="column"
      align="start"
      justify="start"
      wide={false}
      elevation="medium"
    >
      {!wide && navItems && navItems.main && navItems.main.length > 0 && (
        <Section
          fill="horizontal"
          align="start"
          justify="start"
        >
          {navItems.main.map((item, i) => (
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
      {navItems && navItems.pages && navItems.pages.length > 0 && (
        <Section
          fill="horizontal"
          align="start"
          justify="start"
        >
          {navItems.pages.map((page, i) => (
            <LinkInHiddenMenu
              key={i}
              href={page.path}
              active={page.active}
              onClick={(evt) => onClick(evt, page.path)}
              wide={wide}
            >
              {page.title}
            </LinkInHiddenMenu>
          ))}
        </Section>
      )}
      {navItems && navItems.other && navItems.other.length > 0 && (
        <Section
          fill="horizontal"
          align="start"
          justify="start"
        >
          {navItems.other.map((item, i) => (
            <LinkInHiddenMenu
              key={i}
              href={item.path}
              active={item.active}
              onClick={(evt) => {
                evt.stopPropagation();
                onHideMenu();
                onClick(evt, item.path);
              }}
              wide={wide}
            >
              {item.title}
            </LinkInHiddenMenu>
          ))}
        </Section>
      )}
    </HiddenMenu>
  </>
);

MainMenu.propTypes = {
  navItems: PropTypes.object,
  onClick: PropTypes.func,
  onHideMenu: PropTypes.func,
  wide: PropTypes.bool,
};
export default MainMenu;
