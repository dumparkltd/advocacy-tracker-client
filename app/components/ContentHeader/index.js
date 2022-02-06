import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { palette } from 'styled-theme';

import {
  CONTENT_SINGLE, CONTENT_PAGE, CONTENT_MODAL,
} from 'containers/App/constants';

import SupTitle from 'components/SupTitle';
// import Icon from 'components/Icon';

import ButtonFactory from 'components/buttons/ButtonFactory';

const Styled = styled.div`
  padding: ${({ isModal, hasViewOptions }) => {
    if (isModal) return '0 0 10px';
    if (hasViewOptions) return '0.5em 0 0.5em';
    return '1em 0 0.5em';
  }};
  @media (min-width: ${(props) => props.theme.breakpoints.small}) {
    padding: ${({ isModal, hasViewOptions }) => {
    if (isModal) return '20px 0 20px 40px';
    if (hasViewOptions) return '0 0 1em';
    return '3em 0 1em';
  }};
  }
  border-bottom: ${(props) => props.hasBottomBorder ? '1px solid' : 'none'};
  border-color: ${palette('light', 1)};
`;

// const TitleLarge = styled.h1`
//   line-height: 1;
//   margin-top: 10px;
// `;
const TitleMedium = styled.h3`
  line-height: 1;
  margin-top: 15px;
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
const Table = styled.span`
  display: block;
  @media (min-width: ${(props) => props.theme.breakpoints.small}) {
    display: table;
    width: 100%;
    min-height: 62px;
  }
`;
const TableCell = styled.span`
  display: ${(props) => {
    if (props.hiddenMobile) {
      return 'none';
    }
    return 'block';
  }};
  clear: both;
  @media (min-width: ${(props) => props.theme.breakpoints.small}) {
    display: table-cell;
    vertical-align: middle;
  }
`;

const TableCellInner = styled(TableCell)`
  display: table-cell;
  vertical-align: middle;
`;

const ButtonGroup = styled.div`
  float: right;
  display: table;
  text-align: right;
  margin-bottom: 10px;
  @media (min-width: ${(props) => props.theme.breakpoints.small}) {
    margin-bottom: 0;
  }
`;

const SubTitle = styled.p`
  font-size: 1.1em;
  @media print {
    display: none;
  }
`;
const TitleWrap = styled.div`
  clear: both;
`;
const VisibleMobile = styled.span`
  display: block;
  @media (min-width: ${(props) => props.theme.breakpoints.small}) {
    display: none;
  }
`;

class ContentHeader extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  renderTitle = (type, title) => {
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
  }

  render() {
    const {
      type,
      supTitle,
      title,
      buttons,
      subTitle,
      hasViewOptions,
    } = this.props;

    return (
      <Styled
        hasBottomBorder={type === CONTENT_PAGE || type === CONTENT_MODAL}
        isModal={type === CONTENT_MODAL}
        hasViewOptions={hasViewOptions}
      >
        {buttons && (
          <VisibleMobile>
            <ButtonGroup>
              {
                buttons.map((button, i) => button && (
                  <TableCellInner key={i}>
                    <ButtonWrap>
                      <ButtonFactory button={button} />
                    </ButtonWrap>
                  </TableCellInner>
                ))
              }
            </ButtonGroup>
          </VisibleMobile>
        )}
        <TitleWrap>
          {supTitle && <SupTitle title={supTitle} />}
          <Table>
            <TableCell>
              {this.renderTitle(type, title)}
            </TableCell>
            {buttons && (
              <TableCell hiddenMobile>
                <ButtonGroup>
                  {
                    buttons.map((button, i) => (
                      <TableCellInner key={i}>
                        <ButtonWrap>
                          <ButtonFactory button={button} />
                        </ButtonWrap>
                      </TableCellInner>
                    ))
                  }
                </ButtonGroup>
              </TableCell>
            )}
          </Table>
          {subTitle && <SubTitle>{subTitle}</SubTitle>}
        </TitleWrap>
      </Styled>
    );
  }
}

ContentHeader.propTypes = {
  title: PropTypes.string.isRequired,
  buttons: PropTypes.array,
  supTitle: PropTypes.string,
  subTitle: PropTypes.string,
  type: PropTypes.string,
  hasViewOptions: PropTypes.bool,
};

export default ContentHeader;
