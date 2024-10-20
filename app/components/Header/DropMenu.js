import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import {
  Box, Button, Text,
} from 'grommet';

import Icon from 'components/Icon';
import ScreenReaderOnly from 'components/styled/ScreenReaderOnly';
import appMessages from 'containers/App/messages';

import DropMenuGroup from './DropMenuGroup';

const Styled = styled.div`
  position: relative;
  z-index:110;
`;
const Menu = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  background: white;
  width: 100%;
  z-index: 110;
  @media (min-width: ${({ theme }) => theme.breakpoints.large}) {
    width: 300px;
  }
`;


const Title = styled((p) => <Text {...p} />)`
 font-family: ${({ theme }) => theme.fonts.title};
 font-weight: normal;
 font-size: 42px;
 margin-top: 0px;
`;

const ToggleButton = styled((p) => <Button plain {...p} />)`
  display: block;
  border-radius: 999px;
  z-index: 300;
  color: white;
  padding: ${({ menuType }) => {
    if (menuType === 'add') {
      return '10px';
    }
    return '5px';
  }};
  margin: ${({ menuType }) => {
    if (menuType === 'add') {
      return '0';
    }
    return '5px';
  }};
  background-color: ${({ menuType, open }) => {
    if (menuType === 'add' || open) {
      return palette('primary', 1);
    }
    return 'transparent';
  }};
  box-shadow: ${({ menuType, open }) => {
    if (menuType === 'add' || open) {
      return '0px 2px 4px 0px rgba(0,0,0,0.2)';
    }
    return 'none';
  }};
  &:hover {
    background-color: ${({ menuType, open }) => {
    if (menuType === 'add' || open) {
      return palette('primary', 0);
    }
    return 'transparent';
  }};
  opacity: ${({ menuType, open }) => {
    if (menuType === 'add' || open) {
      return 1;
    }
    return 0.9;
  }};
  }
`;

const DropMenu = ({
  title,
  type,
  navItemGroups,
  onClick,
  icon = 'menu',
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);
  return (
    <Styled ref={ref}>
      {open && (
        <Menu>
          <Box
            pad="small"
            fill="horizontal"
            align="start"
            justify="start"
            elevation="medium"
            flex={{ shrink: 0 }}
          >
            <Box
              fill="horizontal"
              pad={{ bottom: 'small', horizontal: 'small' }}
            >
              <Box pad={{ bottom: 'xlarge', top: 'small' }}>
                <Title>{title}</Title>
              </Box>
              <Box margin={{ left: 'xsmall' }} gap="small">
                {Object.values(navItemGroups).filter((g) => !!g).map((group, index) => (
                  <DropMenuGroup
                    key={index}
                    group={group}
                    onClick={(path) => {
                      setOpen(false);
                      onClick(path);
                    }}
                    type={type}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </Menu>
      )}
      <div
        style={{
          position: 'relative',
          top: type === 'add' ? '50%' : '0',
          zIndex: '111',
          right: '5px',
        }}
      >
        <ToggleButton
          onClick={() => setOpen(!open)}
          open={open}
          menuType={type}
        >
          <ScreenReaderOnly>
            <FormattedMessage {...appMessages.buttons.showSecondaryNavigation} />
          </ScreenReaderOnly>
          {open && (
            <div style={{ transform: 'rotate(0)' }}>
              <Icon name="close" size="39px" />
            </div>
          )}
          {!open && type === 'add' && (
            <div style={{ transform: 'rotate(45deg)' }}>
              <Icon name="close" size="39px" />
            </div>
          )}
          {!open && icon && type !== 'add' && (
            <Icon name={icon} size="39px" />
          )}
        </ToggleButton>
      </div>
    </Styled>
  );
};

DropMenu.propTypes = {
  title: PropTypes.string,
  hint: PropTypes.string,
  icon: PropTypes.string,
  type: PropTypes.string,
  navItemGroups: PropTypes.array, // groups[{ title, items: [] }]
  onClick: PropTypes.func,
  show: PropTypes.bool,
  onShow: PropTypes.func,
  onHide: PropTypes.func,
};

export default DropMenu;
