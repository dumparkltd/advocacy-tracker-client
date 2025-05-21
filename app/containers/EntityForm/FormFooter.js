import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { get } from 'lodash/object';
import { FormattedMessage } from 'react-intl';
import { Box, Drop, ResponsiveContext } from 'grommet';

import { isMinSize } from 'utils/responsive';

import ButtonCancel from 'components/buttons/ButtonCancel';
import ButtonForm from 'components/buttons/ButtonForm';
import ButtonSubmit from 'components/buttons/ButtonSubmit';

import appMessages from 'containers/App/messages';
import FormField from './FormField';
import BlockedMessages from './BlockedMessages';

const Styled = styled(
  (p) => <Box {...p} />
)`
  background: white;
`;

const StyledButtonSubmitSubtle = styled(ButtonForm)`
  color: ${({ theme, isBlocked }) => isBlocked ? '#DADDE0' : theme.global.colors.highlight};
  cursor: ${({ isBlocked }) => isBlocked ? 'not-allowed' : 'pointer'};
  &:hover {
    color: ${({ theme, isBlocked }) => isBlocked ? '#DADDE0' : theme.global.colors.highlightHover};
  }
`;
const StyledButtonSubmit = styled(ButtonSubmit)`
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
`;

export function FormFooter({
  fields,
  formData,
  formDataTracked,
  handleCancel,
  handleUpdate,
  handleSubmitRemote,
  isBlocked,
  hasAnyEmptyRequired,
  hasAnyUnseenAutofill,
  hasAnyErrors,
  hasNoChanges,
}) {
  const size = React.useContext(ResponsiveContext);
  const saveCloseRef = React.useRef(null);
  const [blockedSaveHint, setBlockedSaveHint] = React.useState(false);

  return (
    <Styled
      direction="row"
      justify="end"
      elevation="small"
      align="center"
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
          align="center"
          justify={!isMinSize(size, 'medium') ? 'between' : 'start'}
          style={!isMinSize(size, 'medium')
            ? { borderTop: '1px solid #B7BCBF' }
            : {}
          }
        >
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
          <StyledButtonSubmit
            type="submit"
            disabled={isBlocked}
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
            Save & Close
          </StyledButtonSubmit>
          {blockedSaveHint && (
            <Drop
              align={{ bottom: 'top', right: 'right' }}
              target={saveCloseRef.current}
              elevation="small"
              margin={{ top: 'xsmall' }}
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
    </Styled>
  );
}

FormFooter.propTypes = {
  formData: PropTypes.object,
  formDataTracked: PropTypes.object,
  fields: PropTypes.array,
  // sections: PropTypes.array,
  isBlocked: PropTypes.bool,
  hasAnyEmptyRequired: PropTypes.bool,
  hasAnyUnseenAutofill: PropTypes.bool,
  hasAnyErrors: PropTypes.bool,
  hasNoChanges: PropTypes.bool,
  handleCancel: PropTypes.func,
  handleUpdate: PropTypes.func,
  handleSubmitRemote: PropTypes.func,
};


FormFooter.contextTypes = {
  intl: PropTypes.object.isRequired,
};

export default FormFooter;
