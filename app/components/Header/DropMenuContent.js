import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import {
  Box, Button, Text, ResponsiveContext,
} from 'grommet';

import { isMinSize } from 'utils/responsive';

import Icon from 'components/Icon';
import ScreenReaderOnly from 'components/styled/ScreenReaderOnly';
import appMessages from 'containers/App/messages';

import DropMenuGroup from './DropMenuGroup';
import DropButtonWrap from './DropButtonWrap';
import DropButton from './DropButton';

const Menu = styled((p) => (
  <Box
    flex={{ shrink: 0 }}
    responsive={false}
    {...p}
  />
))`
  max-width: none;
  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    width: 300px;
  }
`;


const Title = styled((p) => <Text {...p} />)`
 font-family: ${({ theme }) => theme.fonts.title};
 font-weight: normal;
 font-size: 42px;
 line-height: 46px;
`;

const ExpandItems = styled((p) => <Button plain {...p} />)`
  color: ${palette('primary', 1)};
  font-family: ${({ theme }) => theme.fonts.title};
  font-weight: normal;
  &:hover {
    color: ${palette('primary', 0)};
  }
`;

const DropMenuContent = ({
  title,
  type,
  navItemGroups,
  onSelectItem,
  onClose,
  offsetCloseButton,
}) => {
  const [showAll, setShowAll] = useState(false);
  const size = React.useContext(ResponsiveContext);

  let groups = navItemGroups;
  if (type === 'add' && !showAll) {
    groups = [{
      title: 'Common',
      items: groups.reduce((memo, group) => ([
        ...memo,
        ...group.items.filter((i) => i.popular),
      ]), []),
    }];
  }
  return (
    <Menu
      pad={{ horizontal: 'medium', bottom: 'large' }}
    >
      <DropButtonWrap menuType={type} inDrop>
        <DropButton
          onClick={onClose}
          menuType={type}
          offsetButtonRight={offsetCloseButton}
          inDrop
        >
          <ScreenReaderOnly>
            <FormattedMessage {...appMessages.buttons.showSecondaryNavigation} />
          </ScreenReaderOnly>
          <div>
            <Icon name="close" size={isMinSize(size, 'medium') ? '40px' : '30px'} />
          </div>
        </DropButton>
      </DropButtonWrap>
      <Box
        gap="xlarge"
        margin={{ top: isMinSize(size, 'medium') ? '25px' : '10px', bottom: 'large' }}
      >
        <Title>{title}</Title>
        <Box gap="xlarge">
          {Object.values(groups).filter((g) => !!g).map((group, index) => (
            <DropMenuGroup
              key={index}
              group={group}
              onClick={(path) => {
                onClose();
                onSelectItem(path);
              }}
              type={type}
            />
          ))}
        </Box>
      </Box>
      {type === 'add' && (
        <ExpandItems
          label={
            showAll
              ? 'Show most common only'
              : 'Show all items (by type)'
          }
          onClick={() => setShowAll(!showAll)}
          margin={{ left: 'xsmall' }}
        />
      )}
    </Menu>
  );
};

DropMenuContent.propTypes = {
  title: PropTypes.string,
  type: PropTypes.string,
  offsetCloseButton: PropTypes.number,
  navItemGroups: PropTypes.array, // groups[{ title, items: [] }]
  onSelectItem: PropTypes.func,
  onClose: PropTypes.func,
};

export default DropMenuContent;
