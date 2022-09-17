/*
 *
 * EntityListSidebarOption
 *
 */

import React from 'react';
import PropTypes from 'prop-types';

import styled from 'styled-components';
import { palette } from 'styled-theme';
import { injectIntl, intlShape } from 'react-intl';
import { Box, Button, Text } from 'grommet';
import { FormPrevious } from 'grommet-icons';

import appMessage from 'utils/app-message';
import InfoOverlay from 'components/InfoOverlay';

import messages from './messages';

// TODO compare TaxonomySidebarItem
const Styled = styled((p) => (
  <Box
    direction="row"
    fill="horizontal"
    align="center"
    {...p}
  />
))`
  background-color: ${({ theme, active }) => active ? theme.global.colors.highlightHover : 'transparent'};
  color:  ${(props) => props.active ? palette('asideListItem', 1) : palette('asideListItem', 0)};
`;

const StyledButton = styled((p) => <Button plain fill="horizontal" focusIndicator={false} {...p} />)`
  padding: 0.25em 8px;
  padding-left: 2px;
  text-align: left;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'}
`;

function EntityListSidebarOption({
  option, onShowForm, groupId, groupType, intl,
}) {
  let label = option.get('message')
    ? appMessage(intl, option.get('message'))
    : option.get('label');
  label = option.get('memberType') ? `${label} (via members only)` : label;
  return (
    <Styled active={option.get('active')} disabled={option.get('disabled')}>
      <StyledButton
        disabled={option.get('disabled')}
        plain
        onClick={
          () => !option.get('disabled')
           && onShowForm({
             group: groupType || groupId,
             optionId: option.get('id'),
             path: option.get('path'),
             invalidateEntitiesPaths: option.get('invalidateEntitiesPaths'),
             connection: option.get('connection'),
             key: option.get('key'),
             ownKey: option.get('ownKey'),
             active: option.get('active'),
             create: option.get('create') && option.get('create').toJS(),
           })
        }
        title={intl.formatMessage(
          option.get('active') ? messages.groupOptionSelect.hide : messages.groupOptionSelect.show
        )}
      >
        <Box direction="row" justify="start" align="center" gap="xsmall">
          <FormPrevious size="xsmall" color={option.get('active') ? 'white' : 'black'} />
          <Text size="small" weight={500}>{label}</Text>
        </Box>
      </StyledButton>
      {option.get('info') && (
        <InfoOverlay
          title={label}
          content={option.get('info')}
          dark={option.get('active')}
        />
      )}
    </Styled>
  );
}

EntityListSidebarOption.propTypes = {
  option: PropTypes.object.isRequired,
  groupId: PropTypes.string.isRequired,
  groupType: PropTypes.string,
  onShowForm: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(EntityListSidebarOption);
