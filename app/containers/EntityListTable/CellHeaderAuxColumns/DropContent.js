import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import asArray from 'utils/as-array';
import DropHeader from './DropHeader';
import DropBody from './DropBody';

const Styled = styled.div`
  max-width: none;
  height: 300px;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    height: 350px;
    width: 300px;
  }
`;
const HeaderInDrop = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 50px;
  background: white;
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
  columnOptions,
  onUpdate,
  onClose,
  // theme,
}) {
  return (
    <Styled>
      <HeaderInDrop>
        <DropHeader onClose={() => onClose()} />
      </HeaderInDrop>
      <BodyInDrop>
        <DropBody
          options={columnOptions}
          onUpdate={(columnIds, checked) => {
            let changedToHidden = [];
            let changedToVisible = [];
            asArray(columnIds).forEach((columnId) => {
              if (checked) {
                changedToVisible = [...changedToVisible, columnId];
              }
              if (!checked) {
                changedToHidden = [...changedToHidden, columnId];
              }
            });
            const changedColumns = [...changedToVisible, ...changedToHidden];
            const updatedColumnOptions = columnOptions.map((col) => {
              const colChanged = changedColumns.indexOf(col.id) > -1;
              return ({
                ...col,
                changed: colChanged,
              });
            });
            onUpdate(updatedColumnOptions);
          }}
        />
      </BodyInDrop>
    </Styled>
  );
}
DropContent.propTypes = {
  columnOptions: PropTypes.array,
  onUpdate: PropTypes.func,
  onClose: PropTypes.func,
};

export default DropContent;
