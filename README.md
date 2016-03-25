## redux-asserts
Functions to assert dispatched actions in redux

## Installation

`npm install redux-asserts --save-dev`

## Usage
In your testing code:

    import { configureTestStore } from 'redux-asserts';

 - Create a redux store for testing using `configureTestStore`
 - Use that store's `createDispatchThen` and `createListenForActions` functions to assert that actions were called.

### dispatchThen

Example:

    describe('course reducers', () => {
      let dispatchThen;
      beforeEach(() => {
        dispatchThen = store.createDispatchThen(state => state.courseList);
      });
  
      it('should fetch a list of courses successfully', done => {
        courseListStub.returns(Promise.resolve(["data"]));
  
        dispatchThen(fetchCourseList(), [REQUEST_COURSE_LIST, RECEIVE_COURSE_LIST_SUCCESS]).then(courseState => {
          assert.deepEqual(courseState.courseList, ["data"]);
          assert.equal(courseState.courseListStatus, FETCH_SUCCESS);
  
          done();
        });
      });
    });

This dispatches the `fetchCourseList` action, asserts that the two action types `REQUEST_COURSE_LIST` and `RECEIVE_COURSE_LIST_SUCCESS` were the only actions dispatched, then the promise resolves with the given state.

### listenForActions

Example:

    describe('cart rendering', () => {
      let listenForActions, store;
      beforeEach(() => {
        store = configureTestStore(reducer);
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

This runs the function passed into `listenForActions`, then waits while asserting the types dispatched. If the types are asserted to be dispatched, the promise resolves.
