import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import assert from 'assert';

import _ from 'lodash';

/**
 * Helper function to aid in async dispatch testing.
 * @param {Store} store The redux store
 * @param {Function} stateFunc When called, returns the part of the state we care about
 * @param {Function} actionListFunc When called, returns the list of actions
 * @param {Array} blacklistedActionTypes A list of action types which are ignored
 * @returns {Function} Returns a function which will dispatch an action and take a callback
 * to be executed after the store updates its state. Looks like:
 *   (action, expectedActions) => Promise
 * where
 *   action is an action to be dispatched (or falsey if no action)
 *   expectedActions is a list of actions to listen for
 *   The returned Promise is executed after the number of actions in expectedCalls
 *   is met
 */
function createDispatchThen(store, stateFunc, actionListFunc, blacklistedActionTypes) {
  let unsubscribe;
  let actionTypesFunc = () => actionListFunc().map(action => action.type).sort();

  return (action, actionTypes) => {
    if (typeof actionTypes !== 'object') {
      assert(false, "Expected a list of actions for second parameter of dispatchThen");
    }
    return new Promise(resolve => {
      // Note: we are not using Sets because we care about preserving duplicate values
      const expectedActionTypes = Array.from(actionTypes).concat(actionTypesFunc()).sort().filter(
        type => blacklistedActionTypes.indexOf(type) === -1
      );

      // If we called this twice unsubscribe the old instance from the store
      if (unsubscribe !== undefined) {
        unsubscribe();
      }
      if (_.isEqual(expectedActionTypes, actionTypesFunc())) {
        // No actions expected, run callback now
        if (action) {
          store.dispatch(action);
        }
        resolve(stateFunc(store.getState()));
      } else {
        unsubscribe = store.subscribe(() => {
          // Get current action list
          let actionListTypes = actionTypesFunc();
          if (_.isEqual(actionListTypes, expectedActionTypes)) {
            resolve(stateFunc(store.getState()));
          } else if (actionListTypes.length > expectedActionTypes.length) {
            console.error("Expected actions vs actual", expectedActionTypes, actionListTypes);
            assert.fail(actionListTypes, expectedActionTypes, "Received more actions than expected");
          }
        });
        if (action) {
          store.dispatch(action);
        }
      }
    }).catch(e => {
      // Make sure we don't accidentally silence errors
      console.error(e);
      return Promise.reject(e);
    });
  };
}

/**
 * Listen for actions. After some actions have been processed execute
 * a callback so the user can verify state.
 *
 * @param {Store} store The redux store
 * @param {Function} stateFunc When called, returns the part of the state we care about
 * @param {Function} actionListFunc When called, returns the list of actions
 * @param {Array} blacklistedActionTypes A list of action types which are ignored
 * @returns {Function} Returns a function:
 *   (expectedActionTypes, callback) => Promise
 * where
 *   expectedActionTypes is a list of actions that must be the only actions dispatched
 *     by the code in the callback,
 *   callback which runs the code that will dispatch actions indirectly
 * and returns a Promise that resolves after the expected actions have occurred.
 *
 * Example:
 *   const listenForActions = store.createListenForActions(state => state);
 *   listenForActions(['UPDATE_SELECTED_CHAPTERS', 'UPDATE_SEAT_COUNT'], () => {
 *     runFuncWhichDispatchesTwoActions();
 *   }).then(state => {
 *     assert.deepEqual(state, {
 *       ...
 *     });
 *   });
 */
function createListenForActions(store, stateFunc, actionListFunc, blacklistedActionTypes) {
  let unsubscribe;
  let actionTypesFunc = () => actionListFunc().map(action => action.type).sort();

  return (actionTypes, callback) => {
    return new Promise(resolve => {
      // Note: we are not using Sets because we care about preserving duplicate values
      const expectedActionTypes = Array.from(actionTypes).concat(actionTypesFunc()).sort().filter(
        type => blacklistedActionTypes.indexOf(type) === -1
      );

      // If we called this twice unsubscribe the old instance from the store
      if (unsubscribe !== undefined) {
        unsubscribe();
      }
      if (_.isEqual(actionTypesFunc(), expectedActionTypes)) {
        // No actions expected, run callback now
        callback();

        resolve(stateFunc(store.getState()));
      } else {
        unsubscribe = store.subscribe(() => {
          // Get current action list
          let actionListTypes = actionTypesFunc();
          if (_.isEqual(actionListTypes, expectedActionTypes)) {
            resolve(stateFunc(store.getState()));
          } else if (actionListTypes.length > expectedActionTypes.length) {
            console.error("Expected actions vs actual", expectedActionTypes, actionListTypes);
            assert.fail(actionListTypes, expectedActionTypes, "Received more actions than expected");
          }
        });

        callback();
      }
    }).catch(e => {
      // Make sure we don't accidentally silence errors
      console.error(e);
      return Promise.reject(e);
    });
  };
}

// Keep a list of actions executed for testing purposes
const subscriber = subscribe => store => next => action => {
  if (subscribe !== undefined) {
    subscribe(action);
  }
  return next(action);
};

export default function configureTestStore(rootReducer, initialState, blacklistedActionTypes = []) {
  let actionList = [];

  const createStoreWithMiddleware = applyMiddleware(
    thunkMiddleware,
    subscriber(action => {
      actionList = actionList.concat(action);
    })
  )(createStore);

  let actionListFunc = () => actionList.filter(
    action => blacklistedActionTypes.indexOf(action.type) === -1
  );

  const store = createStoreWithMiddleware(rootReducer, initialState);
  const identity = state => state;
  store.createDispatchThen = (stateFunc = identity) => createDispatchThen(
    store, stateFunc, actionListFunc, blacklistedActionTypes
  );
  store.createListenForActions = (stateFunc = identity) => createListenForActions(
    store, stateFunc, actionListFunc, blacklistedActionTypes
  );
  return store;
}
