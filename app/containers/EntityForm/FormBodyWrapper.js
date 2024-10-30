import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import { FormattedMessage } from 'react-intl';
import { get } from 'lodash/object';
import { Box } from 'grommet';
import asArray from 'utils/as-array';
import appMessages from 'containers/App/messages';

import Icon from 'components/Icon';
import Clear from 'components/styled/Clear';

import Button from 'components/buttons/Button';
import ButtonCancel from 'components/buttons/ButtonCancel';
import ButtonSubmit from 'components/buttons/ButtonSubmit';
import ButtonForm from 'components/buttons/ButtonForm';

import FormFooter from 'components/forms/FormFooter';
import FormFooterButtons from 'components/forms/FormFooterButtons';

import FieldGroupWrapper from 'components/fields/FieldGroupWrapper';
import FieldGroupLabel from 'components/fields/FieldGroupLabel';
import GroupIcon from 'components/fields/GroupIcon';
import GroupLabel from 'components/fields/GroupLabel';
import ViewPanel from 'components/EntityView/ViewPanel';

import FormBody from 'components/forms/FormBody';
import FormField from './FormField';
import messages from './messages';

const DeleteConfirmText = styled.span`
  padding-left: 1em;
  padding-right: 1em;
`;
const DeleteWrapper = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
`;

const ButtonDelete = styled(ButtonForm)`
  color: ${palette('buttonFlat', 0)};
  &:hover {
    color: ${palette('buttonFlatHover', 0)};
  }
`;

const ButtonPreDelete = styled(Button)`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  color: ${palette('text', 1)};
  &:hover {
    color: ${palette('linkHover', 2)};
  }
`;

export function FormBodyWrapper({
  fields,
  sections,
  footerFields,
  formData,
  formDataTracked,
  scrollContainer,
  closeMultiselectOnClickOutside,
  handleUpdate,
  handleDelete,
  deleteConfirmed,
  onSetDeleteConfirmed,
  handleCancel,
  isSaving,
}) {
  // console.log('isNewEntityView', isNewEntityView)
  // // console.log('formData', formData && formData.toJS())
  // console.log('formDataTracked', formDataTracked)
  return (
    <>
      <FormBody>
        {sections && sections.length > 0 && (
          <ViewPanel>
            {sections.map(
              (section) => {
                if (!section.rows) return null;
                return (
                  <div key={section.id}>
                    <FieldGroupWrapper>
                      {section.title && (
                        <GroupLabel>
                          {section.title}
                        </GroupLabel>
                      )}
                      {section.rows.map(
                        (row, i) => {
                          if (!row.fields) return null;
                          return (
                            <Box key={i} direction="row" fill="horizontal">
                              {row.fields.map(
                                (field, j) => {
                                  if (!field) return null;
                                  const modelPath = field.model && field.model.split('.').filter((val) => val !== '');
                                  const fieldTracked = get(formDataTracked, modelPath);
                                  return (
                                    <FormField
                                      field={field}
                                      fieldTracked={fieldTracked}
                                      formData={formData}
                                      key={j}
                                      closeMultiselectOnClickOutside={closeMultiselectOnClickOutside}
                                      scrollContainer={scrollContainer}
                                      handleUpdate={handleUpdate}
                                    />
                                  );
                                }
                              )}
                            </Box>
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
        {footerFields && (
          <ViewPanel>
            FooterFields
          </ViewPanel>
        )}
      </FormBody>
      <FormFooter>
        {handleDelete && !deleteConfirmed && (
          <DeleteWrapper>
            <ButtonPreDelete type="button" onClick={onSetDeleteConfirmed}>
              <Icon name="trash" sizes={{ mobile: '1.8em' }} />
            </ButtonPreDelete>
          </DeleteWrapper>
        )}
        {handleDelete && deleteConfirmed && (
          <FormFooterButtons left>
            <DeleteConfirmText>
              <FormattedMessage {...messages.confirmDeleteQuestion} />
            </DeleteConfirmText>
            <ButtonCancel
              type="button"
              onClick={() => onSetDeleteConfirmed(false)}
            >
              <FormattedMessage {...messages.buttons.cancelDelete} />
            </ButtonCancel>
            <ButtonDelete type="button" onClick={handleDelete}>
              <FormattedMessage {...messages.buttons.confirmDelete} />
            </ButtonDelete>
          </FormFooterButtons>
        )}
        {!deleteConfirmed && (
          <FormFooterButtons>
            <ButtonCancel
              type="button"
              onClick={handleCancel}
            >
              <FormattedMessage {...appMessages.buttons.cancel} />
            </ButtonCancel>
            <ButtonSubmit type="submit" disabled={isSaving}>
              <FormattedMessage {...appMessages.buttons.save} />
            </ButtonSubmit>
          </FormFooterButtons>
        )}
        <Clear />
      </FormFooter>
    </>
  );
}

FormBodyWrapper.propTypes = {
  formData: PropTypes.object,
  formDataTracked: PropTypes.object,
  scrollContainer: PropTypes.object,
  fields: PropTypes.array,
  sections: PropTypes.array,
  footerFields: PropTypes.array,
  model: PropTypes.string,
  deleteConfirmed: PropTypes.bool,
  isSaving: PropTypes.bool,
  closeMultiselectOnClickOutside: PropTypes.bool,
  handleUpdate: PropTypes.func,
  handleDelete: PropTypes.func,
  handleCancel: PropTypes.func,
  onSetDeleteConfirmed: PropTypes.func,
};


FormBodyWrapper.contextTypes = {
  intl: PropTypes.object.isRequired,
};

export default FormBodyWrapper;
