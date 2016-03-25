// Make sure window and document are available for testing
require('jsdom-global')();

import React from 'react';
import ReactDOM from 'react-dom';
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

  it('clicks a checkbox', done => {
    assert.deepEqual(store.getState().checkbox, {
      checked: false
    });
    let checkbox = TestUtils.findRenderedDOMComponentWithTag(component, "input");
    listenForActions([UPDATE_CHECKBOX, CHECKBOX_UPDATED], () => {
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
      done();
    });
  });

  it('ignores the order of action types', done => {
    let checkbox = TestUtils.findRenderedDOMComponentWithTag(component, "input");
    listenForActions([CHECKBOX_UPDATED, UPDATE_CHECKBOX], () => {
      TestUtils.Simulate.change(checkbox, {
        target: {
          checked: true
        }
      });
    }).then(state => {
      assert.ok(state.checkbox.checked);
      done();
    });
  });

  it('should handle duplicate action types', done => {
    let checkbox = TestUtils.findRenderedDOMComponentWithTag(component, "input");
    listenForActions([UPDATE_CHECKBOX, CHECKBOX_UPDATED, UPDATE_CHECKBOX, CHECKBOX_UPDATED], () => {
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
      done();
    });
  });

  it('rejects the promise because an action type is missing', done => {
    assert.deepEqual(store.getState().checkbox, {
      checked: false
    });
    let checkbox = TestUtils.findRenderedDOMComponentWithTag(component, "input");
    listenForActions([CHECKBOX_UPDATED], () => {
      TestUtils.Simulate.change(checkbox);
    }).catch(e => {
      assert.equal(e.message, 'Received more actions than expected: ' +
        'actionListTypes: ["CHECKBOX_UPDATED","UPDATE_CHECKBOX"], ' +
        'expectedActionTypes: ["CHECKBOX_UPDATED"]');
      done();
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
});
