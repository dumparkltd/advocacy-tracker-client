/*
 *
 * OptionListHeader
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Text,
} from 'grommet';

export function OptionListHeader({ labels }) {
  return (
    <Box
      direction="row"
      gap="small"
      align="center"
      justify="between"
      pad={{ bottom: 'small' }}
      margin={{ bottom: 'small' }}
      border={{ side: 'bottom', color: 'rgba(0,0,0,0.33)' }}
    >
      <Text style={{ fontWeight: 700 }}>{labels.attributes}</Text>
      <Text style={{ fontWeight: 700 }}>{labels.columns}</Text>
    </Box>
  );
}

OptionListHeader.propTypes = {
  labels: PropTypes.object,
};

export default OptionListHeader;
