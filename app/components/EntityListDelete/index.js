/*
 *
 * EntityListDelete
 *
 */

import React from 'react';
import PropTypes from 'prop-types';

import styled from 'styled-components';
// import { injectIntl, intlShape } from 'react-intl';
import { FormattedMessage } from 'react-intl';
import { Box, Text } from 'grommet';

import appMessages from 'containers/App/messages';
import { CONTENT_MODAL } from 'containers/App/constants';

import Content from 'components/Content';
import ContentHeader from 'containers/ContentHeader';
import ButtonForm from 'components/buttons/ButtonForm';
import ButtonSubmit from 'components/buttons/ButtonSubmit';

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
  // intl,
}) {
  return (
    <Content inModal>
      <ContentHeader
        title="Delete selected"
        type={CONTENT_MODAL}
      />
      <Main margin={{ bottom: 'large' }}>
        {destroyableCount > 0 && (
          <Box gap="xsmall">
            <Text size="medium" color="danger" weight="700">
              {`Really delete ${destroyableCount} selected? This action cannot be undone.`}
            </Text>
            {destroyableCount !== selectedCount && (
              <Text size="small" color="dark" style={{ fontStyle: 'italic' }}>
                {`Note: Excluding ${selectedCount - destroyableCount} items that you do not have permission to delete`}
              </Text>
            )}
          </Box>
        )}
        {destroyableCount === 0 && (
          <Text>
            {'You don\'t have sufficient permission to delete any selected items. (Only Administrators can delete items they did not create)'}
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
              Delete
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
  // intl: intlShape,
};

// export default injectIntl(EntityListDelete);
export default EntityListDelete;
