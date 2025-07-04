import React from 'react';
import PropTypes from 'prop-types';
import { Box } from 'grommet';
import styled from 'styled-components';
import { truncateText } from 'utils/string';
import Button from 'components/buttons/ButtonTableCell';
import Label from './LabelCellBody';

const LabelWrap = styled((p) => (
  <Box
    direction="column"
    gap="xxsmall"
    align="start"
    {...p}
  />
))``;

const Link = styled((p) => <Button as="a" {...p} />)`
  text-align: ${({ align }) => align === 'end' ? 'right' : 'left'};
  max-width: 100%;
`;

export function CellBodyPlainWithDate({ entity, onEntityClick }) {
  const { value, date, path } = entity;
  return (
    <LabelWrap>
      {date && (
        <Box flex={{ shrink: 0 }}>
          <Label>
            {date}
          </Label>
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
          <Box>
            <Label title={value}>
              {truncateText(value, 25)}
            </Label>
          </Box>
        </Link>
      )}
      {(!path || !onEntityClick) && (
        <Box>
          <Label title={value}>
            {value}
          </Label>
        </Box>
      )}
    </LabelWrap>
  );
}

CellBodyPlainWithDate.propTypes = {
  entity: PropTypes.object,
  onEntityClick: PropTypes.func,
};

export default CellBodyPlainWithDate;
