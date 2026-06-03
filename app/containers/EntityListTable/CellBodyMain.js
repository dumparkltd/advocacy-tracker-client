import React from 'react';
import PropTypes from 'prop-types';
import { Box } from 'grommet';
import PrintHide from 'components/styled/PrintHide';
import Checkbox from 'components/styled/Checkbox';

import styled from 'styled-components';
import { injectIntl, intlShape } from 'react-intl';

import { lowerCase, truncateText } from 'utils/string';
import Button from 'components/buttons/ButtonTableCell';

import appMessages from 'containers/App/messages';
import Label from './LabelCellBody';

const Select = styled(PrintHide)`
  width: 20px;
  text-align: center;
  padding-right: 6px;
`;

const Link = styled((p) => <Button as="a" {...p} />)`
  text-align: ${({ align }) => align === 'end' ? 'right' : 'left'};
`;

const Meta = styled((p) => <Box {...p} />)`
  background-color: ${({ color, theme }) => (theme && color) ? theme.global.colors[color] : 'transparent'};
  border-radius: 3px;
  padding: 1px 3px;
`;

export function CellBodyMain({
  entity,
  // column,
  canEdit,
  intl,
  onEntityClick,
}) {
  const code = entity && entity.values && entity.values.code;
  const meta = [];
  if (entity.draft) {
    meta.push({
      text: intl.formatMessage(appMessages.ui.draftStatuses.draft),
      color: 'draft',
      bg: 'draftBackground',
    });
  }
  if (entity.private) {
    meta.push({
      text: intl.formatMessage(appMessages.ui.privacyStatuses.private),
      color: 'private',
      bg: 'privateBackground',
    });
  }
  if (entity.archived) {
    meta.push({
      text: intl.formatMessage(appMessages.ui.archiveStatuses.archived),
      color: 'archived',
      bg: 'archivedBackground',
    });
  }
  if (entity.public_api) {
    meta.push({
      text: intl.formatMessage(appMessages.ui.publicAPIstatuses.publicAPI),
      color: 'publicAPI',
      bg: 'publicAPIBackground',
    });
  }
  if (entity.noNotifications) {
    meta.push({
      text: `Email ${lowerCase(intl.formatMessage(appMessages.ui.notificationStatuses.disabled))}`,
      color: 'notifications',
      bg: 'notificationsBackground',
    });
  }
  return (
    <Box direction="row" align="center" justify="start">
      {canEdit && (
        <PrintHide>
          <Select>
            <Checkbox
              checked={entity.selected}
              onChange={(evt) => entity.onSelect(evt.target.checked)}
            />
          </Select>
        </PrintHide>
      )}
      <Box gap="xxsmall">
        {(code || meta.length > 0) && (
          <Box direction="row" align="center" gap="xxsmall">
            {code && (
              <Label color="dark-5" size="xxsmall" weight={500}>
                {code}
              </Label>
            )}
            {meta.map((item, i) => (
              <Meta key={i} color={item.bg}>
                <Label color={item.color || '#898989'} size="xxxsmall">
                  {item.text}
                </Label>
              </Meta>
            ))}
          </Box>
        )}
        <Link
          href={entity.href}
          onClick={(evt) => {
            if (evt) evt.preventDefault();
            onEntityClick(entity.id, entity.path);
          }}
          title={entity.values.title}
        >
          <Box direction="row" gap="xsmall" align="center">
            {Object.keys(entity.values).map((key) => {
              if (!entity.values[key]) {
                return null;
              }
              if (key === 'title' || key === 'name') {
                return (
                  <Label key={key} title={entity.values[key]}>
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
                    title={entity.values[key]}
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
  onEntityClick: PropTypes.func,
  // column: PropTypes.object,
  canEdit: PropTypes.bool,
  intl: intlShape,
};

export default injectIntl(CellBodyMain);
