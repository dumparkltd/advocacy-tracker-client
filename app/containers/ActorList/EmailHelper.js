/*
 *
 * EmailHelper
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
// import { intlShape, injectIntl } from 'react-intl';
import styled from 'styled-components';
import { Box, Text, TextArea } from 'grommet';

import validateEmailFormat from 'components/forms/validators/validate-email-format';

// import appMessages from 'containers/App/messages';
//
// import messages from './messages';

const TextNote = styled((p) => <Text size="xsmall" {...p} />)`
  font-style: italic;
`;
const TextStats = styled((p) => <Text size="small" {...p} />)``;
const TextHeading = styled((p) => <Text size="medium" {...p} />)`
  font-weight: 500;
`;
const BoxStats = styled((p) => <Box direction="row" gap="xsmall" {...p} />)``;

const StyledTextArea = styled((p) => (
  <TextArea size="small" readOnly {...p} />
))`
  min-height: 300px;
  line-height: 18px;
  font-weight: 300;
  margin-top: 20px;
`;

const handleFocus = (event) => event && event.target.select();

export function EmailHelper({
  entities,
  // intl,
}) {
  // if (evt && evt.preventDefault) evt.preventDefault();
  const valid = entities && entities.filter(
    (entity) => entity.getIn(['attributes', 'email'])
      && entity.getIn(['attributes', 'email']) !== ''
      && validateEmailFormat(entity.getIn(['attributes', 'email']))
  );
  // console.log(groupEmails);
  const invalid = entities && entities.filter(
    (entity) => entity.getIn(['attributes', 'email'])
      && entity.getIn(['attributes', 'email']) !== ''
      && !validateEmailFormat(entity.getIn(['attributes', 'email']))
  );
  // console.log(invalidGroupEmails)
  const empty = entities && entities.filter(
    (entity) => !entity.getIn(['attributes', 'email'])
      || entity.getIn(['attributes', 'email']) === ''
  );
  return (
    <Box gap="xsmall">
      <BoxStats>
        <TextStats>
          No. of contacts selected:
        </TextStats>
        <TextStats>
          {entities.size}
        </TextStats>
      </BoxStats>
      <BoxStats>
        <TextStats>
          No. of contacts with a valid email address:
        </TextStats>
        <TextStats>
          {valid.size}
        </TextStats>
      </BoxStats>
      {invalid && invalid.size > 0 && (
        <BoxStats>
          <TextStats>
            No. of contacts with an invalid email address:
          </TextStats>
          <TextStats>
            {invalid.size}
          </TextStats>
        </BoxStats>
      )}
      {empty && empty.size > 0 && (
        <BoxStats>
          <TextStats>
            No. of contacts without an email address:
          </TextStats>
          <TextStats>
            {empty.size}
          </TextStats>
        </BoxStats>
      )}
      {((empty && empty.size > 0) || (invalid && invalid.size > 0)) && (
        <TextNote>
          You can use the filter options to identify contacts without or invalid email addresses
        </TextNote>
      )}
      {valid.size && valid.size > 0 && (
        <Box margin={{ top: 'medium' }}>
          <TextHeading>
            {`Select and copy email address of ${valid.size} contacts`}
          </TextHeading>
          <StyledTextArea
            onFocus={handleFocus}
            defaultValue={valid.map(
              (entity) => entity.getIn(['attributes', 'email'])
            ).toArray().join('\n')}
          />
        </Box>
      )}
    </Box>
  );
}

EmailHelper.propTypes = {
  entities: PropTypes.instanceOf(List),
  // intl: intlShape,
};

export default EmailHelper;
// export default injectIntl(EmailHelper);
