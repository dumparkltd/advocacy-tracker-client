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

import appMessages from 'containers/App/messages';
import messages from './messages';

import IndicatorNewForm from './IndicatorNewForm';
import { selectDomain } from './selectors';

export function IndicatorNew({
  viewDomain,
  intl,
}) {
  const type = intl.formatMessage(appMessages.entities.indicators.single);
  return (
    <div>
      <Helmet
        title={`${intl.formatMessage(messages.pageTitle, { type })}`}
        meta={[
          {
            name: 'description',
            content: intl.formatMessage(messages.metaDescription),
          },
        ]}
      />
      <IndicatorNewForm
        viewDomain={viewDomain}
        formDataPath="indicatorNew.form.data"
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
