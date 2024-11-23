import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, ResponsiveContext } from 'grommet';

import { isMinSize } from 'utils/responsive';

import { ROUTES } from 'themes/config';
import Icon from 'components/Icon';
import LinkMenu from './LinkMenu';

const Styled = styled(
  (p) => (<Box direction="row" align="end" {...p} />)
)`
  height: ${({ theme }) => theme.sizes.header.banner.heightMobileBottom}px;

  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    height: ${({ theme }) => theme.sizes.header.banner.height}px;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
  }
`;

const SearchLinkMenu = styled((p) => <LinkMenu {...p} />)`
  font-size: 13px;
  line-height: 15px;
  padding-top: 6px;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.ms}) {
    padding-top: 6px;
  }
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    height: ${({ theme }) => theme.sizes.header.banner.height}px;
    padding-top: 29px;
  }
  @media (min-width: ${({ theme }) => theme.breakpointsMin.large}) {
    font-size: 15px;
    line-height: 18px;
  }
`;

const MainMenu = ({ navItems, onClick, isAuth }) => {
  const size = React.useContext(ResponsiveContext);
  let iconSize = '17px';
  if (isMinSize(size, 'large')) {
    iconSize = '20px';
  }
  return (
    <Styled justify={isAuth ? 'end' : 'start'}>
      <div
        style={
          (!isAuth && isMinSize(size, 'ms'))
            ? { margin: '0 auto' }
            : null
        }
      >
        {navItems && navItems.map((item, i) => {
          if (item.path === ROUTES.SEARCH) {
            return (
              <SearchLinkMenu
                flex={{ shrink: 0 }}
                key={i}
                href={item.path}
                active={item.active}
                onClick={(evt) => {
                  if (evt) evt.stopPropagation();
                  if (evt) evt.preventDefault();
                  onClick(item.path);
                }}
                title={item.title}
              >
                <Box as="span" align="center" direction="row" gap="4px">
                  {isMinSize(size, 'large') && item.title}
                  <Icon name="search" size={iconSize} />
                </Box>
              </SearchLinkMenu>
            );
          }
          return (
            <LinkMenu
              flex={{ shrink: 0 }}
              key={i}
              href={item.path}
              active={item.active}
              onClick={(evt) => {
                if (evt) evt.stopPropagation();
                if (evt) evt.preventDefault();
                onClick(item.path);
              }}
            >
              {item.title}
            </LinkMenu>
          );
        })}
      </div>
    </Styled>
  );
};

MainMenu.propTypes = {
  navItems: PropTypes.array,
  onClick: PropTypes.func,
  isAuth: PropTypes.bool,
};

export default MainMenu;
