/*
 *
 * EntityListDelete
 *
 */

import React from 'react';
import PropTypes from 'prop-types';

import styled from 'styled-components';
import { injectIntl, intlShape } from 'react-intl';
import { FormattedMessage } from 'react-intl';
import { Box, Text } from 'grommet';

import appMessages from 'containers/App/messages';
import { CONTENT_MODAL } from 'containers/App/constants';

import Content from 'components/Content';
import ContentHeader from 'containers/ContentHeader';
import ButtonForm from 'components/buttons/ButtonForm';
import ButtonSubmit from 'components/buttons/ButtonSubmit';

import messages from './messages';

const Main = styled.div`
  padding: 0 0 10px;
  margin: 0 0 30px;
  @media (min-width: ${(props) => props.theme.breakpoints.medium}) {
    padding: 20px 24px;
    margin: 0 0 50px;
  }
`;

const Footer = styled.div`
  width: 100%;
`;

// color: white;
const StyledButtonCancel = styled(ButtonForm)`
  opacity: 0.9;
  &:hover {
    opacity: 0.8;
  }
`;

export function EntityListDelete({
  selectedCount,
  destroyableCount,
  onCancel,
  onConfirm,
  intl,
}) {
  return (
    <Content inModal>
      <ContentHeader
        title={intl.formatMessage(messages.title)}
        type={CONTENT_MODAL}
      />
      <Main margin={{ bottom: 'large' }}>
        {destroyableCount > 0 && (
          <Box gap="xsmall">
            <Text size="medium" color="danger" weight={700}>
              <FormattedMessage
                {...messages.confirm}
                values={{ destroyableCount }}
              />
            </Text>
            {destroyableCount !== selectedCount && (
              <Text size="small" color="dark" style={{ fontStyle: 'italic' }}>
                <FormattedMessage
                  {...messages.excludingNote}
                  values={{ excludingCount: selectedCount - destroyableCount }}
                />
              </Text>
            )}
          </Box>
        )}
        {destroyableCount === 0 && (
          <Text>
            <FormattedMessage {...messages.notAuthorizedNote} />
          </Text>
        )}
      </Main>
      <Footer>
        <Box direction="row" justify="end">
          <StyledButtonCancel type="button" onClick={() => onCancel()}>
            <FormattedMessage {...appMessages.buttons.cancel} />
          </StyledButtonCancel>
          {destroyableCount > 0 && (
            <ButtonSubmit
              type="button"
              onClick={(evt) => {
                evt.preventDefault();
                onConfirm();
              }}
            >
              <FormattedMessage {...messages.deleteButton} />
            </ButtonSubmit>
          )}
        </Box>
      </Footer>
    </Content>
  );
}

EntityListDelete.propTypes = {
  selectedCount: PropTypes.number,
  destroyableCount: PropTypes.number,
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func,
  intl: intlShape,
};

export default injectIntl(EntityListDelete);
