/**
 *
 * Search
 *
 */

import React, {
  useState, useRef, useEffect, forwardRef, useContext,
} from 'react';
import PropTypes from 'prop-types';
import { palette } from 'styled-theme';
import styled from 'styled-components';

import { Box, Button, ThemeContext } from 'grommet';

import PrintHide from 'components/styled/PrintHide';
import Keyboard from 'components/Keyboard';

import { setFocusByRef } from 'utils/accessibility';

import Icon from 'components/Icon';
import SearchResults from './SearchResults';
import TextInput from './TextInput';

import { prepOptions } from './utils';
const SearchButtonBase = forwardRef((p, ref) => <Button plain {...p} ref={ref} />);
const SearchButton = styled(SearchButtonBase)`
  // removing extra space to reveal border + focus-visible outline
  height: ${({ theme }) => theme.sizes.mapSearchBar.height - 6}px;
  width: ${({ theme }) => theme.sizes.mapSearchBar.height - 6}px;
  background: transparent;
  color: ${palette('dark', 4)};
  padding-left: 7px;
  &:focus-visible {
    z-index: 1;
    outline: 2px auto ${palette('primary', 0)};
    box-shadow: none;
  }
  &:hover {
    color: ${palette('primary', 0)};
  }
`;
const ClearButton = styled((p) => <Button {...p} />)`
  // removing extra space to reveal border + focus-visible outline
  height: ${({ theme }) => theme.sizes.mapSearchBar.height - 6}px;
  width: ${({ theme }) => theme.sizes.mapSearchBar.height - 6}px;
  color: ${palette('dark', 4)};
  background: transparent;
  &:hover {
    color: ${palette('primary', 0)};
  }
  &:focus-visible {
    z-index: 1;
    outline: 2px auto  ${palette('primary', 0)};
    box-shadow: none;
  }
  @media print {
    display: none;
  }
`;
const StyledCloseIcon = styled((p) => (
  <Icon
    name="removeSmall"
    size="16px"
    {...p}
  />
))``;
const Styled = styled((p) => <Box {...p} />)`
  width: 100%;
  height: ${({ theme }) => theme.sizes.mapSearchBar.height}px;
  position: relative;
`;
// eslint-disable-next-line react/no-multi-comp
const StyledSearchBoxBase = forwardRef((p, ref) => (
  <Box
    pad={{
      vertical: 'none',
      left: 'medium',
      right: 'small',
    }}
    {...p}
    ref={ref}
  />
));
const StyledSearchBox = styled(StyledSearchBoxBase)`
  width: 100%;
  background-color: ${palette('light', 1)};
  color: ${palette('dark', 4)};
  border: 1px solid ${palette('light', 3)};
  border-radius: 999px;
  position: relative;
  @media print {
    border: none;
    box-shadow: none;
    padding: 0;
    display: ${({ hidePrint }) => hidePrint ? 'none' : 'block'};
  }
`;
const DropDown = styled.div`
  display: none;
  background: white;
  box-shadow: 0px 0px 15px 0px rgba(0,0,0,0.2);
  z-index: 999;
  margin-top: 6px;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    position: absolute;
    left: 3px;
    top: 100%;
    display: block;
  }
`;

export function Search({
  options,
  onSelect,
  placeholder,
}) {
  const theme = useContext(ThemeContext);
  const searchRef = useRef(null);
  const textInputRef = useRef(null);
  const textInputWrapperRef = useRef(null);
  const dropRef = useRef(null);
  const searchButtonRef = useRef(null);

  const [hasToggle, onToggle] = useState(false);
  const [textInputFocused, onTextInputFocused] = useState(false);
  const [dropFocused, onDropFocused] = useState(false);

  const [search, setSearch] = useState('');
  const activeResetIndex = -1;
  const [activeResult, setActiveResult] = useState(activeResetIndex);

  useEffect(() => {
    if (search.length > 1 && !hasToggle) {
      // toggle search dropdown on search query
      onToggle(true);
    }
  }, [search]);

  const outsideSearchClick = (e) => {
    // inside search click
    if (searchRef.current && searchRef.current.contains(e.target)) {
      return;
    }
    // inside drop click
    if (dropRef.current && dropRef.current.contains(e.target)) {
      return;
    }
    // outside click
    if (hasToggle) {
      onToggle(false);
    }
  };

  useEffect(() => {
    if (hasToggle) {
      document.addEventListener('mousedown', outsideSearchClick);
    }
    return () => {
      document.removeEventListener('mousedown', outsideSearchClick);
    };
  }, [hasToggle]);

  useEffect(() => {
    const handleSearchButtonFocus = () => {
      onDropFocused(false);
      setActiveResult(activeResetIndex);
      onTextInputFocused(false);
    };
    const handleInputFocus = () => {
      onDropFocused(false);
      setActiveResult(activeResetIndex);
      onTextInputFocused(true);
    };
    const handleInputBlur = () => onTextInputFocused(false);

    const inputElement = textInputRef.current;
    const searchButton = searchButtonRef.current;

    if (inputElement) {
      inputElement.addEventListener('focus', handleInputFocus);
      inputElement.addEventListener('blur', handleInputBlur);
    }
    if (searchButton) {
      searchButton.addEventListener('focus', handleSearchButtonFocus);
    }

    return () => {
      if (inputElement) {
        inputElement.removeEventListener('focus', handleInputFocus);
        inputElement.removeEventListener('blur', handleInputBlur);
      }
      if (searchButton) {
        searchButton.removeEventListener('focus', handleSearchButtonFocus);
      }
    };
  }, []);

  let sortedOptions = [];
  if (search.length > 0) {
    sortedOptions = options ? prepOptions(options, search) : [];
  }
  const searchHasResults = sortedOptions.size > 0 && search.length > 1;
  const searchIconSize = theme
    && theme.sizes
    && theme.sizes.mapSearchBar
    && theme.sizes.mapSearchBar.searchIconSize
    ? theme.sizes.mapSearchBar.searchIconSize : 0;

  return (
    <Styled>
      <StyledSearchBox
        direction="row"
        align="center"
        ref={searchRef}
        active={textInputFocused}
      >
        <>
          <Box
            width="large"
            fill="horizontal"
            direction="row"
            align="center"
            ref={textInputWrapperRef}
          >
            <Keyboard
              onTab={(event) => {
                const { shiftKey } = event;
                if (shiftKey) {
                  onToggle(false);
                }
              }}
              onEnter={() => {
                if (search.length > 1) {
                  setActiveResult(activeResetIndex + 1);
                  onDropFocused(true);
                  onToggle(true);
                }
              }}
              spanStyle={{ width: 'inherit' }}
            >
              <TextInput
                value={search}
                ref={textInputRef}
                onChange={(evt) => {
                  if (evt && evt.target) {
                    setSearch(evt.target.value);
                    setActiveResult(activeResetIndex);
                  }
                }}
                placeholder={placeholder}
              />
            </Keyboard>
            {search.length > 1 && (
              <Box>
                <ClearButton
                  onClick={() => {
                    setSearch('');
                    setActiveResult(activeResetIndex);
                    setFocusByRef(textInputRef);
                  }}
                  justify="center"
                  align="center"
                  title="Clear"
                  icon={<StyledCloseIcon />}
                />
              </Box>
            )}
          </Box>
          <Keyboard
            onEnter={() => {
              if (searchHasResults) {
                setActiveResult(activeResetIndex + 1);
                onDropFocused(true);
              }
            }}
            onTab={(event) => {
              const { shiftKey } = event;
              if (searchHasResults && !shiftKey) {
                setActiveResult(activeResetIndex + 1);
                onDropFocused(true);
              }
            }}
          >
            <SearchButton
              justify="center"
              align="center"
              tabIndex={searchHasResults ? 0 : -1}
              ref={searchButtonRef}
              onClick={() => {
                setActiveResult(activeResetIndex + 1);
                onDropFocused(true);
                onToggle(true);
              }}
              title="Search"
              icon={(
                <Icon
                  size={`${searchIconSize}px`}
                  name="search"
                />
              )}
            />
          </Keyboard>
        </>
      </StyledSearchBox>
      {hasToggle && search.length > 1 && (
        <PrintHide>
          <DropDown ref={dropRef}>
            <SearchResults
              onClose={() => {
                setSearch('');
                setActiveResult(activeResetIndex);
              }}
              search={search}
              onSelect={(typeId) => {
                onDropFocused(false);
                onSelect(typeId);
              }}
              activeResult={activeResult}
              setActiveResult={setActiveResult}
              activeResetIndex={activeResetIndex}
              options={sortedOptions}
              maxResult={sortedOptions.size}
              dropdownWidth={textInputWrapperRef.current.clientWidth
                + searchIconSize}
              focusTextInput={() => setFocusByRef(textInputRef)}
              focus={dropFocused}
              setFocus={onDropFocused}
              onToggle={onToggle}
            />
          </DropDown>
        </PrintHide>
      )}
    </Styled>
  );
}

Search.propTypes = {
  placeholder: PropTypes.string,
  options: PropTypes.object,
  onSelect: PropTypes.func,
};

export default Search;
