/*
 *
 * IndicatorNew
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { intlShape, injectIntl } from 'react-intl';

import messages from './messages';

import IndicatorNewForm from './IndicatorNewForm';
import { selectDomain } from './selectors';
import { REDUCER_NAME } from './constants';

export function IndicatorNew({
  viewDomain,
  intl,
}) {
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
      <IndicatorNewForm
        viewDomain={viewDomain}
        formDataPath={`${REDUCER_NAME}.form.data`}
        formId={REDUCER_NAME}
      />
    </div>
  );
}

IndicatorNew.propTypes = {
  viewDomain: PropTypes.object,
  intl: intlShape.isRequired,
};

const mapStateToProps = (state) => ({
  viewDomain: selectDomain(state),
});

export default connect(mapStateToProps, null)(injectIntl(IndicatorNew));
