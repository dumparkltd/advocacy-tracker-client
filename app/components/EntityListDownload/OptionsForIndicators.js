/*
 *
 * OptionsForIndicators
 *
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { Box } from 'grommet';

import { injectIntl, intlShape } from 'react-intl';

import { lowerCase } from 'utils/string';

import appMessages from 'containers/App/messages';
import OptionGroup from './OptionGroup';

import messages from './messages';
export function OptionsForIndicators({
  attributes,
  setAttributes,
  hasAttributes,
  includeSupport,
  setIncludeSupport,
  intl,
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
          label={intl.formatMessage(appMessages.nav.attributes)}
          expandedId={expandGroup}
          onExpandGroup={(val) => setExpandGroup(val)}
          activeOptionCount={activeAttributeCount}
          optionCount={Object.keys(attributes).length}
          intro={intl.formatMessage(messages.optionGroups.introLabelDefault,
            { type: 'attribute' })}
          options={attributes}
          optionListLabels={{
            attributes: intl.formatMessage(messages.optionGroups.listLabelAttributes,
              { type: lowerCase(intl.formatMessage(appMessages.nav.attributes)) }),
            columns: intl.formatMessage(messages.optionGroups.listLabelColumns),
          }}
          onSetOptions={(options) => setAttributes(options)}
          editColumnNames
        />
      )}
      <OptionGroup
        groupId="support"
        label={intl.formatMessage(messages.optionGroups.label.support)}
        expandedId={expandGroup}
        onExpandGroup={(val) => setExpandGroup(val)}
        activeOptionCount={includeSupport ? 1 : 0}
        optionCount={1}
        active={includeSupport}
        intro={intl.formatMessage(messages.optionGroups.introLabelSupport)}
        onSetActive={(val) => setIncludeSupport(val)}
        onActiveLabel={intl.formatMessage(messages.optionGroups.onActiveSupportLabel)}
      />
    </Box>
  );
}

OptionsForIndicators.propTypes = {
  intl: intlShape.isRequired,
  attributes: PropTypes.object,
  setAttributes: PropTypes.func,
  hasAttributes: PropTypes.bool,
  includeSupport: PropTypes.bool,
  setIncludeSupport: PropTypes.func,
};

export default injectIntl(OptionsForIndicators);
