/*
 *
 * CategoryNew
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { intlShape, injectIntl } from 'react-intl';

import messages from './messages';

import CategoryNewForm from './CategoryNewForm';
import { selectDomain } from './selectors';

export function CategoryNew({
  params,
  viewDomain,
  intl,
}) {
  const typeId = params.id;
  return (
    <div>
      <Helmet
        title={intl.formatMessage(messages.pageTitle)}
        meta={[
          {
            name: 'description',
            content: intl.formatMessage(messages.metaDescription),
          },
        ]}
      />
      <CategoryNewForm
        typeId={typeId}
        viewDomain={viewDomain}
        formDataPath="categoryNew.form.data"
      />
    </div>
  );
}

CategoryNew.propTypes = {
  viewDomain: PropTypes.object,
  params: PropTypes.object,
  intl: intlShape.isRequired,
};

const mapStateToProps = (state) => ({
  viewDomain: selectDomain(state),
});

export default connect(mapStateToProps, null)(injectIntl(CategoryNew));
