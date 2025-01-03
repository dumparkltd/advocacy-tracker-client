/*
 *
 * OptionsForActors
 *
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { Box, Text } from 'grommet';
import { lowerCase } from 'utils/string';


import { FormattedMessage, injectIntl, intlShape } from 'react-intl';

import appMessages from 'containers/App/messages';
import messages from './messages';

import OptionGroup from './OptionGroup';
export function OptionsForActors({
  hasActions,
  actionsAsRows,
  setActionsAsRows,
  actiontypes,
  setActiontypes,
  hasMembers,
  membertypes,
  setMembertypes,
  hasAssociations,
  associationtypes,
  setAssociationtypes,
  hasUsers,
  includeUsers,
  setIncludeUsers,
  hasAttributes,
  attributes,
  setAttributes,
  hasTaxonomies,
  setTaxonomies,
  taxonomyColumns,
  typeTitle,
  intl,
}) {
  const [expandGroup, setExpandGroup] = useState(null);

  // count active export options
  const activeAttributeCount = hasAttributes && Object.keys(attributes).reduce((counter, attKey) => {
    if (attributes[attKey].active) return counter + 1;
    return counter;
  }, 0);
  const activeTaxonomyCount = hasTaxonomies && Object.keys(taxonomyColumns).reduce((counter, taxId) => {
    if (taxonomyColumns[taxId].active) return counter + 1;
    return counter;
  }, 0);
  const activeActiontypeCount = hasActions && Object.keys(actiontypes).reduce((counter, actiontypeId) => {
    if (actiontypes[actiontypeId].active) return counter + 1;
    return counter;
  }, 0);
  const activeAssociationtypeCount = hasAssociations && Object.keys(associationtypes).reduce((counter, typeId) => {
    if (associationtypes[typeId].active) return counter + 1;
    return counter;
  }, 0);
  const activeMembertypeCount = hasMembers && Object.keys(membertypes).reduce((counter, typeId) => {
    if (membertypes[typeId].active) return counter + 1;
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
            { type: intl.formatMessage(messages.optionGroups.attributeLabel) })}
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
      {hasTaxonomies && (
        <OptionGroup
          groupId="taxonomies"
          label={intl.formatMessage(appMessages.nav.taxonomies)}
          expandedId={expandGroup}
          onExpandGroup={(val) => setExpandGroup(val)}
          activeOptionCount={activeTaxonomyCount}
          optionCount={Object.keys(taxonomyColumns).length}
          intro={intl.formatMessage(messages.optionGroups.introLabelTaxonomy)}
          options={taxonomyColumns}
          optionListLabels={{
            attributes: intl.formatMessage(messages.optionGroups.listLabelCategories),
            columns: intl.formatMessage(messages.optionGroups.listLabelColumns),
          }}
          onSetOptions={(options) => setTaxonomies(options)}
          editColumnNames
        />
      )}
      {hasActions && (
        <OptionGroup
          groupId="actions"
          label={intl.formatMessage(appMessages.nav.actions)}
          expandedId={expandGroup}
          onExpandGroup={(val) => setExpandGroup(val)}
          activeOptionCount={activeActiontypeCount}
          optionCount={Object.keys(actiontypes).length}
          introNode={(
            <Box gap="small">
              <Text size="small">
                <FormattedMessage
                  {...messages.optionGroups.introNodeDefault}
                  values={{ type: lowerCase(intl.formatMessage(appMessages.nav.actions)) }}
                />
                <FormattedMessage {...messages.optionGroups.introNodeAlternativeActor} />
              </Text>
              {hasAssociations && (
                <Text size="small">
                  <FormattedMessage
                    {...messages.optionGroups.introNodeHasAssociations}
                    values={{ type: lowerCase(typeTitle) }}
                  />
                </Text>
              )}
              {!hasAssociations && hasMembers && (
                <Text size="small">
                  <FormattedMessage
                    {...messages.optionGroups.introNodeHasMembersNoAssociation}
                    values={{ type: lowerCase(typeTitle) }}
                  />
                </Text>
              )}
            </Box>
          )}
          options={actiontypes}
          optionListLabels={{
            attributes: intl.formatMessage(messages.optionGroups.listLabelAttributes,
              { type: intl.formatMessage(messages.optionGroups.activityLabel) }),
          }}
          onSetOptions={(options) => setActiontypes(options)}
          onSetAsRows={(val) => setActionsAsRows(val)}
          asRows={actionsAsRows}
          asRowsDisabled={activeActiontypeCount === 0}
          asRowsLabels={{
            columns: intl.formatMessage(messages.optionGroups.asRowsLabelsActivity, { type: 'columns' }),
            rows: intl.formatMessage(messages.optionGroups.asRowsLabelsActivity, { type: 'rows' }),
          }}
        />
      )}
      {hasAssociations && (
        <OptionGroup
          groupId="associations"
          label={intl.formatMessage(messages.optionGroups.associationsLabel)}
          expandedId={expandGroup}
          onExpandGroup={(val) => setExpandGroup(val)}
          activeOptionCount={activeAssociationtypeCount}
          optionCount={Object.keys(associationtypes).length}
          intro={intl.formatMessage(messages.optionGroups.introLabelDefault,
            { type: intl.formatMessage(messages.optionGroups.associationLabel) })}
          options={associationtypes}
          optionListLabels={{
            attributes: intl.formatMessage(messages.optionGroups.listLabelTypes,
              { type: intl.formatMessage(messages.optionGroups.associationLabel) }),
          }}
          onSetOptions={(options) => setAssociationtypes(options)}
        />
      )}
      {hasMembers && (
        <OptionGroup
          groupId="members"
          label={intl.formatMessage(messages.optionGroups.membersLabel)}
          expandedId={expandGroup}
          onExpandGroup={(val) => setExpandGroup(val)}
          activeOptionCount={activeMembertypeCount}
          optionCount={Object.keys(membertypes).length}
          intro={intl.formatMessage(messages.optionGroups.introLabelGroups,
            { type: intl.formatMessage(messages.optionGroups.memberLabel) })}
          options={membertypes}
          optionListLabels={{
            attributes: intl.formatMessage(messages.optionGroups.listLabelAttributes,
              { type: intl.formatMessage(messages.optionGroups.memberLabel) }),
          }}
          onSetOptions={(options) => setMembertypes(options)}
        />
      )}
      {hasUsers && (
        <OptionGroup
          groupId="users"
          label={intl.formatMessage(appMessages.entities.users.plural)}
          expandedId={expandGroup}
          onExpandGroup={(val) => setExpandGroup(val)}
          activeOptionCount={includeUsers ? 1 : 0}
          optionCount={1}
          active={includeUsers}
          onSetActive={(val) => setIncludeUsers(val)}
          onActiveLabel={intl.formatMessage(messages.optionGroups.onActiveUserLabel)}
        />
      )}
    </Box>
  );
}

OptionsForActors.propTypes = {
  hasUsers: PropTypes.bool,
  includeUsers: PropTypes.bool,
  setIncludeUsers: PropTypes.func,
  intl: intlShape.isRequired,
  // attributes
  attributes: PropTypes.object,
  hasAttributes: PropTypes.bool,
  setAttributes: PropTypes.func,
  // taxonomies
  hasTaxonomies: PropTypes.bool,
  setTaxonomies: PropTypes.func,
  taxonomyColumns: PropTypes.object,
  // actions as active actor
  actiontypes: PropTypes.object,
  hasActions: PropTypes.bool,
  setActiontypes: PropTypes.func,
  actionsAsRows: PropTypes.bool,
  setActionsAsRows: PropTypes.func,
  // members (similar to child actors)
  hasMembers: PropTypes.bool,
  membertypes: PropTypes.object,
  setMembertypes: PropTypes.func,
  // associations (member of, similar to parent actors)
  hasAssociations: PropTypes.bool,
  associationtypes: PropTypes.object,
  setAssociationtypes: PropTypes.func,
  typeTitle: PropTypes.string,
};

export default injectIntl(OptionsForActors);
