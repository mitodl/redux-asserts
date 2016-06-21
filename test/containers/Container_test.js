// Make sure window and document are available for testing
require('jsdom-global')();

import React from 'react';
import TestUtils from 'react-addons-test-utils';
import assert from 'assert';
import { Provider } from 'react-redux';

import configureTestStore from '../../src/index';
import rootReducer from '../reducers';
import { UPDATE_CHECKBOX, CHECKBOX_UPDATED } from '../actions';
import Container from './Container';

describe('listenForActions', () => {
  let store, listenForActions, component;

  beforeEach(() => {
    store = configureTestStore(rootReducer);
    listenForActions = store.createListenForActions();

    component = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Container />
      </Provider>
    );
  });

  it('clicks a checkbox', () => {
    assert.deepEqual(store.getState().checkbox, {
      checked: false
    });
    let checkbox = TestUtils.findRenderedDOMComponentWithTag(component, "input");
    return listenForActions([UPDATE_CHECKBOX, CHECKBOX_UPDATED], () => {
      TestUtils.Simulate.change(checkbox, {
        target: {
          checked: true
        }
      });
    }).then(state => {
      // In this case we never passed a state function to createListenForActions
      // so state is just store.getState()
      assert.deepEqual(store.getState(), state);
      assert.ok(state.checkbox.checked);
    });
  });

  it('ignores the order of action types', () => {
    let checkbox = TestUtils.findRenderedDOMComponentWithTag(component, "input");
    return listenForActions([CHECKBOX_UPDATED, UPDATE_CHECKBOX], () => {
      TestUtils.Simulate.change(checkbox, {
        target: {
          checked: true
        }
      });
    }).then(state => {
      assert.ok(state.checkbox.checked);
    });
  });

  it('should handle duplicate action types', () => {
    let checkbox = TestUtils.findRenderedDOMComponentWithTag(component, "input");
    return listenForActions([UPDATE_CHECKBOX, CHECKBOX_UPDATED, UPDATE_CHECKBOX, CHECKBOX_UPDATED], () => {
      TestUtils.Simulate.change(checkbox, {
        target: {
          checked: true
        }
      });
      TestUtils.Simulate.change(checkbox, {
        target: {
          checked: false
        }
      });
    }).then(state => {
      assert.ok(!state.checkbox.checked);
    });
  });

  it('rejects the promise because an action type is missing', () => {
    assert.deepEqual(store.getState().checkbox, {
      checked: false
    });
    let checkbox = TestUtils.findRenderedDOMComponentWithTag(component, "input");
    return listenForActions([CHECKBOX_UPDATED], () => {
      TestUtils.Simulate.change(checkbox);
    }).catch(e => {
      assert.equal(e.message, 'Received more actions than expected: ' +
        'actionListTypes: ["CHECKBOX_UPDATED","UPDATE_CHECKBOX"], ' +
        'expectedActionTypes: ["CHECKBOX_UPDATED"]');
    });
  });

  it('throws an error if the types are missing', () => {
    try {
      listenForActions();
    } catch (e) {
      assert.equal(e.message, "Expected a list of actions for first parameter of listenForActions");
    }
  });

  it('throws an error if the callback is missing', () => {
    try {
      listenForActions([CHECKBOX_UPDATED]);
    } catch (e) {
      assert.equal(e.message, "Callback argument is required for listenForActions");
    }
  });

  it("times out because we're missing an action", done => {
    assert.deepEqual(store.getState().checkbox, {
      checked: false
    });
    let checkbox = TestUtils.findRenderedDOMComponentWithTag(component, "input");
    listenForActions([UPDATE_CHECKBOX, CHECKBOX_UPDATED, "missing"], () => {
      TestUtils.Simulate.change(checkbox, {
        target: {
          checked: true
        }
      });
    }).then(() => {
      assert.fail("Should not get here");
    });

    setTimeout(() => {
      // All actions should have been received by now
      done();
    }, 100);
  });

  it('rejects a promise if an error was thrown after all actions were dispatched', done => {
    assert.deepEqual(store.getState().checkbox, {
      checked: false
    });
    let checkbox = TestUtils.findRenderedDOMComponentWithTag(component, "input");
    listenForActions([UPDATE_CHECKBOX], () => {
      TestUtils.Simulate.change(checkbox, {
        target: {
          checked: true
        }
      });
      // UPDATE_CHECKBOX has been received but listenForActions will wait until this
      // callback is done to ensure any errors are thrown
      throw new Error("test error was thrown");
    }).catch(error => {
      assert.equal("test error was thrown", error.message);
      done();
    });
  });

  it('rejects a promise if an extra action was dispatched', done => {
    assert.deepEqual(store.getState().checkbox, {
      checked: false
    });
    let checkbox = TestUtils.findRenderedDOMComponentWithTag(component, "input");
    listenForActions([UPDATE_CHECKBOX], () => {
      TestUtils.Simulate.change(checkbox, {
        target: {
          checked: true
        }
      });
      // UPDATE_CHECKBOX has been received but listenForActions will wait until this
      // callback is done to ensure any errors are thrown
      store.dispatch({ type: CHECKBOX_UPDATED, payload: true });
    }).catch(error => {
      assert.equal('Received more actions than expected: actionListTypes: ["CHECKBOX_UPDATED","UPDATE_CHECKBOX"], ' +
        'expectedActionTypes: ["UPDATE_CHECKBOX"]', error.message);
      done();
    });
  });
});
