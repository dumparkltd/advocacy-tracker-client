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

import A from 'components/styled/A';
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
  min-height: 220px;
  line-height: 18px;
  font-weight: 300;
`;

const handleFocus = (event) => event && event.target.select();

const MAILTO_MAX_LENGTH = 1800;
// see https://stackoverflow.com/questions/13317429/mailto-max-length-of-each-internet-browsers

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
  const allValid = valid && entities && valid.size === entities.size;
  const validListMailTo = valid && valid.size > 0 && valid.map(
    (entity) => entity.getIn(['attributes', 'email'])
  ).toArray().join(',');
  const validListTextbox = valid && valid.size > 0 && valid.map(
    (entity) => entity.getIn(['attributes', 'email'])
  ).toArray().join('\n');
  return (
    <Box gap="xsmall" margin={{ bottom: 'medium' }}>
      {valid && valid.size > 0 && (
        <Box margin={{ top: 'small', bottom: 'medium' }}>
          <TextHeading>
            {allValid && (
              `Email all ${valid.size} selected contacts `
            )}
            {!allValid && (
              `Email ${valid.size} contacts with valid email addresses (of ${entities.size} selected) `
            )}
          </TextHeading>
          <Box>
            <ul>
              <li>
                <TextStats>
                  {'Email client: '}
                  <A
                    title="Email selected contacts in email client"
                    target="_blank"
                    href={`mailto:${validListMailTo}`}
                    style={{ fontWeight: 600 }}
                  >
                    click here to open list in email client
                  </A>
                </TextStats>
              </li>
              <li>
                <TextStats>
                  Copy & paste: select and copy list from the text box below
                </TextStats>
              </li>
            </ul>
          </Box>
          {validListMailTo.length > MAILTO_MAX_LENGTH && (
            <Box margin={{ bottom: 'small' }}>
              <TextNote>
                {` Warning: for some email clients your recipient list of ${validListMailTo.length} characters may exceed their maximum number of possible characters`}
              </TextNote>
            </Box>
          )}
          <StyledTextArea
            onFocus={handleFocus}
            defaultValue={validListTextbox}
          />
        </Box>
      )}
      {invalid && invalid.size > 0 && (
        <BoxStats>
          <TextHeading>
            No. of contacts with an invalid email address:
          </TextHeading>
          <TextHeading>
            {invalid.size}
          </TextHeading>
        </BoxStats>
      )}
      {empty && empty.size > 0 && (
        <BoxStats>
          <TextHeading>
            No. of selected contacts without an email address stored:
          </TextHeading>
          <TextHeading>
            {empty.size}
          </TextHeading>
        </BoxStats>
      )}
      {((empty && empty.size > 0) || (invalid && invalid.size > 0)) && (
        <Box margin={{ top: 'small' }}>
          <TextNote>
            You can use the filter options to identify contacts without or invalid email addresses
          </TextNote>
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
