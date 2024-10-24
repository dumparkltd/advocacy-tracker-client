/*
 *
 * EntityListFooter
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import { Box } from 'grommet';
import { isEqual } from 'lodash/lang';

import A from 'components/styled/A';

import Icon from 'components/Icon';
import appMessages from 'containers/App/messages';
import PrintHide from 'components/styled/PrintHide';
import BoxPrint from 'components/styled/BoxPrint';
import TextPrint from 'components/styled/TextPrint';

const Styled = styled(PrintHide)`
  position: relative;
`;
const ListInline = styled.ul`
  list-style: none;
  padding-left: 0;
`;
const ListInlineItem = styled.li`
  position: relative;
  display: inline-block;
  padding: 0;
  font-size: 1em;
  color: ${palette('linkHover', 0)};
  vertical-align: middle;
  @media (min-width: ${(props) => props.theme && props.theme.breakpoints ? props.theme.breakpoints.medium : '769px'}) {
    font-size: 1.25em;
  }
  @media print {
    font-size: ${(props) => props.theme.sizes.print.large};
  }
  text-align: center;
`;
const ListInlineItemLink = styled(A)`
  width: 1.5em;
  height: 1.5em;
  line-height: 1.6;
  font-weight: bold;
  display: block;
  text-align: center;
  @media (min-width: ${(props) => props.theme && props.theme.breakpoints ? props.theme.breakpoints.medium : '769px'}) {
    width: 2em;
    height: 2em;
    line-height: 2;
  }
`;
const ListInlineItemActive = styled.div`
  width: 1.5em;
  height: 1.5em;
  line-height: 1.6;
  border-radius: 9999px;
  font-weight: bold;
  background-color: ${palette('buttonDefault', 1)};
  color: ${palette('buttonDefault', 0)};
  @media (min-width: ${(props) => props.theme && props.theme.breakpoints ? props.theme.breakpoints.medium : '769px'}) {
    width: 2em;
    height: 2em;
    line-height: 2;
  }
`;
const ListInlineItemNav = styled(A)`
  padding: 0;
  display: block;
  @media (min-width: ${(props) => props.theme && props.theme.breakpoints ? props.theme.breakpoints.medium : '769px'}) {
    padding: 0 0.5em;
  }
`;

const ListInlineItemNavDisabled = styled.div`
  color: ${palette('buttonDefaultDisabled', 1)};
  padding: 0;
  @media (min-width: ${(props) => props.theme && props.theme.breakpoints ? props.theme.breakpoints.medium : '769px'}) {
    padding: 0 0.5em;
  }`;

export class EntityListFooter extends React.Component { // eslint-disable-line react/prefer-stateless-function
  shouldComponentUpdate(nextProps) {
    return !isEqual(this.props.pager, nextProps.pager)
      || this.props.pageSize !== nextProps.pageSize;
  }

  render() {
    // console.log('EntityListOptions.render')
    const { intl } = this.context;
    const {
      pager,
      onPageSelect,
    } = this.props;
    if (!pager || !pager.pages || pager.pages.length <= 1) {
      return null;
    }

    return (
      <Styled>
        <Box fill="horizontal" align="center" pad={{ top: 'large', bottom: 'small' }}>
          {pager && pager.pages && pager.pages.length > 1 && (
            <BoxPrint printOnly>
              <TextPrint size="xsmall">{`Showing page ${pager.currentPage} of ${pager.totalPages} list pages total`}</TextPrint>
            </BoxPrint>
          )}
          <BoxPrint printHide>
            <ListInline>
              <ListInlineItem>
                {pager.currentPage > 1 && (
                  <ListInlineItemNav
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onPageSelect(Math.max(1, pager.currentPage - 1));
                    }}
                    title={intl && intl.formatMessage(appMessages.buttons.previous)}
                  >
                    <Icon name="arrowLeft" />
                  </ListInlineItemNav>
                )}
                {pager.currentPage === 1 && (
                  <ListInlineItemNavDisabled>
                    <Icon name="arrowLeft" />
                  </ListInlineItemNavDisabled>
                )}
              </ListInlineItem>
              {pager.pages.indexOf(1) < 0 && (
                <ListInlineItem>
                  <ListInlineItemLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onPageSelect(1);
                    }}
                  >
                    1
                  </ListInlineItemLink>
                </ListInlineItem>
              )}
              {pager.pages.indexOf(2) < 0 && (
                <ListInlineItem>
                  ...
                </ListInlineItem>
              )}
              {pager.pages.map((page, index) => (
                <ListInlineItem key={index}>
                  {pager.currentPage !== page && (
                    <ListInlineItemLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        onPageSelect(page);
                      }}
                    >
                      {page}
                    </ListInlineItemLink>
                  )}
                  {pager.currentPage === page && (
                    <ListInlineItemActive>
                      {page}
                    </ListInlineItemActive>
                  )}
                </ListInlineItem>
              ))}
              {pager.pages.indexOf(pager.totalPages - 1) < 0 && (
                <ListInlineItem>
                  ...
                </ListInlineItem>
              )}
              {pager.pages.indexOf(pager.totalPages) < 0 && (
                <ListInlineItem>
                  <ListInlineItemLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onPageSelect(pager.totalPages);
                    }}
                  >
                    {pager.totalPages}
                  </ListInlineItemLink>
                </ListInlineItem>
              )}
              <ListInlineItem>
                {pager.currentPage < pager.totalPages && (
                  <ListInlineItemNav
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onPageSelect(Math.min(pager.totalPages, parseInt(pager.currentPage, 10) + 1));
                    }}
                    title={intl && intl.formatMessage(appMessages.buttons.next)}
                  >
                    <Icon name="arrowRight" />
                  </ListInlineItemNav>
                )}
                {pager.currentPage === pager.totalPages && (
                  <ListInlineItemNavDisabled>
                    <Icon name="arrowRight" />
                  </ListInlineItemNavDisabled>
                )}
              </ListInlineItem>
            </ListInline>
          </BoxPrint>
        </Box>
      </Styled>
    );
  }
}

EntityListFooter.propTypes = {
  pager: PropTypes.object,
  pageSize: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onPageSelect: PropTypes.func,
};

EntityListFooter.contextTypes = {
  intl: PropTypes.object.isRequired,
};


export default EntityListFooter;
