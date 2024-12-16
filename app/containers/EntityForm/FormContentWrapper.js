import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { get } from 'lodash/object';
import { Box, Text, ResponsiveContext } from 'grommet';

import { isMinSize } from 'utils/responsive';

import FormField from './FormField';

const Section = styled(
  (p) => <Box {...p} />
)`
  border-bottom: 1px solid #B7BCBF;
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
  const size = React.useContext(ResponsiveContext);
  // console.log('isNewEntityView', isNewEntityView)
  // // console.log('formData', formData && formData.toJS())
  // console.log('sections', sections)
  let sectionPadding = { vertical: 'large', horizontal: 'small' };
  if (isMinSize(size, 'large')) {
    sectionPadding = { vertical: 'large', horizontal: 'xxlarge' };
  } else if (isMinSize(size, 'medium')) {
    sectionPadding = { vertical: 'large', horizontal: 'large' };
  }
  return (
    <div>
      {sections && sections.length > 0 && sections.map(
        (section) => {
          if (!section.rows) return null;
          const isColumnSection = typeof section.asColumns !== 'undefined';
          return (
            <Section
              key={section.id}
              responsive={false}
              pad={sectionPadding}
            >
              {section.title && (
                <SectionTitle>
                  {section.title}
                </SectionTitle>
              )}
              <Box
                gap={(isMinSize(size, 'medium') && isColumnSection) ? 'ms' : 'medium'}
                direction={(isMinSize(size, 'medium') && isColumnSection) ? 'row' : 'column'}
              >
                {section.rows.map(
                  (row, i) => {
                    if (!row.fields) return null;
                    let { fields } = row;
                    const sumBasis = fields.reduce((memo, field) => {
                      if (!field) return null;
                      if (field.basis) {
                        if (field.basis === '1/2') {
                          return memo + 0.5;
                        }
                        if (field.basis === '1/3') {
                          return memo + 0.33;
                        }
                      }
                      return 0;
                    }, 0);
                    if (sumBasis === 0.5) {
                      fields = [...fields, { basis: '1/2' }];
                    }
                    if (sumBasis === 0.66) {
                      fields = [...fields, { basis: '1/3' }];
                    }
                    if (sumBasis === 0.33) {
                      fields = [...fields, { basis: '2/3' }];
                    }
                    return (
                      <Row
                        key={i}
                        direction={isMinSize(size, 'medium') && !isColumnSection
                          ? 'row'
                          : 'column'
                        }
                        basis={
                          isColumnSection && section.asColumns[i]
                            ? section.asColumns[i]
                            : 'auto'
                        }
                      >
                        {fields.map(
                          (field, j) => {
                            if (!field) return null;
                            const modelPath = field.model && field.model.split('.').filter((val) => val !== '');
                            const fieldTracked = get(formDataTracked, modelPath);
                            return (
                              <Box
                                key={j}
                                basis={(field.basis && !isColumnSection) ? field.basis : 'auto'}
                                fill="horizontal"
                              >
                                {field.controlType && (
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
                                )}
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
