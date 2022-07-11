/*
 *
 * OptionsOverlay
 *
 */

import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import styled from 'styled-components';
import {
  Box,
  Button,
  Layer,
} from 'grommet';
import { Filter } from 'grommet-icons';

import qe from 'utils/quasi-equals';

import MultiSelect from 'components/forms/MultiSelectControl/MultiSelect';
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
  dark, options, title, padButton, colorButton, onChange,
}) {
  const infoRef = useRef(null);
  const [showOptions, setShowOptions] = useState(false);
  const [myOptions, setOptions] = useState(options);
  console.log(options && options.toJS(0));
  console.log(myOptions && myOptions.toJS());
  return (
    <>
      <Box
        fill={false}
        pad={padButton || { horizontal: 'small' }}
        ref={infoRef}
        flex={{ grow: 0, shrink: 0 }}
      >
        <Button
          plain
          icon={(
            <Filter
              color={colorButton || (dark ? 'light-5' : 'dark-5')}
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
                options={myOptions}
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
                onCancel={() => setShowOptions(false)}
                buttons={[{
                  type: 'primary',
                  onClick: () => {
                    onChange(myOptions);
                    setShowOptions(false);
                  },
                  submit: false,
                  title: 'Confirm',
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
  dark: PropTypes.bool,
  options: PropTypes.instanceOf(List),
  title: PropTypes.string,
  colorButton: PropTypes.string,
  onChange: PropTypes.func,
  padButton: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.string,
  ]),
};

export default OptionsOverlay;
