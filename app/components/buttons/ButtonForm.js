import styled from 'styled-components';

import Button from 'components/buttons/Button';

const ButtonForm = styled(Button)`
  text-transform: uppercase;
  font-size: 0.9em;
  padding: 0.7em 0.5em;
  font-family: 'wwfregular', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 18px;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    font-size: 24px;
    padding: 14px 20px;
  }
  @media print {
    font-size: ${(props) => props.theme.sizes.print.default};
  }
`;

export default ButtonForm;
