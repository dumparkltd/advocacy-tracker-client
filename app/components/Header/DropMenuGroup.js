import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import {
  Box, Button, Text,
} from 'grommet';

import Icon from 'components/Icon';
import messages from './messages';

const AddIconWrapper = styled((p) => <Box {...p} />)`
  color: ${palette('primary', 1)};
  background-color: white;
  border-radius: 999px;
  border: none;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1), 0px 1px 3px rgba(0, 0, 0, 0.08);
  padding: 10px;
`;
const ItemButton = styled((p) => <Button plain as="a" pad="xsmall" {...p} />)`
  background-color: white;
  border: none;
  border-bottom: 1px solid ${palette('light', 1)};
  font-weight: ${({ active }) => active ? 600 : 300};
  &:first-child {
    border-top: 1px solid ${palette('light', 1)};
  }
  &:hover {
    color: ${palette('primary', 0)};
    box-shadow: none;
  }
`;
const ExpandItems = styled((p) => <Button plain {...p} />)`
  color: ${palette('primary', 1)};
  font-family: ${({ theme }) => theme.fonts.title};
  font-weight: normal;
  &:hover {
    color: ${palette('primary', 0)};
  }
`;
const Hint = styled((p) => <Text size="xsmall" {...p} />)`
  color: ${palette('dark', 3)};
`;

const DropMenuGroup = ({
  group,
  onClick,
  onHide,
  type,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { items, title } = group;
  if (!items || items.length === 0) return null;
  const displayedNavItems = isExpanded ? items : items.filter((i) => !i.hidden);
  const hasHidden = items.length !== displayedNavItems.length;
  return (
    <Box>
      {title && (
        <Box margin={{ vertical: 'small' }}>
          <Hint>{title}</Hint>
        </Box>
      )}
      <Box>
        {displayedNavItems && displayedNavItems.map((item, i) => (
          <ItemButton
            key={i}
            href={item.path}
            active={item.active}
            onClick={(evt) => {
              if (evt) evt.stopPropagation();
              onHide();
              onClick(item.path);
            }}
          >
            <Box
              direction="row"
              justify="between"
              align="center"
              fill="horizontal"
              pad={{ vertical: 'xsmall' }}
            >
              <Text>{item.title}</Text>
              {type === 'add' && (
                <Box
                  width="79px"
                  align="center"
                >
                  <AddIconWrapper>
                    <Icon
                      name="add"
                      size="14px"
                      hasStroke
                    />
                  </AddIconWrapper>
                </Box>
              )}
            </Box>
          </ItemButton>
        ))}
      </Box>
      {hasHidden && (
        <ExpandItems
          label={
            isExpanded
              ? <FormattedMessage {...messages.showLessLabel} />
              : <FormattedMessage {...messages.showMoreLabel} />
          }
          onClick={() => setIsExpanded(!isExpanded)}
          margin={{ left: 'xsmall' }}
        />
      )}
    </Box>
  );
};

DropMenuGroup.propTypes = {
  group: PropTypes.object,
  onClick: PropTypes.func,
  show: PropTypes.bool,
  onShow: PropTypes.func,
  onHide: PropTypes.func,
  type: PropTypes.string,
};

export default DropMenuGroup;
