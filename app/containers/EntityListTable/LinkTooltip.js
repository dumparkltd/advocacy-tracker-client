import React from 'react';
import styled from 'styled-components';
import Button from 'components/buttons/ButtonSimple';

const LinkTooltip = styled(
  React.forwardRef((p, ref) => <Button {...p} ref={ref} />)
)`
  text-align: ${({ align }) => align === 'end' ? 'right' : 'left'};
  line-height: 12px;
  border-radius: 999px;
  width: 40px;
  height: 40px;
  border: 1px solid #f1f0f1;
  box-shadow: 0px 0px 9px -3px rgba(0,0,0,0.1);
  ${({ theme, showContent }) => {
    if (showContent) {
      /* eslint-disable prefer-template */
      return 'color: ' + theme.global.colors.highlight;
    }
    return '';
  }}
  &:hover {
    box-shadow: 0px 0px 9px -3px rgba(0,0,0,0.2);
    color: ${({ theme, showContent }) => showContent
    ? theme.global.colors.highlightHover
    : theme.global.colors.highlight
};
  }
`;

export default LinkTooltip;
