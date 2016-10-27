import assert from 'assert';
import configureTestStore from '../../src/index';
import rootReducer from './index';
import {
  updateCheckbox,
  UPDATE_CHECKBOX,
  CHECKBOX_UPDATED,
} from '../actions';

describe('dispatchThen', () => {
  let store, dispatchThen;

  beforeEach(() => {
    store = configureTestStore(rootReducer);
    dispatchThen = store.createDispatchThen(state => state.checkbox);
  });

  it('should check the checkbox', done => {
    dispatchThen(updateCheckbox(true), [UPDATE_CHECKBOX, CHECKBOX_UPDATED]).then(checkbox => {
      assert.ok(checkbox.checked);

      done();
    });
  });

  it('should ignore the order of action types', done => {
    dispatchThen(updateCheckbox(true), [CHECKBOX_UPDATED, UPDATE_CHECKBOX]).then(checkbox => {
      assert.ok(checkbox.checked);

      done();
    });
  });

  it('should handle duplicate action types', done => {
    const updateTwice = dispatch => {
      dispatch(updateCheckbox(true));
      dispatch(updateCheckbox(false));
    };

    dispatchThen(
      updateTwice,
      [UPDATE_CHECKBOX, CHECKBOX_UPDATED, UPDATE_CHECKBOX, CHECKBOX_UPDATED]
    ).then(checkbox => {
      assert.ok(!checkbox.checked);

      done();
    });
  });

  it('should error if we forget the action types list', () => {
    try {
      dispatchThen(updateCheckbox(true));
    } catch (e) {
      assert.equal(e.message, "Expected a list of actions for second parameter of dispatchThen");
    }
  });

  it("should reject the promise if the action types don't match", done => {
    dispatchThen(updateCheckbox(true), ['missing']).catch(e => {
      assert.equal(e.message, `ReduxAsserts: didn't receive the expected actions

Unexpected actions:
[
    CHECKBOX_UPDATED,
    UPDATE_CHECKBOX,
]


Expected, unreceived actions:
[
    missing,
]

`);
      done();
    });
  });

  it("should timeout if an extra action is never dispatched", done => {
    dispatchThen(updateCheckbox(true), [UPDATE_CHECKBOX, CHECKBOX_UPDATED, 'missing']).then(() => {
      assert.fail("Should not happen");
    });
    setTimeout(() => {
      // all actions should have been received by the store subscriber by now
      done();
    }, 100);
  });

  it("should unsubscribe any previous dispatchThen subscribers if called twice", done => {
    dispatchThen(updateCheckbox(true), [UPDATE_CHECKBOX, CHECKBOX_UPDATED]).then(checkbox => {
      assert.ok(checkbox.checked);

      dispatchThen(updateCheckbox(false), [UPDATE_CHECKBOX, CHECKBOX_UPDATED]).then(checkbox => {
        assert.ok(!checkbox.checked);

        done();
      });
    });
  });

  it('should resolve immediately if there are no actions to assert', done => {
    dispatchThen(updateCheckbox(true), []).then(checkbox => {
      // The action has been dispatched but we never yielded control to let
      // the reducer alter state
      assert.ok(!checkbox.checked);

      done();
    });
  });
});
