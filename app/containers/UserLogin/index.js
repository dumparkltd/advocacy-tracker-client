/*
 *
 * UserLogin
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import styled from 'styled-components';
import { actions as formActions } from 'react-redux-form/immutable';
import { Text, Box } from 'grommet';

import {
  getEmailFormField,
  getPasswordFormField,
} from 'utils/forms';

import Messages from 'components/Messages';
import Loading from 'components/Loading';
import Icon from 'components/Icon';
import ContentNarrow from 'components/ContentNarrow';
import ContentHeader from 'containers/ContentHeader';
import AuthForm from 'components/forms/AuthForm';
import A from 'components/styled/A';

import {
  selectQueryMessages,
  selectIsAuthenticating,
  selectAuthError,
} from 'containers/App/selectors';

import {
  updatePath,
  dismissQueryMessages,
  redirectIfSignedIn,
} from 'containers/App/actions';

import { ROUTES, IS_DEV } from 'themes/config';
import messages from './messages';

import { login } from './actions';

const BottomLinks = styled.div`
  padding: 2em 0;
`;

export class UserLogin extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  UNSAFE_componentWillMount() {
    this.props.initialiseForm();
    this.props.redirectIfSignedIn();
  }

  render() {
    const { intl } = this.context;
    const { isUserAuthenticating, authError } = this.props;
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
          {IS_DEV && (
            <Box margin={{ bottom: 'medium' }}>
              <Text>
                <FormattedMessage {...messages.devNote} />
              </Text>
            </Box>
          )}
          {this.props.queryMessages.info
            && (
              <Box margin={{ bottom: 'medium' }}>
                <Messages
                  type="info"
                  onDismiss={this.props.onDismissQueryMessages}
                  messageKey={this.props.queryMessages.info}
                />
              </Box>
            )
          }
          {authError
            && (
              <Box margin={{ bottom: 'medium' }}>
                <Messages
                  type="error"
                  messages={authError.messages}
                />
              </Box>
            )
          }
          {isUserAuthenticating
            && <Box margin={{ bottom: 'medium' }}><Loading /></Box>
          }
          <AuthForm
            model="userLogin.form.data"
            sending={isUserAuthenticating}
            handleSubmit={(formData) => this.props.handleSubmit(formData)}
            handleCancel={this.props.handleCancel}
            labels={{ submit: intl.formatMessage(messages.submit) }}
            fields={[
              getEmailFormField({ formatMessage: intl.formatMessage, required: true, model: '.email' }),
              getPasswordFormField({ formatMessage: intl.formatMessage, model: '.password' }),
            ]}
          />
          <BottomLinks>
            <p>
              <FormattedMessage {...messages.registerLinkBefore} />
              <A
                href={ROUTES.REGISTER}
                onClick={(evt) => {
                  if (evt !== undefined && evt.preventDefault) evt.preventDefault();
                  this.props.handleLink(ROUTES.REGISTER, { keepQuery: true });
                }}
              >
                <FormattedMessage {...messages.registerLink} />
                <Icon name="arrowRight" text size="1.5em" sizes={{ mobile: '1em' }} />
              </A>
            </p>
            <p>
              <A
                href={ROUTES.RECOVER_PASSWORD}
                onClick={(evt) => {
                  if (evt !== undefined && evt.preventDefault) evt.preventDefault();
                  this.props.handleLink(ROUTES.RECOVER_PASSWORD, { keepQuery: true });
                }}
              >
                <FormattedMessage {...messages.recoverPasswordLink} />
                <Icon name="arrowRight" text size="1.5em" sizes={{ mobile: '1em' }} />
              </A>
            </p>
          </BottomLinks>
        </ContentNarrow>
      </div>
    );
  }
}

UserLogin.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  handleLink: PropTypes.func.isRequired,
  redirectIfSignedIn: PropTypes.func.isRequired,
  initialiseForm: PropTypes.func,
  onDismissQueryMessages: PropTypes.func,
  queryMessages: PropTypes.object,
  isUserAuthenticating: PropTypes.bool,
  authError: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.bool,
  ]),
};

UserLogin.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  queryMessages: selectQueryMessages(state),
  isUserAuthenticating: selectIsAuthenticating(state),
  authError: selectAuthError(state),
});

export function mapDispatchToProps(dispatch) {
  return {
    initialiseForm: () => {
      dispatch(formActions.reset('userLogin.form.data'));
    },
    redirectIfSignedIn: () => {
      dispatch(redirectIfSignedIn());
    },
    handleSubmit: (formData) => {
      dispatch(login(formData.toJS()));
      dispatch(dismissQueryMessages());
    },
    handleCancel: () => {
      dispatch(updatePath('/'));
    },
    handleLink: (path, args) => {
      dispatch(updatePath(path, args));
    },
    onDismissQueryMessages: () => {
      dispatch(dismissQueryMessages());
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserLogin);
