import test from 'node:test';
import assert from 'node:assert/strict';
import { parseExpense, InputError } from '../utils/expenseInput.js';
import { splitPercent } from '../utils/splitter.js';

const members = ['a', 'b', 'c'];
const base = { description: 'Dinner', amount: '300', paidBy: 'a' };
const sum = (splits) => splits.reduce((s, x) => s + x.share, 0);

test('equal split by default', () => {
  const r = parseExpense({ ...base, splitAmong: ['a', 'b', 'c'] }, members, 'a');
  assert.equal(r.amount, 30000);
  assert.equal(sum(r.splits), 30000);
  assert.equal(r.splitType, 'equal');
  assert.equal(r.category, 'other');
});

test('exact split must add up to the amount', () => {
  const ok = parseExpense({ ...base, splitType: 'exact', splitDetails: [{ user: 'a', value: 100 }, { user: 'b', value: 200 }] }, members, 'a');
  assert.deepEqual(ok.splits, [{ user: 'a', share: 10000 }, { user: 'b', share: 20000 }]);
  assert.throws(
    () => parseExpense({ ...base, splitType: 'exact', splitDetails: [{ user: 'a', value: 100 }, { user: 'b', value: 150 }] }, members, 'a'),
    /add up to ₹250.00, but the expense is ₹300.00/
  );
});

test('percent split adds up exactly even when it does not divide evenly', () => {
  const r = parseExpense({ ...base, amount: '100', splitType: 'percent', splitDetails: [{ user: 'a', value: 33.33 }, { user: 'b', value: 33.33 }, { user: 'c', value: 33.34 }] }, members, 'a');
  assert.equal(sum(r.splits), 10000);
  assert.throws(
    () => parseExpense({ ...base, splitType: 'percent', splitDetails: [{ user: 'a', value: 50 }, { user: 'b', value: 40 }] }, members, 'a'),
    /not 100%/
  );
});

test('splitPercent largest remainder', () => {
  const s = splitPercent(100, [{ id: 'x', percent: 50 }, { id: 'y', percent: 25 }, { id: 'z', percent: 25 }]);
  assert.deepEqual(s, { x: 50, y: 25, z: 25 });
  const t = splitPercent(1, [{ id: 'x', percent: 50 }, { id: 'y', percent: 50 }]);
  assert.equal(t.x + t.y, 1);
});

test('rejects strangers, bad input, unknown types', () => {
  assert.throws(() => parseExpense({ ...base, splitAmong: ['a', 'zzz'] }, members, 'a'), InputError);
  assert.throws(() => parseExpense({ ...base, paidBy: 'zzz', splitAmong: ['a'] }, members, 'a'), InputError);
  assert.throws(() => parseExpense({ ...base, description: '  ', splitAmong: ['a'] }, members, 'a'), /Describe/);
  assert.throws(() => parseExpense({ ...base, amount: '-5', splitAmong: ['a'] }, members, 'a'), /greater than 0/);
  assert.throws(() => parseExpense({ ...base, splitType: 'magic' }, members, 'a'), /Unknown/);
  assert.throws(() => parseExpense({ ...base, splitAmong: [] }, members, 'a'), /at least one/);
});

test('category falls back to other and dates are checked', () => {
  const r = parseExpense({ ...base, splitAmong: ['a'], category: 'food', date: '2026-10-01T10:00:00.000Z' }, members, 'a');
  assert.equal(r.category, 'food');
  assert.equal(r.date.toISOString(), '2026-10-01T10:00:00.000Z');
  assert.equal(parseExpense({ ...base, splitAmong: ['a'], category: 'nonsense' }, members, 'a').category, 'other');
  assert.throws(() => parseExpense({ ...base, splitAmong: ['a'], date: 'not a date' }, members, 'a'), /not valid/);
  assert.throws(() => parseExpense({ ...base, splitAmong: ['a'], date: '2099-01-01' }, members, 'a'), /future/);
});

test('InputError carries a 400 status for the error handler', () => {
  try { parseExpense({}, members, 'a'); } catch (e) { assert.equal(e.status, 400); }
});
