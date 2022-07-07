import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';

import {
  Box, Text, Button, Drop,
} from 'grommet';
import styled from 'styled-components';
import { truncateText } from 'utils/string';

import { ROUTES, ACTION_INDICATOR_SUPPORTLEVELS } from 'themes/config';
import Dot from 'components/styled/Dot';
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

const LabelWrap = styled((p) => <Box direction="row" gap="xsmall" align="center" {...p} />)``;

const getIndicatorLink = (indicator) => `${ROUTES.INDICATOR}/${indicator.get('id')}`;

const getIndicatorOnClick = (indicator, onEntityClick) => (evt) => {
  if (evt) evt.preventDefault();
  onEntityClick(indicator.get('id'), ROUTES.INDICATOR);
};

const getTitleWithLevel = (indicator, value, intl) => {
  const level = indicator.getIn(['supportlevel', 'value']);
  const levelLabel = intl.formatMessage(appMessages.supportlevels[level]);
  return `${value} (${levelLabel})`;
};

export function CellBodyIndicators({
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
          href={getIndicatorLink(entity.single)}
          onClick={getIndicatorOnClick(entity.single, onEntityClick)}
          title={entity.single.get('supportlevel')
            ? getTitleWithLevel(entity.single, entity.value, intl)
            : entity.value}
          alignSelf={align}
        >
          <LabelWrap>
            {entity.single.get('supportlevel') && (
              <Dot color={entity.single.getIn(['supportlevel', 'color'])} />
            )}
            <Label textAlign={align}>
              {truncateText(entity.value, 25)}
            </Label>
          </LabelWrap>
        </Link>
      )}
      {entity.multiple && (
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
      {entity.multiple && showContent && buttonRef.current && (
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
            {Object.values(ACTION_INDICATOR_SUPPORTLEVELS).sort(
              (a, b) => a.order < b.order ? -1 : 1
            ).map(
              (level) => {
                if (entity.tooltip.get(level.value)) {
                  return (
                    <Box key={level.value} flex={{ shrink: 0 }}>
                      <Box border="bottom" flex={{ shrink: 0 }} margin={{ bottom: 'small' }}>
                        <LabelWrap>
                          <Dot color={level.color} />
                          <Text size="small" weight={500}>
                            {intl.formatMessage(appMessages.supportlevels[level.value])}
                          </Text>
                        </LabelWrap>
                      </Box>
                      <Box flex={{ shrink: 0 }} gap="xsmall">
                        {entity.tooltip.get(level.value)
                          .toList()
                          .sort(
                            (a, b) => a.getIn(['attributes', 'title'])
                              > b.getIn(['attributes', 'title'])
                              ? 1
                              : -1
                          ).map(
                            (indicator) => (
                              <Box key={indicator.get('id')} flex={{ shrink: 0 }}>
                                <LinkInTT
                                  key={indicator.get('id')}
                                  href={getIndicatorLink(indicator)}
                                  onClick={getIndicatorOnClick(indicator, onEntityClick)}
                                  title={indicator.getIn(['attributes', 'title'])}
                                >
                                  <LabelInTT>
                                    {truncateText(indicator.getIn(['attributes', 'title']), 30)}
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

CellBodyIndicators.propTypes = {
  entity: PropTypes.object,
  align: PropTypes.string,
  onEntityClick: PropTypes.func,
  intl: intlShape,
};


export default injectIntl(CellBodyIndicators);
