import { splitEqual, splitPercent } from './splitter.js';
import { toPaise } from './money.js';

export const CATEGORIES = ['food', 'rent', 'travel', 'bills', 'shopping', 'fun', 'other'];

/** An error the client caused. The error handler turns `status` into the HTTP code. */
export class InputError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InputError';
    this.status = 400;
  }
}

const rupeesText = (paise) => (paise / 100).toFixed(2);
const NOT_IN_GROUP = 'Everyone in an expense must belong to this group';

// Rows with a blank or zero value are ignored; the rest must be unique group members.
function cleanRows(details, memberIds) {
  const seen = new Set();
  const rows = [];
  for (const d of Array.isArray(details) ? details : []) {
    const id = String(d?.user);
    const value = Number(d?.value);
    if (!(value > 0)) continue;
    if (!memberIds.includes(id)) throw new InputError(NOT_IN_GROUP);
    if (seen.has(id)) throw new InputError('Each person can only appear once');
    seen.add(id);
    rows.push({ id, value });
  }
  return rows;
}

/** Validates a request body for creating/editing an expense and works out each person's share.
 *  Returns { description, amount, paidBy, splits, splitType, category, date?, isPayment }. */
export function parseExpense(body, memberIds, defaultPayer) {
  const { description, amount, paidBy, splitType = 'equal', splitAmong, splitDetails, category, date, isPayment } =
    body || {};

  const text = typeof description === 'string' ? description.trim() : '';
  if (!text) throw new InputError('Describe what the money was for');
  if (text.length > 80) throw new InputError('Keep the description under 80 characters');

  const paise = toPaise(amount);
  if (paise === null) throw new InputError('Enter an amount greater than 0');

  const payer = String(paidBy || defaultPayer);
  if (!memberIds.includes(payer)) throw new InputError(NOT_IN_GROUP);

  let splits;
  if (splitType === 'equal') {
    const people = [...new Set((Array.isArray(splitAmong) ? splitAmong : []).map(String))];
    if (people.length === 0) throw new InputError('Pick at least one person to split with');
    if (people.some((id) => !memberIds.includes(id))) throw new InputError(NOT_IN_GROUP);
    const shares = splitEqual(paise, people);
    splits = people.map((id) => ({ user: id, share: shares[id] }));
  } else if (splitType === 'exact' || splitType === 'percent') {
    const rows = cleanRows(splitDetails, memberIds);
    if (rows.length === 0) throw new InputError('Enter a value for at least one person');
    if (splitType === 'exact') {
      const shares = rows.map((r) => toPaise(r.value));
      if (shares.includes(null)) throw new InputError('Amounts must be at least ₹0.01');
      const sum = shares.reduce((a, b) => a + b, 0);
      if (sum !== paise) {
        throw new InputError(`The amounts add up to ₹${rupeesText(sum)}, but the expense is ₹${rupeesText(paise)}`);
      }
      splits = rows.map((r, i) => ({ user: r.id, share: shares[i] }));
    } else {
      const sum = rows.reduce((s, r) => s + r.value, 0);
      if (Math.abs(sum - 100) > 0.01) {
        throw new InputError(`The percentages add up to ${Number(sum.toFixed(2))}%, not 100%`);
      }
      const shares = splitPercent(paise, rows.map((r) => ({ id: r.id, percent: r.value })));
      splits = rows.map((r) => ({ user: r.id, share: shares[r.id] }));
    }
  } else {
    throw new InputError('Unknown way of splitting');
  }

  let when;
  if (date) {
    when = new Date(date);
    if (Number.isNaN(when.getTime())) throw new InputError('That date is not valid');
    if (when.getTime() > Date.now() + 24 * 60 * 60 * 1000) throw new InputError("The date can't be in the future");
  }

  return {
    description: text,
    amount: paise,
    paidBy: payer,
    splits,
    splitType,
    category: CATEGORIES.includes(category) ? category : 'other',
    date: when,
    isPayment: Boolean(isPayment),
  };
}
