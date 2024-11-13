import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import {
  Box, Text,
} from 'grommet';
import Button from 'components/buttons/ButtonSimple';

import Icon from 'components/Icon';

const AddIconWrapper = styled((p) => <Box {...p} />)`
  color: ${palette('primary', 1)};
  background-color: white;
  border-radius: 999px;
  border: none;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1), 0px 1px 3px rgba(0, 0, 0, 0.08);
  padding: 10px;
`;
const ItemButton = styled((p) => <Button as="a" {...p} />)`
  background-color: white;
  border: none;
  border-bottom: 1px solid ${palette('light', 1)};
  font-weight: ${({ active }) => active ? 600 : 300};
  margin: 1px 0;
  min-height: 48px;
  &:first-child {
    border-top: 1px solid ${palette('light', 1)};
  }
  color: black;
  &:hover {
    color: ${({ theme }) => theme.global.colors.highlight};
    box-shadow: none;
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
  const { items, title } = group;
  if (!items || items.length === 0) return null;
  return (
    <Box>
      {title && (
        <Box margin={{ vertical: 'small' }}>
          <Hint>{title}</Hint>
        </Box>
      )}
      <Box>
        {items && items.map((item, i) => (
          <ItemButton
            key={i}
            href={item.path}
            active={item.active}
            onClick={(evt) => {
              if (evt) evt.stopPropagation();
              if (onHide) onHide();
              onClick(item.path);
            }}
          >
            <Box
              direction="row"
              justify="between"
              align="center"
              alignContent="center"
              fill
              pad={{ horizontal: 'xsmall' }}
              style={{ minHeight: '48px' }}
            >
              <Text>{item.title}</Text>
              {type === 'add' && (
                <AddIconWrapper>
                  <Icon
                    name="add"
                    size="14px"
                    hasStroke
                  />
                </AddIconWrapper>
              )}
            </Box>
          </ItemButton>
        ))}
      </Box>
    </Box>
  );
};

DropMenuGroup.propTypes = {
  group: PropTypes.object,
  onClick: PropTypes.func,
  onHide: PropTypes.func,
  type: PropTypes.string,
};

export default DropMenuGroup;
