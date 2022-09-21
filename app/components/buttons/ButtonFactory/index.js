import React from 'react';
import PropTypes from 'prop-types';
import Icon from 'components/Icon';
import appMessages from 'containers/App/messages';
import { Box, Text } from 'grommet';
import ButtonDefaultWithIcon from '../ButtonDefaultWithIcon';
import ButtonDefault from '../ButtonDefault';
import ButtonSubmit from '../ButtonSubmit';
import ButtonFlat from '../ButtonFlat';
import ButtonFlatWithIcon from '../ButtonFlatWithIcon';
import ButtonDefaultIconOnly from '../ButtonDefaultIconOnly';
import ButtonFlatIconOnly from '../ButtonFlatIconOnly';
import ButtonSecondary from '../ButtonSecondary';
import Bookmarker from '../../../containers/Bookmarker';

class ButtonFactory extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { button, args } = this.props;
    const { intl } = this.context;
    switch (button.type) {
      case 'listOption':
      case 'primary':
        return (
          <ButtonDefault
            onClick={button.onClick && (() => button.onClick(args))}
            type={button.submit ? 'submit' : 'button'}
            disabled={button.disabled}
            inactive={!button.active}
          >
            {button.icon && (
              <Box align="center" direction="row" gap="small">
                {button.icon}
                <Text>{button.title}</Text>
              </Box>
            )}
            {!button.icon && <Text>{button.title}</Text>}
          </ButtonDefault>
        );
      case 'secondary':
        return (
          <ButtonSecondary
            onClick={button.onClick && (() => button.onClick(args))}
            type={button.submit ? 'submit' : 'button'}
            disabled={button.disabled}
            inactive={!button.active}
          >
            <Text>{button.title}</Text>
          </ButtonSecondary>
        );
      case 'formPrimary':
        return (
          <ButtonSubmit
            onClick={button.onClick && (() => button.onClick(args))}
            type={button.submit ? 'submit' : 'button'}
            disabled={button.disabled}
          >
            {button.title}
          </ButtonSubmit>
        );
      case 'add':
        return (
          <ButtonDefaultWithIcon
            onClick={() => button.onClick(args)}
            icon="add"
            strong
            type={button.submit ? 'submit' : 'button'}
            title={button.title || intl.formatMessage(appMessages.buttons.add)}
            disabled={button.disabled}
          />
        );
      case 'addFlat':
        return (
          <ButtonFlatWithIcon
            onClick={() => button.onClick(args)}
            icon="add"
            strong
            type={button.submit ? 'submit' : 'button'}
            title={button.title || intl.formatMessage(appMessages.buttons.add)}
            disabled={button.disabled}
            inForm
          />
        );
      case 'addFlatPrimary':
        return (
          <ButtonFlatWithIcon
            onClick={() => button.onClick(args)}
            icon="add"
            strong
            type={button.submit ? 'submit' : 'button'}
            title={button.title || intl.formatMessage(appMessages.buttons.add)}
            disabled={button.disabled}
            primary
          />
        );
      case 'save':
        return (
          <ButtonFlat
            primary
            onClick={() => button.onClick(args)}
            type={button.submit ? 'submit' : 'button'}
            disabled={button.disabled}
          >
            {button.title || intl.formatMessage(appMessages.buttons.save)}
          </ButtonFlat>
        );
      case 'cancel':
        return (
          <ButtonFlat
            onClick={() => button.onClick(args)}
            type={button.submit ? 'submit' : 'button'}
            disabled={button.disabled}
          >
            {button.title || intl.formatMessage(appMessages.buttons.cancel)}
          </ButtonFlat>
        );
      case 'edit':
        return (
          <ButtonFlat
            onClick={() => button.onClick(args)}
            type={button.submit ? 'submit' : 'button'}
            disabled={button.disabled}
          >
            {button.title || intl.formatMessage(appMessages.buttons.edit)}
          </ButtonFlat>
        );
      case 'close':
        return (
          <ButtonDefaultIconOnly
            onClick={() => button.onClick(args)}
            type={button.submit ? 'submit' : 'button'}
            title={button.title || intl.formatMessage(appMessages.buttons.close)}
            disabled={button.disabled}
          >
            <Icon name="close" />
          </ButtonDefaultIconOnly>
        );
      case 'closeText':
        return (
          <ButtonFlat
            onClick={() => button.onClick(args)}
            type={button.submit ? 'submit' : 'button'}
            disabled={button.disabled}
            inForm
          >
            {button.title || intl.formatMessage(appMessages.buttons.close)}
          </ButtonFlat>
        );
      case 'textPrimary':
        return (
          <ButtonFlat
            onClick={button.onClick && (() => button.onClick(args))}
            primary
            type={button.submit ? 'submit' : 'button'}
            disabled={button.disabled}
          >
            {button.title}
          </ButtonFlat>
        );
      case 'bookmarker':
        return <Bookmarker viewTitle={button.title} type={button.entityType} />;
      case 'icon':
        return (
          <ButtonFlatIconOnly
            onClick={button.onClick && (() => button.onClick(args))}
            title={button.title}
            subtle
          >
            <Icon name={button.icon} />
          </ButtonFlatIconOnly>
        );
      case 'simple':
      case 'text':
      case 'delete':
      default:
        return (
          <ButtonFlat
            onClick={() => button.onClick(args)}
            type={button.submit ? 'submit' : 'button'}
            disabled={button.disabled}
          >
            {button.title}
          </ButtonFlat>
        );
    }
  }
}
ButtonFactory.propTypes = {
  button: PropTypes.object.isRequired,
  args: PropTypes.object,
};
ButtonFactory.contextTypes = {
  intl: PropTypes.object.isRequired,
};

export default ButtonFactory;
