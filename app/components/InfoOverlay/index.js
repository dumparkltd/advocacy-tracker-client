/*
 *
 * InfoOverlay
 *
 */

import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';

import styled from 'styled-components';
import { Box, Drop } from 'grommet';
import { CircleInformation, CircleQuestion } from 'grommet-icons';

import Button from 'components/buttons/ButtonSimple';
import PrintHide from 'components/styled/PrintHide';
import Overlay from './Overlay';
import Markdown from './Markdown';

const DropContent = styled(({ dropBackground, ...p }) => (
  <Box
    pad="xsmall"
    background={dropBackground}
    elevation="small"
    {...p}
  />
))`
  max-width: 280px;
`;

const StyledButton = styled(Button)`
  color: ${({ theme, colorButton = 'hint' }) => theme.global.colors[colorButton]};
  stroke: ${({ theme, colorButton = 'hint' }) => theme.global.colors[colorButton]};
  vertical-align: top;
  &:hover {
    color: ${({ theme }) => theme.global.colors.highlight};
    stroke: ${({ theme }) => theme.global.colors.highlight};
  }
`;

function InfoOverlay({
  // dark,
  content,
  tooltip,
  title,
  padButton = null,
  colorButton,
  icon,
  markdown,
  inline,
  dropBackground = 'white',
  size = 'medium',
}) {
  const infoRef = useRef(null);
  const [info, showInfo] = useState(false);

  return (
    <PrintHide displayProp={inline ? 'inline' : 'block'}>
      <Box
        as={inline ? 'span' : 'div'}
        fill={false}
        pad={padButton || (inline ? null : { horizontal: 'small' })}
        ref={infoRef}
        flex={inline ? false : { grow: 0, shrink: 0 }}
        style={inline ? { width: 'auto', display: 'inline' } : null}
        align="center"
        justify="center"
        direction="row"
      >
        <StyledButton
          colorButton={colorButton}
          onMouseOver={() => tooltip && showInfo(true)}
          onMouseLeave={() => tooltip && showInfo(false)}
          onFocus={() => tooltip && showInfo(true)}
          onBlur={() => tooltip && showInfo(false)}
          onClick={(evt) => {
            if (evt) evt.preventDefault();
            if (!tooltip) showInfo(!info);
          }}
        >
          {
            (tooltip || icon === 'question')
              ? (
                <CircleQuestion
                  color="currentColor"
                  size="19px"
                  style={{
                    position: 'relative',
                    top: '-2px',
                  }}
                />
              )
              : (
                <CircleInformation
                  color="currentColor"
                  size="19px"
                  style={{
                    position: 'relative',
                    top: '-2px',
                  }}
                />
              )
          }
        </StyledButton>
      </Box>
      {info && infoRef && tooltip && (
        <Drop
          align={{ bottom: 'top' }}
          pad="xxsmall"
          target={infoRef.current}
          plain
          trapFocus={false}
        >
          <DropContent dropBackground={dropBackground}>
            {markdown && (
              <div>
                <Markdown
                  source={content}
                  className="react-markdown"
                  linkTarget="_blank"
                  size={size}
                />
              </div>
            )}
            {!markdown && content}
          </DropContent>
        </Drop>
      )}
      {info && !tooltip && (
        <Overlay
          onClose={() => showInfo(false)}
          title={title}
          markdown={markdown}
          content={content}
          size={size}
        />
      )}
    </PrintHide>
  );
}

InfoOverlay.propTypes = {
  // dark: PropTypes.bool,
  markdown: PropTypes.bool,
  inline: PropTypes.bool,
  tooltip: PropTypes.bool,
  content: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.string,
  ]),
  title: PropTypes.string,
  icon: PropTypes.string,
  dropBackground: PropTypes.string,
  colorButton: PropTypes.string,
  size: PropTypes.string,
  padButton: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.string,
  ]),
};

export default InfoOverlay;
