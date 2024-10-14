import React from 'react';
import styled from 'styled-components';
import { Box } from 'grommet';

const Card = styled(
  (p) => <Box elevation="small" background="white" fill {...p} />
)``;

export default Card;
