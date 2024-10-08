/*
 * UserLogin Messages
 *
 * This contains all the text for the UserLogin component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  pageTitle: {
    id: 'app.containers.UserLogin.pageTitle',
    defaultMessage: 'Sign in',
  },
  metaDescription: {
    id: 'app.containers.UserLogin.metaDescription',
    defaultMessage: 'Sign in page description',
  },
  header: {
    id: 'app.containers.UserLogin.header',
    defaultMessage: 'Sign in',
  },
  registerLinkBefore: {
    id: 'app.containers.UserLogin.registerLinkBefore',
    defaultMessage: 'Do not have an account? ',
  },
  registerLink: {
    id: 'app.containers.UserLogin.registerLink',
    defaultMessage: 'Register here',
  },
  recoverPasswordLink: {
    id: 'app.containers.UserLogin.recoverPasswordLink',
    defaultMessage: 'I forgot my password',
  },
  resetPasswordHint: {
    id: 'app.containers.UserLogin.resetPasswordHint',
    defaultMessage: 'If you forgot your password, please contact the administrator',
  },
  submit: {
    id: 'app.containers.UserLogin.submit',
    defaultMessage: 'Sign in',
  },
  devNote: {
    id: 'app.containers.UserLogin.devNote',
    defaultMessage: 'Note: signing in to test database',
  },
});
