import React from 'react';
import PropTypes from 'prop-types';
import { Box, Text, Button } from 'grommet';
import PrintHide from 'components/styled/PrintHide';
import styled from 'styled-components';
import { injectIntl, intlShape } from 'react-intl';

import { lowerCase, truncateText } from 'utils/string';

import appMessages from 'containers/App/messages';

const Select = styled(PrintHide)`
  width: 20px;
  text-align: center;
  padding-right: 6px;
`;

const StyledInput = styled.input`
  accent-color: ${({ theme }) => theme.global.colors.highlight};
`;

const Link = styled((p) => <Button as="a" plain {...p} />)`
  text-align: ${({ align }) => align === 'end' ? 'right' : 'left'};
  line-height: 16px;
`;
const Label = styled((p) => <Text size="small" {...p} />)``;

const Meta = styled((p) => <Box {...p} />)``;
const Gap = styled((p) => <Box pad={{ horizontal: 'xxsmall' }} {...p} />)``;

export function CellBodyMain({
  entity,
  // column,
  canEdit,
  intl,
}) {
  const code = entity && entity.values && entity.values.code;
  const meta = [];
  if (code) {
    meta.push({
      text: code,
      color: 'dark-5',
      size: 'small',
    });
  }
  if (entity.draft) {
    meta.push({
      text: intl.formatMessage(appMessages.ui.publishStatuses.draft),
      color: 'draft',
      size: 'xxsmall',
    });
  }
  if (entity.private) {
    meta.push({
      text: intl.formatMessage(appMessages.ui.privacyStatuses.private),
      color: 'private',
      size: 'xxsmall',
    });
  }
  if (entity.archived) {
    meta.push({
      text: intl.formatMessage(appMessages.ui.archiveStatuses.archived),
      color: 'archived',
      size: 'xxsmall',
    });
  }
  if (entity.noNotifications) {
    meta.push({
      text: `Email ${lowerCase(intl.formatMessage(appMessages.ui.notificationStatuses.disabled))}`,
      color: 'archived',
      size: 'xxsmall',
    });
  }
  return (
    <Box direction="row" align="center" justify="start">
      {canEdit && (
        <Select>
          <StyledInput
            type="checkbox"
            checked={entity.selected}
            onChange={(evt) => entity.onSelect(evt.target.checked)}
          />
        </Select>
      )}
      <Box gap="xsmall">
        {meta.length > 0 && (
          <Box direction="row" align="end">
            {meta.map((item, i) => (
              <Meta key={i} direction="row" align="end">
                <Label color={item.color || 'dark-5'} size={item.size || 'xsmall'}>
                  {item.text}
                </Label>
                {i + 1 < meta.length && (
                  <Gap><Label color="draft" size="xxsmall">/</Label></Gap>
                )}
              </Meta>
            ))}
          </Box>
        )}
        <Link
          href={entity.href}
          onClick={entity.onClick}
          title={entity.values.title}
        >
          <Box direction="row" gap="xsmall" align="center">
            {Object.keys(entity.values).map((key) => {
              if (!entity.values[key]) {
                return null;
              }
              if (key === 'title' || key === 'name') {
                return (
                  <Label size="small" key={key}>
                    {truncateText(entity.values[key], 45)}
                  </Label>
                );
              }
              if (key === 'menu_title') {
                return (
                  <Label
                    key={key}
                    color="dark-5"
                    size="small"
                  >
                    {`[${entity.values[key]}]`}
                  </Label>
                );
              }
              return null;
            })}
          </Box>
        </Link>
      </Box>
    </Box>
  );
}

CellBodyMain.propTypes = {
  entity: PropTypes.object,
  // column: PropTypes.object,
  canEdit: PropTypes.bool,
  intl: intlShape,
};

export default injectIntl(CellBodyMain);
