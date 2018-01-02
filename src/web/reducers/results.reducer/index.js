// @flow

import * as Actions from 'actionTypes';

/**
 * It runs the correct action received
 * @param {object} state of the application
 * @param {object} action received
 * @return {object} new object whic represent the new state after the action
 */
const results = (state: Object = {}, action: Object) => {
  if (action.type === Actions.FETCH_RESULTS) {
    const newState = Object.assign({}, state);
    newState['isLoading'] = true;

    return newState;
  } else if (action.type === Actions.ADD_RESULTS) {
    return {
      ...state,
      isLoading: false,
      ...action.results
    };
  }

  return state;
};

export default results;
