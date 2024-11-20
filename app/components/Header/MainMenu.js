import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box } from 'grommet';
import { ROUTES } from 'themes/config';
import Icon from 'components/Icon';
import LinkMenu from './LinkMenu';

const Styled = styled(
  (p) => (<Box direction="row" align="end" {...p} />)
)`
  height: ${({ theme }) => theme.sizes.header.banner.heightMobileBottom}px;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.large}) {
    height: ${({ theme }) => theme.sizes.header.banner.height}px;
  }
`;

const SearchLinkMenu = styled((p) => <LinkMenu {...p} />)`
  font-size: 13px;
  line-height: 15px;
  padding-bottom: 3px;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.ms}) {
    padding-bottom: 4px;
  }
  @media (min-width: ${({ theme }) => theme.breakpointsMin.large}) {
    font-size: 15px;
    line-height: 18px;
    padding-top: 29px;
  }
`;

const MainMenu = ({ navItems, onClick }) => (
  <Styled>
    {
      navItems.map((item, i) => {
        if (item.path === ROUTES.SEARCH) {
          return (
            <SearchLinkMenu
              flex={{ shrink: 0 }}
              key={i}
              href={item.path}
              active={item.active}
              onClick={(evt) => {
                if (evt) evt.stopPropagation();
                onClick(item.path);
              }}
            >
              <Box as="span" align="center" direction="row" gap="4px">
                {item.title}
                <Icon name="search" size="20px" />
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
              onClick(item.path);
            }}
          >
            {item.title}
          </LinkMenu>
        );
      })
    }
  </Styled>
);

MainMenu.propTypes = {
  navItems: PropTypes.array,
  onClick: PropTypes.func,
};

export default MainMenu;
