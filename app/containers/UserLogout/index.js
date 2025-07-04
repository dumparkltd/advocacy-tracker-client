/*
 * UserLogout
 *
 */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import Helmet from 'react-helmet';
import Loading from 'components/Loading';
import ContentNarrow from 'components/ContentNarrow';
import ContentHeader from 'containers/ContentHeader';

import { logout } from 'containers/App/actions';

import messages from './messages';

const UserLogout = ({ doLogout, intl }) => {
  useEffect(() => {
    doLogout();
  }, []);

  return (
    <div>
      <Helmet
        title={`${intl.formatMessage(messages.pageTitle)}`}
        meta={[
          {
            name: 'description',
            content: intl.formatMessage(messages.metaDescription),
          },
        ]}
      />
      <ContentNarrow>
        <ContentHeader
          title={intl.formatMessage(messages.pageTitle)}
        />
        <Loading />
      </ContentNarrow>
    </div>
  );
};

UserLogout.propTypes = {
  doLogout: PropTypes.func,
  intl: intlShape,
};

export function mapDispatchToProps(dispatch) {
  return {
    doLogout: () => {
      dispatch(logout());
    },
  };
}

// Wrap the component to inject dispatch and state into it
export default connect(null, mapDispatchToProps)(injectIntl(UserLogout));
