import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box } from 'grommet';
import Content from 'components/Content';

const Wrapper = styled((p) => <Box {...p} />)`
    max-width: 90%;
    @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
      max-width: 400px;
    }
    @media (min-width: ${({ theme }) => theme.breakpointsMin.large}) {
      max-width: 480px;
    }
`;

class ContentNarrow extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { isStatic, withoutHeaderNav } = this.props;
    return (
      <Content withoutHeaderNav={withoutHeaderNav} isStatic={isStatic}>
        <Box align="center" fill="horizontal">
          <Wrapper>
            {this.props.children}
          </Wrapper>
        </Box>
      </Content>
    );
  }
}

ContentNarrow.propTypes = {
  children: PropTypes.node,
  isStatic: PropTypes.bool,
  withoutHeaderNav: PropTypes.bool,
};

export default ContentNarrow;
