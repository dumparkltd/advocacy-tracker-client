import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import TagSearch from 'components/TagSearch';

import { cleanupSearchTarget, regExMultipleWords } from 'utils/string';
import OptionList from './OptionList';

const Styled = styled.div`
  padding-top: 0px;
  position: relative;
  max-height: ${({ full }) => full ? 'none' : '450px'};
  min-height: ${({ full }) => full ? 0 : 300}px;
  height: ${({ full }) => full ? '100%' : '450px'};
  display: block;
  z-index: 10;
  overflow: hidden;
  background-color: white;
  border: 1px solid ${({ full }) => full ? 'transparent' : palette('light', 2)};
  box-shadow: ${({ full }) => full ? 'none' : '0px 0px 5px 0px rgba(0,0,0,0.1)'};
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    min-width: 350px;
  }
`;

const Search = styled.div`
  padding: 0.75em;
  background-color: ${palette('background', 1)};
  height: 80px;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    padding: 0.75em 1em;
  }
  border-bottom: 1px solid ${palette('light', 2)};
`;

export function DropdownSelect({
  options,
  onSelect,
  full,
}) {
  const [search, onSetSearch] = useState(null);
  const optionsSearched = search
    ? options.filter((o) => {
      const regex = new RegExp(regExMultipleWords(search), 'i');
      return regex.test(cleanupSearchTarget(o.title));
    })
    : options;
  return (
    <Styled full={full}>
      <Search full={full}>
        <TagSearch
          onSearch={onSetSearch}
          onClear={() => onSetSearch(null)}
          searchQuery={search || ''}
          multiselect
        />
      </Search>
      <OptionList
        full={full}
        options={optionsSearched}
        onSelect={onSelect}
      />
    </Styled>
  );
}

DropdownSelect.propTypes = {
  options: PropTypes.array,
  onSelect: PropTypes.func,
  full: PropTypes.bool,
};

export default DropdownSelect;
