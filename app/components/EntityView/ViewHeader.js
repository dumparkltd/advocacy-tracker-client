import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, Text } from 'grommet';
import { LinkPrevious } from 'grommet-icons';
import ButtonFactory from 'components/buttons/ButtonFactory';
import Button from 'components/buttons/ButtonSimple';
import PrintHide from 'components/styled/PrintHide';
import PrintOnly from 'components/styled/PrintOnly';

import { usePrint } from 'containers/App/PrintContext';
import { CONTENT_PAGE } from 'containers/App/constants';

import ViewPanel from './ViewPanel';
import ViewPanelInside from './ViewPanelInside';
import Main from './Main';


const Styled = styled.div`
  padding-top: ${({ isPage, isPrint }) => isPage || isPrint ? '40px' : 0};
  @media print {
    padding-top: 40pt;
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
const MyButton = styled((p) => <Button {...p} />)`
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
                  <Box direction="row" align="center" gap="small">
                    {buttons.map(
                      (button, i) => (
                        <Box pad="xsmall" key={i}>
                          <ButtonFactory button={button} />
                        </Box>
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
