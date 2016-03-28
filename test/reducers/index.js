import { combineReducers } from 'redux';
import { CHECKBOX_UPDATED } from '../actions';

const INITIAL_CHECKBOX = {
  checked: false
};
export const checkbox = (state = INITIAL_CHECKBOX, action) => {
  switch (action.type) {
  case CHECKBOX_UPDATED:
    return Object.assign({}, state, {
      checked: action.payload.checked
    });
  default:
    return state;
  }
};

export default combineReducers({
  checkbox
});
