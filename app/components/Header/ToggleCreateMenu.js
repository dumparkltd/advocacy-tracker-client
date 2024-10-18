import React, { useState } from 'react';
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

import ToggleButtonCreate from './ToggleMenus/ToggleButtonCreate';
import messages from './messages';

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

const HintWrapper = styled((p) => <Box pad={{ bottom: 'small' }} {...p} />)`
  border-bottom: 1px solid ${palette('light', 1)};
`;
const Hint = styled((p) => <Text size="xsmall" {...p} />)`
  color: ${palette('dark', 3)};
`;
const TitleWrapper = styled((p) => <Box pad={{ bottom: 'xlarge', top: 'small' }} {...p} />)``;
const Title = styled((p) => <Text {...p} />)`
 font-family: ${({ theme }) => theme.fonts.title};
 font-weight: normal;
 font-size: 42px;
 margin-top: 0px;
`;
const AddIconWrapper = styled((p) => <Box {...p} />)`
  color: ${palette('primary', 1)};
  background-color: white;
  border-radius: 999px;
  border: none;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1), 0px 1px 3px rgba(0, 0, 0, 0.08);
  padding: 10px;
`;
const ItemButton = styled((p) => <Button as="a" pad="xsmall" {...p} />)`
  background-color: white;
  border: none;
  &:hover {
    color: ${palette('primary', 0)};
    box-shadow: none;
  }
`;
const ItemWrapper = styled((p) => <Box {...p} />)`
  border-bottom: 1px solid ${palette('light', 1)};
  &:hover {
    color: ${palette('primary', 0)};
  }
`;
const ExpandItems = styled((p) => <Button plain {...p} />)`
  color: ${palette('primary', 1)};
  font-family: ${({ theme }) => theme.fonts.title};
  font-weight: normal;
  &:hover {
    color: ${palette('primary', 0)};
  }
`;

const CreateMenu = ({
  navItems,
  onClick,
  onShow,
  onHide,
  show,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayedNavItems = isExpanded ? navItems : navItems.slice(0, 4);
  return (
    <Styled>
      {show && (
        <Menu>
          <Box
            pad="small"
            fill="horizontal"
            align="start"
            justify="start"
            elevation="medium"
            flex={{ shrink: 0 }}
          >
            <Box fill="horizontal" pad={{ bottom: 'small', horizontal: 'small' }}>
              <TitleWrapper>
                <Title>
                  <FormattedMessage {...messages.addLabel} />
                </Title>
              </TitleWrapper>
              <HintWrapper>
                <Hint>
                  <FormattedMessage {...messages.selectLabel} />
                </Hint>
              </HintWrapper>
              <Box margin={{ left: 'xsmall' }}>
                {displayedNavItems && displayedNavItems.map((item, i) => (
                  <ItemButton
                    key={i}
                    href={item.path}
                    active={item.active}
                    onClick={(evt) => {
                      evt.stopPropagation();
                      onHide();
                      onClick(evt, item.path);
                    }}
                  >
                    <ItemWrapper
                      direction="row"
                      justify="between"
                      align="center"
                      fill="horizontal"
                      pad={{ vertical: 'xsmall' }}
                    >
                      <Text>{item.title}</Text>
                      <Box
                        width="79px"
                        align="center"
                      >
                        <AddIconWrapper>
                          <Icon
                            name="add"
                            size="14px"
                            hasStroke
                          />
                        </AddIconWrapper>
                      </Box>
                    </ItemWrapper>
                  </ItemButton>
                ))}
              </Box>
              <ExpandItems
                label={
                  isExpanded
                    ? <FormattedMessage {...messages.showLessLabel} />
                    : <FormattedMessage {...messages.showMoreLabel} />
                }
                onClick={() => setIsExpanded(!isExpanded)}
                margin={{ left: 'xsmall' }}
              />
            </Box>
          </Box>
        </Menu>
      )}
      <div
        style={{ position: 'relative', top: '50%', zIndex: '111', right: '5px' }}
      >
        <ToggleButtonCreate onClick={() => show ? onHide() : onShow()}>
          <ScreenReaderOnly>
            <FormattedMessage {...appMessages.buttons.showSecondaryNavigation} />
          </ScreenReaderOnly>
          <div style={{ transform: show ? 'rotate(0)' : 'rotate(45deg)' }}>
            <Icon name="close" size="39px" />
          </div>
        </ToggleButtonCreate>
      </div>
    </Styled>
  );
};

CreateMenu.propTypes = {
  navItems: PropTypes.array,
  onClick: PropTypes.func,
  show: PropTypes.bool,
  onShow: PropTypes.func,
  onHide: PropTypes.func,
};

export default CreateMenu;
