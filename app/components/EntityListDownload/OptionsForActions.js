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

import OptionGroup from './OptionGroup';

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
      {hasTaxonomies && (
        <OptionGroup
          groupId="taxonomies"
          label="Categories"
          expandedId={expandGroup}
          onExpandGroup={(val) => setExpandGroup(val)}
          activeOptionCount={activeTaxonomyCount}
          optionCount={Object.keys(taxonomyColumns).length}
          intro="The resulting CSV file will have one column for each category group (taxonomy) selected"
          options={taxonomyColumns}
          optionListLabels={{
            attributes: 'Select category groups',
            columns: 'Customise column name',
          }}
          onSetOptions={(options) => setTaxonomies(options)}
          editColumnNames
        />
      )}
      {hasActors && (
        <OptionGroup
          groupId="actors"
          label="Actors"
          expandedId={expandGroup}
          onExpandGroup={(val) => setExpandGroup(val)}
          activeOptionCount={activeActortypeCount}
          optionCount={Object.keys(actortypes).length}
          introNode={(
            <Box gap="small">
              <Text size="small">
                By default, the resulting CSV file will have one column for each type of actor selected.
                {(!indicatorsAsRows || !indicatorsActive) && ' Alternatively you can chose to include actors as rows, resulting in one row per activity and actor.'}
                {indicatorsAsRows && indicatorsActive && ' Alternatively you can chose to include actors as rows, resulting in one row per activity, topic and actor.'}
              </Text>
            </Box>
          )}
          options={actortypes}
          optionListLabels={{
            attributes: 'Select actor types',
          }}
          onSetOptions={(options) => setActortypes(options)}
          onSetAsRows={(val) => setActorsAsRows(val)}
          asRows={actorsAsRows}
          asRowsDisabled={activeActortypeCount === 0}
          asRowsLabels={{
            columns: 'Include actors as columns (one column for each actor type)',
            rows: indicatorsAsRows
              ? 'Include actors as rows (one row for each activity, topic and actor)'
              : 'Include actors as rows (one row for each activity and actor)',
          }}
        />
      )}
      {hasTargets && (
        <OptionGroup
          groupId="targets"
          label="Targets"
          expandedId={expandGroup}
          onExpandGroup={(val) => setExpandGroup(val)}
          activeOptionCount={activeTargettypeCount}
          optionCount={Object.keys(targettypes).length}
          intro="By default, the resulting CSV file will have one column for each type of target selected"
          options={targettypes}
          optionListLabels={{
            attributes: 'Select target types',
          }}
          onSetOptions={(options) => setTargettypes(options)}
        />
      )}
      {hasParentActions && (
        <OptionGroup
          groupId="parents"
          label="Parent activities"
          expandedId={expandGroup}
          onExpandGroup={(val) => setExpandGroup(val)}
          activeOptionCount={activeParenttypeCount}
          optionCount={Object.keys(parenttypes).length}
          intro="By default, the resulting CSV file will have one column for each type of parent activity selected."
          options={parenttypes}
          optionListLabels={{
            attributes: 'Select parent activity types',
          }}
          onSetOptions={(options) => setParenttypes(options)}
        />
      )}
      {hasChildActions && (
        <OptionGroup
          groupId="children"
          label="Child activities"
          expandedId={expandGroup}
          onExpandGroup={(val) => setExpandGroup(val)}
          activeOptionCount={activeChildtypeCount}
          optionCount={Object.keys(childtypes).length}
          intro="By default, the resulting CSV file will have one column for each type of child activity selected."
          options={childtypes}
          optionListLabels={{
            attributes: 'Select child activity types',
          }}
          onSetOptions={(options) => setChildtypes(options)}
        />
      )}
      {hasResources && (
        <OptionGroup
          groupId="resources"
          label="Resources"
          expandedId={expandGroup}
          onExpandGroup={(val) => setExpandGroup(val)}
          activeOptionCount={activeResourcetypeCount}
          optionCount={Object.keys(resourcetypes).length}
          intro="By default, the resulting CSV file will have one column for each type of resource selected."
          options={resourcetypes}
          optionListLabels={{
            attributes: 'Select resource types',
          }}
          onSetOptions={(options) => setResourcetypes(options)}
        />
      )}
      {hasIndicators && (
        <OptionGroup
          groupId="indicators"
          label="Topics"
          expandedId={expandGroup}
          onExpandGroup={(val) => setExpandGroup(val)}
          activeOptionCount={indicatorsActive ? 1 : 0}
          optionCount={1}
          introNode={(
            <Box gap="xsmall">
              <Text size="small">
                By default, the resulting CSV file will have one column for each topic.
                {!actorsAsRows && ' Alternatively you can chose to include topics as rows, resulting in one row per activity and topic'}
                {actorsAsRows && ' Alternatively you can chose to include topics as rows, resulting in one row per activity, actor and topic'}
              </Text>
            </Box>
          )}
          active={indicatorsActive}
          onSetActive={(val) => setIndicatorsActive(val)}
          onActiveLabel="Include topics"
          onSetAsRows={(val) => setIndicatorsAsRows(val)}
          asRows={indicatorsAsRows}
          asRowsDisabled={!indicatorsActive}
          asRowsLabels={{
            columns: 'Include topics as columns (one column for each topic)',
            rows: actorsAsRows
              ? 'Include topics as rows (one row for each activity, actor and topic)'
              : 'Include topics as rows (one row for each activity and topic)',
          }}
        />
      )}
      {hasUsers && (
        <OptionGroup
          groupId="users"
          label="Users"
          expandedId={expandGroup}
          onExpandGroup={(val) => setExpandGroup(val)}
          activeOptionCount={includeUsers ? 1 : 0}
          optionCount={1}
          active={includeUsers}
          onSetActive={(val) => setIncludeUsers(val)}
          onActiveLabel="Include users"
        />
      )}
    </Box>
  );
}

OptionsForActions.propTypes = {
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

export default OptionsForActions;
