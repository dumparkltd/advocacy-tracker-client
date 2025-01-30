import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import styled from 'styled-components';
import { get } from 'lodash/object';
import { Box, Drop } from 'grommet';
import { CaretDownFill, CaretUpFill } from 'grommet-icons';

//
import ButtonForm from 'components/buttons/ButtonForm';
import ButtonCancel from 'components/buttons/ButtonCancel';
import ButtonSubmit from 'components/buttons/ButtonSubmit';

import appMessages from 'containers/App/messages';
import FormField from './FormField';

const ButtonSubmitSubtle = styled(ButtonForm)`
  color: ${({ theme, disabled }) => disabled ? '#DADDE0' : theme.global.colors.highlight};
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  &:hover {
    color: ${({ theme, disabled }) => disabled ? '#DADDE0' : theme.global.colors.highlightHover};
  }
`;

const FormHeader = ({
  isBlocked,
  fields,
  formData,
  formDataTracked,
  handleCancel,
  handleUpdate,
  handleSubmitRemote,
}) => {
  const [showSaveOptions, setShowSaveOptions] = React.useState(false);
  const saveOptionsButtonRef = React.useRef(null);

  return (
    <Box
      direction="row"
      justify="end"
      align="center"
      margin={{ bottom: 'small' }}
      gap="xxsmall"
    >
      {handleCancel && (
        <Box>
          <ButtonCancel
            type="button"
            onClick={(e) => {
              if (e && e.preventDefault) e.preventDefault();
              handleCancel(e);
            }}
          >
            <FormattedMessage {...appMessages.buttons.cancel} />
          </ButtonCancel>
        </Box>
      )}
      <Box>
        <ButtonSubmitSubtle
          type="button"
          disabled={isBlocked}
          title="Save & continue editing"
          onClick={(e) => {
            if (e && e.preventDefault) e.preventDefault();
            handleUpdate(formData.set('close', false));
            handleSubmitRemote();
          }}
        >
          Save
        </ButtonSubmitSubtle>
      </Box>
      <Box>
        <ButtonSubmitSubtle
          type="button"
          ref={saveOptionsButtonRef}
          title={!showSaveOptions ? 'Show save options' : 'Hide save otions'}
          onClick={(e) => {
            if (e && e.preventDefault) e.preventDefault();
            setShowSaveOptions(!showSaveOptions);
          }}
        >
          <Box direction="row" gap="xsmall" align="center">
            <span>Save &hellip;</span>
            <span>
            {showSaveOptions && (<CaretUpFill size="26px" />)}
              {!showSaveOptions && (<CaretDownFill size="26px" />)}
            </span>
          </Box>
        </ButtonSubmitSubtle>
        {saveOptionsButtonRef && showSaveOptions && (
          <Drop
            align={{ top: 'bottom', right: 'right' }}
            target={saveOptionsButtonRef.current}
            onClickOutside={() => setShowSaveOptions(false)}
            margin={{ top: 'xxsmall' }}
            plain
          >
            <Box
              elevation="medium"
              background="white"
              style={{ minWidth: '300px', maxWidth: '100%' }}
            >
              {fields && fields.length > 0 && (
                <Box
                  align="start"
                  gap="xsmall"
                  pad={{ vertical: 'small', horizontal: 'medium' }}
                >
                  {fields.map((field, j) => {
                    if (!field) return null;
                    const modelPath = field.model && field.model.split('.').filter((val) => val !== '');
                    const fieldTracked = get(formDataTracked, modelPath);
                    return (
                      <Box key={j}>
                        <FormField
                          field={field}
                          fieldTracked={fieldTracked}
                          formData={formData}
                        />
                      </Box>
                    );
                  })}
                </Box>
              )}
              <Box pad={{ vertical: 'small', horizontal: 'medium' }}>
                <ButtonSubmit
                  disabled={isBlocked}
                  type="button"
                  title="Save & close form"
                  onClick={(e) => {
                    if (e && e.preventDefault) e.preventDefault();
                    // console.log(formData && formData.toJS())
                    handleUpdate(formData.set('close', true));
                    handleSubmitRemote(); // close
                    setShowSaveOptions(false);
                  }}
                >
                  Save & Close
                </ButtonSubmit>
              </Box>
            </Box>
          </Drop>
        )}
      </Box>
    </Box>
  );
}


FormHeader.propTypes = {
  isBlocked: PropTypes.bool,
  fields: PropTypes.array,
  formData: PropTypes.object,
  formDataTracked: PropTypes.object,
  handleCancel: PropTypes.func,
  handleUpdate: PropTypes.func,
  handleSubmitRemote: PropTypes.func,
};

export default FormHeader;
