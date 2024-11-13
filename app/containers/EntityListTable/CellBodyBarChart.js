import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Text,
  Drop,
} from 'grommet';
import styled from 'styled-components';

import Button from 'components/buttons/ButtonSimple';

import { ROUTES } from 'themes/config';

import DropEntityList from './DropEntityList';

const Value = styled.div`
  width: 30px !important;
  display: block;
  text-align: right;
`;
const BarWrapper = styled.div`
  width: 100%;
  height: 20px;
  display: block;
  position: relative;
`;

const Bar = styled.div`
  width: ${({ value, maxvalue }) => value / maxvalue * 100}%;
  min-width: 1px;
  height: 20px;
  background-color: ${({ theme, color }) => color || theme.global.colors.primary};
  opacity: ${({ issecondary }) => issecondary ? 0.6 : 1};
  display: block;
  position: absolute;
  left: 0;
  top: 0;
`;

const BarButton = styled((p) => <Button {...p} />)`
  width: ${({ value, maxvalue }) => value / maxvalue * 100}%;
  min-width: 1px;
  height: 20px;
  background-color: ${({ theme, color }) => color || theme.global.colors.primary};
  display: block;
  position: absolute;
  left: 0;
  top: 0;
  opacity: ${({ isHover }) => isHover ? 0.85 : 1};
`;

const LinkTooltip = styled(
  React.forwardRef((p, ref) => <Button {...p} ref={ref} />)
)`
  text-align: ${({ align }) => align === 'end' ? 'right' : 'left'};
  line-height: 12px;
  padding: 0 4px;
`;

export function CellBodyBarChart({
  value,
  maxvalue,
  issecondary,
  rowConfig,
  entityType,
  onEntityClick,
  color,
}) {
  const infoRef = useRef(null);
  const [info, showInfo] = useState(false);
  const [hover, isHover] = useState(false);
  return (
    <Box>
      {value && (
        <Box direction="row" gap="none" flex={{ shrink: 0 }} align="center">
          <Value>
            {!rowConfig.tooltip && (
              <Text size="xsmall" weight={500} textAlign="end">
                {value}
              </Text>
            )}
            {rowConfig.tooltip && (
              <LinkTooltip
                onClick={() => showInfo(!info)}
                onMouseOver={() => isHover(true)}
                onMouseLeave={() => isHover(false)}
                onFocus={() => isHover(true)}
                onBlur={() => null}
                ref={infoRef}
              >
                <Text size="small" weight={500} textAlign="end" wordBreak="keep-all">
                  {value}
                </Text>
              </LinkTooltip>
            )}
          </Value>
          <BarWrapper>
            {!rowConfig.tooltip && (
              <Bar value={value} maxvalue={maxvalue} issecondary={issecondary} color={color} />
            )}
            {rowConfig.tooltip && (
              <BarButton
                value={value}
                maxvalue={maxvalue}
                issecondary={issecondary}
                color={color}
                isHover={hover}
                onClick={() => showInfo(true)}
                onMouseOver={() => isHover(true)}
                onMouseLeave={() => isHover(false)}
                onFocus={() => isHover(true)}
                onBlur={() => null}
              />
            )}
          </BarWrapper>
        </Box>
      )}
      {info && infoRef && rowConfig.tooltip && (
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
            tooltipConfig={rowConfig.tooltip}
            onEntityClick={(id) => {
              showInfo(false);
              onEntityClick(id, entityType === 'actors' ? ROUTES.ACTOR : ROUTES.ACTION);
            }}
          />
        </Drop>
      )}
    </Box>
  );
}

CellBodyBarChart.propTypes = {
  value: PropTypes.number,
  maxvalue: PropTypes.number,
  issecondary: PropTypes.bool,
  entityType: PropTypes.string,
  color: PropTypes.string,
  rowConfig: PropTypes.object,
  onEntityClick: PropTypes.func,
};

export default CellBodyBarChart;
