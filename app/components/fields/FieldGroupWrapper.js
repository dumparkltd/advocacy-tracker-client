import styled from 'styled-components';

const FieldGroupWrapper = styled.div`
  background-color: transparent;
  border-bottom: ${(props) => props.groupType === 'smartTaxonomy' ? '1px solid' : 0};
  border-bottom-color: ${({ theme }) => theme.global.colors.background};
  padding-top: ${({ seamless, theme }) => seamless ? 0 : theme.global.edgeSize.small};
  padding-right: ${({ seamless, theme }) => seamless ? 0 : theme.global.edgeSize.small};
  padding-left: ${({ seamless, theme }) => seamless ? 0 : theme.global.edgeSize.small};
  padding-bottom: ${({ seamless, theme }) => seamless ? 0 : theme.global.edgeSize.small};
  @media (min-width: ${(props) => props.theme.breakpoints.medium}) {
    padding-top: ${({ seamless, theme }) => seamless ? 0 : theme.global.edgeSize.medium};
    padding-right: ${({ seamless, theme }) => seamless ? 0 : theme.global.edgeSize.medium};
    padding-left: ${({ seamless, theme }) => seamless ? 0 : theme.global.edgeSize.medium};
    padding-bottom: ${({ seamless, theme }) => seamless ? 0 : theme.global.edgeSize.medium};
  }
  @media print {
    padding: ${({ aside, bottom }) => (aside && !bottom) ? '15px 0 10px 20px' : '15px 0 10px'};
    background-color: transparent;
  }
`;

export default FieldGroupWrapper;
