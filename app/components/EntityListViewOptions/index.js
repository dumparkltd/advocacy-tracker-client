import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { palette } from 'styled-theme';

import {
  Text, Box, Button, ResponsiveContext,
} from 'grommet';

import { isMinSize } from 'utils/responsive';

import Icon from 'components/Icon';

const Styled = styled((p) => <Box {...p} />)`
  position: relative;
  z-index: 20;
  display: ${({ isPrint }) => isPrint ? 'none' : 'inline-block'};
`;
const ButtonGroup = styled((p) => <Box direction="row" margin="none" gap="medium" {...p} />)`
  border-radius: 999px;
  padding: 8px 18px 6px ${({ isOnMap }) => isOnMap ? '18' : '0'}px;
  box-shadow: ${({ isOnMap }) => isOnMap ? '0px 0px 5px 0px rgba(0,0,0,0.2)' : 'none'};
  background: white;
`;
const ButtonLabel = styled((p) => <Text size="small" {...p} />)`
  font-weight: normal;
`;
const ButtonOptions = styled((p) => <Button plain {...p} />)`
  color: ${({ isActive }) => isActive ? palette('dark', 2) : palette('dark', 4)};
  border-radius: 5px;
  border: none;
  padding: 5px;
  cursor: ${({ isActive }) => isActive ? 'default' : 'pointer'};
  &:hover {
    box-shadow: none;
    color: ${({ isActive, theme }) => isActive ? palette('dark', 2) : theme.global.colors.highlight};
  }
`;

class EntityListViewOptions extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { options, isOnMap, isPrintView } = this.props;
    return (
      <ResponsiveContext.Consumer>
        {(size) => (
          <Styled isPrint={isPrintView}>
            {options && (
              <ButtonGroup pad="none" isOnMap={isOnMap}>
                {options.map((option, i) => option && (
                  <ButtonOptions
                    key={i}
                    onClick={() => option.onClick()}
                    isActive={option.active}
                    label={(
                      <Box as="span" direction="row" gap="none" align="center">
                        <Icon
                          name={option.icon}
                          size="33px"
                        />
                        {isMinSize(size, 'medium') && (
                          <ButtonLabel size="small" isActive={option.active}>
                            {option.title}
                          </ButtonLabel>
                        )}
                      </Box>
                    )}
                  />
                ))
                }
              </ButtonGroup>
            )}
          </Styled>
        )}
      </ResponsiveContext.Consumer>
    );
  }
}

EntityListViewOptions.propTypes = {
  isOnMap: PropTypes.bool,
  isPrintView: PropTypes.bool,
  options: PropTypes.array,
};

export default EntityListViewOptions;
