import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import { Box } from 'grommet';

import Option from './Option';

const Styled = styled.div`
  width: 100%;
  overflow-y: scroll;
  position: absolute;
  top: 80px;
  left: 0;
  bottom: 0;
  right: 0;
`;
const ListWrapper = styled.div`
  width: 100%;
  border-top: 1px solid ${palette('light', 1)};
`;

const OptionsWrapper = styled((p) => <Box {...p} />)`
  width: 100%;
`;

const Empty = styled.div`
  padding: 1em;
  color: ${palette('text', 1)};
`;

function OptionList({ options, onSelect }) {
  return (
    <Styled>
      <ListWrapper>
        <OptionsWrapper>
          {options && options.map((option) => {
            const { id } = option;
            return (
              <Option
                key={id}
                option={option}
                onSelect={onSelect}
              />
            );
          })}
        </OptionsWrapper>
        {(!options || options.length === 0) && (
          <Empty>
            No entries
          </Empty>
        )}
      </ListWrapper>
    </Styled>
  );
}


OptionList.propTypes = {
  options: PropTypes.array,
  onSelect: PropTypes.func,
};

export default OptionList;
