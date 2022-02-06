import React from 'react';
import PropTypes from 'prop-types';

import ButtonTagCategory from 'components/buttons/ButtonTagCategory';

// border-top-color:;

class EntityListItemMainTag extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { tag } = this.props;
    return (
      <ButtonTagCategory
        onClick={tag.onClick}
        taxId={parseInt(tag.taxId, 10)}
        disabled={!tag.onClick}
        title={tag.title}
      >
        {tag.label}
      </ButtonTagCategory>
    );
  }
}

EntityListItemMainTag.propTypes = {
  tag: PropTypes.object,
};

export default EntityListItemMainTag;
