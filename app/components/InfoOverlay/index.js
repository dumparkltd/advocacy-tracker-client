/*
 *
 * InfoOverlay
 *
 */

import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';

import styled from 'styled-components';
import {
  Box,
  Button,
  Drop,
  Layer,
  Text,
} from 'grommet';
import { CircleInformation, CircleQuestion, FormClose } from 'grommet-icons';
const DropContent = styled(({ dropBackground, ...p }) => (
  <Box
    pad="small"
    background={dropBackground}
    {...p}
  />
))`
  max-width: 280px;
`;
const LayerWrap = styled((p) => (
  <Box
    background="white"
    {...p}
  />
))`
min-width: 320px;
min-height: 200px;
overflow-y: auto;
`;
const LayerHeader = styled((p) => (
  <Box
    direction="row"
    pad={{ left: 'medium', right: 'small', vertical: 'small' }}
    background="light-2"
    align="center"
    gap="small"
    justify="between"
    {...p}
  />
))``;

const LayerContent = styled((p) => (
  <Box
    pad={{ horizontal: 'medium', vertical: 'medium' }}
    background="white"
    {...p}
  />
))``;

const Markdown = styled(ReactMarkdown)`
  font-size: ${(props) => props.theme.sizes.text.markdownMobile};
  @media (min-width: ${(props) => props.theme.breakpoints.medium}) {
    font-size: ${(props) => props.theme.sizes.text.markdown};
  }
  @media print {
    font-size: ${(props) => props.theme.sizes.print.markdown};
  }
`;

function InfoOverlay({
  dark,
  content,
  tooltip,
  title,
  padButton,
  colorButton,
  icon,
  markdown,
  inline,
  dropBackground,
}) {
  const infoRef = useRef(null);
  const [info, showInfo] = useState(false);
  return (
    <>
      <Box
        as={inline ? 'span' : 'div'}
        fill={false}
        pad={inline ? null : (padButton || { horizontal: 'small' })}
        ref={infoRef}
        flex={inline ? false : { grow: 0, shrink: 0 }}
        style={inline ? { width: 'auto', display: 'inline-block' } : null}
      >
        <Button
          plain
          icon={
            icon === 'question'
              ? (
                <CircleQuestion
                  color={colorButton || (dark ? 'light-5' : 'dark-5')}
                  size="21px"
                />
              )
              : (
                <CircleInformation
                  color={colorButton || (dark ? 'light-5' : 'dark-5')}
                  size="21px"
                />
              )
          }
          fill={false}
          onMouseOver={() => tooltip && showInfo(true)}
          onMouseLeave={() => tooltip && showInfo(false)}
          onFocus={() => tooltip && showInfo(true)}
          onBlur={() => null}
          onClick={() => !tooltip && showInfo(!info)}
        />
      </Box>
      {info && infoRef && tooltip && (
        <Drop
          align={{ bottom: 'top' }}
          target={infoRef.current}
          plain
        >
          <DropContent dropBackground={dropBackground}>
            {markdown && (
              <div>
                <Markdown source={content} className="react-markdown" linkTarget="_blank" />
              </div>
            )}
            {!markdown && content}
          </DropContent>
        </Drop>
      )}
      {info && !tooltip && (
        <Layer
          onEsc={() => showInfo(false)}
          onClickOutside={() => showInfo(false)}
          margin={{ top: 'large' }}
          position="top"
          animate={false}
        >
          <LayerWrap>
            <LayerHeader flex={{ grow: 0, shrink: 0 }}>
              <Box>
                {title && (
                  <Text weight={600}>{title}</Text>
                )}
              </Box>
              <Box flex={{ grow: 0 }}>
                <Button plain icon={<FormClose size="medium" />} onClick={() => showInfo(false)} />
              </Box>
            </LayerHeader>
            <LayerContent flex={{ grow: 1 }}>
              <div>
                <Markdown source={content} className="react-markdown" linkTarget="_blank" />
              </div>
            </LayerContent>
          </LayerWrap>
        </Layer>
      )}
    </>
  );
}

InfoOverlay.propTypes = {
  dark: PropTypes.bool,
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
  padButton: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.string,
  ]),
};

export default InfoOverlay;
