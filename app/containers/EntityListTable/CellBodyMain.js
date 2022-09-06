import React from 'react';
import PropTypes from 'prop-types';
import { Box, Text, Button } from 'grommet';
import PrintHide from 'components/styled/PrintHide';
import styled from 'styled-components';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';

import { lowerCase } from 'utils/string';

import appMessages from 'containers/App/messages';

const Select = styled(PrintHide)`
  width: 20px;
  text-align: center;
  padding-right: 6px;
`;

const Link = styled((p) => <Button as="a" plain {...p} />)`
  text-align: ${({ align }) => align === 'end' ? 'right' : 'left'};
  line-height: 16px;
`;
const Label = styled((p) => <Text size="small" {...p} />)`
  line-height: 16px;
`;


export function CellBodyMain({
  entity,
  // column,
  canEdit,
  intl,
}) {
  return (
    <Box direction="row" align="center" justify="start">
      {canEdit && (
        <Select>
          <input
            type="checkbox"
            checked={entity.selected}
            onChange={(evt) => entity.onSelect(evt.target.checked)}
          />
        </Select>
      )}
      <Box gap="xxsmall">
        {(entity.draft || entity.archived || entity.private || entity.noNotifications) && (
          <Box direction="row" gap="xsmall">
            {entity.private && (
              <Text color="private" size="xxxsmall">
                <FormattedMessage {...appMessages.ui.privacyStatuses.private} />
              </Text>
            )}
            {entity.archived && (
              <Text color="archived" size="xxxsmall">
                <FormattedMessage {...appMessages.ui.archiveStatuses.archived} />
              </Text>
            )}
            {entity.noNotifications && (
              <Text color="notifications" size="xxxsmall">
                {`Email ${lowerCase(intl.formatMessage(appMessages.ui.notificationStatuses.disabled))}`}
              </Text>
            )}
            {entity.draft && (
              <Text color="draft" size="xxxsmall">
                <FormattedMessage {...appMessages.ui.publishStatuses.draft} />
              </Text>
            )}
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
                    {entity.values[key]}
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
              if (key === 'code') {
                return (
                  <Box flex={{ shrink: 0 }} key={key}>
                    <Label
                      color="dark-5"
                      size="small"
                    >
                      {`${entity.values[key]}`}
                    </Label>
                  </Box>
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
