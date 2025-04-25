import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import styled from 'styled-components';
import { Box, Drop } from 'grommet';

import ButtonForm from 'components/buttons/ButtonForm';
import ButtonCancel from 'components/buttons/ButtonCancel';

import appMessages from 'containers/App/messages';
import BlockedMessages from './BlockedMessages';

const StyledButtonSubmitSubtle = styled(ButtonForm)`
  color: ${({ theme, isBlocked }) => isBlocked ? '#DADDE0' : theme.global.colors.highlight};
  cursor: ${({ isBlocked }) => isBlocked ? 'not-allowed' : 'pointer'};
  &:hover {
    color: ${({ theme, isBlocked }) => isBlocked ? '#DADDE0' : theme.global.colors.highlightHover};
  }
`;

const FormHeader = ({
  isBlocked,
  formData,
  handleCancel,
  handleUpdate,
  handleSubmitRemote,
  hasAnyEmptyRequired,
  hasAnyUnseenAutofill,
  hasAnyErrors,
  // formDataTracked,
}) => {
  const saveCloseRef = React.useRef(null);
  const [blockedSaveHint, setBlockedSaveHint] = React.useState(false);
  return (
    <Box
      direction="row"
      justify="end"
      align="center"
      margin={{ bottom: 'small' }}
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
        <StyledButtonSubmitSubtle
          type="button"
          isBlocked={isBlocked}
          title="Save & continue editing"
          onClick={(e) => {
            if (e && e.preventDefault) e.preventDefault();
            if (!isBlocked) {
              handleUpdate(formData.set('close', false));
              handleSubmitRemote();
            }
          }}
          onMouseOver={(e) => {
            if (e && e.preventDefault) e.preventDefault();
            if (isBlocked) {
              setBlockedSaveHint(true);
            }
          }}
          onFocus={(e) => {
            if (e && e.preventDefault) e.preventDefault();
            if (isBlocked) {
              setBlockedSaveHint(true);
            }
          }}
          onMouseOut={(e) => {
            if (e && e.preventDefault) e.preventDefault();
            if (isBlocked) {
              setBlockedSaveHint(false);
            }
          }}
          onBlur={(e) => {
            if (e && e.preventDefault) e.preventDefault();
            if (isBlocked) {
              setBlockedSaveHint(false);
            }
          }}
        >
          Save
        </StyledButtonSubmitSubtle>
      </Box>
      <Box>
        <StyledButtonSubmitSubtle
          type="button"
          isBlocked={isBlocked}
          title="Save & close form"
          ref={saveCloseRef}
          onClick={(e) => {
            if (e && e.preventDefault) e.preventDefault();
            if (!isBlocked) {
              // console.log(formData && formData.toJS())
              handleUpdate(formData.set('close', true));
              handleSubmitRemote(); // close
            }
          }}
          onMouseOver={(e) => {
            if (e && e.preventDefault) e.preventDefault();
            if (isBlocked) {
              setBlockedSaveHint(true);
            }
          }}
          onFocus={(e) => {
            if (e && e.preventDefault) e.preventDefault();
            if (isBlocked) {
              setBlockedSaveHint(true);
            }
          }}
          onMouseOut={(e) => {
            if (e && e.preventDefault) e.preventDefault();
            if (isBlocked) {
              setBlockedSaveHint(false);
            }
          }}
          onBlur={(e) => {
            if (e && e.preventDefault) e.preventDefault();
            if (isBlocked) {
              setBlockedSaveHint(false);
            }
          }}
        >
          Save & close
        </StyledButtonSubmitSubtle>
      </Box>
      {blockedSaveHint && (
        <Drop
          align={{ bottom: 'top', right: 'right' }}
          target={saveCloseRef.current}
          elevation="small"
        >
          <BlockedMessages
            hasAnyEmptyRequired={hasAnyEmptyRequired}
            hasAnyUnseenAutofill={hasAnyUnseenAutofill}
            hasAnyErrors={hasAnyErrors}
          />
        </Drop>
      )}
    </Box>
  );
};

FormHeader.propTypes = {
  isBlocked: PropTypes.bool,
  hasAnyEmptyRequired: PropTypes.bool,
  hasAnyUnseenAutofill: PropTypes.bool,
  hasAnyErrors: PropTypes.bool,
  fields: PropTypes.array,
  formData: PropTypes.object,
  formDataTracked: PropTypes.object,
  handleCancel: PropTypes.func,
  handleUpdate: PropTypes.func,
  handleSubmitRemote: PropTypes.func,
};

export default FormHeader;
