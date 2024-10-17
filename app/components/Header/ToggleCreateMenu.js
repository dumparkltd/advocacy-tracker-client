import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import {
  Box, Button, Text,
} from 'grommet';

import appMessages from 'containers/App/messages';
import Icon from 'components/Icon';
import ScreenReaderOnly from 'components/styled/ScreenReaderOnly';

import messages from './messages';

import ToggleButtonCreate from './ToggleMenus/ToggleButtonCreate';
import HiddenMenu from './ToggleMenus/HiddenMenu';
import Section from './ToggleMenus/Section';

const Styled = styled((p) => <Box fill="horizontal" {...p} />)``;
const StyledHiddenMenu = styled((p) => <HiddenMenu {...p} />)`
  top: 0px;
  right: 0px;
  z-index: 301;
  @media (min-width: ${(props) => props.theme.breakpoints.large}) {
    right: 105px;
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
  onHideMenu,
  navItems,
  onClick,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayedNavItems = isExpanded ? navItems : navItems.slice(0, 4);
  return (
    <StyledHiddenMenu
      flex={{ grow: 1 }}
      direction="column"
      align="start"
      justify="start"
      wide={false}
      elevation="medium"
    >
      <ToggleButtonCreate showMenu onClick={() => onHideMenu()}>
        <ScreenReaderOnly>
          <FormattedMessage {...appMessages.buttons.showSecondaryNavigation} />
        </ScreenReaderOnly>
        <Icon name="close" size="39px" />
      </ToggleButtonCreate>
      <Section
        pad="small"
        fill="horizontal"
        align="start"
        justify="start"
      >
        <Styled pad={{ bottom: 'small', horizontal: 'small' }}>
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
                  onHideMenu();
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
        </Styled>
      </Section>
    </StyledHiddenMenu>
  );
};

CreateMenu.propTypes = {
  navItems: PropTypes.array,
  onClick: PropTypes.func,
  onHideMenu: PropTypes.func,
};

export default CreateMenu;
