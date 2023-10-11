/*
 *
 * PageView
 *
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import styled from 'styled-components';
import { palette } from 'styled-theme';

import {
  loadEntitiesIfNeeded,
  updatePath,
  printView,
  // closeEntity
} from 'containers/App/actions';

import { keydownHandlerPrint } from 'utils/print';

import { CONTENT_PAGE, PRINT_TYPES } from 'containers/App/constants';
import { ROUTES } from 'themes/config';

import Footer from 'containers/Footer';
import Loading from 'components/Loading';
import Container from 'components/styled/Container';
import ContainerWrapper from 'components/styled/Container/ContainerWrapper';
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
const getBodyAsideFields = (entity, isAdmin, isMine) => ([{
  fields: [
    getStatusField(entity),
    (isAdmin || isMine) && getStatusFieldIf({
      entity,
      attribute: 'private',
    }),
    getMetaField(entity),
  ],
}]);

const getBodyMainFields = (entity) => ([{
  fields: [getMarkdownField(entity, 'content', false)],
}]);

const getFields = (entity, isMember, isAdmin, isMine, isPrint) => ({
  body: {
    main: getBodyMainFields(entity),
    aside: (isMember && !isPrint)
      ? getBodyAsideFields(entity, isAdmin, isMine)
      : null,
  },
});

export function PageView({
  onLoadEntitiesIfNeeded,
  page,
  params,
  handleEdit,
  dataReady,
  isAdmin,
  isVisitor,
  isMember,
  myId,
  isPrintView,
  onSetPrintView,
  intl,
}) {
  useEffect(() => {
    if (!dataReady) onLoadEntitiesIfNeeded();
  }, [dataReady]);

  const mySetPrintView = () => onSetPrintView({
    printType: PRINT_TYPES.SINGLE,
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

  let buttons = [];
  if (dataReady) {
    if (window.print) {
      buttons = [
        ...buttons,
        {
          type: 'icon',
          onClick: () => mySetPrintView(),
          title: 'Print',
          icon: 'print',
        },
      ];
    }
    if (isAdmin) {
      buttons.push({
        type: 'edit',
        onClick: handleEdit,
      });
    }
  }
  const isMine = page && qe(page.getIn(['attributes', 'created_by_id']), myId);

  return (
    <div>
      <Helmet
        title={page ? page.getIn(['attributes', 'title']) : `${intl.formatMessage(messages.pageTitle)}: ${params.id}`}
        meta={[
          { name: 'description', content: intl.formatMessage(messages.metaDescription) },
        ]}
      />
      <StyledContainerWrapper className={`content-${CONTENT_PAGE}`}>
        <ViewContainer isNarrow={!isVisitor} isPrint={isPrintView}>
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
                header={{
                  title: page ? page.getIn(['attributes', 'title']) : '',
                  type: CONTENT_PAGE,
                  buttons,
                }}
                fields={getFields(page, isMember, isAdmin, isMine, isPrintView)}
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


PageView.propTypes = {
  onLoadEntitiesIfNeeded: PropTypes.func,
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
  intl: intlShape.isRequired,
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
    onLoadEntitiesIfNeeded: () => {
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

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(PageView));
