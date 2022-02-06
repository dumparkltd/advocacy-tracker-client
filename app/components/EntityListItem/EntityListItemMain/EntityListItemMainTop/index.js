import React from 'react';
import PropTypes from 'prop-types';

import Component from 'components/styled/Component';

import ItemRole from 'components/ItemRole';

export default function EntityListItemMainTop({ entity }) {
  return (
    <Component>
      { entity.role
        && <ItemRole role={entity.role} />
      }
    </Component>
  );
}

EntityListItemMainTop.propTypes = {
  entity: PropTypes.object.isRequired,
};
