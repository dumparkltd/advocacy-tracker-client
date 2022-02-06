/*
 * HomePage Messages
 *
 * This contains all the text for the HomePage component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  pageTitle: {
    id: 'app.containers.HomePage.pageTitle',
    defaultMessage: 'Sadata Home',
  },
  metaDescription: {
    id: 'app.containers.HomePage.metaDescription',
    defaultMessage: 'Home page description',
  },
  intro: {
    id: 'app.containers.HomePage.intro',
    defaultMessage: 'Welcome to Sadata, this is the introductory text that provides the user with some context and a brief overview about this site and its purpose. Two or three sentences will likely be sufficient to provide the user with some guidance.',
  },
  signingIn: {
    id: 'app.containers.HomePage.signingIn',
    defaultMessage: 'Signing in...',
  },
  loading: {
    id: 'app.containers.HomePage.loading',
    defaultMessage: 'Loading initial data...',
  },
  notSignedIn: {
    id: 'app.containers.HomePage.notSignedIn',
    defaultMessage: 'Please sign in or register to use this platform',
  },
  noRoleAssigned: {
    id: 'app.containers.HomePage.noRoleAssigned',
    defaultMessage: 'You do not have sufficient rights to access the content of this platform. Please contact the platform administrator',
  },
});
