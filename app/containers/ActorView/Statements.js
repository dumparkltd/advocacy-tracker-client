/*
 *
 * Statements
 *
 */

// import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { FormattedMessage, intlShape, injectIntl } from 'react-intl';
// import {
//   Box,
//   Text,
//   Button,
//   ResponsiveContext,
// } from 'grommet';
import { Map } from 'immutable';
// import styled from 'styled-components';
//
// import qe from 'utils/quasi-equals';
// import isNumber from 'utils/is-number';
// import { isMaxSize } from 'utils/responsive';

// import NumberField from 'components/fields/NumberField';

// import { ROUTES } from 'themes/config';

import { updatePath } from 'containers/App/actions';

// import appMessages from 'containers/App/messages';
import {
  selectIndicators,
  selectActorsWithPositions,
} from 'containers/App/selectors';

// const ResourceButton = styled((p) => <Button plain {...p} />)``;
// const Group = styled(
//   (p) => (
//     <Box
//       margin={{ bottom: 'large', top: 'medium' }}
//       pad={{ vertical: 'small' }}
//       {...p}
//     />
//   )
// )``;
// const GroupTitle = styled.h5`
//   font-size: 18px;
//   font-weight: 500;
//   margin: 0;
// `;
// const GroupTitleLabel = styled(GroupTitle)`
//   font-weight: 300;
//   color: ${({ theme }) => theme.global.colors.text.secondary};
// `;
//
// const Indicator = styled((p) => <Box margin={{ top: 'medium' }} pad={{ top: 'medium' }} {...p} />)`
//   border-top: 1px solid ${({ theme }) => theme.global.colors.border.light};
// `;

export function Statements(props) {
  const {
    indicators,
    // onUpdatePath,
    statements,
    actorsWithPositions,
    associationsByType,
    // intl,
  } = props;
  console.log('indicators', indicators && indicators.toJS());
  console.log('statements', statements && statements.toJS());
  console.log('actorsWithPositions', actorsWithPositions && actorsWithPositions.toJS());
  console.log('associationsByType', associationsByType && associationsByType.toJS());
  return null;
  // const size = React.useContext(ResponsiveContext);
  // const indicatorsByResourceId = indicators && indicators.groupBy(
  //   (entity) => {
  //     if (entity.get('resourcesByType')) {
  //       return entity.get('resourcesByType').flatten().toList().first();
  //     }
  //     return 'without';
  //   }
  // );
  // return (
  //   <Box>
  //     {(!indicators || indicators.size === 0) && (
  //       <Box margin={{ vertical: 'small', horizontal: 'medium' }}>
  //         <Text>
  //           No indicators for actor in database
  //         </Text>
  //       </Box>
  //     )}
  //     {indicators && indicators.size > 0 && (
  //       <Box margin={{ vertical: 'small', horizontal: 'medium' }}>
  //         {indicatorsByResourceId && indicatorsByResourceId.keySeq().map(
  //           (resourceId) => {
  //             const resource = !qe(resourceId, 'without')
  //               && resources
  //               && resources.get(resourceId.toString());
  //             const resourceIndicators = indicatorsByResourceId.get(resourceId);
  //             return (
  //               <Group key={`res-${resourceId}`}>
  //                 {resource && (
  //                   <Box
  //                     direction={isMaxSize(size, 'medium') ? 'column' : 'row'}
  //                     gap="xsmall"
  //                   >
  //                     <Box>
  //                       <GroupTitleLabel>
  //                         Publication
  //                       </GroupTitleLabel>
  //                     </Box>
  //                     <Box>
  //                       <ResourceButton
  //                         as="a"
  //                         href={`${ROUTES.RESOURCE}/${resourceId}`}
  //                         onClick={(e) => {
  //                           if (e) e.preventDefault();
  //                           onUpdatePath(`${ROUTES.RESOURCE}/${resourceId}`);
  //                         }}
  //                       >
  //                         <GroupTitle>
  //                           {resource.getIn(['attributes', 'title'])}
  //                         </GroupTitle>
  //                       </ResourceButton>
  //                     </Box>
  //                   </Box>
  //                 )}
  //                 {!resource && (
  //                   <GroupTitle>
  //                     Without resource
  //                   </GroupTitle>
  //                 )}
  //                 <Box>
  //                   {resourceIndicators && resourceIndicators.toList().map((indicator) => {
  //                     const path = `${ROUTES.ACTION}/${indicator.get('id')}`;
  //                     const value = isNumber(indicator.get('value'))
  //                       ? parseFloat(indicator.get('value'), 10)
  //                       : value;
  //                     let digits;
  //                     if (isNumber(value)) {
  //                       digits = value > 1 ? 1 : 3;
  //                     }
  //                     return (
  //                       <Indicator key={indicator.get('id')}>
  //                         <Box direction="row">
  //                           <NumberField
  //                             field={{
  //                               title: indicator.getIn(['attributes', 'title']),
  //                               unit: indicator.getIn(['attributes', 'comment']),
  //                               value,
  //                               digits,
  //                               showEmpty: appMessages.labels.noIndicatorValue,
  //                               titleLink: {
  //                                 href: path,
  //                                 onClick: (evt) => {
  //                                   if (evt && evt.preventDefault) evt.preventDefault();
  //                                   onUpdatePath(path);
  //                                 },
  //                               },
  //                             }}
  //                           />
  //                         </Box>
  //                       </Indicator>
  //                     );
  //                   })}
  //                 </Box>
  //               </Group>
  //             );
  //           }
  //         )}
  //       </Box>
  //     )}
  //   </Box>
  // );
}

Statements.propTypes = {
  // viewEntity: PropTypes.instanceOf(Map),
  indicators: PropTypes.instanceOf(Map),
  statements: PropTypes.instanceOf(Map),
  actorsWithPositions: PropTypes.instanceOf(Map),
  associationsByType: PropTypes.instanceOf(Map),
  onUpdatePath: PropTypes.func,
  // intl: intlShape,
};

const mapStateToProps = (state) => ({
  indicators: selectIndicators(state),
  actorsWithPositions: selectActorsWithPositions(state),
});

function mapDispatchToProps(dispatch) {
  return {
    onUpdatePath: (path) => {
      dispatch(updatePath(path));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Statements);
