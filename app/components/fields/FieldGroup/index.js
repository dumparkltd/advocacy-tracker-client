import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import FieldFactory from 'components/fields/FieldFactory';
import FieldGroupWrapper from 'components/fields/FieldGroupWrapper';
import FieldGroupLabel from 'components/fields/FieldGroupLabel';
import GroupLabel from 'components/fields/GroupLabel';
import Field from 'components/fields/Field';

export function FieldGroup({
  group,
  seamless,
  aside,
  bottom,
}) {
  // skip group if no group or fields are present
  const hasFields = group
    && group.fields
    && group.fields.reduce((memo, field) => memo || field, false);
  if (group && (hasFields || group.custom)) {
    console.log(group);
    return (
      <FieldGroupWrapper
        groupType={group.type}
        seamless={seamless}
        aside={aside}
        bottom={bottom}
      >
        {group.label && (
          <FieldGroupLabel basic={group.type === 'smartTaxonomy'}>
            <GroupLabel>
              <FormattedMessage {...group.label} />
            </GroupLabel>
          </FieldGroupLabel>
        )}
        {group.title && (
          <FieldGroupLabel>
            <GroupLabel>
              {group.title}
            </GroupLabel>
          </FieldGroupLabel>
        )}
        {group.fields && group.fields.map(
          (field, i) => field
            ? (
              <FieldFactory
                key={i}
                field={{ ...field, aside }}
              />
            )
            : null
        )}
        {group.custom && (
          <Field>
            {group.custom}
          </Field>
        )}
      </FieldGroupWrapper>
    );
  }
  return null;
}

FieldGroup.propTypes = {
  group: PropTypes.object.isRequired,
  seamless: PropTypes.bool,
  aside: PropTypes.bool,
  bottom: PropTypes.bool,
  isPrint: PropTypes.bool,
};

export default FieldGroup;
