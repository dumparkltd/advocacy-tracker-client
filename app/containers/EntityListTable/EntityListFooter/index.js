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
  @media (min-width: ${({ theme }) => theme && theme.breakpointsMin ? theme.breakpointsMin.medium : '769px'}) {
    font-size: 1.25em;
  }
  @media print {
    font-size: ${(props) => props.theme.sizes.print.large};
  }
  text-align: center;
`;
const ListInlineItemLink = styled(A)`
  width: 2.3em;
  height: 2.3em;
  line-height: 2.3;
  font-size: 13px;
  font-weight: 500;
  display: block;
  text-align: center;
  @media (min-width: ${({ theme }) => theme && theme.breakpointsMin ? theme.breakpointsMin.medium : '769px'}) {
    width: 2.5em;
    height: 2.5em;
    line-height: 2.5;
    font-size: 14px;
  }
`;
const ListInlineItemActive = styled.div`
  width: 2.3em;
  height: 2.3em;
  line-height: 2.3;
  font-size: 13px;
  border-radius: 9999px;
  font-weight: 500;
  background-color: ${palette('primary', 2)};
  color: ${palette('buttonDefault', 0)};
  @media (min-width: ${({ theme }) => theme && theme.breakpointsMin ? theme.breakpointsMin.medium : '769px'}) {
    width: 2.5em;
    height: 2.5em;
    line-height: 2.5;
    font-size: 14px;
  }
`;
const ListInlineItemNav = styled(A)`
  padding: 0;
  display: block;
  padding: 0 0.5em;
`;

const ListInlineItemNavDisabled = styled.div`
  color: ${palette('light', 4)};
  padding: 0;
  padding: 0 0.5em;
`;

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
                    <Icon name="arrowLeft" size="0.8em" />
                  </ListInlineItemNav>
                )}
                {pager.currentPage === 1 && (
                  <ListInlineItemNavDisabled>
                    <Icon name="arrowLeft" size="0.8em" />
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
                    <Icon name="arrowRight" size="0.8em" />
                  </ListInlineItemNav>
                )}
                {pager.currentPage === pager.totalPages && (
                  <ListInlineItemNavDisabled>
                    <Icon name="arrowRight" size="0.8em" />
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
