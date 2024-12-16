import styled from 'styled-components';

const EntityListItemMainTitle = styled.span`
  font-weight: normal;
  font-size: ${(props) => props.theme.sizes && props.theme.text.medium.size};
  @media (min-width: ${({ theme }) => theme && theme.breakpointsMin ? theme.breakpointsMin.large : '993px'}) {
    font-size: ${(props) => props.theme.sizes && props.theme.text.xlarge.size};
};
    line-height: 1.2em;
  }
  @media print {
    font-size: ${(props) => props.theme.sizes && props.theme.sizes.print.mainListItem};
  }
`;

export default EntityListItemMainTitle;
