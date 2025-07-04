import styled from 'styled-components';

const ContentSimple = styled.div`
  @media (min-width: ${({ theme }) => theme.breakpointsMin.large}) {
    padding: ${({ isPrint }) => isPrint ? 0 : '0 16px'};
  }
  @media (min-width: ${({ theme }) => theme.breakpointsMin.xlarge}) {
    padding: ${({ isPrint }) => isPrint ? 0 : '0 32px'};
  }
  @media print {
    padding: 0;
  }
`;
export default ContentSimple;
