import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, Text, ResponsiveContext } from 'grommet';
import ReactMarkdown from 'react-markdown';

import { isMinSize } from 'utils/responsive';

import {
  CONTENT_SINGLE, CONTENT_PAGE, CONTENT_MODAL,
} from 'containers/App/constants';

import SupTitle from 'components/SupTitle';
import InfoOverlay from 'components/InfoOverlay';
import ButtonFactory from 'components/buttons/ButtonFactory';
import BoxPrint from 'components/styled/BoxPrint';
import PrintHide from 'components/styled/PrintHide';

import { usePrint } from 'containers/App/PrintContext';

const Styled = styled.div`
  padding: ${({ isModal, hasViewOptions }) => {
    if (isModal) return '0 0 10px 10px';
    if (hasViewOptions) return '0';
    return '1em 0 0.5em';
  }};
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    padding: ${({ isModal, hasViewOptions }) => {
    if (isModal) return '20px 0 20px 24px';
    if (hasViewOptions) return '0';
    return '3em 0 1em';
  }};
  }
`;

// const TitleLarge = styled.h1`
//   line-height: 1;
//   margin-top: 10px;
// `;
export const TitleMedium = styled.h3`
  font-family: 'wwfregular', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  text-transform: uppercase;
  line-height: 1;
  margin: 15px 0;
  display: inline-block;
  font-weight: normal;
  font-size: 42px;
  position: relaive;
  top: -0.07em
`;
const TitleMediumPrint = styled.h3`
  font-family: 'wwfregular', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  text-transform: uppercase;
  margin-bottom: 0px;
  margin-top: 22px;
  font-size: 12pt;
  font-weight: normal;
  @media print {
    margin-bottom: 5px;
  }
`;
const ButtonWrap = styled.span`
  padding: 0 0.3em;
  &:last-child {
    padding: 0;
  }
  @media print {
    display: none;
  }
`;
const TitleButtonWrap = styled((p) => <Box align="center" direction="row" {...p} />)`
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    min-height: 62px;
    width: 100%;
  }
`;

const ButtonGroup = styled((p) => <Box align="center" direction="row" {...p} />)`
  text-align: left;
  margin-bottom: 10px;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    margin-bottom: -4px;
  }
`;

const SubTitle = styled.p`
  font-size: 1.1em;
  @media print {
    font-size: 0.9em;
  }
`;
const TitleWrap = styled(Box)``;

const MarkdownPrintOnly = styled(ReactMarkdown)`
  font-size: ${({ theme }) => theme.sizes.print.smaller};
  line-height: ${({ theme }) => theme.sizes.print.default};
`;
const InfoTitlePrintOnly = styled(Text)`
  font-size: ${({ theme }) => theme.sizes.print.smaller};
  line-height: ${({ theme }) => theme.sizes.print.default};
`;


const renderTitle = (type, title) => {
  switch (type) {
    case CONTENT_PAGE:
    case CONTENT_SINGLE:
      return (
        <SupTitle title={title} />
      );
    default:
      return (<TitleMedium>{title}</TitleMedium>);
  }
};

export function ContentHeader({
  type,
  supTitle,
  title,
  buttons,
  subTitle,
  hasViewOptions,
  info,
  entityIdsSelected,
}) {
  const isPrintView = usePrint();
  const size = React.useContext(ResponsiveContext);

  return (
    <Styled
      hasBottomBorder={type === CONTENT_PAGE || type === CONTENT_MODAL}
      isModal={type === CONTENT_MODAL}
      hasViewOptions={hasViewOptions}
    >
      <TitleWrap fill="horizontal">
        {info && (
          <BoxPrint printOnly>
            <Box>
              {info.title && (<InfoTitlePrintOnly>{info.title}</InfoTitlePrintOnly>)}
            </Box>
            <Box width={{ max: 'large' }}>
              {info.content && (
                <MarkdownPrintOnly source={info.content} className="react-markdown" />
              )}
            </Box>
          </BoxPrint>
        )}
        {supTitle && <SupTitle title={supTitle} />}
        <TitleButtonWrap fill="horizontal" justify="between">
          <Box align="center" direction="row">
            {title && (
              <PrintHide>
                <Box>
                  {renderTitle(type, title)}
                </Box>
              </PrintHide>
            )}
            {title && isPrintView && (
              <TitleMediumPrint>{title}</TitleMediumPrint>
            )}
            {info && !isPrintView && (
              <InfoOverlay
                title={info.title}
                content={info.content}
              />
            )}
          </Box>
          {buttons && isMinSize(size, 'medium') && !isPrintView && (
            <ButtonGroup>
              {buttons.map((button, i) => (
                <ButtonWrap key={i}>
                  <Box direction="row" align="center" gap="xsmall">
                    {button.warning && <Box width={{ max: '320px' }}>{button.warning}</Box>}
                    <Box>
                      <ButtonFactory
                        button={button}
                        args={{ ids: entityIdsSelected }}
                      />
                    </Box>
                  </Box>
                </ButtonWrap>
              ))}
            </ButtonGroup>
          )}
        </TitleButtonWrap>
        {subTitle && <SubTitle>{subTitle}</SubTitle>}
        {info && (
          <BoxPrint printOnly>
            <Box direction="row">
              <Box flex="shrink">
                {info.title && (
                  <InfoTitlePrintOnly>{`${info.title}: `}</InfoTitlePrintOnly>
                )}
              </Box>
              <Box width={{ max: 'large' }} flex>
                {info.content && (
                  <MarkdownPrintOnly source={info.content} className="react-markdown" />
                )}
              </Box>
            </Box>
          </BoxPrint>
        )}
      </TitleWrap>
      {buttons && !isMinSize(size, 'medium') && (
        <ButtonGroup justify="end">
          {buttons.map((button, i) => button && (
            <ButtonWrap key={i}>
              <ButtonFactory
                button={button}
                args={{ ids: entityIdsSelected }}
              />
            </ButtonWrap>
          ))}
        </ButtonGroup>
      )}
    </Styled>
  );
}

ContentHeader.propTypes = {
  title: PropTypes.string,
  buttons: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.bool,
  ]),
  supTitle: PropTypes.string,
  subTitle: PropTypes.string,
  info: PropTypes.object,
  type: PropTypes.string,
  hasViewOptions: PropTypes.bool,
  entityIdsSelected: PropTypes.object, // PropTypes.instanceOf(List),
};

export default ContentHeader;
