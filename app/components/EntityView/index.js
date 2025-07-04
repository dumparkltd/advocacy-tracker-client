/**
*
* EntityView
*
*/
import React from 'react';
import PropTypes from 'prop-types';
import { reduce } from 'lodash/collection';

import asArray from 'utils/as-array';

import FieldGroup from 'components/fields/FieldGroup';
import HeaderPrint from 'components/Header/HeaderPrint';

import { usePrint } from 'containers/App/PrintContext';

import Main from './Main';
import Aside from './Aside';
import ViewWrapper from './ViewWrapper';
import ViewPanel from './ViewPanel';
import ViewPanelInside from './ViewPanelInside';
import ViewHeader from './ViewHeader';

const hasFields = (fieldGroup) => fieldGroup.fields && reduce(fieldGroup.fields, (memo, field) => memo || field, false);

const renderMain = (fieldGroups, hasAside = true, bottom = false, seamless = false) => (
  <Main hasAside={hasAside} bottom={bottom}>
    {asArray(fieldGroups).map((fieldGroup, i) => fieldGroup && hasFields(fieldGroup) && (
      <FieldGroup
        key={i}
        group={fieldGroup}
        seamless={seamless}
        bottom={bottom}
      />
    ))}
  </Main>
);

const renderAside = (fieldGroups, bottom = false, seamless) => (
  <Aside bottom={bottom}>
    {asArray(fieldGroups).map((fieldGroup, i) => fieldGroup && (
      <FieldGroup
        key={i}
        group={fieldGroup}
        seamless={seamless}
        bottom={bottom}
        aside
      />
    ))}
  </Aside>
);

export function EntityView({ fields, seamless, header }) {
  const isPrint = usePrint();
  const hasBodyMainFields = fields.body
    && (
      fields.body.main
      && fields.body.main[0]
      && fields.body.main[0].fields
    );
  const hasBodyAsideFields = fields.body
    && (
      fields.body.aside
      && fields.body.aside[0]
      && fields.body.aside[0].fields
    );
  return (
    <ViewWrapper seamless={seamless}>
      {isPrint && (
        <HeaderPrint argsKeep={[]} />
      )}
      {header && (
        <ViewHeader {...header} />
      )}
      {fields.header && (
        <ViewPanel>
          <ViewPanelInside>
            {fields.header.main
              && renderMain(
                fields.header.main,
                hasBodyAsideFields,
                false,
                seamless,
              )
            }
            {fields.header.aside && !isPrint && renderAside(fields.header.aside, false)}
          </ViewPanelInside>
        </ViewPanel>
      )}
      {(hasBodyMainFields || hasBodyAsideFields) && (
        <ViewPanel>
          <ViewPanelInside>
            {fields.body.main
              && renderMain(
                fields.body.main,
                hasBodyAsideFields,
                true,
                seamless,
              )
            }
            {hasBodyAsideFields && renderAside(fields.body.aside, true)}
          </ViewPanelInside>
        </ViewPanel>
      )}
    </ViewWrapper>
  );
}

EntityView.propTypes = {
  fields: PropTypes.object,
  seamless: PropTypes.bool,
  header: PropTypes.object,
};
export default EntityView;
