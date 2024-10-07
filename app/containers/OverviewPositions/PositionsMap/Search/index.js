/**
 *
 * Search
 *
 */

import React, {
  useState, useRef, useEffect, forwardRef,
} from 'react';
import PropTypes from 'prop-types';
import { palette } from 'styled-theme';
import styled from 'styled-components';

import { Box, Button } from 'grommet';
// import { Search as SearchIcon } from 'grommet-icons';

import PrintHide from 'components/styled/PrintHide';
import Keyboard from 'components/Keyboard';

import { setFocusByRef } from 'utils/accessibility';

import Icon from 'components/Icon';
import SearchResults from './SearchResults';
import TextInput from './TextInput';

import { prepOptions } from './utils';

const SearchButton = styled(
  forwardRef((p, ref) => <Button {...p} ref={ref} />)
)`
  cursor: ${({ onClick }) => onClick ? 'pointer' : 'auto'};
  background: ${palette('light', 1)};
  border-top-right-radius: 999px;
  border-bottom-right-radius: 999px;
  border: 1px solid ${palette('light', 3)};
  border-left: 0px;
  padding-left: 13px;
  height: ${({ theme }) => theme.sizes.mapSearchBar.height}px;
  width: ${({ theme }) => theme.sizes.mapSearchBar.height}px;
  &:focus-visible {
    z-index: 1;
    outline: 2px auto ${palette('primary', 0)};
    box-shadow: none;
  }
`;
const ClearButton = styled((p) => <Button {...p} />)`
  cursor: ${({ onClick }) => onClick ? 'pointer' : 'auto'};
  height: ${({ theme }) => theme.sizes.mapSearchBar.height}px;
  width: ${({ theme }) => theme.sizes.mapSearchBar.height}px;
  border: 1px solid ${palette('light', 3)};
  background-color: ${palette('light', 1)};
  &:focus-visible {
    z-index: 1;
    outline: 2px auto  ${palette('primary', 0)};
    box-shadow: none;
  }
`;
/* const StyledSearchIcon = styled((p) => <SearchIcon size="small" {...p} />)`
  path {
    stroke-width: 1px;
    stroke-color: ${palette('dark', 2)};
  }
`; */
const StyledArrowIcon = styled((p) => (
  <Icon
    name="arrowDown"
    size="10px"
    palette="dark"
    paletteIndex={4}
    hasStroke
    {...p}
  />
))`
  path {
    stroke-width: 4px;
  }
  &:hover {
    stroke: ${palette('dark', 2)};
  }
`;
const StyledCloseIcon = styled((p) => (
  <Icon
    name="close"
    size="10px"
    palette="dark"
    paletteIndex={4}
    hasStroke
    {...p}
  />
))`
  path {
    stroke-width: 4px;
  }
  &:hover {
    stroke: ${palette('dark', 2)};
  }
`;
const Styled = styled((p) => <Box {...p} />)`
  width: 100%;
  position: relative;
`;
// eslint-disable-next-line react/no-multi-comp
const StyledSearchBox = styled(forwardRef((p, ref) => <Box {...p} ref={ref} />))`
  border-radius: 999px;
  outline: 2px solid ${({ active }) => active ? palette('primary', 0) : 'transparent'};
  outline-offset: 2px;
`;

const DropDown = styled.div`
  display: none;
  background: white;
  box-shadow: 0px 0px 15px 0px rgba(0,0,0,0.2);
  z-index: 999;
  margin-top: 6px;
  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
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

  return (
    <Styled
      pad={{ right: 'ms' }}
    >
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
                plain
                value={search}
                ref={textInputRef}
                onChange={(evt) => {
                  if (evt && evt.target) {
                    setSearch(evt.target.value);
                    setActiveResult(activeResetIndex);
                  }
                }}
                // icon={<StyledSearchIcon />}
                placeholder={placeholder}
              />
            </Keyboard>
            {search.length > 0 && (
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
              icon={<StyledArrowIcon />}
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
              dropdownWidth={textInputWrapperRef.current.clientWidth}
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
