import React from 'react';
import PropTypes from 'prop-types';
import { Box, Text, Button } from 'grommet';
import styled from 'styled-components';
import { truncateText } from 'utils/string';

const LabelWrap = styled((p) => (
  <Box
    direction="column"
    gap="xsmall"
    align="start"
    {...p}
  />
))``;

const Link = styled((p) => <Button as="a" plain {...p} />)`
  text-align: ${({ align }) => align === 'end' ? 'right' : 'left'};
  line-height: 12px;
`;
const Label = styled((p) => <Text size="xsmall" wordBreak="keep-all" {...p} />)`
  text-align: ${({ align }) => align === 'end' ? 'right' : 'left'};
  line-height: 12px;
`;


export function CellBodyPlainWithDate({ entity, onEntityClick }) {
  const { value, date, path } = entity;
  return (
    <LabelWrap>
      {date && (
        <Box flex={{ shrink: 0 }}>
          <Text size="xsmall" weight={500} wordBreak="keep-all">
            {date}
          </Text>
        </Box>
      )}
      {path && onEntityClick && (
        <Link
          href={path}
          onClick={(evt) => {
            if (evt) evt.preventDefault();
            onEntityClick(path);
          }}
          title={value}
        >
          <Label>
            {truncateText(value, 25)}
          </Label>
        </Link>
      )}
      {(!path || !onEntityClick) && (
        <Label>
          {value}
        </Label>
      )}
    </LabelWrap>
  );
}

CellBodyPlainWithDate.propTypes = {
  entity: PropTypes.object,
  onEntityClick: PropTypes.func,
};

export default CellBodyPlainWithDate;
