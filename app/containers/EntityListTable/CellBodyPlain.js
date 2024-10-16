import React from 'react';
import PropTypes from 'prop-types';
import { Box, Text, Button } from 'grommet';
import styled from 'styled-components';
import Dot from 'components/styled/Dot';

const LabelWrap = styled((p) => <Box direction="row" gap="xsmall" align="center" {...p} />)``;
const Link = styled((p) => <Button as="a" plain {...p} />)`
  text-align: ${({ align }) => align === 'end' ? 'right' : 'left'};
  line-height: 12px;
`;
const Label = styled((p) => <Text size="xsmall" wordBreak="keep-all" {...p} />)`
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
  return (
    <Box>
      {path && onEntityClick && (
        <Link
          href={path}
          onClick={(evt) => {
            if (evt) evt.preventDefault();
            onEntityClick(path);
          }}
          title={value}
        >
          {color && (
            <LabelWrap>
              <Box flex={{ shrink: 0 }}>
                <Dot size={!value ? '33px' : null} color={color} />
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
      {(!path || !onEntityClick) && (
        <>
          {color && (
            <LabelWrap>
              <Box flex={{ shrink: 0 }}>
                <Dot size={!value ? '33px' : null} color={color} />
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
