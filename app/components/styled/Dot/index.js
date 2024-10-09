import styled from 'styled-components';

const Dot = styled.div`
  display: block;
  width:  ${({ size }) => size || '10px'};
  height:  ${({ size }) => size || '10px'};
  border-radius: 99999px;
  background: ${({ color }) => color || 'red'};
`;

export default Dot;
