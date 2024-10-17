import React, { useRef, useEffect, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { palette } from 'styled-theme';

import { Box, Button } from 'grommet';

import { setFocusByRef } from 'utils/accessibility';

import Keyboard from 'components/Keyboard';

import Hint from './Hint';
import ResultOptions from './ResultOptions';
import messages from './messages';


const Styled = styled((p) => <Box {...p} />)`
  width: ${({ dropdownWidth }) => dropdownWidth}px;
`;

const StyledButton = styled(forwardRef((p, ref) => <Button {...p} ref={ref} />))`
  &:focus-visible {
    outline-offset: -2px;
    outline: 2px solid ${palette('primary', 0)};
    border-radius: 5px;
  }
`;
export function SearchResults({
  options,
  onSelect,
  activeResult,
  setActiveResult,
  activeResetIndex,
  maxResult,
  dropdownWidth,
  focus,
  onToggle,
  focusTextInput,
}) {
  const hasOptions = options && options.size > 0;
  const noResultsRef = useRef(null);

  useEffect(() => {
    if (activeResult === (activeResetIndex + 1) && !hasOptions) {
      setFocusByRef(noResultsRef);
    }
  }, [activeResult, hasOptions]);

  return (
    <Box
      elevation="medium"
      round="xsmall"
      background="white"
    >
      <Styled flex overflow="auto" margin="none" dropdownWidth={dropdownWidth}>
        {!hasOptions
          && (
            <Keyboard
              onEnter={() => {
                onToggle(false);
                setActiveResult(activeResetIndex);
                focusTextInput();
              }}
              onTab={() => {
                onToggle(false);
                setActiveResult(activeResetIndex);
              }}
            >
              <StyledButton ref={noResultsRef}>
                <Box pad="small">
                  <Hint italic>
                    <FormattedMessage {...messages.noResults} />
                  </Hint>
                </Box>
              </StyledButton>
            </Keyboard>
          )}
        {hasOptions
          && (
            <Keyboard
              onUp={(event) => {
                event.preventDefault();
                setActiveResult(Math.max(0, activeResult - 1));
              }}
              onDown={(event) => {
                event.preventDefault();
                setActiveResult(Math.min(activeResult + 1, maxResult - 1));
              }}
              onTab={() => {
                // if end of the dropdown has been reached, toggle drop
                if (activeResult + 1 === maxResult) {
                  onToggle(false);
                }
              }}
            >
              <ResultOptions
                options={options.toList().toJS()}
                activeResult={activeResult}
                onClick={(id) => onSelect(id)}
                focus={focus}
                onFocus={(index) => {
                  setActiveResult(index);
                }}
              />
            </Keyboard>
          )}
      </Styled>
    </Box>
  );
}

SearchResults.propTypes = {
  onSelect: PropTypes.func,
  setActiveResult: PropTypes.func,
  options: PropTypes.object,
  activeResult: PropTypes.number,
  maxResult: PropTypes.number,
  dropdownWidth: PropTypes.number,
  focus: PropTypes.bool,
  onToggle: PropTypes.func,
  focusTextInput: PropTypes.func,
  activeResetIndex: PropTypes.number,
};

export default SearchResults;
