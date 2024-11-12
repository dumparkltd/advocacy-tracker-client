import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Drop } from 'grommet';

import { ROUTES } from 'themes/config';
import Button from 'components/buttons/ButtonSimple';
import DropEntityList from './DropEntityList';

const BarButton = styled(
  React.forwardRef((p, ref) => <Button {...p} ref={ref} />)
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
export function CellBodyStackedBarChartBarOverlay({
  value,
  maxvalue,
  offset,
  count,
  tooltipConfig,
  onEntityClick,
  entityType,
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
        onClick={() => showInfo(true)}
      />
      {info && infoRef && tooltipConfig && (
        <Drop
          target={infoRef.current}
          onClickOutside={() => showInfo(false)}
          align={{
            bottom: 'top',
            left: 'left',
          }}
          margin={{ bottom: 'xsmall' }}
          background="white"
          elevation="small"
          stretch={false}
        >
          <DropEntityList
            entityType={entityType}
            tooltipConfig={tooltipConfig}
            onEntityClick={(id) => {
              showInfo(false);
              onEntityClick(id, entityType === 'actors' ? ROUTES.ACTOR : ROUTES.ACTION);
            }}
          />
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
  entityType: PropTypes.string,
  tooltipConfig: PropTypes.object,
  onEntityClick: PropTypes.func,
};

export default CellBodyStackedBarChartBarOverlay;
