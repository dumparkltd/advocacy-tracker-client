/*
 *
 * PageView
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { palette } from 'styled-theme';

import {
  loadEntitiesIfNeeded,
  updatePath,
  printView,
  // closeEntity
} from 'containers/App/actions';

import { CONTENT_PAGE, PRINT_TYPES } from 'containers/App/constants';
import { ROUTES } from 'themes/config';

import Footer from 'containers/Footer';
import Loading from 'components/Loading';
import Container from 'components/styled/Container';
import ContainerWrapper from 'components/styled/Container/ContainerWrapper';
import ContentHeader from 'containers/ContentHeader';
import EntityView from 'components/EntityView';

import {
  selectReady,
  selectIsUserAdmin,
  selectIsUserVisitor,
  selectIsUserMember,
  selectSessionUserId,
  selectIsPrintView,
} from 'containers/App/selectors';

import {
  getStatusField,
  getStatusFieldIf,
  getMetaField,
  getMarkdownField,
} from 'utils/fields';
import qe from 'utils/quasi-equals';

import messages from './messages';
import { selectViewEntity } from './selectors';
import { DEPENDENCIES } from './constants';

const StyledContainerWrapper = styled((p) => <ContainerWrapper {...p} />)`
  background-color: ${palette('primary', 4)}
`;

const ViewContainer = styled(Container)`
min-height: ${({ isPrint }) => isPrint ? '50vH' : '85vH'};
  @media print {
    min-height: 50vH;
  }
`;

export class PageView extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  UNSAFE_componentWillMount() {
    this.props.loadEntitiesIfNeeded();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // reload entities if invalidated
    if (!nextProps.dataReady) {
      this.props.loadEntitiesIfNeeded();
    }
  }

  getBodyAsideFields = (entity, isAdmin, isMine) => ([{
    fields: [
      getStatusField(entity),
      (isAdmin || isMine) && getStatusFieldIf({
        entity,
        attribute: 'private',
      }),
      getMetaField(entity),
    ],
  }]);

  getBodyMainFields = (entity) => ([{
    fields: [getMarkdownField(entity, 'content', false)],
  }]);

  getFields = (entity, isMember, isAdmin, isMine, isPrint) => ({
    body: {
      main: this.getBodyMainFields(entity),
      aside: (isMember && !isPrint)
        ? this.getBodyAsideFields(entity, isAdmin, isMine)
        : null,
    },
  });


  render() {
    const { intl } = this.context;
    const {
      page,
      dataReady,
      isAdmin,
      isVisitor,
      isMember,
      myId,
      isPrintView,
      onSetPrintView,
    } = this.props;
    let buttons = [];
    if (dataReady) {
      if (window.print) {
        buttons = [
          ...buttons,
          {
            type: 'icon',
            // onClick: () => window.print(),
            onClick: () => onSetPrintView({
              printType: PRINT_TYPES.SINGLE,
              printOrientation: 'portrait',
              printSize: 'A4',
            }),
            title: 'Print',
            icon: 'print',
          },
        ];
      }
      if (isAdmin) {
        buttons.push({
          type: 'edit',
          onClick: this.props.handleEdit,
        });
      }
    }
    const isMine = page && qe(page.getIn(['attributes', 'created_by_id']), myId);

    return (
      <div>
        <Helmet
          title={page ? page.getIn(['attributes', 'title']) : `${intl.formatMessage(messages.pageTitle)}: ${this.props.params.id}`}
          meta={[
            { name: 'description', content: intl.formatMessage(messages.metaDescription) },
          ]}
        />
        <StyledContainerWrapper className={`content-${CONTENT_PAGE}`}>
          <ViewContainer isNarrow={!isVisitor} isPrint={isPrintView}>
            <ContentHeader
              title={page ? page.getIn(['attributes', 'title']) : ''}
              type={CONTENT_PAGE}
              buttons={buttons}
            />
            {!dataReady
              && <Loading />
            }
            {!page && dataReady
              && (
                <div>
                  <FormattedMessage {...messages.notFound} />
                </div>
              )
            }
            {page && dataReady
              && (
                <EntityView
                  fields={this.getFields(page, isMember, isAdmin, isMine, isPrintView)}
                  seamless
                />
              )
            }
          </ViewContainer>
          <Footer />
        </StyledContainerWrapper>
      </div>
    );
  }
}

PageView.propTypes = {
  loadEntitiesIfNeeded: PropTypes.func,
  handleEdit: PropTypes.func,
  onSetPrintView: PropTypes.func,
  page: PropTypes.object,
  dataReady: PropTypes.bool,
  isAdmin: PropTypes.bool,
  isVisitor: PropTypes.bool,
  isMember: PropTypes.bool,
  params: PropTypes.object,
  isPrintView: PropTypes.bool,
  myId: PropTypes.string,
};

PageView.contextTypes = {
  intl: PropTypes.object.isRequired,
};


const mapStateToProps = (state, props) => ({
  isAdmin: selectIsUserAdmin(state),
  isMember: selectIsUserMember(state),
  isVisitor: selectIsUserVisitor(state),
  myId: selectSessionUserId(state),
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  page: selectViewEntity(state, props.params.id),
  isPrintView: selectIsPrintView(state),
});

function mapDispatchToProps(dispatch, props) {
  return {
    loadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    handleEdit: () => {
      dispatch(updatePath(`${ROUTES.PAGES}${ROUTES.EDIT}/${props.params.id}`, { replace: true }));
    },
    onSetPrintView: (config) => {
      dispatch(printView(config));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PageView);
