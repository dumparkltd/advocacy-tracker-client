import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
  Box,
  Button,
  Drop,
  Text,
} from 'grommet';
const BarButton = styled(
  React.forwardRef((p, ref) => <Button plain {...p} ref={ref} />)
)`
  width: ${({ value, maxvalue }) => value / maxvalue * 100}%;
  min-width: 0;
  height: 20px;
  background-color: ${({ bgColor }) => bgColor};
  display: block;
  position: absolute;
  left: ${({ offset, maxvalue }) => offset / maxvalue * 100}%;
  top: 0;
  border-right: 1px solid white;
  &:hover {
    opacity: 0.85;
  }
`;
const DropContent = styled((p) => (
  <Box
    pad={{
      horizontal: 'small',
      vertical: 'xsmall',
    }}
    {...p}
  />
))`
  max-width: 280px;
`;
export function CellBodyStackedBarChartBarOverlay({
  value,
  maxvalue,
  offset,
  count,
}) {
  const infoRef = useRef(null);
  const [info, showInfo] = useState(false);
  return (
    <>
      <BarButton
        ref={infoRef}
        value={count}
        offset={offset}
        maxvalue={maxvalue}
        bgColor={value.color}
        fill={false}
        onMouseOver={() => showInfo(true)}
        onMouseLeave={() => showInfo(false)}
        onFocus={() => showInfo(true)}
        onBlur={() => null}
        onClick={() => showInfo(true)}
      />
      {info && infoRef && (
        <Drop
          target={infoRef.current}
          onClickOutside={() => showInfo(false)}
          align={{
            bottom: 'top',
            left: 'left',
          }}
          margin={{ horizontal: 'xsmall', vertical: 'xsmall' }}
          background="white"
          elevation="small"
          stretch={false}
        >
          <DropContent>
            <Text size="small">
              {count}
            </Text>
          </DropContent>
        </Drop>
      )}
    </>
  );
}

CellBodyStackedBarChartBarOverlay.propTypes = {
  value: PropTypes.object,
  count: PropTypes.number,
  offset: PropTypes.number,
  maxvalue: PropTypes.number,
};

export default CellBodyStackedBarChartBarOverlay;
