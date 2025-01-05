/*
 *
 * EntityListSidebarOption
 *
 */

import React from 'react';
import PropTypes from 'prop-types';

import styled from 'styled-components';
import { injectIntl, intlShape } from 'react-intl';
import { Box, Text } from 'grommet';
import { FormPrevious } from 'grommet-icons';
import Button from 'components/buttons/ButtonSimple';

import appMessage from 'utils/app-message';
import InfoOverlay from 'components/InfoOverlay';

import messages from './messages';

// TODO compare TaxonomySidebarItem
const Styled = styled.div`
  width: 100%;
  position: relative;
`;

const StyledButton = styled((p) => <Button {...p} />)`
  padding: 0.25em 8px;
  padding-left: 2px;
  text-align: left;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  width: 100%;
  color: ${({ active }) => active ? 'white' : 'black'};
  background-color: ${({ theme, active }) => active ? theme.global.colors.highlight : 'transparent'};
  &:hover {
    color: white;
    background-color: ${({ theme }) => theme.global.colors.highlightHover};
  }
`;

const InfoAnchor = styled.div`
  position: absolute;
  right: 0;
  top: 2px;
`;

function EntityListSidebarOption({
  option, onShowForm, groupId, groupType, intl,
}) {
  const [mouseOver, setMouseOver] = React.useState(false);
  let label = option.get('message')
    ? appMessage(intl, option.get('message'))
    : option.get('label');
  label = option.get('memberType') ? `${label} (via member countries only)` : label;
  return (
    <Styled active={option.get('active')} disabled={option.get('disabled')}>
      <StyledButton
        disabled={option.get('disabled')}
        active={option.get('active')}
        onMouseOver={() => setMouseOver(true)}
        onFocus={() => false}
        onMouseOut={() => setMouseOver(false)}
        onBlur={() => false}
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
          <FormPrevious size="xsmall" color="currentColor" />
          <Text size="small" weight={500}>{label}</Text>
        </Box>
      </StyledButton>
      {option.get('info') && (
        <InfoAnchor>
          <InfoOverlay
            title={label}
            content={option.get('info')}
            dark={option.get('active') || mouseOver}
            markdown
          />
        </InfoAnchor>
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
