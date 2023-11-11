import styled from 'styled-components';

import ButtonDefault from 'components/buttons/ButtonDefault';

const getBorderRadius = ({ isLast, isFirst }) => {
  const tl = isFirst ? '999px' : '0';
  const tr = isLast ? '999px' : '0';
  const br = isLast ? '999px' : '0';
  const bl = isFirst ? '999px' : '0';
  return `${tl} ${tr} ${br} ${bl}`;
};

const ButtonDefaultGrouped = styled(ButtonDefault)`
  border-radius: ${({ isLast, isFirst }) => getBorderRadius({ isLast, isFirst })};
  padding-top: 0.4em;
  padding-bottom: 0.4em;
  padding-left: ${({ isFirst }) => isFirst ? 0.4 : 0.3}em;
  padding-right: ${({ isLast }) => isLast ? 0.4 : 0.3}em;
  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    padding-top: 0.5em;
    padding-bottom: 0.4em;
    padding-left: ${({ isFirst }) => isFirst ? 1.5 : 1.1}em;
    padding-right: ${({ isLast }) => isLast ? 1.5 : 1.1}em;
  }
`;

export default ButtonDefaultGrouped;
