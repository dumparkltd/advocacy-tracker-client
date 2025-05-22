import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';

const Markdown = styled(ReactMarkdown)`
  font-size: ${({ theme, size }) => theme.text[size].size};
  line-height: ${({ theme, size }) => theme.text[size].height};
  @media print {
    font-size: ${(props) => props.theme.sizes.print.markdown};
  }
`;
export default Markdown;
