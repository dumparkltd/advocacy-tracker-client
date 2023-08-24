import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
  Box, Button, Text, ResponsiveContext,
} from 'grommet';
import { LinkPrevious } from 'grommet-icons';
import ButtonFactory from 'components/buttons/ButtonFactory';

import { isMaxSize } from 'utils/responsive';

import ViewPanel from './ViewPanel';
import ViewPanelInside from './ViewPanelInside';
import Main from './Main';

const Between = styled((p) => <Box plain {...p} />)`
  flex: 0 0 auto;
  align-self: stretch;
  width: 1px;
  position: relative;
  &:after {
    content: "";
    position: absolute;
    height: 100%;
    left: 0;
    border-left: 1px solid rgba(0, 0, 0, 0.15);
  }
`;
const MyButton = styled((p) => <Button plain {...p} />)`
  color: ${({ theme }) => theme.global.colors.brand};
  stroke: ${({ theme }) => theme.global.colors.brand};
  &:hover {
    color: ${({ theme }) => theme.global.colors.highlight};
    stroke: ${({ theme }) => theme.global.colors.highlight};
  }
`;
const StyledButtonBox = styled((p) => <Box {...p} />)`
  @media (max-width: ${({ theme }) => theme.breakpoints.ms}){
    max-width:100px
  }
`;
function ViewHeader({
  title,
  buttons,
  onClose,
  onTypeClick,
}) {
  const size = React.useContext(ResponsiveContext);

  return (
    <ViewPanel>
      <ViewPanelInside>
        <Main>
          <Box
            direction="row"
            pad={{ top: 'medium', horizontal: 'medium', bottom: 'small' }}
            align="center"
            justify="between"
          >
            <Box direction="row" align="center" gap="xsmall">
              {onClose && (
                <MyButton onClick={onClose} title="Back to previous view">
                  <Box pad="xsmall">
                    <LinkPrevious size="xsmall" color="inherit" />
                  </Box>
                </MyButton>
              )}
              {onClose && (
                <Between />
              )}
              {onTypeClick && (
                <MyButton onClick={onTypeClick} title={title}>
                  <Box pad="xsmall">
                    <Text size="small">
                      {title}
                    </Text>
                  </Box>
                </MyButton>
              )}
              {!onTypeClick && (
                <Box pad="xsmall">
                  <Text size="small">
                    {title}
                  </Text>
                </Box>
              )}
            </Box>
            {buttons && buttons.length > 0
              && (
                <Box direction="row" align="center" gap={isMaxSize(size, 'ms') ? '0px' : 'small'}>
                  <Box direction="row" align="center" gap={isMaxSize(size, 'ms') ? '0px' : 'small'}>
                    {buttons.map(
                      (button, i) => (
                        <StyledButtonBox gap={isMaxSize(size, 'ms') ? '0px' : 'small'} key={i}>
                          <ButtonFactory button={button} />
                        </StyledButtonBox>
                      )
                    )}
                  </Box>
                </Box>
              )}
          </Box>
        </Main>
      </ViewPanelInside>
    </ViewPanel>
  );
}

ViewHeader.propTypes = {
  title: PropTypes.string,
  buttons: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.bool,
  ]),
  onClose: PropTypes.func,
  onTypeClick: PropTypes.func,
};

export default ViewHeader;
