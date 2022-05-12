import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, Text, Button } from 'grommet';

// import ButtonFactory from 'components/buttons/ButtonFactory';

const Styled = styled.div`
  padding-bottom: ${({ inList }) => inList ? 2 : 8}px;
  @media (min-width: ${(props) => props.theme.breakpoints.medium}) {
    padding-bottom: ${({ inList }) => inList ? 5 : 10}px;
  }
`;
const TypeButton = styled((p) => <Button plain {...p} />)`
  padding: ${({ inList }) => inList ? '0px 4px' : '2px 4px'};
  border-bottom: 2px solid;
  border-bottom-color: ${({ active }) => active ? 'brand' : 'transparent'};
  background: none;
`;

class MapSubjectOptions extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { options, inList } = this.props;
    return (
      <Styled inList={inList}>
        {options && (
          <Box direction="row" gap="small">
            {
              options.map((option, i) => option && (
                <Box key={i}>
                  <TypeButton active={option.active} onClick={option.onClick} inList={inList}>
                    <Text size={inList ? 'medium' : 'large'}>
                      {option.title}
                    </Text>
                  </TypeButton>
                </Box>
              ))
            }
          </Box>
        )}
      </Styled>
    );
  }
}

MapSubjectOptions.propTypes = {
  options: PropTypes.array,
  inList: PropTypes.bool,
};

export default MapSubjectOptions;
