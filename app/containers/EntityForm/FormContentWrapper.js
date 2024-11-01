import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { get } from 'lodash/object';
import { Box, Text } from 'grommet';

import FormField from './FormField';

const Section = styled(
  (p) => <Box pad={{ vertical: 'large', horizontal: 'xxlarge' }} {...p} />
)`
  border-bottom: 2px solid #B7BCBF;
  &:last-child {
    border-bottom: none;
  }
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
  sections,
  formData,
  formDataTracked,
  scrollContainer,
  closeMultiselectOnClickOutside,
  handleUpdate,
  step,
  isNewEntityView,
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
                                  isNewEntityView={isNewEntityView}
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
    </div>
  );
}

FormContentWrapper.propTypes = {
  step: PropTypes.object,
  formData: PropTypes.object,
  formDataTracked: PropTypes.object,
  scrollContainer: PropTypes.object,
  sections: PropTypes.array,
  closeMultiselectOnClickOutside: PropTypes.bool,
  handleUpdate: PropTypes.func,
  isNewEntityView: PropTypes.bool,
};


FormContentWrapper.contextTypes = {
  intl: PropTypes.object.isRequired,
};

export default FormContentWrapper;
