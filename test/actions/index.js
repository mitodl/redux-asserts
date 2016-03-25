export const UPDATE_CHECKBOX = 'UPDATE_CHECKBOX';
export const CHECKBOX_UPDATED = 'CHECKBOX_UPDATED';

export const updateCheckbox = (checked, timeout) => {
  return dispatch => {
    dispatch({ type: UPDATE_CHECKBOX });
    setTimeout(() => {
      dispatch({
        type: CHECKBOX_UPDATED,
        payload: {
          checked
        }
      });
    }, timeout);
  };
};
