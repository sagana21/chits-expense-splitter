import test from 'node:test';
import assert from 'node:assert/strict';
import { splitEqual, computeBalances, simplifyDebts } from '../utils/splitter.js';
import { toPaise } from '../utils/money.js';

test('splitEqual always adds up exactly', () => {
  const shares = splitEqual(10000, ['a', 'b', 'c']); // Rs 100 between 3
  assert.equal(Object.values(shares).reduce((x, y) => x + y, 0), 10000);
  assert.deepEqual(Object.values(shares).sort(), [3333, 3333, 3334]);
});

test('splitEqual rejects an empty list', () => {
  assert.throws(() => splitEqual(100, []));
});

test('balances always sum to zero', () => {
  const bal = computeBalances(['a', 'b', 'c'], [
    { paidBy: 'a', amount: 900, shares: { a: 300, b: 300, c: 300 } },
    { paidBy: 'b', amount: 300, shares: { a: 100, c: 200 } },
  ]);
  assert.deepEqual(bal, { a: 500, b: 0, c: -500 });
});

test('simplifyDebts clears every balance with few payments', () => {
  const bal = { a: 500, b: -200, c: -300, d: 0 };
  const transfers = simplifyDebts(bal);
  assert.ok(transfers.length <= 2);
  const after = { ...bal };
  for (const t of transfers) {
    after[t.from] += t.amount;
    after[t.to] -= t.amount;
  }
  assert.ok(Object.values(after).every((v) => v === 0));
});

test('a payment reduces what is owed', () => {
  const expenses = [
    { paidBy: 'a', amount: 900, shares: { a: 300, b: 300, c: 300 } },
    { paidBy: 'b', amount: 300, shares: { a: 300 } }, // b pays a back Rs 3.00
  ];
  const bal = computeBalances(['a', 'b', 'c'], expenses);
  assert.equal(bal.a, 300);
  assert.equal(bal.b, 0);
  assert.equal(bal.c, -300);
});

test('toPaise converts rupees and rejects bad input', () => {
  assert.equal(toPaise('12.50'), 1250);
  assert.equal(toPaise(33.33), 3333);
  assert.equal(toPaise('0'), null);
  assert.equal(toPaise('-4'), null);
  assert.equal(toPaise('abc'), null);
});
