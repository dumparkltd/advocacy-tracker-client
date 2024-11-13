import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { get } from 'lodash/object';
import { FormattedMessage } from 'react-intl';
import { Box, ResponsiveContext } from 'grommet';

import { isMinSize } from 'utils/responsive';

import ButtonCancel from 'components/buttons/ButtonCancel';
import ButtonSubmit from 'components/buttons/ButtonSubmit';

import appMessages from 'containers/App/messages';
import FormField from './FormField';

const Styled = styled(
  (p) => <Box {...p} />
)`
  background: white;
`;

export function FormFooter({
  fields,
  formData,
  formDataTracked,
  handleCancel,
  isBlocked,
}) {
  const size = React.useContext(ResponsiveContext);
  // console.log('isNewEntityView', isNewEntityView)
  // // console.log('formData', formData && formData.toJS())
  return (
    <Styled
      direction="row"
      justify="between"
      elevation="small"
      align="center"
    >
      {isMinSize(size, 'medium') && (
        <Box>
          <ButtonCancel
            type="button"
            onClick={handleCancel}
          >
            <FormattedMessage {...appMessages.buttons.cancel} />
          </ButtonCancel>
        </Box>
      )}
      <Box
        direction={isMinSize(size, 'medium') ? 'row' : 'column'}
        gap="small"
        fill={isMinSize(size, 'medium') ? false : 'horizontal'}
      >
        {fields && fields.length > 0 && (
          <Box
            direction={isMinSize(size, 'medium') ? 'row' : 'column'}
            align={isMinSize(size, 'medium') ? 'center' : 'start'}
            gap="small"
            pad={isMinSize(size, 'medium') ? {} : { horizontal: 'small', vertical: 'small' }}
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
        <Box
          direction="row"
          justify={!isMinSize(size, 'medium') ? 'between' : 'start'}
          style={!isMinSize(size, 'medium')
            ? { borderTop: '1px solid #B7BCBF' }
            : {}
          }
        >
          {!isMinSize(size, 'medium') && (
            <Box>
              <ButtonCancel
                type="button"
                onClick={handleCancel}
              >
                <FormattedMessage {...appMessages.buttons.cancel} />
              </ButtonCancel>
            </Box>
          )}
          <ButtonSubmit type="submit" disabled={isBlocked}>
            Save & Close
          </ButtonSubmit>
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
  handleCancel: PropTypes.func,
};


FormFooter.contextTypes = {
  intl: PropTypes.object.isRequired,
};

export default FormFooter;
