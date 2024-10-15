import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { palette } from 'styled-theme';

import {
  Text, Box, Button,
} from 'grommet';

import Icon from 'components/Icon';

const Styled = styled((p) => <Box {...p} />)`
  position: relative;
  z-index: 20;
  display: ${({ isPrint }) => isPrint ? 'none' : 'inline-block'};
`;
const ButtonGroup = styled((p) => <Box {...p} />)`
  display: table;
  text-align: right;
  border-radius: 999px;
  padding-bottom: 0px;
  box-shadow: ${({ isOnMap }) => isOnMap ? '0px 0px 5px 0px rgba(0,0,0,0.2)' : 'none'};
  background: white;
`;
const ButtonLabel = styled((p) => <Text size="small" {...p} />)`
  color: ${({ isActive }) => isActive ? palette('dark', 1) : palette('dark', 4)};
  font-weight: normal;
`;
const TableCell = styled.span`
  display: ${({ hiddenMobile }) => {
    if (hiddenMobile) {
      return 'none';
    }
    return 'table-cell';
  }};
  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    display: table-cell;
    vertical-align: middle;
  }
`;
const ButtonWrap = styled.span`
  @media print {
    display: none;
  }
`;
const ButtonOptions = styled((p) => <Button plain {...p} />)`
  color: ${({ isActive }) => isActive ? palette('dark', 2) : palette('dark', 4)};
  padding: 0px 10px;
  border-radius: 999px;
  border: none;
  &:hover {
    box-shadow: none;
    color: ${palette('primary', 1)};
  }
`;
class EntityListViewOptions extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { options, isOnMap, isPrintView } = this.props;
    return (
      <Styled isPrint={isPrintView}>
        {options && (
          <ButtonGroup pad="xsmall" isOnMap={isOnMap}>
            {options.map((option, i) => option && (
              <TableCell key={i}>
                <ButtonWrap>
                  <ButtonOptions
                    onClick={() => option.onClick()}
                    isActive={option.active}
                    pad={{
                      vertical: 'xsmall',
                      horizontal: 'small',
                      left: (option.isFirst && !isOnMap) ? 'none' : 'smaall',
                    }}
                    label={(
                      <Box direction="row" gap="none" align="center">
                        <Box>
                          <Icon
                            name={option.icon}
                            size="35px"
                            paletteIndex={option.active ? 2 : 4}
                            palette="dark"
                          />
                        </Box>
                        <ButtonLabel
                          size="small"
                          isActive={option.active}
                        >
                          {option.title}
                        </ButtonLabel>
                      </Box>
                    )}
                  />
                </ButtonWrap>
              </TableCell>
            ))
            }
          </ButtonGroup>
        )}
      </Styled>
    );
  }
}

EntityListViewOptions.propTypes = {
  isOnMap: PropTypes.bool,
  isPrintView: PropTypes.bool,
  options: PropTypes.array,
};

export default EntityListViewOptions;
