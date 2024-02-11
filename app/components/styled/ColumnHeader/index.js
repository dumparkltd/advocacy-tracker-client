import styled from 'styled-components';
import { palette } from 'styled-theme';

const ColumnHeader = styled.div`
  font-size: 0.75em;
  padding: ${({ hasSelectAll, isPrint }) => (isPrint || hasSelectAll) ? '4px 4px 4px 0' : '4px'};
  word-break: break-word;
  width: ${({ colWidth }) => colWidth}%;
  position: relative;
  display: table-cell;
  min-height: 35px;
  border-right: 1px solid ${({ isPrint }) => isPrint ? 'transparent' : palette('light', 2)};
  &:last-child {
    border-right: none;
  }
  @media (min-width: ${({ theme }) => theme.breakpoints ? theme.breakpoints.medium : '769px'}) {
    padding-top: 8px;
    padding-bottom: 8px;
    padding-left: ${({ hasSelectAll, isPrint }) => (isPrint || hasSelectAll) ? 1 : 8}px;
    padding-right: 4px;
  }
  @media (min-width: ${({ theme }) => theme.breakpoints ? theme.breakpoints.large : '993px'}) {
    font-size: 0.85em;
  }
  @media print {
    font-size: ${({ theme }) => theme.sizes.print.small};
    position: relative;
    z-index: 0;
    height: 30px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
    padding-left: 0;
    border-right: none;
  }
`;
export default ColumnHeader;
