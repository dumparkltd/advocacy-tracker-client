import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import asArray from 'utils/as-array';

import DropHeader from './DropHeader';
import DropFilter from './DropFilter';
import DropSort from './DropSort';


const Styled = styled.div`
  max-width: none;
  height: 300px;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    height: 350px;
    width: 300px;
  }
`;
const BodyInDrop = styled.div`
  position: absolute;
  top: 50px;
  right: 0;
  left: 0;
  bottom: 0;
  overflow-y: auto;
`;

export function DropContent({
  column,
  onUpdate,
  onClose,
}) {
  return (
    <Styled>
      <DropHeader
        onClose={onClose}
        title={column.filterOptionsTitle || column.mainTitle || 'Column options'}
      />
      <BodyInDrop>
        {column.onSort && (
          <DropSort column={column} />
        )}
        <DropFilter
          options={column.filterOptions}
          onUpdate={(filterIds, checked) => {
            let changedToChecked = [];
            let changedToUnchecked = [];
            asArray(filterIds).forEach((filterId) => {
              if (checked) {
                changedToChecked = [...changedToChecked, filterId];
              }
              if (!checked) {
                changedToUnchecked = [...changedToUnchecked, filterId];
              }
            });
            const changedFilters = [...changedToChecked, ...changedToUnchecked];
            const updatedFilterOptions = column.filterOptions.map((option) => {
              const optionChanged = changedFilters.indexOf(option.value) > -1;
              return ({
                ...option,
                changed: optionChanged,
              });
            });
            onUpdate(updatedFilterOptions);
          }}
        />
      </BodyInDrop>
    </Styled>
  );
}

DropContent.propTypes = {
  column: PropTypes.object,
  onClose: PropTypes.func,
  onUpdate: PropTypes.func,
};

export default DropContent;
