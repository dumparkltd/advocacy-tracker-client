import styled from 'styled-components';

const Reference = styled.div`
  font-weight: bold;
  color: ${({ theme }) => theme.global.colors.text.secondary};
  @media print {
    font-size: 11pt;
  }
`;

export default Reference;
