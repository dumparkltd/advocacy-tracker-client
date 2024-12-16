import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Close from './Close';

const Styled = styled.div`
  display: table;
  width: 100%;
  color: white;
  background-color: ${({ theme }) => theme.global.colors.highlightHover};
  box-shadow: 0px 0px 8px 0px rgba(0,0,0,0.2);
  z-index: 1;
  height: 40px;
  padding-left: 0.75em;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    height: ${({ inSingleForm }) => inSingleForm ? 50 : 60}px;
    padding-left: 1em;
  }
`;

const Title = styled.div`
  font-size: 0.85em;
  display: table-cell;
  width: 99%;
  vertical-align: middle;
  @media print {
    font-size: ${(props) => props.theme.sizes.print.smaller};
  }
`;
const CloseWrap = styled.div`
  display: table-cell;
  width: 48px;
  vertical-align: middle;
  padding-right: 10px;
`;

const Header = (props) => (
  <Styled inSingleForm={props.inSingleForm}>
    <Title>
      { props.title }
    </Title>
    { props.onCancel
      && (
        <CloseWrap>
          <Close onCancel={props.onCancel} />
        </CloseWrap>
      )
    }
  </Styled>
);

Header.propTypes = {
  onCancel: PropTypes.func,
  title: PropTypes.string,
  inSingleForm: PropTypes.bool,
};
export default Header;
