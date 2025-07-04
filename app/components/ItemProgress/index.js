import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import ButtonTagCategoryInverse from 'components/buttons/ButtonTagCategoryInverse';

const Status = styled.div`
  float: right;
  padding-left: 5px;
  margin-top: -4px;
  @media (min-width: ${({ theme }) => theme && theme.breakpointsMin ? theme.breakpointsMin.medium : '769px'}) {
    padding-left: 13px;
  }
`;

class ItemProgress extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { status } = this.props;
    return status
      ? (
        <Status>
          <ButtonTagCategoryInverse
            taxId={parseInt(status.attributes.taxonomy_id, 10)}
            disabled
            title={status.attributes.title}
          >
            {status.attributes.title}
          </ButtonTagCategoryInverse>
        </Status>
      )
      : null;
  }
}

ItemProgress.propTypes = {
  status: PropTypes.object,
};

export default ItemProgress;
