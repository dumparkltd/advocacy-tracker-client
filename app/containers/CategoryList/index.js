/*
 *
 * Taxonomies
 *
 */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';


// containers
import {
  loadEntitiesIfNeeded,
  updatePath,
  printView,
} from 'containers/App/actions';

import { keydownHandlerPrint } from 'utils/print';
import { usePrint } from 'containers/App/PrintContext';
import HeaderPrint from 'components/Header/HeaderPrint';

import {
  selectTaxonomiesSorted,
  selectReady,
  selectIsUserMember,
  selectActortypes,
  selectActiontypes,
} from 'containers/App/selectors';
import { CONTENT_LIST, PRINT_TYPES } from 'containers/App/constants';
import { ROUTES, DEFAULT_TAXONOMY } from 'themes/config';
import appMessages from 'containers/App/messages';

// components
import ContainerWithSidebar from 'components/styled/Container/ContainerWithSidebar';
import Container from 'components/styled/Container';
import ContentSimple from 'components/styled/ContentSimple';
import Loading from 'components/Loading';

import ContentHeader from 'containers/ContentHeader';
import CategoryListItems from 'components/categoryList/CategoryListItems';
import TaxonomySidebar from 'components/categoryList/TaxonomySidebar';
import EntityListSidebarLoading from 'components/EntityListSidebarLoading';

// relative
import messages from './messages';
import { DEPENDENCIES, SORT_OPTION_DEFAULT } from './constants';
import {
  selectTaxonomy,
  selectCategoryGroups,
  selectUserOnlyCategoryGroups,
} from './selectors';
import { updateSort } from './actions';

const UsersOnly = styled.h4`
  margin-top: 4em;
`;
const Description = styled.div`
  margin-bottom: 2em;
`;

const Markdown = styled(ReactMarkdown)`
  font-size: ${({ theme }) => theme.sizes.text.markdownMobile};
  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    font-size: ${({ theme }) => theme.sizes.text.markdown};
  }
  @media print {
    font-size: ${({ theme }) => theme.sizes.print.markdown};
  }
`;
const getTaxTitle = (id, intl) => intl.formatMessage(appMessages.entities.taxonomies[id].plural);

const getTaxDescription = (id, intl) => intl.formatMessage(appMessages.entities.taxonomies[id].description);

const getTaxButtonTitle = (id, intl) => intl.formatMessage(
  appMessages.entities.taxonomies[id].shortSingle || appMessages.entities.taxonomies[id].single
);


export function CategoryList({
  taxonomy,
  taxonomies,
  categoryGroups,
  userOnlyCategoryGroups,
  dataReady,
  isMember,
  onPageLink,
  onTaxonomyLink,
  actortypes,
  actiontypes,
  onSort,
  location,
  intl,
  onLoadEntitiesIfNeeded,
  handleNew,
  redirectToDefaultTaxonomy,
  onSetPrintView,
}) {
  useEffect(() => {
    if (!dataReady) onLoadEntitiesIfNeeded();
  }, [dataReady]);
  useEffect(() => {
    if (!taxonomy) redirectToDefaultTaxonomy(DEFAULT_TAXONOMY);
  }, [taxonomy]);
  const mySetPrintView = () => onSetPrintView({
    printType: PRINT_TYPES.LIST,
    printOrientation: 'portrait',
    printSize: 'A4',
  });
  const keydownHandler = (e) => {
    keydownHandlerPrint(e, mySetPrintView);
  };
  useEffect(() => {
    document.addEventListener('keydown', keydownHandler);
    return () => {
      document.removeEventListener('keydown', keydownHandler);
    };
  }, []);
  const reference = taxonomy && taxonomy.get('id');
  const contentTitle = (taxonomy && typeof reference !== 'undefined') ? getTaxTitle(reference, intl) : '';
  const contentDescription = (taxonomy && typeof reference !== 'undefined') && getTaxDescription(reference, intl);
  const buttons = [];
  if (dataReady && !!reference && window.print) {
    buttons.push({
      type: 'icon',
      onClick: mySetPrintView,
      title: 'Print',
      icon: 'print',
    });
    if (isMember && typeof reference !== 'undefined') {
      buttons.push({
        type: 'add',
        title: [
          intl.formatMessage(appMessages.buttons.add),
          {
            title: getTaxButtonTitle(reference, intl),
            hiddenSmall: true,
          },
        ],
        onClick: () => handleNew(reference),
      });
    }
  }

  const hasUserCategories = isMember
    && dataReady
    && userOnlyCategoryGroups
    && userOnlyCategoryGroups.reduce((memo, group) => memo || (group.get('categories') && group.get('categories').size > 0),
      false);
  const isPrintView = usePrint();
  return (
    <div>
      <Helmet
        title={`${intl.formatMessage(messages.supTitle)}: ${contentTitle}`}
        meta={[
          { name: 'description', content: intl.formatMessage(messages.metaDescription) },
        ]}
      />
      {!dataReady && (
        <EntityListSidebarLoading responsiveSmall />
      )}
      {dataReady && typeof reference !== 'undefined' && (
        <TaxonomySidebar
          taxonomies={taxonomies}
          active={reference}
          actortypes={actortypes}
          actiontypes={actiontypes}
          onTaxonomyLink={onTaxonomyLink}
        />
      )}
      <ContainerWithSidebar sidebarResponsiveSmall isPrint={isPrintView}>
        {isPrintView && <HeaderPrint />}
        <Container isPrint={isPrintView}>
          <ContentSimple isPrint={isPrintView}>
            <ContentHeader
              type={CONTENT_LIST}
              icon="categories"
              supTitle={intl.formatMessage(messages.supTitle)}
              title={contentTitle}
              buttons={buttons}
            />
            {contentDescription && (
              <Description>
                <Markdown source={contentDescription} className="react-markdown" />
              </Description>
            )}
            {!dataReady && <Loading />}
            {dataReady && taxonomy && (
              <CategoryListItems
                taxonomy={taxonomy}
                categoryGroups={categoryGroups}
                onPageLink={onPageLink}
                onSort={onSort}
                sortOptions={[SORT_OPTION_DEFAULT]}
                sortBy={location.query && location.query.sort}
                sortOrder={location.query && location.query.order}
                isPrintView={isPrintView}
              />
            )}
            {hasUserCategories && (
              <UsersOnly>
                <FormattedMessage {...messages.usersOnly} />
              </UsersOnly>
            )}
            {dataReady && taxonomy && hasUserCategories && (
              <CategoryListItems
                taxonomy={taxonomy}
                categoryGroups={userOnlyCategoryGroups}
                onPageLink={onPageLink}
                onSort={onSort}
                sortOptions={[SORT_OPTION_DEFAULT]}
                sortBy="title"
                sortOrder={location.query && location.query.order}
                userOnly
              />
            )}
          </ContentSimple>
        </Container>
      </ContainerWithSidebar>
    </div>
  );
}

CategoryList.propTypes = {
  loadEntitiesIfNeeded: PropTypes.func,
  redirectToDefaultTaxonomy: PropTypes.func,
  onPageLink: PropTypes.func,
  onTaxonomyLink: PropTypes.func,
  onSort: PropTypes.func,
  handleNew: PropTypes.func,
  taxonomy: PropTypes.object,
  taxonomies: PropTypes.object,
  categoryGroups: PropTypes.object,
  userOnlyCategoryGroups: PropTypes.object,
  dataReady: PropTypes.bool,
  isMember: PropTypes.bool,
  location: PropTypes.object,
  actortypes: PropTypes.object,
  actiontypes: PropTypes.object,
  onLoadEntitiesIfNeeded: PropTypes.func,
  onSetPrintView: PropTypes.func,
  intl: intlShape,
};

const mapStateToProps = (state, props) => ({
  actortypes: selectActortypes(state),
  actiontypes: selectActiontypes(state),
  isMember: selectIsUserMember(state),
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  taxonomies: selectTaxonomiesSorted(state),
  taxonomy: selectTaxonomy(state, { id: props.params.id }),
  categoryGroups: selectCategoryGroups(
    state,
    {
      id: typeof props.params.id !== 'undefined' ? props.params.id : DEFAULT_TAXONOMY,
    },
  ),
  userOnlyCategoryGroups: selectUserOnlyCategoryGroups(
    state,
    {
      id: typeof props.params.id !== 'undefined' ? props.params.id : DEFAULT_TAXONOMY,
    },
  ),
});

function mapDispatchToProps(dispatch) {
  return {
    onLoadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    redirectToDefaultTaxonomy: (taxonomyId) => {
      dispatch(updatePath(`${ROUTES.TAXONOMIES}/${taxonomyId}`, { replace: true }));
    },
    handleNew: (taxonomyId) => {
      dispatch(updatePath(`${ROUTES.TAXONOMIES}/${taxonomyId}${ROUTES.NEW}`, { replace: true }));
    },
    onPageLink: (path) => {
      dispatch(updatePath(path));
    },
    onTaxonomyLink: (path) => {
      dispatch(updatePath(path, { keepQuery: true }));
    },
    onSort: (sort, order) => {
      dispatch(updateSort({ sort, order }));
    },
    onSetPrintView: (config) => {
      dispatch(printView(config));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(CategoryList));
