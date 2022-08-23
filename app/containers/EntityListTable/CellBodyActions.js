import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import {
  Box, Text, Button, Drop,
} from 'grommet';
import styled from 'styled-components';
import { truncateText } from 'utils/string';

import { ACTIONTYPES_CONFIG, ROUTES } from 'themes/config';
import appMessages from 'containers/App/messages';

const Link = styled((p) => <Button as="a" plain {...p} />)`
  text-align: ${({ align }) => align === 'end' ? 'right' : 'left'};
  line-height: 12px;
`;
const Label = styled((p) => <Text size="xsmall" wordBreak="keep-all" {...p} />)`
  text-align: ${({ align }) => align === 'end' ? 'right' : 'left'};
  line-height: 12px;
`;

const LinkTT = styled(
  React.forwardRef((p, ref) => <Button plain {...p} ref={ref} />)
)`
  text-align: ${({ align }) => align === 'end' ? 'right' : 'left'};
  line-height: 12px;
`;
const LabelTT = styled((p) => <Text size="xsmall" wordBreak="keep-all" {...p} />)`
  text-align: ${({ align }) => align === 'end' ? 'right' : 'left'};
  font-style: italic;
  line-height: 12px;
`;
const LinkInTT = styled((p) => <Button as="a" plain {...p} />)`
  line-height: 13px;
`;
const LabelInTT = styled((p) => <Text size="xsmall" wordBreak="keep-all" {...p} />)`
  line-height: 13px;
`;

const getActionLink = (action) => `${ROUTES.ACTION}/${action.get('id')}`;

export function CellBodyActions({
  entity,
  align = 'start',
  onEntityClick,
  intl,
}) {
  const buttonRef = useRef();
  const [showContent, setShowContent] = useState(false);
  return (
    <Box alignContent={align}>
      {entity.single && (
        <Link
          href={getActionLink(entity.single)}
          onClick={(evt) => {
            if (evt) evt.preventDefault();
            onEntityClick(entity.single.get('id'), ROUTES.ACTION);
          }}
          title={entity.value}
          alignSelf={align}
        >
          <Label textAlign={align}>
            {truncateText(entity.value, 25)}
          </Label>
        </Link>
      )}
      {entity.tooltip && (
        <LinkTT
          ref={buttonRef}
          alignSelf={align}
          onClick={() => setShowContent(!showContent)}
          active={showContent}
        >
          <LabelTT textAlign={align}>
            {entity.value}
          </LabelTT>
        </LinkTT>
      )}
      {entity.tooltip && showContent && buttonRef.current && (
        <Drop
          target={buttonRef.current}
          onClickOutside={() => setShowContent(false)}
          align={{
            bottom: 'top',
          }}
          margin={{ horizontal: 'xsmall', vertical: 'xsmall' }}
          background="white"
          elevation="small"
          overflow={{
            vertical: 'auto',
            horizontal: 'hidden',
          }}
        >
          <Box
            style={{ minWidth: '240px' }}
            pad={{
              horizontal: 'small',
              vertical: 'medium',
            }}
            gap="medium"
            flex={{ shrink: 0 }}
          >
            {Object.values(ACTIONTYPES_CONFIG).sort(
              (a, b) => a.order < b.order ? -1 : 1
            ).map(
              (type) => {
                if (entity.tooltip.get(parseInt(type.id, 10))) {
                  const count = entity.tooltip.get(parseInt(type.id, 10)).size;
                  return (
                    <Box key={type.id} flex={{ shrink: 0 }}>
                      <Box border="bottom" flex={{ shrink: 0 }} margin={{ bottom: 'small' }}>
                        <Text size="small" weight={500}>
                          {`${count} ${intl.formatMessage(appMessages.entities[`actions_${type.id}`][count === 1 ? 'singleShort' : 'pluralShort'])}`}
                        </Text>
                      </Box>
                      <Box flex={{ shrink: 0 }} gap="xsmall">
                        {entity.tooltip.get(parseInt(type.id, 10))
                          .toList()
                          .sort(
                            (a, b) => a.getIn(['attributes', 'title'])
                              > b.getIn(['attributes', 'title'])
                              ? 1
                              : -1
                          ).map(
                            (action) => (
                              <Box key={action.get('id')} flex={{ shrink: 0 }}>
                                <LinkInTT
                                  key={action.get('id')}
                                  href={getActionLink(action)}
                                  onClick={(evt) => {
                                    if (evt) evt.preventDefault();
                                    setShowContent(false);
                                    onEntityClick(action.get('id'), ROUTES.ACTION);
                                  }}
                                  title={action.getIn(['attributes', 'title'])}
                                >
                                  <LabelInTT>
                                    {truncateText(action.getIn(['attributes', 'title']), 30)}
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
        </Drop>
      )}
    </Box>
  );
}

CellBodyActions.propTypes = {
  entity: PropTypes.object,
  align: PropTypes.string,
  onEntityClick: PropTypes.func,
  intl: intlShape,
};


export default injectIntl(CellBodyActions);
