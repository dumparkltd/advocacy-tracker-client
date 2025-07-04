import styled from 'styled-components';

const Dot = styled.div`
  display: block;
  width:  ${({ width, size }) => {
    if (width) return width;
    return size || '10px';
  }};
  height:  ${({ size }) => size || '10px'};
  border-radius: ${({ width }) => width ? 0 : 99999}px;
  background: ${({ color }) => color || 'red'};
`;

export default Dot;
