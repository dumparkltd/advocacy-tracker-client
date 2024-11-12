import React from 'react';
import styled from 'styled-components';
import Button from 'components/buttons/ButtonSimple';

const SubjectButton = styled((p) => <Button {...p} />)`
  padding: 2px 4px;
  border-bottom: 2px solid;
  border-bottom-color: ${({ active }) => active ? 'brand' : 'transparent'};
  background: none;
`;

export default SubjectButton;
