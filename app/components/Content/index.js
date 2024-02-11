import React from 'react';
import PropTypes from 'prop-types';

import Container from 'components/styled/Container';
import ContainerWrapper from 'components/styled/Container/ContainerWrapper';
import { usePrint } from 'containers/App/PrintContext';

const Content = React.forwardRef(
  (
    {
      isSingle,
      withoutHeaderNav,
      isStatic,
      onClose,
      inModal,
      children,
    },
    ref,
  ) => {
    const isPrint = usePrint();
    return (
      <ContainerWrapper
        bg={isSingle}
        ref={ref}
        isStatic={withoutHeaderNav || isStatic}
        isContent
        isPrint={isPrint}
        onClick={(e) => {
          if (inModal && onClose) {
            if (e.currentTarget !== e.target) return;
            onClose(e);
          }
        }}
      >
        <Container
          inModal={inModal}
          isSingle={isSingle}
          isPrint={isPrint}
        >
          {children}
        </Container>
      </ContainerWrapper>
    );
  }
);

Content.propTypes = {
  children: PropTypes.node,
  inModal: PropTypes.bool,
  withoutHeaderNav: PropTypes.bool,
  isStatic: PropTypes.bool,
  isSingle: PropTypes.bool,
  onClose: PropTypes.func,
};

export default Content;
