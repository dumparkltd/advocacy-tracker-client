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
import TagList from 'components/TagList';
import BoxPrint from 'components/styled/BoxPrint';
import PrintHide from 'components/styled/PrintHide';

import { usePrint } from 'containers/App/PrintContext';

const Styled = styled.div`
  padding: ${({ isModal, hasViewOptions }) => {
    if (isModal) return '0 0 10px';
    if (hasViewOptions) return '0.5em 0 0.5em';
    return '1em 0 0.5em';
  }};
  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    padding: ${({ isModal, hasViewOptions }) => {
    if (isModal) return '20px 0 20px 40px';
    if (hasViewOptions) return '0 0 1em';
    return '3em 0 1em';
  }};
  }
`;

// const TitleLarge = styled.h1`
//   line-height: 1;
//   margin-top: 10px;
// `;
const TitleMedium = styled.h3`
  line-height: 1;
  margin: 15px 0;
  display: inline-block;
`;
const TitleMediumPrint = styled.h3`
  margin-bottom: 0px;
  margin-top: 22px;
  font-size: 18pt;
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
  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    min-height: 62px;
    width: 100%;
  }
`;

const ButtonGroup = styled((p) => <Box align="center" direction="row" {...p} />)`
  text-align: left;
  margin-bottom: 10px;
  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
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
    case CONTENT_MODAL:
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
  hasFilters,
  filters,
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
                  {button.warning && <span style={{ marginRight: '8px' }}>{button.warning}</span>}
                  <ButtonFactory
                    button={button}
                    args={{ ids: entityIdsSelected }}
                  />
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
      {isPrintView && hasFilters && <TagList filters={filters} isPrintView isPrint />}
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
  filters: PropTypes.array,
  hasFilters: PropTypes.bool,
};

export default ContentHeader;
