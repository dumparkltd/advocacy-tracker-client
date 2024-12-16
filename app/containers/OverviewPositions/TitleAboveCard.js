import styled from 'styled-components';

const TitleAboveCard = styled.span`
  color: black;
  text-transform: uppercase;
  font-weight: bold;
  font-size: ${({ theme }) => theme.text.xxsmall.size};
  line-height: ${({ theme }) => theme.text.xxsmall.height};
  margin-top: 20px;
  margin-bottom: 10px;
`;
export default TitleAboveCard;
