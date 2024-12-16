import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { Form } from 'react-redux-form/immutable';

import CsvDownloader from 'react-csv-downloader';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import {
  Text,
  Box,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from 'grommet';

import { omit } from 'lodash/object';
import { map } from 'lodash/collection';

import asArray from 'utils/as-array';
import { lowerCase } from 'utils/string';

import A from 'components/styled/A';
import Field from 'components/fields/Field';
import Accordion from 'components/Accordion';
import ViewPanel from 'components/EntityView/ViewPanel';
import Main from 'components/EntityView/Main';

import Messages from 'components/Messages';
import Loading from 'components/Loading';

import DocumentWrap from 'components/fields/DocumentWrap';
import FieldGroupWrapper from 'components/fields/FieldGroupWrapper';

import ButtonCancel from 'components/buttons/ButtonCancel';
import ButtonSubmit from 'components/buttons/ButtonSubmit';
import Clear from 'components/styled/Clear';

import ImportFileSelectControl from '../ImportFileSelectControl';
import FormWrapper from '../FormWrapper';
import FormBody from '../FormBody';
import FormFieldWrap from '../FormFieldWrap';
import FormFooter from '../FormFooter';
import FormFooterButtons from '../FormFooterButtons';

import messages from './messages';

const StyledForm = styled(Form)`
  display: table;
  width: 100%;
`;

const Importing = styled.div``;

const ImportingText = styled.div`
  font-weight: bold;
  font-size: 1em;
  color: ${palette('text', 1)};
  margin-bottom: 0.25em;
  margin-top: -0.5em;
  overflow: hidden;
  @media print {
    font-size: ${(props) => props.theme.sizes.print.default};
  }
`;

const DocumentWrapEdit = styled(DocumentWrap)`
  background-color: ${palette('background', 0)};
  position: relative;
  padding: 1em 0.75em;
`;

const FormTitle = styled.h3`
  padding-top: 0;
  margin-top: 0;
`;

const Intro = styled.div`
  margin-bottom: 10px;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    margin-bottom: 16px;
    font-size: 1.2em;
  }
  @media print {
    font-size: ${(props) => props.theme.sizes.print.large};
  }
`;
const Hint = styled.div`
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    margin-bottom: 16px;
    font-size: 1.2em;
  }
  @media print {
    font-size: ${(props) => props.theme.sizes.print.large};
  }
`;
const CsvDownload = styled.span`
  display: inline-block;
`;
const NoteLink = styled(A)`
  font-weight: bold;
`;
const RowErrors = styled.div`
  margin-top: 2em;
`;

const HintList = styled.ul`
  margin: 10px 0;
`;

const HintTitle = styled.h6`
  margin: 0;
  font-weight: normal;
`;
const ErrorHint = styled.div``;
const ErrorHintTitle = styled.h5``;
const ErrorHintText = styled.p``;

// These props will be omitted before being passed to the Control component
const nonControlProps = ['label', 'component', 'controlType', 'children', 'errorMessages'];

const getControlProps = (field) => omit(field, nonControlProps);

function ImportEntitiesForm({
  model,
  handleSubmit,
  handleCancel,
  handleReset,
  fieldModel,
  template,
  formData,
  progress,
  errors,
  success,
  typeLabel = '',
  intl,
}) {
  const [actives, setActive] = React.useState([]);
  // const { intl } = this.context;
  const field = {
    id: 'file',
    model: `.${fieldModel}`,
    placeholder: 'filename',
  };
  const { id, ...props } = getControlProps(field);
  return (
    <FormWrapper white>
      <StyledForm model={model} onSubmit={(data) => data.get('import') !== null && handleSubmit(data)}>
        <FormBody>
          <ViewPanel>
            <Main bottom>
              <FieldGroupWrapper>
                <FormTitle>
                  <FormattedMessage {...messages.title} values={{ type: lowerCase(typeLabel) }} />
                </FormTitle>
                <Intro>
                  <Text size="medium">
                    <FormattedMessage {...messages.introduction} />
                  </Text>
                </Intro>
                {progress === null && (
                  <Hint>
                    <HintTitle>
                      <Text size="medium">
                        <FormattedMessage {...messages.hintTitle} />
                      </Text>
                    </HintTitle>
                    <HintList>
                      <li>
                        <Text size="medium">
                          <FormattedMessage {...messages.templateHint} />
                        </Text>
                        <CsvDownload>
                          <CsvDownloader
                            datas={asArray(template.data)}
                            filename={template.filename}
                          >
                            <NoteLink href="/" onClick={(evt) => evt.preventDefault()}>
                              <Text size="medium">
                                <FormattedMessage {...messages.templateHintDownloadLink} />
                              </Text>
                            </NoteLink>
                          </CsvDownloader>
                        </CsvDownload>
                      </li>
                      <li>
                        <Text size="medium">
                          <FormattedMessage {...messages.formatHint} />
                        </Text>
                        {messages.formatHintLink && messages.formatHintLink !== '' && (
                          <A href={intl.formatMessage(messages.formatHintLink)} target="_blank">
                            <Text size="medium">
                              {intl.formatMessage(messages.formatHintLinkAnchor)}
                            </Text>
                          </A>
                        )}
                      </li>
                    </HintList>
                  </Hint>
                )}
                {progress === null && template.data && (
                  <Box margin={{ vertical: 'small' }}>
                    <Accordion
                      activePanels={actives}
                      onActive={(newActives) => setActive(newActives)}
                      options={[
                        {
                          id: 0,
                          titleButton: actives.indexOf(0) > -1
                            ? 'Hide field/column overview'
                            : 'Show field/column overview',
                          content: actives.indexOf(0) > -1 && (
                            <Box background="light-1" pad="medium">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableCell scope="col" border="bottom">
                                      <Text size="xsmall" weight={600}>Field/column name</Text>
                                    </TableCell>
                                    <TableCell scope="col" border="bottom">
                                      <Text size="xsmall" weight={600}>Content/info</Text>
                                    </TableCell>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {template.data && Object.keys(template.data).filter((d) => d.trim() !== '').map(
                                    (d, index) => (
                                      <TableRow key={index}>
                                        <TableCell scope="row">
                                          <Text size="xsmall">{d}</Text>
                                        </TableCell>
                                        <TableCell>
                                          <Text size="xsmall">{template.data[d]}</Text>
                                        </TableCell>
                                      </TableRow>
                                    )
                                  )}
                                </TableBody>
                              </Table>
                            </Box>
                          ),
                        },
                      ]}
                    />
                  </Box>
                )}
                <Field noPadding>
                  <FormFieldWrap>
                    {(progress === null) && (
                      <ImportFileSelectControl
                        id={id}
                        model={field.model}
                        as="text"
                        accept=".csv, text/csv"
                        {...props}
                      />
                    )}
                    {progress !== null && (
                      <div>
                        {progress < 100 && (
                          <DocumentWrapEdit>
                            <Importing>
                              <ImportingText>
                                <FormattedMessage {...messages.importing} />
                                { formData && `"${formData.get('import').file.name}"`}
                              </ImportingText>
                              <Loading progress={progress} />
                            </Importing>
                          </DocumentWrapEdit>
                        )}
                        {progress >= 100 && (
                          <div>
                            {(errors.size > 0 && success.size === 0)
                            && (
                              <Messages
                                type="error"
                                message={intl.formatMessage(messages.allErrors)}
                              />
                            )}
                            {(errors.size > 0 && success.size > 0) && (
                              <Messages
                                type="error"
                                message={intl.formatMessage(messages.someErrors, {
                                  successNo: success.size,
                                  rowNo: errors.size + success.size,
                                })}
                              />
                            )}
                            {(errors.size === 0) && (
                              <Messages
                                type="success"
                                message={intl.formatMessage(messages.success, {
                                  rowNo: success.size,
                                })}
                              />
                            )}
                          </div>
                        )}
                        {(errors.size > 0) && (
                          <RowErrors>
                            <FormattedMessage {...messages.rowErrorHint} />
                            <Messages
                              type="error"
                              details
                              preMessage={false}
                              messages={
                                errors
                                  .sortBy((error) => error && error.data && error.data.saveRef)
                                  .reduce((memo, error) => error.error.messages
                                    ? memo.concat(map(error.error.messages, (message) => error.data.saveRef
                                      ? [`${error.data.saveRef}:`, message]
                                      : message))
                                    : memo,
                                  [])
                              }
                            />
                          </RowErrors>
                        )}
                        {(errors.size > 0 && progress >= 100) && (
                          <ErrorHint>
                            <ErrorHintTitle>
                              <FormattedMessage {...messages.errorHintTitle} />
                            </ErrorHintTitle>
                            <ErrorHintText>
                              <FormattedMessage {...messages.errorHintText} />
                            </ErrorHintText>
                          </ErrorHint>
                        )}
                      </div>
                    )}
                  </FormFieldWrap>
                </Field>
              </FieldGroupWrapper>
            </Main>
          </ViewPanel>
        </FormBody>
        { progress >= 100
          && (
            <FormFooter>
              <FormFooterButtons>
                <ButtonCancel type="button" onClick={handleReset}>
                  <FormattedMessage {...messages.importAgain} />
                </ButtonCancel>
                <ButtonSubmit type="button" onClick={handleCancel}>
                  <FormattedMessage {...messages.done} />
                </ButtonSubmit>
              </FormFooterButtons>
              <Clear />
            </FormFooter>
          )
        }
      </StyledForm>
    </FormWrapper>
  );
}

ImportEntitiesForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  handleReset: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  model: PropTypes.string,
  fieldModel: PropTypes.string,
  typeLabel: PropTypes.string,
  formData: PropTypes.object,
  progress: PropTypes.number,
  errors: PropTypes.object,
  success: PropTypes.object,
  template: PropTypes.object,
  intl: intlShape,
};


export default injectIntl(ImportEntitiesForm);
