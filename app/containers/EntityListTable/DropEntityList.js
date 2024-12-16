import React from 'react';
import PropTypes from 'prop-types';
import { Box, Text } from 'grommet';
import styled from 'styled-components';

import { injectIntl, intlShape } from 'react-intl';

import { truncateText } from 'utils/string';
import { ACTORTYPES_CONFIG, ACTIONTYPES_CONFIG, ROUTES } from 'themes/config';
import appMessages from 'containers/App/messages';
import Button from 'components/buttons/ButtonTableCell';

const LinkInTT = styled((p) => <Button as="a" {...p} />)`
  line-height: 13px;
`;
const LabelInTT = styled((p) => <Text size="xsmall" wordBreak="keep-all" {...p} />)`
  line-height: 13px;
`;

const getTitle = (entityType, typeId, count, intl) => {
  let title;
  switch (entityType) {
    case 'actors':
      title = intl.formatMessage(
        appMessages.entities[`actors_${typeId}`][count === 1 ? 'singleShort' : 'pluralShort']
      );
      break;
    case 'actions':
      title = intl.formatMessage(
        appMessages.entities[`actions_${typeId}`][count === 1 ? 'singleShort' : 'pluralShort']
      );
      break;
    default:
      title = '';
  }
  return `${count} ${title}`;
};

const getEntityLink = (entity, entityType) => {
  switch (entityType) {
    case 'actors':
      return `${ROUTES.ACTOR}/${entity.get('id')}`;
    case 'actions':
      return `${ROUTES.ACTION}/${entity.get('id')}`;
    default:
      return '';
  }
};

export function DropEntityList({
  intl,
  tooltipConfig,
  onEntityClick,
  entityType,
}) {
  let typeConfig = entityType === 'actors'
    ? Object.values(ACTORTYPES_CONFIG)
    : Object.values(ACTIONTYPES_CONFIG);
  typeConfig = typeConfig.sort(
    (a, b) => a.order < b.order ? -1 : 1
  );
  return (
    <Box
      style={{ minWidth: '240px' }}
      pad={{
        horizontal: 'small',
        vertical: 'small',
      }}
      gap="medium"
      flex={{ shrink: 0 }}
    >
      {typeConfig.map(
        (type) => {
          const tooltipTypes = tooltipConfig.get(type.id)
            || tooltipConfig.get(parseInt(type.id, 10))
            || tooltipConfig.get(type.id.toString());
          if (tooltipTypes) {
            const count = tooltipTypes.size;
            return (
              <Box key={type.id} flex={{ shrink: 0 }}>
                <Box border="bottom" flex={{ shrink: 0 }} margin={{ bottom: 'small' }}>
                  <Text size="small" weight={500}>
                    {getTitle(entityType, type.id, count, intl)}
                  </Text>
                </Box>
                <Box flex={{ shrink: 0 }} gap="xsmall">
                  {tooltipTypes
                    .toList()
                    .sort(
                      (a, b) => a.getIn(['attributes', 'title'])
                        > b.getIn(['attributes', 'title'])
                        ? 1
                        : -1
                    ).map(
                      (entity) => (
                        <Box key={entity.get('id')} flex={{ shrink: 0 }}>
                          <LinkInTT
                            key={entity.get('id')}
                            href={getEntityLink(entity, entityType)}
                            onClick={(evt) => {
                              if (evt) evt.preventDefault();
                              onEntityClick(entity.get('id'));
                            }}
                            title={entity.getIn(['attributes', 'title'])}
                          >
                            <LabelInTT>
                              {truncateText(entity.getIn(['attributes', 'title']), 30)}
                            </LabelInTT>
                          </LinkInTT>
                        </Box>
                      )
                    )
                  }
                </Box>
              </Box>
            );
          }
          return null;
        }
      )}
    </Box>
  );
}

DropEntityList.propTypes = {
  entityType: PropTypes.string,
  onEntityClick: PropTypes.func,
  tooltipConfig: PropTypes.object,
  intl: intlShape,
};

export default injectIntl(DropEntityList);
