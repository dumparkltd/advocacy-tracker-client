/*
 *
 * OptionsForIndicators
 *
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';

import {
  Box,
  // Text,
} from 'grommet';

import OptionGroup from './OptionGroup';

export function OptionsForIndicators({
  attributes,
  setAttributes,
  hasAttributes,
  includeSupport,
  setIncludeSupport,
}) {
  const [expandGroup, setExpandGroup] = useState(null);

  // count active export options
  const activeAttributeCount = hasAttributes && Object.keys(attributes).reduce((counter, attKey) => {
    if (attributes[attKey].active) return counter + 1;
    return counter;
  }, 0);

  return (
    <Box margin={{ bottom: 'large' }}>
      {hasAttributes && (
        <OptionGroup
          groupId="attributes"
          label="Attributes"
          expandedId={expandGroup}
          onExpandGroup={(val) => setExpandGroup(val)}
          activeOptionCount={activeAttributeCount}
          optionCount={Object.keys(attributes).length}
          intro="The resulting CSV file will have one column for each attribute selected"
          options={attributes}
          optionListLabels={{
            attributes: 'Select attributes',
            columns: 'Customise column name',
          }}
          onSetOptions={(options) => setAttributes(options)}
          editColumnNames
        />
      )}
      <OptionGroup
        groupId="support"
        label="Support"
        expandedId={expandGroup}
        onExpandGroup={(val) => setExpandGroup(val)}
        activeOptionCount={includeSupport ? 1 : 0}
        optionCount={1}
        active={includeSupport}
        intro="Please note that the values may include indirect support inferred from group statements (depending on the list option selected)"
        onSetActive={(val) => setIncludeSupport(val)}
        onActiveLabel="Include country numbers by level of support"
      />
    </Box>
  );
}

OptionsForIndicators.propTypes = {
  attributes: PropTypes.object,
  setAttributes: PropTypes.func,
  hasAttributes: PropTypes.bool,
  includeSupport: PropTypes.bool,
  setIncludeSupport: PropTypes.func,
};

export default OptionsForIndicators;
