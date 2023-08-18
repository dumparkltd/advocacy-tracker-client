import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
  Box, Button, Text, ResponsiveContext,
} from 'grommet';
import { LinkPrevious } from 'grommet-icons';
import ButtonFactory from 'components/buttons/ButtonFactory';

import { isMinSize, isMaxSize } from 'utils/responsive';

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
            <Box direction="row" align="center" gap="small">
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
            {isMinSize(size, 'ms')
              && buttons && buttons.length > 0
              && (
                <Box direction="row" align="center" gap="small">
                  <Box direction="row" align="center" gap="small">
                    {buttons.map(
                      (button, i) => (
                        <Box pad="xsmall" key={i}>
                          <ButtonFactory button={button} />
                        </Box>
                      )
                    )}
                  </Box>
                </Box>
              )}
          </Box>
          {isMaxSize(size, 'small')
            && buttons && buttons.length > 0
            && (
              <Box
                direction="row"
                pad={{ top: 'medium', horizontal: 'medium', bottom: 'small' }}
                align="end"
                justify="between"
              >
                <Box direction="row" align="center" gap="small">
                  <Box direction="row" align="center" gap="small">
                    {buttons.map(
                      (button, i) => (
                        <Box pad="xsmall" key={i}>
                          <ButtonFactory button={button} />
                        </Box>
                      )
                    )}
                  </Box>
                </Box>
              </Box>
            )}
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
