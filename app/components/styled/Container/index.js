import styled from 'styled-components';
/* eslint-disable prefer-template */
const Container = styled.div`
  margin-right: auto;
  margin-left: auto;
  max-width: 100%;
  padding-bottom: ${({ noPaddingBottom, inModal, isPrint }) => (isPrint || noPaddingBottom || inModal) ? 0 : '3em'};
  padding-left: ${({ inModal }) => inModal ? 0 : 12}px;
  padding-right: ${({ inModal }) => inModal ? 0 : 12}px;
  background-color: ${({ inModal, bg, theme }) => (inModal || bg) ? theme.global.colors.background : 'transparent'};
  margin-top: ${({ isSingle, isPrint }) => {
    if (isPrint) return 0;
    return isSingle ? 50 : 0;
  }}px;
  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    padding-right: ${({ inModal, isPrint }) => (isPrint || inModal) ? 0 : 12}px;
    padding-left: ${({ inModal, isPrint }) => (isPrint || inModal) ? 0 : 12}px;
  }
  @media (min-width: ${({ theme }) => theme.breakpoints.xlarge}) {
    max-width: ${({ isNarrow, isPrint, theme }) => {
    if (isPrint) return '100%';
    return isNarrow ? '960px' : (parseInt(theme.breakpoints.xlarge, 10) - 30) + 'px';
  }};
}
  @media print {
    max-width: 100%;
    width: 100%;
    padding: 0;
    margin: 0;
    background-color: transparent;
  }
`;
export default Container;
