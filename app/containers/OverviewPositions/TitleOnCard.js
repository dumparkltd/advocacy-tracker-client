import styled from 'styled-components';

const TitleOnCard = styled.span`
  color: black;
  font-family: 'wwfregular', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  margin: 0;
  font-size: 27px;
  line-height: 32px;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    font-size: 34px;
    line-height: 36px;
    min-height: 42px;
  }
`;
export default TitleOnCard;
