import styled from 'styled-components';

const Reference = styled.div`
  font-weight: bold;
  color: ${({ theme }) => theme.global.colors.text.secondary};
  font-size: ${({ theme }) => theme.text.small.size};
  line-height: ${({ theme }) => theme.text.small.height};
  letter-spacing: -0.5px;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    font-size: ${({ theme }) => theme.text.medium.size};
    line-height: ${({ theme }) => theme.text.medium.height};
  }
  @media print {
    font-size: 11pt;
  }
`;

export default Reference;
