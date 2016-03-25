## redux-asserts
Functions to assert dispatched actions in redux

## Installation

`npm install redux-asserts --save-dev`

## Tests
Check out the repository, run `npm install`, then run `npm test`.

## Usage
In your testing code:

    import configureTestStore from 'redux-asserts';
    import rootReducer from '../reducers';

Create a redux store for testing using `configureTestStore`. Then use that
store's `createListenForActions` and `createListenForActions` functions to
create the `listenForActions` and `dispatchThen` functions respectively.

### listenForActions

Asserts that a list of actions were called during the execution of the callback,
then resolves the `Promise`. The `Promise` will reject on an assertion error, but
note that there are cases where the `Promise` may resolve earlier than the user would want,
or the `Promise` may never be resolved or rejected.

This function takes two required arguments:

    listenForActions(actionTypes, callback) => Promise

- actionTypes: A list of action types to assert. This list must match exactly
the types that are dispatched to the store , but the types may be
in any order. If there are more action types being expected than actions, the
`Promise` may never resolve. If there are fewer action types, the `Promise` will
resolve since all expected action types were asserted. If at any point there is
an unexpected action type the `Promise` will reject.
- callback: A function to be executed right after the store starts listening
for actions to be asserted. Note that the actions don't need to be dispatched
within this function specifically. The store will keep listening until all
expected actions are received, or until there is one unexpected action.
- return value: A `Promise` which will be resolved or rejected after the
action types are asserted.

Example:

    describe('cart rendering', () => {
      let listenForActions, store;
      beforeEach(() => {
        store = configureTestStore(rootReducer);
        listenForActions = store.createListenForActions();
      });

      it('clicks the add to cart button', done => {
        listenForActions([UPDATE_CART_ITEMS, UPDATE_CART_VISIBILITY], () => {
          // Click the Update cart button
          let button = TestUtils.findRenderedDOMComponentWithClass(component, "add-to-cart");
          TestUtils.Simulate.click(button);
        }).then(state => {
          done();
        });
      });
    });

This runs the function passed into `listenForActions`, then waits while
asserting the types dispatched. If the types are asserted
to be dispatched, the promise resolves.

See also the examples in the test directory.

### dispatchThen

Dispatches an action or action creator, then asserts a list of action types were called,
then resolves the `Promise`. The `Promise` will reject on an assertion error, but
there are cases where the `Promise` may resolve earlier than the user would want,
or the `Promise` may never be resolved or rejected.

Note that this function is exactly the same as `listenForActions` but where the callback is

    dispatch(action());

This function takes two required arguments:

    dispatchThen(action, actionTypes) => Promise

- action: The action or action creator, whatever you would pass to `dispatch()`.
- actionTypes: A list of action types to assert. This list must match exactly
the types that are dispatched to the store by `action`, but the types may be
in any order. If there are more action types being expected than actions, the
`Promise` may never resolve. If there are fewer action types, the `Promise` will
resolve since all expected action types were asserted. If at any point there is
an unexpected action type the `Promise` will reject.
- return value: A `Promise` which will be resolved or rejected after the
action types are asserted.

Example:

    describe('course reducers', () => {
      let dispatchThen, store, courseListStub, sandbox;
      beforeEach(() => {
        // Create a redux store for testing
        store = configureTestStore(rootReducer);
        // Create the dispatchThen function we use below
        dispatchThen = store.createDispatchThen(state => state.courseList);

        // Stub API function to return our test data
        sandbox = sinon.sandbox.create();
        courseListStub = sinon.stub(api, 'getCourseList');
      });
  
      it('should fetch a list of courses successfully', done => {
        courseListStub.returns(Promise.resolve(COURSE_LIST_DATA));
  
        dispatchThen(fetchCourseList(), [REQUEST_COURSE_LIST, RECEIVE_COURSE_LIST_SUCCESS]).then(courseState => {
          assert.deepEqual(courseState.courseList, COURSE_LIST_DATA);
          assert.equal(courseState.courseListStatus, FETCH_SUCCESS);
  
          done();
        });
      });
    });

This dispatches the `fetchCourseList` action, asserts that the two action
types `REQUEST_COURSE_LIST` and `RECEIVE_COURSE_LIST_SUCCESS` were the only
actions dispatched, then the promise resolves with the given state.

See also the examples in the test directory.
