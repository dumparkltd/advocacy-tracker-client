import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
  Box, Button, Text, ResponsiveContext,
} from 'grommet';
import { LinkPrevious } from 'grommet-icons';
import ButtonFactory from 'components/buttons/ButtonFactory';
import PrintHide from 'components/styled/PrintHide';
import PrintOnly from 'components/styled/PrintOnly';

import { usePrint } from 'containers/App/PrintContext';
import { CONTENT_PAGE } from 'containers/App/constants';

import { isMaxSize } from 'utils/responsive';

import ViewPanel from './ViewPanel';
import ViewPanelInside from './ViewPanelInside';
import Main from './Main';

const Styled = styled.div`
  padding-top: ${({ isPage, isPrint }) => isPage || isPrint ? '40px' : 0};
  @media print {
    padding-top: 40pt;
  }
`;

const StyledButtonBox = styled((p) => <Box {...p} />)`
  @media (max-width: ${({ theme }) => theme.breakpoints.ms}){
    max-width:100px
  }
`;

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

const TitleMedium = styled.h3`
  line-height: 1;
  margin: 15px 0;
  display: inline-block;
  @media print {
    margin-bottom: 5px;
  }
`;
function ViewHeader({
  title,
  buttons,
  onClose,
  onTypeClick,
  type,
}) {
  const size = useContext(ResponsiveContext);
  const isPrintView = usePrint();
  return (
    <Styled isPrint={isPrintView} isPage={type === CONTENT_PAGE}>
      <ViewPanel>
        <ViewPanelInside>
          <Main>
            <PrintHide>
              <Box
                direction="row"
                pad={{
                  top: 'medium',
                  horizontal: type !== CONTENT_PAGE ? 'medium' : 'none',
                  bottom: 'small',
                }}
                align="center"
                justify="between"
              >
                {type !== CONTENT_PAGE && (
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
                    {!onTypeClick && type !== CONTENT_PAGE && (
                      <Box pad="xsmall">
                        <Text size="small">
                          {title}
                        </Text>
                      </Box>
                    )}
                  </Box>
                )}
                {type === CONTENT_PAGE && (
                  <Box>
                    <TitleMedium>{title}</TitleMedium>
                  </Box>
                )}
                {buttons && buttons.length > 0 && (
                  <Box direction="row" align="center" gap={isMaxSize(size, 'ms') ? '0px' : 'small'}>
                    {buttons.map(
                      (button, i) => (
                        <StyledButtonBox gap={isMaxSize(size, 'ms') ? '0px' : 'small'} key={i}>
                          <ButtonFactory button={button} />
                        </StyledButtonBox>
                      )
                    )}
                  </Box>
                )}
              </Box>
            </PrintHide>
            {type === CONTENT_PAGE && (
              <PrintOnly>
                <Box>
                  <TitleMedium>{title}</TitleMedium>
                </Box>
              </PrintOnly>
            )}
          </Main>
        </ViewPanelInside>
      </ViewPanel>
    </Styled>
  );
}

ViewHeader.propTypes = {
  title: PropTypes.string,
  type: PropTypes.string,
  buttons: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.bool,
  ]),
  onClose: PropTypes.func,
  onTypeClick: PropTypes.func,
};

export default ViewHeader;
