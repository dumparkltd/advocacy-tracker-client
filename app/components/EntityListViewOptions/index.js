import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import {
  Text, Box, ResponsiveContext,
} from 'grommet';

import { isMinSize } from 'utils/responsive';

import ButtonFlat from 'components/buttons/ButtonFlat';
import Icon from 'components/Icon';

const Styled = styled((p) => <Box {...p} />)`
  position: relative;
  z-index: 20;
  display: ${({ isPrint }) => isPrint ? 'none' : 'inline-block'};
`;
const ButtonGroup = styled(
  (p) => (
    <Box
      direction="row"
      align="center"
      responsive={false}
      plain
      {...p}
    />
  )
)`
  background: white;
  box-shadow: ${({ isOnMap }) => isOnMap ? '0px 0px 5px 0px rgba(0,0,0,0.2)' : 'none'};
  border-radius: 999px;
  padding: 4px 13px;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.ms}) {
    padding: 4px 16px;
  }
`;
const ButtonLabel = styled((p) => <Text size="small" {...p} />)`
  font-weight: normal;
`;
const ButtonOptions = styled((p) => <ButtonFlat {...p} />)`
  color: ${({ isActive }) => isActive ? palette('dark', 2) : palette('dark', 4)};
  cursor: ${({ isActive }) => isActive ? 'default' : 'pointer'};
  padding: 0;
  min-height: 33px;
  min-width: 33px;
  text-transform: none;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    padding: 0 3px 0 0;
  }
  &:hover {
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
              <ButtonGroup
                isOnMap={isOnMap}
                gap={isMinSize(size, 'ms') ? 'xsmall' : 'xxsmall'}
              >
                {options.map((option, i) => option && (
                  <Box key={i}>
                    <ButtonOptions
                      onClick={() => option.onClick()}
                      isActive={option.active}
                      title={option.title}
                    >
                      <Box direction="row" align="center" responsive={false}>
                        <Icon name={option.icon} size="33px" />
                        {isMinSize(size, 'medium') && (
                          <ButtonLabel size="small" isActive={option.active}>
                            {option.title}
                          </ButtonLabel>
                        )}
                      </Box>
                    </ButtonOptions>
                  </Box>
                ))}
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
