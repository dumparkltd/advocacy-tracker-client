import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { palette } from 'styled-theme';
import styled from 'styled-components';
import { Box, Text, Button } from 'grommet';

import {
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  OrderedList,
} from 'grommet-icons';

import TextareaMarkdown from 'textarea-markdown-editor';
import MarkdownField from 'components/fields/MarkdownField';

const StyledTextareaMarkdown = styled(
  React.forwardRef((p, ref) => <TextareaMarkdown ref={ref} {...p} />)
)`
  background-color: ${palette('background', 0)};
  width: 100%;
  border: 1px solid ${palette('light', 1)};
  padding: 0.7em;
  border-radius: 0.5em;
  color: ${palette('text', 0)};
  min-height:14em;
`;
const Preview = styled((p) => <Box {...p} />)`
  background-color: ${palette('background', 0)};
  width: 100%;
  border: 1px solid ${palette('light', 1)};
  padding: 0.7em;
  color: ${palette('text', 0)};
  min-height:14em;
  cursor: not-allowed;
`;

const MDButton = styled((p) => (
  <Button
    plain
    {...p}
  />
))`
  min-width: 30px;
  min-height: 30px;
  text-align: center;
  padding: 2px 4px;
  border: 1px solid white;
`;
const ViewButton = styled((p) => (
  <Button
    plain
    {...p}
  />
))`
`;

function TextareaMarkdownWrapper(props) {
  const ref = useRef(null);
  const [view, setView] = useState('write');

  return (
    <Box>
      <Box direction="row" justify="between" margin={{ vertical: 'small' }} align="center">
        <Box direction="row" gap="small" align="center">
          <ViewButton
            onClick={() => setView('write')}
            active={view === 'write'}
          >
            Write
          </ViewButton>
          <ViewButton
            onClick={() => setView('preview')}
            active={view === 'preview'}
          >
            Preview
          </ViewButton>
        </Box>
        <Box direction="row" align="center">
          <MDButton
            title="h2"
            disabled={view !== 'write'}
            onClick={() => {
              if (ref.current) {
                ref.current.trigger('h2');
              }
            }}
          >
            <Text weight="bold">H2</Text>
          </MDButton>
          <MDButton
            title="h3"
            disabled={view !== 'write'}
            onClick={() => {
              if (ref.current) {
                ref.current.trigger('h3');
              }
            }}
          >
            <Text weight="bold">H3</Text>
          </MDButton>
          <MDButton
            title="bold"
            disabled={view !== 'write'}
            onClick={() => {
              if (ref.current) {
                ref.current.trigger('bold');
              }
            }}
            icon={<Bold size="xsmall" />}
          />
          <MDButton
            title="italic"
            disabled={view !== 'write'}
            onClick={() => {
              if (ref.current) {
                ref.current.trigger('italic');
              }
            }}
            icon={<Italic size="xsmall" />}
          />
          <MDButton
            title="link"
            disabled={view !== 'write'}
            onClick={() => {
              if (ref.current) {
                ref.current.trigger('link');
              }
            }}
            icon={<LinkIcon size="xsmall" />}
          />
          <MDButton
            title="unordered list"
            disabled={view !== 'write'}
            onClick={() => {
              if (ref.current) {
                ref.current.trigger('unordered-list');
              }
            }}
            icon={<List size="xsmall" />}
          />
          <MDButton
            title="ordered list"
            disabled={view !== 'write'}
            onClick={() => {
              if (ref.current) {
                ref.current.trigger('ordered-list');
              }
            }}
            icon={<OrderedList size="xsmall" />}
          />
        </Box>
      </Box>
      {view === 'preview' && (
        <Preview>
          <MarkdownField field={{ value: props.value }} />
        </Preview>
      )}
      {view === 'write' && (
        <Box>
          <StyledTextareaMarkdown
            ref={ref}
            options={{
              preferredItalicSyntax: '_',
            }}
            {...props}
          />
        </Box>
      )}
    </Box>
  );
}

TextareaMarkdownWrapper.propTypes = {
  value: PropTypes.string,
};

export default TextareaMarkdownWrapper;
