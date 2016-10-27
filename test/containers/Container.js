import React from 'react';
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
  dispatch: React.PropTypes.func.isRequired,
  checkbox: React.PropTypes.object.isRequired
};

const mapStateToProps = (state) => {
  return {
    checkbox: state.checkbox
  };
};

export default connect(mapStateToProps)(Container);
