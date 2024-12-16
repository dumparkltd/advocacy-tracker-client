import styled from 'styled-components';

import Main from './Main';

const Aside = styled(Main)`
  border-right-style: none;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    width: 30%;
  }
  @media print {
    width: ${({ bottom }) => !bottom ? '30%' : '100%'};
    border-right-style: none;
    display: ${({ bottom }) => !bottom ? 'table-cell' : 'block'};
  }
`;

export default Aside;
