import React from 'react';
import PropTypes from 'prop-types';
import FieldFactory from 'components/fields/FieldFactory';
import styled from 'styled-components';
import { Box, Text } from 'grommet';

import { API, ACTIONTYPES } from 'themes/config';
import qe from 'utils/quasi-equals';

import {
  getDateField,
  getMarkdownField,
} from 'utils/fields';

const SectionTitle = styled((p) => <Text size="xsmall" {...p} />)`
  text-transform: uppercase;
  font-weight: bold;
`;

export function AttributeField({
  content,
  entity,
}) {
  const att = content.get('attribute');
  let field;
  if (
    att === 'description'
    && entity.getIn(['attributes', 'description'])
    && entity.getIn(['attributes', 'description']).trim().length > 0
  ) {
    field = getMarkdownField(entity, 'description', true, null, true);
  }
  if (att === 'date' || att === 'date_start') {
    let measureTypeId;
    if (entity.get('type') === API.ACTIONS) {
      measureTypeId = entity && entity.getIn(['attributes', 'measuretype_id']);
    }
    if (
      qe(measureTypeId, ACTIONTYPES.EXPRESS)
      || (
        entity.getIn(['attributes', 'date_start'])
        && entity.getIn(['attributes', 'date_start']).trim().length > 0
      )
    ) {
      let datesEqual;
      if (
        entity
        && entity.getIn(['attributes', 'date_start'])
        && entity.getIn(['attributes', 'date_end'])
      ) {
        const [ds] = entity.getIn(['attributes', 'date_start']).split('T');
        const [de] = entity.getIn(['attributes', 'date_end']).split('T');
        datesEqual = ds === de;
      }
      const dateSpecificity = 'd';
      field = getDateField(
        entity,
        'date_start',
        {
          specificity: dateSpecificity,
          attributeLabel: datesEqual ? 'date' : 'date_start',
          fallbackAttribute: qe(measureTypeId, ACTIONTYPES.EXPRESS) ? 'created_at' : null,
          fallbackAttributeLabel: 'created_at_fallback',
        },
      );
    }
  }
  if (!field) return null;
  return (
    <Box gap="small">
      {content.get('title') && (
        <SectionTitle>
          {content.get('title')}
        </SectionTitle>
      )}
      <FieldFactory
        field={{
          ...field,
          noPadding: true,
        }}
      />
    </Box>
  );
}

AttributeField.propTypes = {
  content: PropTypes.object, // immutable Map
  entity: PropTypes.object, // immutable Map
};

export default AttributeField;
