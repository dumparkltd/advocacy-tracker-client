import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { get } from 'lodash/object';
import { Box, Text } from 'grommet';
import asArray from 'utils/as-array';

import Icon from 'components/Icon';

import FieldGroupWrapper from 'components/fields/FieldGroupWrapper';
import FieldGroupLabel from 'components/fields/FieldGroupLabel';
import GroupIcon from 'components/fields/GroupIcon';
import GroupLabel from 'components/fields/GroupLabel';
import ViewPanel from 'components/EntityView/ViewPanel';

import FormField from './FormField';

const Section = styled(
  (p) => <Box pad={{ vertical: 'large', horizontal: 'xxlarge' }} {...p} />
)`
  border-bottom: 2px solid #B7BCBF;
`;

const SectionTitle = styled(
  (p) => <Text size="small" {...p} />
)`
  text-transform: uppercase;
  font-weight: 700;
  margin-bottom: ${({ theme }) => theme.global.edgeSize.small};
 `;

const Row = styled(
  (p) => <Box direction="row" fill="horizontal" align="start" gap="medium" {...p} />
)``;

export function FormContentWrapper({
  fields,
  sections,
  formData,
  formDataTracked,
  scrollContainer,
  closeMultiselectOnClickOutside,
  handleUpdate,
  step,
}) {
  // console.log('isNewEntityView', isNewEntityView)
  // // console.log('formData', formData && formData.toJS())
  // console.log('sections', sections)
  return (
    <div>
      {sections && sections.length > 0 && sections.map(
        (section) => {
          if (!section.rows) return null;
          return (
            <Section key={section.id}>
              {section.title && (
                <SectionTitle>
                  {section.title}
                </SectionTitle>
              )}
              <Box gap="ms">
                {section.rows.map(
                  (row, i) => {
                    if (!row.fields) return null;
                    return (
                      <Row key={i}>
                        {row.fields.map(
                          (field, j) => {
                            if (!field) return null;
                            const modelPath = field.model && field.model.split('.').filter((val) => val !== '');
                            const fieldTracked = get(formDataTracked, modelPath);
                            return (
                              <Box key={j} basis={field.basis || 'full'}>
                                <FormField
                                  step={step}
                                  field={field}
                                  fieldTracked={fieldTracked}
                                  formData={formData}
                                  closeMultiselectOnClickOutside={closeMultiselectOnClickOutside}
                                  scrollContainer={scrollContainer}
                                  handleUpdate={handleUpdate}
                                />
                              </Box>
                            );
                          }
                        )}
                      </Row>
                    );
                  }
                )}
              </Box>
            </Section>
          );
        }
      )}
      {fields && fields.length > 0 && (
        <ViewPanel>
          {asArray(fields).map(
            (fieldGroup, i) => {
              // skip group if no group or fields are present
              if (!fieldGroup.fields
                || !fieldGroup.fields.reduce((memo, field) => memo || field, false)
              ) {
                return null;
              }
              return (
                <div key={i}>
                  <FieldGroupWrapper>
                    {fieldGroup.label && (
                      <FieldGroupLabel>
                        <GroupLabel>
                          {fieldGroup.label}
                        </GroupLabel>
                        {fieldGroup.icon && (
                          <GroupIcon>
                            <Icon name={fieldGroup.icon} />
                          </GroupIcon>
                        )}
                      </FieldGroupLabel>
                    )}
                    {fieldGroup.fields.map(
                      (field, j) => {
                        if (!field) return null;
                        const modelPath = field.model && field.model.split('.').filter((val) => val !== '');
                        const fieldTracked = get(formDataTracked, modelPath);
                        return (
                          <FormField
                            field={field}
                            fieldTracked={fieldTracked}
                            fieldGroup={fieldGroup}
                            formData={formData}
                            key={j}
                            closeMultiselectOnClickOutside={closeMultiselectOnClickOutside}
                            scrollContainer={scrollContainer}
                            handleUpdate={handleUpdate}
                          />
                        );
                      }
                    )}
                  </FieldGroupWrapper>
                </div>
              );
            }
          )}
        </ViewPanel>
      )}
    </div>
  );
}

FormContentWrapper.propTypes = {
  step: PropTypes.object,
  formData: PropTypes.object,
  formDataTracked: PropTypes.object,
  scrollContainer: PropTypes.object,
  fields: PropTypes.array,
  sections: PropTypes.array,
  closeMultiselectOnClickOutside: PropTypes.bool,
  handleUpdate: PropTypes.func,
};


FormContentWrapper.contextTypes = {
  intl: PropTypes.object.isRequired,
};

export default FormContentWrapper;
