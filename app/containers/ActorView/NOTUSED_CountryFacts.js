/*
 *
 * CountryFacts
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
// import { FormattedMessage, intlShape, injectIntl } from 'react-intl';
import { Box, Text, Button } from 'grommet';
import { Map } from 'immutable';
import styled from 'styled-components';
import qe from 'utils/quasi-equals';
import isNumber from 'utils/is-number';
import ButtonSimple from 'components/buttons/ButtonSimple';
import NumberField from 'components/fields/NumberField';
import { ROUTES } from 'themes/config';

const Group = styled((p) => <Box margin={{ bottom: 'large', top: 'medium' }} {...p} />)``;
const GroupTitle = styled.h5`
  font-size: 14px;
`;
export function CountryFacts(props) {
  const {
    indicators,
    resources,
    onUpdatePath,
    // intl,
  } = props;

  const indicatorsByResourceId = indicators && indicators.groupBy(
    (entity) => {
      if (entity.get('resourcesByType')) {
        return entity.get('resourcesByType').flatten().toList().first();
      }
      return 'without';
    }
  );
  return (
    <Box>
      {(!indicators || indicators.size === 0) && (
        <Box margin={{ vertical: 'small', horizontal: 'medium' }}>
          <Text>
            No indicators for actor in database
          </Text>
        </Box>
      )}
      {indicators && indicators.size > 0 && (
        <Box margin={{ vertical: 'small', horizontal: 'medium' }}>
          {indicatorsByResourceId && indicatorsByResourceId.keySeq().map(
            (resourceId) => {
              const resource = !qe(resourceId, 'without')
                && resources
                && resources.get(resourceId.toString());
              const resourceIndicators = indicatorsByResourceId.get(resourceId);
              return (
                <Group key={`res-${resourceId}`}>
                  {resource && (
                    <ButtonSimple onClick={() => onUpdatePath(`${ROUTES.RESOURCE}/${resourceId}`)}>
                      <GroupTitle>
                        {resource.getIn(['attributes', 'title'])}
                      </GroupTitle>
                    </ButtonSimple>
                  )}
                  {!resource && (
                    <GroupTitle>
                      Without resource
                    </GroupTitle>
                  )}
                  <Box gap="large">
                    {resourceIndicators && resourceIndicators.toList().map((indicator) => {
                      const path = `${ROUTES.ACTION}/${indicator.get('id')}`;
                      const value = isNumber(indicator.get('value'))
                        ? parseFloat(indicator.get('value'), 10)
                        : value;
                      let digits;
                      if (isNumber(value)) {
                        digits = value > 1 ? 1 : 3;
                      }
                      return (
                        <Box key={indicator.get('id')}>
                          <Box direction="row">
                            <NumberField
                              field={{
                                title: indicator.getIn(['attributes', 'title']),
                                unit: indicator.getIn(['attributes', 'comment']),
                                value,
                                digits,
                              }}
                            />
                          </Box>
                          <Button
                            plain
                            href={path}
                            onClick={(evt) => {
                              if (evt && evt.preventDefault) evt.preventDefault();
                              onUpdatePath(path);
                            }}
                            label={<Text size="xsmall">{'See all country values >'}</Text>}
                          />
                        </Box>
                      );
                    })}
                  </Box>
                </Group>
              );
            }
          )}
        </Box>
      )}
    </Box>
  );
}

CountryFacts.propTypes = {
  // viewEntity: PropTypes.instanceOf(Map),
  indicators: PropTypes.instanceOf(Map),
  resources: PropTypes.instanceOf(Map),
  onUpdatePath: PropTypes.func,
  // intl: intlShape,
};


// export default injectIntl(CountryFacts);
export default CountryFacts;
