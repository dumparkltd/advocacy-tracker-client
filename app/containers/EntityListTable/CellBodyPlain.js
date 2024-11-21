import React from 'react';
import PropTypes from 'prop-types';
import { Box, Text, ResponsiveContext } from 'grommet';
import styled from 'styled-components';
import Dot from 'components/styled/Dot';

import { isMinSize } from 'utils/responsive';

import Button from 'components/buttons/ButtonTableCell';

const LabelWrap = styled((p) => <Box direction="row" gap="xsmall" align="center" {...p} />)``;
const Link = styled((p) => <Button as="a" {...p} />)`
  text-align: ${({ align }) => {
    if (align === 'end') return 'right';
    if (align === 'center') return 'center';
    return 'left';
  }};
  line-height: 12px;
`;
const Label = styled((p) => <Text size="xxsmall" wordBreak="keep-all" {...p} />)`
  text-align: ${({ align }) => align === 'end' ? 'right' : 'left'};
  line-height: 12px;
`;
export function CellBodyPlain({
  entity,
  column = {},
  onEntityClick,
}) {
  const { value, color, path } = entity;
  const { align = 'start', primary } = column;
  const size = React.useContext(ResponsiveContext);
  const isLink = !!path && !!onEntityClick;
  let dotSize = isLink ? '33px' : '28px';
  if (!isMinSize(size, 'medium')) {
    dotSize = '22px';
  }
  return (
    <Box align={align}>
      {isLink && (
        <Link
          href={path}
          onClick={(evt) => {
            if (evt) evt.preventDefault();
            onEntityClick(path);
          }}
          title={value}
        >
          {color && (
            <LabelWrap textAlign={align}>
              <Box flex={{ shrink: 0 }} align={align}>
                <Dot size={!value ? dotSize : null} color={color} />
              </Box>
              {value && (
                <Label weight={primary ? 500 : 300}>
                  {value}
                </Label>
              )}
            </LabelWrap>
          )}
          {!color && (
            <Label weight={primary ? 500 : 300}>
              {value}
            </Label>
          )}
        </Link>
      )}
      {!isLink && (
        <>
          {color && (
            <LabelWrap textAlign={align}>
              <Box flex={{ shrink: 0 }} align={align}>
                <Dot size={!value ? dotSize : null} color={color} />
              </Box>
              {value && (
                <Label weight={primary ? 500 : 300}>
                  {value}
                </Label>
              )}
            </LabelWrap>
          )}
          {!color && (
            <Label weight={primary ? 500 : 300} textAlign={align}>
              {value}
            </Label>
          )}
        </>
      )}
    </Box>
  );
}

CellBodyPlain.propTypes = {
  entity: PropTypes.object,
  column: PropTypes.object,
  onEntityClick: PropTypes.func,
};

export default CellBodyPlain;
