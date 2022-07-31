import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, ResponsiveContext } from 'grommet';

import { isMinSize } from 'utils/responsive';

import {
  CONTENT_SINGLE, CONTENT_PAGE, CONTENT_MODAL,
} from 'containers/App/constants';

import SupTitle from 'components/SupTitle';
import InfoOverlay from 'components/InfoOverlay';
// import Icon from 'components/Icon';

import ButtonFactory from 'components/buttons/ButtonFactory';

const Styled = styled.div`
  padding: ${({ isModal, hasViewOptions }) => {
    if (isModal) return '0 0 10px';
    if (hasViewOptions) return '0.5em 0 0.5em';
    return '1em 0 0.5em';
  }};
  @media (min-width: ${(props) => props.theme.breakpoints.medium}) {
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
  @media (min-width: ${(props) => props.theme.breakpoints.medium}) {
    min-height: 62px;
    width: 100%;
  }
`;

const ButtonGroup = styled((p) => <Box align="center" direction="row" {...p} />)`
  text-align: left;
  margin-bottom: 10px;
  @media (min-width: ${(props) => props.theme.breakpoints.medium}) {
    margin-bottom: -4px;
  }
`;

const SubTitle = styled.p`
  font-size: 1.1em;
  @media print {
    display: none;
  }
`;
const TitleWrap = styled(Box)``;

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
}) {
  const size = React.useContext(ResponsiveContext);
  return (
    <Styled
      hasBottomBorder={type === CONTENT_PAGE || type === CONTENT_MODAL}
      isModal={type === CONTENT_MODAL}
      hasViewOptions={hasViewOptions}
    >
      <TitleWrap fill="horizontal">
        {supTitle && <SupTitle title={supTitle} />}
        <TitleButtonWrap fill="horizontal" justify="between">
          <Box align="center" direction="row">
            {title && (
              <Box>
                {renderTitle(type, title)}
              </Box>
            )}
            {info && (
              <InfoOverlay
                title={info.title}
                content={info.content}
              />
            )}
          </Box>
          {buttons && isMinSize(size, 'medium') && (
            <ButtonGroup>
              {buttons.map((button, i) => (
                <ButtonWrap key={i}>
                  <ButtonFactory button={button} />
                </ButtonWrap>
              ))}
            </ButtonGroup>
          )}
        </TitleButtonWrap>
        {subTitle && <SubTitle>{subTitle}</SubTitle>}
      </TitleWrap>
      {buttons && !isMinSize(size, 'medium') && (
        <ButtonGroup justify="end">
          {buttons.map((button, i) => button && (
            <ButtonWrap key={i}>
              <ButtonFactory button={button} />
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
};

export default ContentHeader;
