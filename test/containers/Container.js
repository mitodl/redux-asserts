import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  updateCheckbox
} from '../actions';

class Container extends React.Component {
  render() {
    const { checkbox } = this.props;
    return <input
      type="checkbox"
      onChange={this.handleCheck.bind(this)}
      value={checkbox.checked}
    />;
  }

  handleCheck(e) {
    const { dispatch } = this.props;
    dispatch(updateCheckbox(e.target.checked));
  }
}

Container.propTypes = {
  dispatch: PropTypes.func.isRequired,
  checkbox: PropTypes.object.isRequired
};

const mapStateToProps = (state) => {
  return {
    checkbox: state.checkbox
  };
};

export default connect(mapStateToProps)(Container);
