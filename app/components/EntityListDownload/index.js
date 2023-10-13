/*
 *
 * EntityListDownload
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import CsvDownloader from 'react-csv-downloader';
import {
  Box,
} from 'grommet';

import appMessages from 'containers/App/messages';
import { CONTENT_MODAL } from 'containers/App/constants';
import Content from 'components/Content';
import ContentHeader from 'components/ContentHeader';
import ButtonForm from 'components/buttons/ButtonForm';
import ButtonSubmit from 'components/buttons/ButtonSubmit';
import messages from './messages';
import { prepareDatas, getAttributes } from './utils';


const Footer = styled.div`
  width: 100%;
`;

// color: white;
const StyledButtonCancel = styled(ButtonForm)`
  opacity: 0.9;
  &:hover {
    opacity: 0.8;
  }
`;


export function EntityListDownload({
  typeId,
  config,
  fields,
  entities,
  taxonomies,
  connections,
  onClose,
}) {
  const attributes = getAttributes({
    typeId,
    fieldAttributes: fields && fields.ATTRIBUTES,
  });
  const datas = prepareDatas({
    typeId,
    config,
    attributes,
    entities,
    taxonomies,
    connections,
  });
  return (
    <Content inModal>
      <ContentHeader
        title="Download CSV"
        type={CONTENT_MODAL}
        buttons={[{
          type: 'cancel',
          onClick: () => onClose(),
        }]}
      />
      <Footer>
        <Box direction="row" justify="end">
          <StyledButtonCancel type="button" onClick={() => onClose()}>
            <FormattedMessage {...appMessages.buttons.cancel} />
          </StyledButtonCancel>
          <CsvDownloader
            datas={datas}
            filename="csv.csv"
            bom={false}
          >
            <ButtonSubmit
              type="button"
              onClick={(evt) => evt.preventDefault()}
            >
              <FormattedMessage {...messages.buttonDownload} />
            </ButtonSubmit>
          </CsvDownloader>
        </Box>
      </Footer>
    </Content>
  );
}

EntityListDownload.propTypes = {
  fields: PropTypes.object,
  config: PropTypes.object,
  typeId: PropTypes.string,
  entities: PropTypes.instanceOf(List),
  taxonomies: PropTypes.instanceOf(Map),
  connections: PropTypes.instanceOf(Map),
  onClose: PropTypes.func,
};

export default EntityListDownload;
