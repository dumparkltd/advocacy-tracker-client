import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import {
  ResponsiveContext, Layer, Drop,
} from 'grommet';

import { isMinSize } from 'utils/responsive';

import Icon from 'components/Icon';
import ScreenReaderOnly from 'components/styled/ScreenReaderOnly';
import appMessages from 'containers/App/messages';

import DropMenuContent from './DropMenuContent';
import DropButtonWrap from './DropButtonWrap';
import DropButton from './DropButton';

const Styled = styled.div`
  position: relative;
  z-index: ${({ open }) => open ? '111' : '110'};
`;

const DropMenu = ({
  title,
  type,
  navItemGroups,
  onClick,
  icon = 'menu',
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const size = React.useContext(ResponsiveContext);

  return (
    <Styled open={open}>
      <div ref={ref} style={{ position: 'absolute', top: 0, right: type === 'add' ? '-5px' : '0' }} />
      <DropButtonWrap menuType={type}>
        <DropButton
          onClick={() => setOpen(!open)}
          open={open}
          menuType={type}
        >
          <ScreenReaderOnly>
            <FormattedMessage {...appMessages.buttons.showSecondaryNavigation} />
          </ScreenReaderOnly>
          {type === 'add' && (
            <div style={{ transform: 'rotate(45deg)' }}>
              <Icon name="close" size={isMinSize(size, 'medium') ? '40px' : '30px'} />
            </div>
          )}
          {icon && type !== 'add' && (
            <Icon name={icon} size={isMinSize(size, 'medium') ? '40px' : '30px'} />
          )}
        </DropButton>
      </DropButtonWrap>
      {open && !isMinSize(size, 'medium') && (
        <Layer
          full
          responsive
          onClickOutside={() => setOpen(false)}
          onEsc={() => setOpen(false)}
          animation={false}
          style={{ overflowY: 'auto', borderRadius: '0' }}
        >
          <DropMenuContent
            title={title}
            type={type}
            navItemGroups={navItemGroups}
            onSelectItem={onClick}
            onClose={() => setOpen(false)}
          />
        </Layer>
      )}
      {open && isMinSize(size, 'large') && (
        <Drop
          target={ref.current}
          responsive
          align={{ top: 'top', right: 'right' }}
          onClickOutside={() => setOpen(false)}
          onEsc={() => setOpen(false)}
          style={{ animation: 'none', opacity: '1', marginRight: '-5px' }}
          animate={false}
          overflow={{
            vertical: 'auto',
            horizontal: 'hidden',
          }}
        >
          <DropMenuContent
            title={title}
            type={type}
            navItemGroups={navItemGroups}
            onSelectItem={onClick}
            onClose={() => setOpen(false)}
            offsetCloseButton={type === 'add' ? 5 : 0}
          />
        </Drop>
      )}
    </Styled>
  );
};

DropMenu.propTypes = {
  title: PropTypes.string,
  icon: PropTypes.string,
  type: PropTypes.string,
  navItemGroups: PropTypes.array, // groups[{ title, items: [] }]
  onClick: PropTypes.func,
};

export default DropMenu;
