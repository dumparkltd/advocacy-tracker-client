import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import ButtonClose from 'components/buttons/ButtonClose';
import { Box, Text } from 'grommet';
import Icon from 'components/Icon';
import A from 'components/styled/A';

const Root = styled.div`
  position: absolute;
  top: ${({ position }) => position ? position.y : 50}px;
  left: 0;
  right: 0;
  z-index: 2501;
  @media (min-width: ${({ theme }) => theme.breakpoints.large}) {
    bottom: auto;
    right: auto;
    top: ${({ position }) => position ? position.y : 10}px;
    right: ${({ position }) => position ? 'auto' : '10px'};
    left: ${({ position }) => position ? position.x : 'auto'};
  }
`;

// const BlockMouse = styled.div`
//   position: absolute;
//   top: -40px;
//   left: ${({ dirLeft }) => (dirLeft ? '-60px' : '0px')};
//   width: 60px;
//   background: transparent];
//   height: 60px;
//   display: block;
// `;

// prettier-ignore
const Anchor = styled.div``;

// eslint-ebable prefer-template
// border-right-color: ${({ dirLeft }) => (!dirLeft ? 'white' : 'transparent')};

const TTContentWrap = styled((p) => <Box pad={{ bottom: 'small' }} {...p} />)``;
const ButtonWrap = styled.div`
  margin-left: auto;
  position: absolute;
  bottom: 10px;
  right: 10px;
`;
const Main = styled.div`
  padding: 20px 10px 30px;
  min-height: 100px;
  box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.2);
  display: block;
  background: white;
  width: 100%;
  overflow: auto;
  @media (min-width: ${({ theme }) => theme.breakpoints.large}) {
    max-height: 80vH;
    height: auto;
    overflow: visible;
    max-width: ${({ w }) => w}px;
    min-width: 250px;
    pointer-events: all;
  }
`;
const CloseWrap = styled.div`
  width: 30px;
  height: 30px;
  position: absolute;
  right: 12px;
  top: 10px;
  @media (min-width: ${({ theme }) => theme.breakpoints.large}) {
    right: -10px;
    top: -10px;
  }
`;
const TTTitle = styled.h4`
margin: 0 0 5px;
font-size: ${({ theme }) => theme.sizes.text.default};
`;
//
// const TTContent = styled.div`
//   font-size: ${({ theme }) => theme.sizes.text.small};
// `;
// const TTSectionTitle = styled.div`
//   margin: 15px 0 3px;
//   font-size: ${({ theme }) => theme.sizes.text.default};
// `;

// const CloseButton = styled.button`
//   border-radius: 9999px;
//   box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.2);
//   background: black;
// `;

const WIDTH = 300;

const Tooltip = ({
  position,
  direction,
  feature,
  onClose,
  onFeatureClick,
}) => (
  <Root position={position}>
    <Anchor dirLeft={direction && direction.x === 'left'} w={WIDTH} xy={{ x: 0, y: 0 }}>
      <Main
        dirLeft={direction && direction.x === 'left'}
        w={WIDTH}
      >
        <CloseWrap>
          <ButtonClose onClose={onClose} />
        </CloseWrap>
        <TTTitle>{feature.title}</TTTitle>
        {feature.content && (
          <TTContentWrap>
            {feature.content}
          </TTContentWrap>
        )}
        <ButtonWrap>
          <A as="button" onClick={onFeatureClick}>
            <Box direction="row" align="center" ggap="small">
              <Text size="small">Country profile</Text>
              <Icon name="arrowRight" size="1em" sizes={{ mobile: '1em' }} />
            </Box>
          </A>
        </ButtonWrap>
      </Main>
    </Anchor>
  </Root>
);

Tooltip.propTypes = {
  position: PropTypes.object,
  direction: PropTypes.object, // x, y
  feature: PropTypes.object,
  onClose: PropTypes.func,
  onFeatureClick: PropTypes.func,
};

export default Tooltip;
