import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { palette } from 'styled-theme';

import { ROUTES } from 'themes/config';

import { selectCurrentPathname } from 'containers/App/selectors';
import { updatePath } from 'containers/App/actions';
import appMessages from 'containers/App/messages';

import PrintHide from 'components/styled/PrintHide';
import Container from 'components/styled/Container';
import Content from 'components/styled/Content';

import LinkMain from './LinkMain';
import messages from './messages';

const Styled = styled.div`
  background-color: ${palette('primary', 3)};
  box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.2);
  position: relative;
  padding: 40px 0 0;
  @media print {
    display: block;
    height: ${({ theme }) => theme.sizes.headerExplore.banner.height}px;
    position: static;
    box-shadow: none;
    background: white;
  }
`;

const LinkTitle = styled.div`
  font-size: ${(props) => props.theme.sizes.text.small};
  font-weight: bold;
  @media (min-width: ${(props) => props.theme.breakpoints.small}) {
    font-size: ${(props) => props.theme.sizes.text.default};
  }
  @media print {
    font-size: ${(props) => props.theme.sizes.print.default};
  }
`;

const NavMain = styled(PrintHide)`
  white-space: nowrap;
`;

const Title = styled.h1`
  font-size: 1.5em;
  margin: 0;
  max-width: 720px;
`;
const Label = styled.div`
  margin-top: 30px;
  font-size: 0.7em;
`;

const StyledContainer = styled(Container)`
  padding-bottom: 0;
`;
class HeaderExplore extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { onPageLink, currentPath } = this.props;
    const { intl } = this.context;

    const navItems = [
      {
        path: ROUTES.ACTIONS,
        title: intl.formatMessage(appMessages.nav.actions),
        active: currentPath && currentPath.startsWith(ROUTES.ACTION),
      },
      {
        path: ROUTES.ACTORS,
        title: intl.formatMessage(appMessages.nav.actors),
        active: currentPath && currentPath.startsWith(ROUTES.ACTOR),
      },
    ];
    return (
      <Styled>
        <StyledContainer>
          <Content>
            <Title>
              <FormattedMessage {...messages.title} />
            </Title>
            <Label>
              <FormattedMessage {...messages.explore} />
            </Label>
            <NavMain>
              {navItems && navItems.map((item, i) => (
                <LinkMain
                  key={i}
                  href={item.path}
                  active={item.active}
                  onClick={(evt) => {
                    if (evt !== undefined && evt.preventDefault) evt.preventDefault();
                    onPageLink(item.path);
                  }}
                >
                  <LinkTitle active={item.active}>
                    {item.title}
                  </LinkTitle>
                </LinkMain>
              ))}
            </NavMain>
          </Content>
        </StyledContainer>
      </Styled>
    );
  }
}

HeaderExplore.propTypes = {
  onPageLink: PropTypes.func.isRequired,
  currentPath: PropTypes.string,
};

HeaderExplore.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  currentPath: selectCurrentPathname(state),
});


export function mapDispatchToProps(dispatch) {
  return {
    onPageLink: (path, args) => {
      dispatch(updatePath(path, args));
    },
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(HeaderExplore);
