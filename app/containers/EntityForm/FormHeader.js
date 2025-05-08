import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { get } from 'lodash/object';
import { Box, Drop, ResponsiveContext } from 'grommet';

import { isMinSize } from 'utils/responsive';
import ButtonForm from 'components/buttons/ButtonForm';
import ButtonCancel from 'components/buttons/ButtonCancel';

import appMessages from 'containers/App/messages';
import BlockedMessages from './BlockedMessages';
import FormField from './FormField';

const StyledButtonSubmitSubtle = styled(ButtonForm)`
  color: ${({ theme, isBlocked }) => isBlocked ? '#DADDE0' : theme.global.colors.highlight};
  cursor: ${({ isBlocked }) => isBlocked ? 'not-allowed' : 'pointer'};
  &:hover {
    color: ${({ theme, isBlocked }) => isBlocked ? '#DADDE0' : theme.global.colors.highlightHover};
  }
`;

const FormHeader = ({
  fields,
  formData,
  handleCancel,
  handleUpdate,
  handleSubmitRemote,
  isBlocked,
  hasAnyEmptyRequired,
  hasAnyUnseenAutofill,
  hasAnyErrors,
  hasNoChanges,
  formDataTracked,
}) => {
  const size = React.useContext(ResponsiveContext);
  const saveCloseRef = React.useRef(null);
  const [blockedSaveHint, setBlockedSaveHint] = React.useState(false);

  return (
    <Box
      direction="row"
      justify="end"
      align="center"
      margin={{ bottom: 'small' }}
    >
      <Box
        direction={isMinSize(size, 'medium') ? 'row' : 'column'}
        align="center"
        gap="medium"
        fill={isMinSize(size, 'medium') ? false : 'horizontal'}
      >
        {fields && fields.length > 0 && (
          <Box
            direction={isMinSize(size, 'medium') ? 'row' : 'column'}
            align={isMinSize(size, 'medium') ? 'center' : 'start'}
            gap={isMinSize(size, 'medium') ? 'medium' : 'small'}
            pad={isMinSize(size, 'medium') ? {} : { horizontal: 'small', vertical: 'small' }}
            margin={{ top: 'xsmall' }}
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
                    isFooter
                  />
                </Box>
              );
            })}
          </Box>
        )}
        <Box
          ref={saveCloseRef}
          direction="row"
          justify="end"
          align="center"
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
                hasNoChanges={hasNoChanges}
              />
            </Drop>
          )}
        </Box>
      </Box>
    </Box>
  );
};

FormHeader.propTypes = {
  isBlocked: PropTypes.bool,
  hasAnyEmptyRequired: PropTypes.bool,
  hasAnyUnseenAutofill: PropTypes.bool,
  hasAnyErrors: PropTypes.bool,
  hasNoChanges: PropTypes.bool,
  fields: PropTypes.array,
  formData: PropTypes.object,
  formDataTracked: PropTypes.object,
  handleCancel: PropTypes.func,
  handleUpdate: PropTypes.func,
  handleSubmitRemote: PropTypes.func,
};

export default FormHeader;
