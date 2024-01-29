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
import OptionGroup from './OptionGroup';
import messages from './messages';
export function OptionsForActors({
  hasActions,
  actionsAsRows,
  setActionsAsRows,
  actiontypes,
  setActiontypes,
  hasActionsAsTarget,
  actiontypesAsTarget,
  setActiontypesAsTarget,
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
  const activeActiontypeAsTargetCount = hasActionsAsTarget && Object.keys(actiontypesAsTarget).reduce((counter, actiontypeId) => {
    if (actiontypesAsTarget[actiontypeId].active) return counter + 1;
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
          intro={intl.formatMessage(messages.optionGroups.introLabels.attributes)}
          options={attributes}
          optionListLabels={{
            attributes: intl.formatMessage(messages.optionGroups.listLabelAttributes.attributes),
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
          intro={intl.formatMessage(messages.optionGroups.introLabels.categories)}
          options={taxonomyColumns}
          optionListLabels={{
            attributes: intl.formatMessage(messages.optionGroups.listLabelAttributes.category),
            columns: intl.formatMessage(messages.optionGroups.listLabelColumns),
          }}
          onSetOptions={(options) => setTaxonomies(options)}
          editColumnNames
        />
      )}
      {hasActions && (
        <OptionGroup
          groupId="actions"
          label={intl.formatMessage(messages.optionGroups.label.actionsAsTarget)}
          expandedId={expandGroup}
          onExpandGroup={(val) => setExpandGroup(val)}
          activeOptionCount={activeActiontypeCount}
          optionCount={Object.keys(actiontypes).length}
          introNode={(
            <Box gap="small">
              <Text size="small">
                <FormattedMessage {...messages.optionGroups.introNode.actions.default} />
              </Text>
              {hasAssociations && (
                <Text size="small">
                  <FormattedMessage
                    {...messages.optionGroups.introNode.actions.hasAssociations}
                    value={{ typeTitle: lowerCase(typeTitle) }}
                  />
                </Text>
              )}
              {!hasAssociations && hasMembers && (
                <Text size="small">
                  <FormattedMessage
                    {...messages.optionGroups.introNode.actions.hasMembersNoAssociation}
                    value={{ typeTitle: lowerCase(typeTitle) }}
                  />
                </Text>
              )}
            </Box>
          )}
          options={actiontypes}
          optionListLabels={{
            attributes: intl.formatMessage(messages.optionGroups.listLabelAttributes.activities),
          }}
          onSetOptions={(options) => setActiontypes(options)}
          onSetAsRows={(val) => setActionsAsRows(val)}
          asRows={actionsAsRows}
          asRowsDisabled={activeActiontypeCount === 0}
          asRowsLabels={{
            columns: intl.formatMessage(messages.optionGroups.asRowsLabels.activityColumns),
            rows: intl.formatMessage(messages.optionGroups.asRowsLabels.activityRows),
          }}
        />
      )}
      {hasActionsAsTarget && (
        <OptionGroup
          groupId="actions-as-target"
          label={intl.formatMessage(messages.optionGroups.label.actionsAsTarget)}
          expandedId={expandGroup}
          onExpandGroup={(val) => setExpandGroup(val)}
          activeOptionCount={activeActiontypeAsTargetCount}
          optionCount={Object.keys(actiontypesAsTarget).length}
          introNode={(
            <Box gap="small">
              <Text size="small">
                <FormattedMessage {...messages.optionGroups.introNode.actionAsTarget.default} />
              </Text>
              {hasAssociations && (
                <Text size="small">
                  <FormattedMessage
                    {...messages.optionGroups.introNode.actionAsTarget.hasAssociations}
                    value={{ typeTitle: lowerCase(typeTitle) }}
                  />
                </Text>
              )}
              {!hasAssociations && hasMembers && (
                <Text size="small">
                  <FormattedMessage
                    {...messages.optionGroups.introNode.actionAsTarget.hasMembersNoAssociation}
                    value={{ typeTitle: lowerCase(typeTitle) }}
                  />
                </Text>
              )}
            </Box>
          )}
          options={actiontypesAsTarget}
          optionListLabels={{
            attributes: intl.formatMessage(messages.optionGroups.listLabelAttributes.actionsAsTarget),
          }}
          onSetOptions={(options) => setActiontypesAsTarget(options)}
        />
      )}
      {hasAssociations && (
        <OptionGroup
          groupId="associations"
          label={intl.formatMessage(messages.optionGroups.label.associations)}
          expandedId={expandGroup}
          onExpandGroup={(val) => setExpandGroup(val)}
          activeOptionCount={activeAssociationtypeCount}
          optionCount={Object.keys(associationtypes).length}
          intro={intl.formatMessage(messages.optionGroups.introLabels.associations)}
          options={associationtypes}
          optionListLabels={{
            attributes: intl.formatMessage(messages.optionGroups.listLabelAttributes.associations),
          }}
          onSetOptions={(options) => setAssociationtypes(options)}
        />
      )}
      {hasMembers && (
        <OptionGroup
          groupId="members"
          label={intl.formatMessage(messages.optionGroups.label.members)}
          expandedId={expandGroup}
          onExpandGroup={(val) => setExpandGroup(val)}
          activeOptionCount={activeMembertypeCount}
          optionCount={Object.keys(membertypes).length}
          intro={intl.formatMessage(messages.optionGroups.introLabels.members)}
          options={membertypes}
          optionListLabels={{
            attributes: intl.formatMessage(messages.optionGroups.listLabelAttributes.members),
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
  // actions as targeted actor
  hasActionsAsTarget: PropTypes.bool,
  actiontypesAsTarget: PropTypes.object,
  setActiontypesAsTarget: PropTypes.func,
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
