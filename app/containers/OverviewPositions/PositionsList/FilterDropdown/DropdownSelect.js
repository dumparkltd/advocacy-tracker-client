import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import TagSearch from 'components/TagSearch';

import { cleanupSearchTarget, regExMultipleWords } from 'utils/string';
import OptionList from './OptionList';

const Styled = styled.div`
  max-height: 450px;
  min-height: 300px;
  height: 450px;
  display: block;
  z-index: 10;
  overflow: hidden;
  background-color: white;
  border: 1px solid ${palette('light', 2)};
  box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.1);
  @media (min-width: ${(props) => props.theme.breakpoints.medium}) {
    min-width: 350px;
  }
  margin-top: 10px;
  position: relative;
`;

const Search = styled.div`
  padding: 0.75em;
  background-color: ${palette('background', 1)};
  height: 80px;
  @media (min-width: ${(props) => props.theme.breakpoints.medium}) {
    padding: 0.75em 1em;
  }
  border-bottom: 1px solid ${palette('light', 2)};
`;

export function DropdownSelect({
  options,
  onSelect,
}) {
  const [search, onSetSearch] = useState(null);
  const optionsSearched = search
    ? options.filter((o) => {
      const regex = new RegExp(regExMultipleWords(search), 'i');
      return regex.test(cleanupSearchTarget(o.title));
    })
    : options;
  return (
    <Styled>
      <Search>
        <TagSearch
          onSearch={onSetSearch}
          onClear={() => onSetSearch(null)}
          searchQuery={search || ''}
          multiselect
        />
      </Search>
      <OptionList
        options={optionsSearched}
        onSelect={onSelect}
      />
    </Styled>
  );
}

DropdownSelect.propTypes = {
  options: PropTypes.array,
  onSelect: PropTypes.func,
};

export default DropdownSelect;
