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
import { lowerCase } from 'utils/string';
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
  parenttypes,
  setParenttypes,
  childtypes,
  setChildtypes,
  resourcetypes,
  setResourcetypes,
  hasAttributes,
  hasTaxonomies,
  hasActors,
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
          intro={intl.formatMessage(messages.optionGroups.introLabelDefault,
            { type: intl.formatMessage(messages.optionGroups.attributeLabel) })}
          options={attributes}
          optionListLabels={{
            attributes: intl.formatMessage(messages.optionGroups.listLabelAttributes,
              { type: intl.formatMessage(appMessages.nav.attributes) }),
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
                <FormattedMessage
                  {...messages.optionGroups.introNodeDefault}
                  values={{ type: lowerCase(intl.formatMessage(appMessages.nav.actors)) }}
                />
                {(!indicatorsAsRows || !indicatorsActive)
                  && (
                    <FormattedMessage
                      {...messages.optionGroups.introNodeTypeNotAsRows}
                      values={{ type: lowerCase(intl.formatMessage(appMessages.nav.actors)) }}
                    />
                  )
                }
                {indicatorsAsRows && indicatorsActive
                  && (
                    <FormattedMessage
                      {...messages.optionGroups.introNodeTypeAsRows}
                      values={{ type: lowerCase(intl.formatMessage(appMessages.nav.actors)) }}
                    />
                  )
                }
              </Text>
            </Box>
          )}
          options={actortypes}
          optionListLabels={{
            attributes: intl.formatMessage(messages.optionGroups.listLabelAttributes,
              { type: intl.formatMessage(messages.optionGroups.actorLabel) }),
          }}
          onSetOptions={(options) => setActortypes(options)}
          onSetAsRows={(val) => setActorsAsRows(val)}
          asRows={actorsAsRows}
          asRowsDisabled={activeActortypeCount === 0}
          asRowsLabels={{
            columns: intl.formatMessage(messages.optionGroups.asRowsLabelColumn,
              { type: intl.formatMessage(messages.optionGroups.actorLabel) }),
            rows: indicatorsAsRows
              ? intl.formatMessage(messages.optionGroups.asRowsLabelsAsRow,
                { type: intl.formatMessage(messages.optionGroups.actorLabel) })
              : intl.formatMessage(messages.optionGroups.asRowsLabels,
                { type: intl.formatMessage(messages.optionGroups.actorLabel) }),
          }}
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
          intro={intl.formatMessage(messages.optionGroups.introLabelActivity,
            { type: intl.formatMessage(messages.optionGroups.parentLabel) })}
          options={parenttypes}
          optionListLabels={{
            attributes: intl.formatMessage(messages.optionGroups.listLabelActivity,
              { type: intl.formatMessage(messages.optionGroups.parentLabel) }),
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
          intro={intl.formatMessage(messages.optionGroups.introLabelActivity,
            { type: intl.formatMessage(messages.optionGroups.childLabel) })}
          options={childtypes}
          optionListLabels={{
            attributes: intl.formatMessage(messages.optionGroups.listLabelActivity,
              { type: intl.formatMessage(messages.optionGroups.childLabel) }),
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
          intro={intl.formatMessage(messages.optionGroups.introLabelGroups,
            { type: lowerCase(intl.formatMessage(appMessages.nav.resources)) })}
          options={resourcetypes}
          optionListLabels={{
            attributes: intl.formatMessage(messages.optionGroups.listLabelTypes,
              { type: lowerCase(intl.formatMessage(appMessages.nav.resources)) }),
          }}
          onSetOptions={(options) => setResourcetypes(options)}
        />
      )}
      {hasIndicators && (
        <OptionGroup
          groupId="indicators"
          label={intl.formatMessage(messages.optionGroups.topicsLabel)}
          expandedId={expandGroup}
          onExpandGroup={(val) => setExpandGroup(val)}
          activeOptionCount={indicatorsActive ? 1 : 0}
          optionCount={1}
          introNode={(
            <Box gap="xsmall">
              <Text size="small">
                <FormattedMessage
                  {...messages.optionGroups.introNodeDefault}
                  values={{ type: intl.formatMessage(messages.optionGroups.topicLabel) }}
                />
                {!actorsAsRows
                  && (
                    <FormattedMessage
                      {...messages.optionGroups.introNodeTypeNotAsRows}
                      values={{ type: intl.formatMessage(messages.optionGroups.topicLabel) }}
                    />
                  )}
                {actorsAsRows
                  && (
                    <FormattedMessage
                      {...messages.optionGroups.introNodeTypeAsRows}
                      values={{ type: intl.formatMessage(messages.optionGroups.topicLabel) }}
                    />
                  )}
              </Text>
            </Box>
          )}
          active={indicatorsActive}
          onSetActive={(val) => setIndicatorsActive(val)}
          onActiveLabel={intl.formatMessage(messages.optionGroups.onActiveLabelDefault,
            { type: intl.formatMessage(messages.optionGroups.topicsLabel) })}
          onSetAsRows={(val) => setIndicatorsAsRows(val)}
          asRows={indicatorsAsRows}
          asRowsDisabled={!indicatorsActive}
          asRowsLabels={{
            columns: intl.formatMessage(messages.optionGroups.asRowsLabelColumn,
              { type: intl.formatMessage(messages.optionGroups.topicLabel) }),
            rows: actorsAsRows
              ? intl.formatMessage(messages.optionGroups.asRowsLabelsAsRow,
                { type: intl.formatMessage(messages.optionGroups.topicLabel) })
              : intl.formatMessage(messages.optionGroups.asRowsLabels,
                { type: intl.formatMessage(messages.optionGroups.topicLabel) }),
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
          onActiveLabel={intl.formatMessage(messages.optionGroups.onActiveLabelDefault,
            { type: lowerCase(intl.formatMessage(appMessages.entities.users.plural)) })}
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
  parenttypes: PropTypes.object,
  setParenttypes: PropTypes.func,
  childtypes: PropTypes.object,
  setChildtypes: PropTypes.func,
  resourcetypes: PropTypes.object,
  setResourcetypes: PropTypes.func,
  hasActors: PropTypes.bool,
  hasParentActions: PropTypes.bool,
  hasChildActions: PropTypes.bool,
  hasResources: PropTypes.bool,
  hasUsers: PropTypes.bool,
  hasIndicators: PropTypes.bool,
  hasAttributes: PropTypes.bool,
  hasTaxonomies: PropTypes.bool,
};

export default injectIntl(OptionsForActions);
