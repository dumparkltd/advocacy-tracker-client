import React from 'react';
import PropTypes from 'prop-types';

import Container from 'components/styled/Container';
import ContainerWrapper from 'components/styled/Container/ContainerWrapper';

const Content = React.forwardRef((props, ref) => (
  <ContainerWrapper bg={props.isSingle} ref={ref} isStatic={props.withoutHeaderNav || props.isStatic}>
    <Container inModal={props.inModal} isSingle={props.isSingle}>
      {props.children}
    </Container>
  </ContainerWrapper>
));

Content.propTypes = {
  children: PropTypes.node,
  inModal: PropTypes.bool,
  withoutHeaderNav: PropTypes.bool,
  isStatic: PropTypes.bool,
  isSingle: PropTypes.bool,
};

export default Content;
