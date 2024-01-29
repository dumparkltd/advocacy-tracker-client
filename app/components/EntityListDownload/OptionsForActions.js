/*
 *
 * OptionsForActions
 *
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';

import {
  Box,
  Text,
} from 'grommet';

import appMessages from 'containers/App/messages';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import OptionGroup from './OptionGroup';

import messages from './messages';

export function OptionsForActions({
  actorsAsRows,
  setActorsAsRows,
  indicatorsAsRows,
  setIndicatorsAsRows,
  indicatorsActive,
  setIndicatorsActive,
  includeUsers,
  setIncludeUsers,
  attributes,
  setAttributes,
  taxonomyColumns,
  setTaxonomies,
  actortypes,
  setActortypes,
  targettypes,
  setTargettypes,
  parenttypes,
  setParenttypes,
  childtypes,
  setChildtypes,
  resourcetypes,
  setResourcetypes,
  hasAttributes,
  hasTaxonomies,
  hasActors,
  hasTargets,
  hasParentActions,
  hasChildActions,
  hasResources,
  hasUsers,
  hasIndicators,
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
  const activeActortypeCount = hasActors && Object.keys(actortypes).reduce((counter, actortypeId) => {
    if (actortypes[actortypeId].active) return counter + 1;
    return counter;
  }, 0);
  const activeTargettypeCount = hasTargets && Object.keys(targettypes).reduce((counter, actortypeId) => {
    if (targettypes[actortypeId].active) return counter + 1;
    return counter;
  }, 0);
  const activeParenttypeCount = hasParentActions && Object.keys(parenttypes).reduce((counter, parenttypeId) => {
    if (parenttypes[parenttypeId].active) return counter + 1;
    return counter;
  }, 0);
  const activeChildtypeCount = hasChildActions && Object.keys(childtypes).reduce((counter, childtypeId) => {
    if (childtypes[childtypeId].active) return counter + 1;
    return counter;
  }, 0);
  const activeResourcetypeCount = hasResources && Object.keys(resourcetypes).reduce((counter, resourcetypeId) => {
    if (resourcetypes[resourcetypeId].active) return counter + 1;
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
      {hasActors && (
        <OptionGroup
          groupId="actors"
          label={intl.formatMessage(appMessages.nav.actors)}
          expandedId={expandGroup}
          onExpandGroup={(val) => setExpandGroup(val)}
          activeOptionCount={activeActortypeCount}
          optionCount={Object.keys(actortypes).length}
          introNode={(
            <Box gap="small">
              <Text size="small">
                <FormattedMessage {...messages.optionGroups.introNode.actors.default} />
                {(!indicatorsAsRows || !indicatorsActive) && <FormattedMessage {...messages.optionGroups.introNode.actors.noIndicatorInactiveAsRows} />}
                {indicatorsAsRows && indicatorsActive && <FormattedMessage {...messages.optionGroups.introNode.actors.indicatorActiveAsRows} />}
              </Text>
            </Box>
          )}
          options={actortypes}
          optionListLabels={{
            attributes: intl.formatMessage(messages.optionGroups.listLabelAttributes.actors),
          }}
          onSetOptions={(options) => setActortypes(options)}
          onSetAsRows={(val) => setActorsAsRows(val)}
          asRows={actorsAsRows}
          asRowsDisabled={activeActortypeCount === 0}
          asRowsLabels={{
            columns: intl.formatMessage(messages.optionGroups.listLabelAttributes.actors),
            rows: indicatorsAsRows
              ? intl.formatMessage(messages.optionGroups.asRowsLabels.actorRowsAsIndicator)
              : intl.formatMessage(messages.optionGroups.asRowsLabels.actorsRows),
          }}
        />
      )}
      {hasTargets && (
        <OptionGroup
          groupId="targets"
          label={intl.formatMessage(appMessages.nav.targets)}
          expandedId={expandGroup}
          onExpandGroup={(val) => setExpandGroup(val)}
          activeOptionCount={activeTargettypeCount}
          optionCount={Object.keys(targettypes).length}
          intro={intl.formatMessage(messages.optionGroups.introLabels.targets)}
          options={targettypes}
          optionListLabels={{
            attributes: intl.formatMessage(messages.optionGroups.listLabelAttributes.types),
          }}
          onSetOptions={(options) => setTargettypes(options)}
        />
      )}
      {hasParentActions && (
        <OptionGroup
          groupId="parents"
          label={intl.formatMessage(appMessages.nav.parents)}
          expandedId={expandGroup}
          onExpandGroup={(val) => setExpandGroup(val)}
          activeOptionCount={activeParenttypeCount}
          optionCount={Object.keys(parenttypes).length}
          intro={intl.formatMessage(messages.optionGroups.introLabels.parents)}
          options={parenttypes}
          optionListLabels={{
            attributes: intl.formatMessage(messages.optionGroups.listLabelAttributes.parents),
          }}
          onSetOptions={(options) => setParenttypes(options)}
        />
      )}
      {hasChildActions && (
        <OptionGroup
          groupId="children"
          label={intl.formatMessage(appMessages.nav.children)}
          expandedId={expandGroup}
          onExpandGroup={(val) => setExpandGroup(val)}
          activeOptionCount={activeChildtypeCount}
          optionCount={Object.keys(childtypes).length}
          intro={intl.formatMessage(messages.optionGroups.introLabels.children)}
          options={childtypes}
          optionListLabels={{
            attributes: intl.formatMessage(messages.optionGroups.listLabelAttributes.children),
          }}
          onSetOptions={(options) => setChildtypes(options)}
        />
      )}
      {hasResources && (
        <OptionGroup
          groupId="resources"
          label={intl.formatMessage(appMessages.nav.resources)}
          expandedId={expandGroup}
          onExpandGroup={(val) => setExpandGroup(val)}
          activeOptionCount={activeResourcetypeCount}
          optionCount={Object.keys(resourcetypes).length}
          intro={intl.formatMessage(messages.optionGroups.introLabels.resources)}
          options={resourcetypes}
          optionListLabels={{
            attributes: intl.formatMessage(messages.optionGroups.listLabelAttributes.resources),
          }}
          onSetOptions={(options) => setResourcetypes(options)}
        />
      )}
      {hasIndicators && (
        <OptionGroup
          groupId="indicators"
          label={intl.formatMessage(messages.optionGroups.label.topics)}
          expandedId={expandGroup}
          onExpandGroup={(val) => setExpandGroup(val)}
          activeOptionCount={indicatorsActive ? 1 : 0}
          optionCount={1}
          introNode={(
            <Box gap="xsmall">
              <Text size="small">
                <FormattedMessage {...messages.optionGroups.introNode.indicators.default} />
                {!actorsAsRows && <FormattedMessage {...messages.optionGroups.introNode.indicators.notActorAsRows} />}
                {actorsAsRows && <FormattedMessage {...messages.optionGroups.introNode.indicators.actorAsRows} />}
              </Text>
            </Box>
          )}
          active={indicatorsActive}
          onSetActive={(val) => setIndicatorsActive(val)}
          onActiveLabel={intl.formatMessage(messages.optionGroups.activeLabels.topics)}
          onSetAsRows={(val) => setIndicatorsAsRows(val)}
          asRows={indicatorsAsRows}
          asRowsDisabled={!indicatorsActive}
          asRowsLabels={{
            columns: intl.formatMessage(messages.optionGroups.asRowsLabels.topicColumns),
            rows: actorsAsRows
              ? intl.formatMessage(messages.optionGroups.asRowsLabels.indicatorRowsActorAsRow)
              : intl.formatMessage(messages.optionGroups.asRowsLabels.indicatorRows),
          }}
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
          onActiveLabel={intl.formatMessage(messages.optionGroups.activeLabels.users)}
        />
      )}
    </Box>
  );
}

OptionsForActions.propTypes = {
  intl: intlShape.isRequired,
  actorsAsRows: PropTypes.bool,
  setActorsAsRows: PropTypes.func,
  indicatorsAsRows: PropTypes.bool,
  setIndicatorsAsRows: PropTypes.func,
  indicatorsActive: PropTypes.bool,
  setIndicatorsActive: PropTypes.func,
  includeUsers: PropTypes.bool,
  setIncludeUsers: PropTypes.func,
  attributes: PropTypes.object,
  setAttributes: PropTypes.func,
  taxonomyColumns: PropTypes.object,
  setTaxonomies: PropTypes.func,
  actortypes: PropTypes.object,
  setActortypes: PropTypes.func,
  targettypes: PropTypes.object,
  setTargettypes: PropTypes.func,
  parenttypes: PropTypes.object,
  setParenttypes: PropTypes.func,
  childtypes: PropTypes.object,
  setChildtypes: PropTypes.func,
  resourcetypes: PropTypes.object,
  setResourcetypes: PropTypes.func,
  hasActors: PropTypes.bool,
  hasTargets: PropTypes.bool,
  hasParentActions: PropTypes.bool,
  hasChildActions: PropTypes.bool,
  hasResources: PropTypes.bool,
  hasUsers: PropTypes.bool,
  hasIndicators: PropTypes.bool,
  hasAttributes: PropTypes.bool,
  hasTaxonomies: PropTypes.bool,
};

export default injectIntl(OptionsForActions);
