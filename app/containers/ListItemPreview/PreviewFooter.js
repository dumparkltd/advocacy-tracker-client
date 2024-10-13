import React from 'react';
import PropTypes from 'prop-types';

import { Box, Text } from 'grommet';

import Icon from 'components/Icon';
import ButtonPrimary from 'components/buttons/ButtonPrimaryNew';
import ButtonSecondary from 'components/buttons/ButtonSecondaryNew';

export function PreviewFooter({ content, onUpdatePath }) {
  const { primaryLink, secondaryLink } = content;
  return (
    <Box
      direction="row"
      justify="end"
      pad={{ top: 'small' }}
      gap="none"
    >
      {secondaryLink && (
        <ButtonSecondary
          gap="none"
          justify="center"
          onClick={(e) => {
            if (e && e.preventDefault) e.preventDefault();
            onUpdatePath(secondaryLink.path);
          }}
        >
          <Box direction="row" align="center">
            <Text size="large" style={{ marginTop: '-2px' }}>
              {secondaryLink.title}
            </Text>
            <Icon
              name="arrowRight"
              size="10px"
              palette="primary"
              paletteIndex={1}
              hasStroke
            />
          </Box>
        </ButtonSecondary>
      )}
      {primaryLink && (
        <ButtonPrimary
          onClick={(e) => {
            if (e && e.preventDefault) e.preventDefault();
            onUpdatePath(primaryLink.path);
          }}
          label={(
            <Text size="large">
              {primaryLink.title}
            </Text>
          )}
        />
      )}
    </Box>
  );
}

PreviewFooter.propTypes = {
  content: PropTypes.object,
  onUpdatePath: PropTypes.func,
};
export default PreviewFooter;
