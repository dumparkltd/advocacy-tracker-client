/*
 *
 * EntityListMain
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Map, List } from 'immutable';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';

import { jumpToComponent } from 'utils/scroll-to-component';
import { lowerCase } from 'utils/string';

import ContainerWrapper from 'components/styled/Container/ContainerWrapper';
import Container from 'components/styled/Container';
import Content from 'components/styled/Content';
import Loading from 'components/Loading';
import ContentHeader from 'components/ContentHeader';
import EntityListSearch from 'components/EntityListSearch';
import EntityListViewOptions from 'components/EntityListViewOptions';
import PrintOnly from 'components/styled/PrintOnly';

import { CONTENT_LIST, PARAMS } from 'containers/App/constants';
import appMessages from 'containers/App/messages';

import EntityListGroups from './EntityListGroups';

import EntityListOptions from './EntityListOptions';
import { getGroupOptions, getGroupValue } from './group-options';
import { groupEntities } from './group-entities';

import messages from './messages';

const EntityListSearchWrapper = styled.div`
  padding-bottom: 1em;
  @media (min-width: ${(props) => props.theme && props.theme.breakpoints ? props.theme.breakpoints.small : '769px'}) {
    padding-bottom: 2em;
  }
`;

const ListEntities = styled.div``;
const ListWrapper = styled.div``;
const PrintHintKey = styled(PrintOnly)`
  font-style: italic;
  font-size: ${(props) => props.theme.sizes.print.smaller};
  margin-bottom: 20px;
`;

class EntityListMain extends React.Component { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    this.ScrollContainer = React.createRef();
    this.ScrollTarget = React.createRef();
    this.ScrollReference = React.createRef();
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.listUpdating) {
      return false;
    }
    if (this.props.listUpdating && !nextProps.listUpdating) {
      return true;
    }
    return this.props.entities !== nextProps.entities
      || this.props.entityIdsSelected !== nextProps.entityIdsSelected
      || this.props.dataReady !== nextProps.dataReady
      || this.props.locationQuery !== nextProps.locationQuery
      || this.props.typeId !== nextProps.typeId
      || this.props.errors !== nextProps.errors;
  }

  scrollToTop = () => {
    jumpToComponent(
      this.ScrollTarget.current,
      this.ScrollReference.current,
      this.ScrollContainer.current
    );
  }

  render() {
    const {
      config,
      header,
      entityTitle,
      dataReady,
      isManager,
      isAnalyst,
      onGroupSelect,
      onSubgroupSelect,
      onSearch,
      taxonomies,
      connections,
      connectedTaxonomies,
      locationQuery,
      entities,
      errors,
      actortypes,
      hasHeader,
      onClearFilters,
      viewOptions,
      hasFilters,
      showCode,
    } = this.props;
    const { intl } = this.context;

    let groupSelectValue = locationQuery.get('group');
    if (config.taxonomies && !groupSelectValue) {
      groupSelectValue = getGroupValue(
        taxonomies,
        config.taxonomies.defaultGroupAttribute,
        1,
      );
    }
    let subgroupSelectValue;
    if (groupSelectValue && groupSelectValue !== PARAMS.GROUP_RESET) {
      subgroupSelectValue = locationQuery.get('subgroup');
    }

    let headerTitle = entities && dataReady
      ? `${entities.size} ${entities.size === 1 ? entityTitle.single : entityTitle.plural}`
      : entityTitle.plural;
    if (hasFilters) {
      headerTitle = `${headerTitle} (filtered)`;
    }

    // group all entities, regardless of page items
    const entityGroups = groupSelectValue
      && taxonomies
      && taxonomies.get(groupSelectValue)
      && groupSelectValue !== PARAMS.GROUP_RESET
      ? groupEntities(
        entities,
        taxonomies,
        connectedTaxonomies,
        config,
        groupSelectValue,
        subgroupSelectValue !== PARAMS.GROUP_RESET && subgroupSelectValue,
        intl || null,
        actortypes,
      )
      : null;

    let subtitle = null;
    if (dataReady && entityGroups && groupSelectValue && intl) {
      const isPlural = entityGroups.size !== 1;
      // disable broken support for connectedTaxonomies
      // let taxId = groupSelectValue;
      // if (taxId.indexOf('x:') > -1 && taxId.split(':').length > 1) {
      //   taxId = taxId.split(':')[1];
      // }
      subtitle = intl.formatMessage(messages.groupSubtitle, {
        size: entityGroups.size,
        type:
          lowerCase(
            intl.formatMessage(
              isPlural
                ? appMessages.entities.taxonomies[groupSelectValue].plural
                : appMessages.entities.taxonomies[groupSelectValue].single
            )
          ),
      });
    }
    const headerActions = dataReady ? header.actions : [];
    return (
      <ContainerWrapper hasHeader={hasHeader} ref={this.ScrollContainer}>
        {dataReady && viewOptions && viewOptions.length > 1 && (
          <EntityListViewOptions options={viewOptions} />
        )}
        <Container ref={this.ScrollReference}>
          <Content>
            <ContentHeader
              type={CONTENT_LIST}
              title={headerTitle}
              subTitle={subtitle}
              buttons={headerActions}
              hasViewOptions={viewOptions && viewOptions.length > 1}
            />
            {!dataReady && <Loading />}
            {dataReady && (
              <ListEntities>
                <PrintHintKey>
                  <FormattedMessage {...messages.printHintKey} />
                </PrintHintKey>
                <EntityListSearchWrapper>
                  <EntityListSearch
                    searchQuery={locationQuery.get('search') || ''}
                    onSearch={onSearch}
                    onClear={onClearFilters}
                  />
                </EntityListSearchWrapper>
                <EntityListOptions
                  groupOptions={getGroupOptions(taxonomies, intl)}
                  subgroupOptions={getGroupOptions(taxonomies, intl)}
                  groupSelectValue={(taxonomies && taxonomies.get(groupSelectValue)) ? groupSelectValue : ''}
                  subgroupSelectValue={(taxonomies && taxonomies.get(subgroupSelectValue)) ? subgroupSelectValue : ''}
                  onGroupSelect={onGroupSelect}
                  onSubgroupSelect={onSubgroupSelect}
                />
                <ListWrapper ref={this.ScrollTarget}>
                  <EntityListGroups
                    entities={entities}
                    errors={errors}
                    onDismissError={this.props.onDismissError}
                    entityGroups={entityGroups}
                    taxonomies={taxonomies}
                    connections={connections}
                    entityIdsSelected={this.props.entityIdsSelected}
                    locationQuery={this.props.locationQuery}
                    groupSelectValue={(taxonomies && taxonomies.get(groupSelectValue)) ? groupSelectValue : ''}
                    subgroupSelectValue={(taxonomies && taxonomies.get(subgroupSelectValue)) ? subgroupSelectValue : ''}
                    onEntityClick={this.props.onEntityClick}
                    entityTitle={entityTitle}
                    config={config}
                    isManager={isManager}
                    isAnalyst={isAnalyst}
                    onPageItemsSelect={(no) => {
                      this.scrollToTop();
                      this.props.onPageItemsSelect(no);
                    }}
                    onPageSelect={(page) => {
                      this.scrollToTop();
                      this.props.onPageSelect(page);
                    }}
                    onEntitySelect={this.props.onEntitySelect}
                    onEntitySelectAll={this.props.onEntitySelectAll}
                    onSortBy={this.props.onSortBy}
                    onSortOrder={this.props.onSortOrder}
                    showCode={showCode}
                  />
                </ListWrapper>
              </ListEntities>
            )}
          </Content>
        </Container>
      </ContainerWrapper>
    );
  }
}

EntityListMain.propTypes = {
  entities: PropTypes.instanceOf(List),
  taxonomies: PropTypes.instanceOf(Map),
  actortypes: PropTypes.instanceOf(Map),
  connections: PropTypes.instanceOf(Map),
  connectedTaxonomies: PropTypes.instanceOf(Map),
  entityIdsSelected: PropTypes.instanceOf(List),
  locationQuery: PropTypes.instanceOf(Map),
  errors: PropTypes.instanceOf(Map),
  // object/arrays
  config: PropTypes.object,
  header: PropTypes.object,
  viewOptions: PropTypes.array,
  entityTitle: PropTypes.object, // single/plural
  // primitive
  dataReady: PropTypes.bool,
  isManager: PropTypes.bool,
  isAnalyst: PropTypes.bool,
  // functions
  onEntityClick: PropTypes.func.isRequired,
  onEntitySelect: PropTypes.func.isRequired,
  onEntitySelectAll: PropTypes.func.isRequired,
  onGroupSelect: PropTypes.func.isRequired,
  onSubgroupSelect: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  onPageSelect: PropTypes.func.isRequired,
  onPageItemsSelect: PropTypes.func.isRequired,
  onSortOrder: PropTypes.func.isRequired,
  onSortBy: PropTypes.func.isRequired,
  onDismissError: PropTypes.func.isRequired,
  listUpdating: PropTypes.bool,
  hasHeader: PropTypes.bool,
  hasFilters: PropTypes.bool,
  onClearFilters: PropTypes.func.isRequired,
  typeId: PropTypes.string,
  showCode: PropTypes.bool,
};

EntityListMain.contextTypes = {
  intl: PropTypes.object.isRequired,
};

export default EntityListMain;
// export default EntityListMain;
