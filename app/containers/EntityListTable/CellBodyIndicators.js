import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';

import {
  Box, Text, Button, Drop,
} from 'grommet';
import styled from 'styled-components';
import { truncateText } from 'utils/string';

import { ROUTES } from 'themes/config';
// import appMessages from 'containers/App/messages';

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

const getIndicatorLink = (indicator) => `${ROUTES.INDICATOR}/${indicator.get('id')}`;

const getIndicatorOnClick = (indicator, onEntityClick) => (evt) => {
  if (evt) evt.preventDefault();
  onEntityClick(indicator.get('id'), ROUTES.INDICATOR);
};

export function CellBodyIndicators({
  entity,
  align = 'start',
  onEntityClick,
  // intl,
}) {
  const buttonRef = useRef();
  const [showContent, setShowContent] = useState(false);
  return (
    <Box alignContent={align}>
      {entity.single && (
        <Link
          href={getIndicatorLink(entity.single)}
          onClick={getIndicatorOnClick(entity.single, onEntityClick)}
          title={entity.value}
          alignSelf={align}
        >
          <Label textAlign={align}>
            {truncateText(entity.value, 25)}
          </Label>
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
            <Box flex={{ shrink: 0 }} gap="xsmall">
              {entity.tooltip
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
        </Drop>
      )}
    </Box>
  );
}

CellBodyIndicators.propTypes = {
  entity: PropTypes.object,
  align: PropTypes.string,
  onEntityClick: PropTypes.func,
  // intl: intlShape,
};


export default CellBodyIndicators;
