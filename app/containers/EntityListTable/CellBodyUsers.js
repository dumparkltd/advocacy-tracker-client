import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';

import {
  Box, Text, Drop,
} from 'grommet';
import styled from 'styled-components';
import { truncateText } from 'utils/string';
import Button from 'components/buttons/ButtonTableCell';

import { ROUTES } from 'themes/config';

import LabelTooltip from './LabelTooltip';
import LinkTooltip from './LinkTooltip';
// import appMessages from 'containers/App/messages';

const Link = styled((p) => <Button as="a" {...p} />)`
  text-align: ${({ align }) => align === 'end' ? 'right' : 'left'};
  line-height: 12px;
`;
const Label = styled((p) => <Text size="xsmall" wordBreak="keep-all" {...p} />)`
  text-align: ${({ align }) => align === 'end' ? 'right' : 'left'};
  line-height: 12px;
`;

const LinkInTT = styled((p) => <Button as="a" {...p} />)`
  line-height: 13px;
`;
const LabelInTT = styled((p) => <Text size="xsmall" wordBreak="keep-all" {...p} />)`
  line-height: 13px;
`;

const getUserLink = (user) => `${ROUTES.USERS}/${user.get('id')}`;

const getUserOnClick = (user, onEntityClick, setShowContent) => (evt) => {
  if (evt) evt.preventDefault();
  if (setShowContent) setShowContent(false);
  onEntityClick(user.get('id'), ROUTES.USERS);
};

export function CellBodyUsers({
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
          href={getUserLink(entity.single)}
          onClick={getUserOnClick(entity.single, onEntityClick)}
          title={entity.value}
          alignSelf={align}
        >
          <Label textAlign={align}>
            {truncateText(entity.value, 25)}
          </Label>
        </Link>
      )}
      {entity.multiple && (
        <LinkTooltip
          ref={buttonRef}
          showContent={showContent}
          alignSelf={align}
          onClick={() => setShowContent(!showContent)}
        >
          <Box align="center" justify="center">
            <LabelTooltip textAlign={align}>
              {entity.value}
            </LabelTooltip>
          </Box>
        </LinkTooltip>
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
                  (a, b) => a.getIn(['attributes', 'name'])
                    > b.getIn(['attributes', 'name'])
                    ? 1
                    : -1
                ).map(
                  (user) => (
                    <Box key={user.get('id')} flex={{ shrink: 0 }}>
                      <LinkInTT
                        key={user.get('id')}
                        href={getUserLink(user)}
                        onClick={getUserOnClick(user, onEntityClick, setShowContent)}
                        title={user.getIn(['attributes', 'name'])}
                      >
                        <LabelInTT>
                          {truncateText(user.getIn(['attributes', 'name']), 30)}
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

CellBodyUsers.propTypes = {
  entity: PropTypes.object,
  align: PropTypes.string,
  onEntityClick: PropTypes.func,
  // intl: intlShape,
};


export default CellBodyUsers;
