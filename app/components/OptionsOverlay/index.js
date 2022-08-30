/*
 *
 * OptionsOverlay
 *
 */

import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import styled from 'styled-components';
import {
  Box,
  Button,
  Layer,
} from 'grommet';
import qe from 'utils/quasi-equals';
import Icon from 'components/Icon';
import MultiSelect from 'components/forms/MultiSelectControl/MultiSelect';


const StyledButton = styled((p) => <Button {...p} />)`
  color: ${({ theme }) => theme.global.colors.text.secondary};
  &:hover {
    color: ${({ theme }) => theme.global.colors.highlight};
  }
`;

const LayerWrap = styled((p) => (
  <Box
    background="white"
    {...p}
  />
))`
min-width: 320px;
min-height: 350px;
overflow-y: auto;
`;

function OptionsOverlay({
  options,
  title,
  onChange,
}) {
  const infoRef = useRef(null);
  const [showOptions, setShowOptions] = useState(false);
  const [myOptions, setOptions] = useState(options);

  useEffect(
    () => setOptions(options),
    [options],
  );

  return (
    <>
      <Box
        fill={false}
        pad={{ horizontal: 'xsmall' }}
        ref={infoRef}
        flex={{ grow: 0, shrink: 0 }}
      >
        <StyledButton
          plain
          title={title}
          pad="small"
          icon={(
            <Icon
              title={title}
              name="filter"
              size="18px"
            />
          )}
          fill={false}
          onClick={() => setShowOptions(!showOptions)}
        />
      </Box>
      {showOptions && (
        <Layer
          onEsc={() => setShowOptions(false)}
          onClickOutside={() => setShowOptions(false)}
          margin={{ top: 'large' }}
          position="top"
          animate={false}
        >
          <LayerWrap>
            <Box>
              <MultiSelect
                title={title}
                values={myOptions}
                options={options}
                onChange={(optionsChanged) => {
                  const optionsUpdated = myOptions.map(
                    (o) => {
                      const optionChanged = optionsChanged.find(
                        (oc) => qe(o.get('value'), oc.get('value'))
                      );
                      return optionChanged
                        ? o.set('checked', optionChanged.get('checked'))
                        : o;
                    }
                  );
                  setOptions(optionsUpdated);
                }}
                fixedOrder
                search={false}
                onCancel={() => {
                  setShowOptions(false);
                  onChange(options);
                }}
                buttons={[{
                  submit: false,
                  type: 'primary',
                  title: 'Confirm',
                  onClick: () => {
                    setShowOptions(false);
                    onChange(myOptions);
                  },
                }]}
              />
            </Box>
          </LayerWrap>
        </Layer>
      )}
    </>
  );
}

OptionsOverlay.propTypes = {
  options: PropTypes.instanceOf(List),
  title: PropTypes.string,
  onChange: PropTypes.func,
};

export default OptionsOverlay;
