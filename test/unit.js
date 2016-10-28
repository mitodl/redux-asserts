import { arrayDiff } from '../src/index';
import assert from 'assert';

describe('arrayDiff', () => {
  let xs = [1,2,3];
  let ys = [2,3,4];

  it('should return the difference of the arrays', () => {
    assert.deepEqual(arrayDiff(xs, ys), [1]);
    assert.deepEqual(arrayDiff(ys, xs), [4]);
  });

  it('should return nothing for indentical arrays', () => {
    assert.deepEqual(arrayDiff(xs, xs), []);
  });

  it('should not mutate original arrays at all', () => {
    let curxs = xs.concat();
    let curys = ys.concat();

    arrayDiff(xs, ys);
    arrayDiff(ys, xs);

    assert.deepEqual(xs, curxs);
    assert.deepEqual(ys, curys);
  });

  it('should handle dupes correctly', () => {
    let dupexs = xs.concat(2);
    let dupeys = ys.concat(3);

    assert.deepEqual(arrayDiff(dupexs, ys), [1,2]);
    assert.deepEqual(arrayDiff(dupeys, xs), [4, 3]);
  });
});
