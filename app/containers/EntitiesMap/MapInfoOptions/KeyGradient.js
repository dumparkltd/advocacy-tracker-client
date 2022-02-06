import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const SVG = styled.svg`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
`;

export function KeyGradient({
  stops, log = false, ...props
}) {
  const cleanStops = stops.map((stop) => ({
    ...stop,
    value: log ? Math.log10(stop.value) : stop.value,
  }));
  const [maxValue, minValue] = cleanStops.reduce(
    ([max, min], stop) => [
      max ? Math.max(max, stop.value) : stop.value,
      min ? Math.min(min, stop.value) : stop.value,
    ],
    [null, null],
  );
  const lfid = 'mpx-svg-lg-x';
  return (
    <SVG
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      {...props}
    >
      <defs>
        <linearGradient
          id={lfid}
          x1={`${(minValue / maxValue) * 100}%`}
          y1="0"
          x2="100%"
          y2="0"
        >
          {cleanStops.map((stop, stopNo) => (
            <stop
              offset={`${(stop.value / maxValue) * 100}%`}
              stopColor={stop.color}
              key={stopNo}
            />
          ))}
        </linearGradient>
      </defs>
      <rect width="100" height="100" x="0" y="0" fill={`url(#${lfid})`} />
    </SVG>
  );
}

KeyGradient.propTypes = {
  // id: PropTypes.string.isRequired,
  stops: PropTypes.array,
  // continuous: PropTypes.bool,
  log: PropTypes.bool,
};

export default KeyGradient;
