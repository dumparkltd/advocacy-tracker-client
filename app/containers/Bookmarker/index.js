import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { API } from 'themes/config';

import { getBookmarkForSaving, generateBookmarkTitle } from 'utils/bookmark';

import {
  loadEntitiesIfNeeded, deleteEntity, saveEntity, newEntity,
} from 'containers/App/actions';
import { selectReady, selectLocation, selectEntities } from 'containers/App/selectors';
import Icon from 'components/Icon';
import ButtonFlat from 'components/buttons/ButtonFlat';

import BookmarkForm from './BookmarkForm';
import { DEPENDENCIES } from './constants';
import { selectBookmarkForLocation } from './selectors';

const BookmarkerContainer = styled.div`
  z-index: 10;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    position: relative;
  }
`;

const ButtonAction = styled((p) => <ButtonFlat {...p} />)`
  padding: 0;
  min-height: 33px;
  min-width: 33px;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    padding: 0;
  }
`;


class Bookmarker extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    this.state = {
      new: true,
      open: false,
    };
  }

  UNSAFE_componentWillMount() {
    this.props.loadEntitiesIfNeeded();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!nextProps.dataReady) {
      this.props.loadEntitiesIfNeeded();
    }
  }

  render() {
    const {
      dataReady,
      bookmark,
      handleDelete,
      handleNew,
      handleUpdateTitle,
      location,
      bookmarks,
      viewTitle,
      type,
    } = this.props;

    if (dataReady) {
      return (
        <BookmarkerContainer>
          <ButtonAction
            subtle
            onClick={
              () => {
                if (!bookmark) {
                  this.setState({
                    new: true,
                    open: true,
                  });
                  handleNew(
                    location,
                    generateBookmarkTitle(
                      location,
                      bookmarks,
                      viewTitle,
                    ),
                    type,
                  );
                } else {
                  this.setState(
                    (prevState) => ({
                      new: false,
                      open: !prevState.open,
                    })
                  );
                }
              }
            }
          >
            {bookmark && <Icon name="bookmark_active" title="Edit bookmark for current view" />}
            {!bookmark && <Icon name="bookmark_inactive" title="Add bookmark for current view" />}
          </ButtonAction>
          {this.state.open && bookmark && (
            <BookmarkForm
              bookmark={bookmark}
              isNew={this.state.new}
              handleUpdateTitle={
                (title) => {
                  handleUpdateTitle(bookmark, title);
                  this.setState({ open: false });
                }
              }
              handleCancel={
                () => this.setState({ open: false })
              }
              handleDelete={
                () => {
                  handleDelete(bookmark.get('id'));
                  this.setState({ open: false });
                }
              }
            />
          )}
        </BookmarkerContainer>
      );
    }
    return null;
  }
}

Bookmarker.propTypes = {
  loadEntitiesIfNeeded: PropTypes.func,
  dataReady: PropTypes.bool,
  handleNew: PropTypes.func,
  handleUpdateTitle: PropTypes.func,
  handleDelete: PropTypes.func,
  bookmark: PropTypes.object,
  bookmarks: PropTypes.object,
  location: PropTypes.object,
  viewTitle: PropTypes.string,
  type: PropTypes.string,
};

const mapStateToProps = (state) => ({
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  bookmark: selectBookmarkForLocation(state),
  bookmarks: selectEntities(state, API.BOOKMARKS),
  location: selectLocation(state),
});
function mapDispatchToProps(dispatch) {
  return {
    loadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    handleDelete: (id) => {
      dispatch(deleteEntity({
        path: API.BOOKMARKS,
        id,
        redirect: false,
      }));
    },
    handleNew: (location, title, type) => {
      dispatch(newEntity({
        path: API.BOOKMARKS,
        entity: {
          attributes: {
            title,
            view: getBookmarkForSaving(location, type),
          },
        },
      }));
    },
    handleUpdateTitle: (bookmark, title) => {
      dispatch(saveEntity({
        path: API.BOOKMARKS,
        entity: {
          id: bookmark.get('id'),
          attributes: {
            view: bookmark.getIn(['attributes', 'view']),
            title,
          },
        },
      }));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Bookmarker);
