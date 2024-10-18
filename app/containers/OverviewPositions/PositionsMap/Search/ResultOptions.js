import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, Text } from 'grommet';

import Keyboard from 'components/Keyboard';
import ResultOption from './ResultOption';

const ResultOptionWrap = styled(Box)``;

export function ResultOptions({
  options,
  onClick,
  activeResult,
  focus,
  onFocus,
}) {
  const myRefs = useRef([]);
  useEffect(() => {
    // when focus is inside the drop down, highlight the correct option
    if (focus && myRefs && myRefs.current && myRefs.current[activeResult]) {
      myRefs.current[activeResult].focus();
    }
  }, [activeResult, focus]);

  return (
    <ResultOptionWrap>
      {options.map((option, index) => (
        <Keyboard
          key={option.code}
          onEnter={() => {
            if (options[activeResult]) onClick(options[activeResult].id);
          }}
        >
          <ResultOption
            onClick={() => {
              onClick(option.id);
            }}
            ref={(el) => {
              myRefs.current[index] = el;
            }}
            onFocus={() => onFocus(index)}
            active={index === activeResult}
            last={index === options.length - 1}
          >
            <Box direction="row" align="end" fill="horizontal" width="100%">
              <Text size="medium">
                {option.label}
              </Text>
            </Box>
          </ResultOption>
        </Keyboard>
      ))}
    </ResultOptionWrap>
  );
}

ResultOptions.propTypes = {
  options: PropTypes.array,
  onClick: PropTypes.func,
  onFocus: PropTypes.func,
  activeResult: PropTypes.number,
  focus: PropTypes.bool,
};

export default ResultOptions;
