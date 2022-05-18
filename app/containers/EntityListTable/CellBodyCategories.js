import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import {
  Box, Text, Button, Drop,
} from 'grommet';
import styled from 'styled-components';
import { truncateText } from 'utils/string';

import appMessages from 'containers/App/messages';

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
const LabelInTT = styled((p) => <Text size="xsmall" wordBreak="keep-all" {...p} />)`
  line-height: 13px;
`;

export function CellBodyCategories({
  entity,
  align = 'start',
  intl,
}) {
  const buttonRef = useRef();
  const [showContent, setShowContent] = useState(false);
  return (
    <Box alignContent={align}>
      {entity.single && (
        <Label textAlign={align}>
          {truncateText(entity.value, 25)}
        </Label>
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
            flex={{ shrink: 0 }}
          >
            <Box border="bottom" flex={{ shrink: 0 }} margin={{ bottom: 'small' }}>
              <Text size="small" weight={500}>
                {`${entity.tooltip.size} ${intl.formatMessage(appMessages.entities.taxonomies[entity.taxonomy_id][entity.tooltip.size === 1 ? 'shortSingle' : 'shortPlural'])}`}
              </Text>
            </Box>
            <Box flex={{ shrink: 0 }} gap="xsmall">
              {entity.tooltip.toList()
                .sort(
                  (a, b) => a.getIn(['attributes', 'title'])
                    > b.getIn(['attributes', 'title'])
                    ? 1
                    : -1
                ).map(
                  (category) => (
                    <Box key={category.get('id')} flex={{ shrink: 0 }}>
                      <LabelInTT>
                        {truncateText(category.getIn(['attributes', 'title']), 30)}
                      </LabelInTT>
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

CellBodyCategories.propTypes = {
  entity: PropTypes.object,
  align: PropTypes.string,
  intl: intlShape,
};


export default injectIntl(CellBodyCategories);
