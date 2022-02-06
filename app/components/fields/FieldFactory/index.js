import React from 'react';
import PropTypes from 'prop-types';
import Field from 'components/fields/Field';

import ConnectionsField from 'components/fields/ConnectionsField';
import ConnectionGroupsField from 'components/fields/ConnectionGroupsField';
import DateField from 'components/fields/DateField';
import MarkdownField from 'components/fields/MarkdownField';
import EmailField from 'components/fields/EmailField';
import LinkField from 'components/fields/LinkField';
import TaxonomyField from 'components/fields/TaxonomyField';
import ManagerField from 'components/fields/ManagerField';
import MetaField from 'components/fields/MetaField';
import ReferenceField from 'components/fields/ReferenceField';
import RoleField from 'components/fields/RoleField';
import StatusField from 'components/fields/StatusField';
import TextField from 'components/fields/TextField';
import TitleField from 'components/fields/TitleField';
import TitleTextField from 'components/fields/TitleTextField';
import TitleShortField from 'components/fields/TitleShortField';

class FieldFactory extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  renderField = (field) => {
    switch (field.type) {
      case 'title':
        return (<TitleField field={field} />);
      case 'titleText':
        return (<TitleTextField field={field} />);
      case 'short_title':
        return (<TitleShortField field={field} />);
      case 'meta':
        return (<MetaField field={field} />);
      case 'reference':
        return (<ReferenceField field={field} />);
      case 'status':
        return (<StatusField field={field} />);
      case 'role':
        return (<RoleField field={field} />);
      case 'link':
        return (<LinkField field={field} />);
      case 'email':
        return (<EmailField field={field} />);
      case 'date':
        return (<DateField field={field} />);
      case 'manager':
        return (<ManagerField field={field} />);
      case 'taxonomy':
        return (<TaxonomyField field={field} />);
      case 'description':
      case 'markdown':
        return (<MarkdownField field={field} />);
      case 'connections':
        return (<ConnectionsField field={field} />);
      case 'connectionGroups':
        return (<ConnectionGroupsField field={field} />);
      case 'text':
      default:
        return (<TextField field={field} />);
    }
  };

  render() {
    const { field, nested } = this.props;
    return (
      // value not empty or not undefined or nor empty string
      (
        typeof field.value !== 'undefined'
        && field.value !== null
        && field.value.toString().trim() !== ''
      )
      // values (multiple) not empty or undefined
      || (
        typeof field.values !== 'undefined'
        && (
          (field.values.length && field.values.length > 0)
          || (field.values.size && field.values.size > 0)
        )
      )
      // fields not empty or undefined
      || (typeof field.fields !== 'undefined' && field.fields.length > 0)
      // or showEmpty
      || (typeof field.showEmpty !== 'undefined' && field.showEmpty))
      ? (
        <Field nested={nested} noPadding={field.type === 'smartTaxonomy'}>
          {this.renderField(field)}
        </Field>
      )
      : null;
  }
}
FieldFactory.propTypes = {
  field: PropTypes.object.isRequired,
  nested: PropTypes.bool,
};

export default FieldFactory;
