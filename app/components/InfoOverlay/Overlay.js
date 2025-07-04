/*
 *
 * Overlay
 *
 */

import React from 'react';
import PropTypes from 'prop-types';

import {
  Box,
  Layer,
  Text,
} from 'grommet';
import { FormClose } from 'grommet-icons';
import Button from 'components/buttons/ButtonSimple';

import Loading from 'components/Loading';

import LayerHeader from './LayerHeader';
import LayerWrap from './LayerWrap';
import LayerContent from './LayerContent';
import Markdown from './Markdown';

function Overlay({
  onClose,
  title,
  markdown,
  content,
  loading,
  size = 'medium',
}) {
  return (
    <Layer
      onEsc={onClose}
      onClickOutside={onClose}
      margin={{ top: 'large' }}
      position="top"
      animate={false}
    >
      <LayerWrap>
        <LayerHeader flex={{ grow: 0, shrink: 0 }}>
          <Box>
            {title && (
              <Text size={size} weight={600}>{title}</Text>
            )}
          </Box>
          {onClose && (
            <Box flex={{ grow: 0 }}>
              <Button onClick={onClose}>
                <FormClose size="medium" />
              </Button>
            </Box>
          )}
        </LayerHeader>
        {loading && <Loading />}
        <LayerContent flex={{ grow: 1 }}>
          <div>
            {markdown && (
              <Markdown
                source={content}
                className="react-markdown"
                linkTarget="_blank"
                size={size}
              />
            )}
            {!markdown && content}
          </div>
        </LayerContent>
      </LayerWrap>
    </Layer>
  );
}

Overlay.propTypes = {
  markdown: PropTypes.bool,
  loading: PropTypes.bool,
  content: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.string,
  ]),
  onClose: PropTypes.func,
  title: PropTypes.string,
  size: PropTypes.string,
};

export default Overlay;
