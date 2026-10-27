import mongoose from 'mongoose';
import { CATEGORIES } from '../utils/expenseInput.js';

// `amount` and every `share` are integers in paise (1 rupee = 100 paise).
const expenseSchema = new mongoose.Schema(
  {
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
    description: { type: String, required: true, trim: true, maxlength: 80 },
    amount: { type: Number, required: true, min: 1 },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    splits: [
      {
        _id: false,
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        share: { type: Number, required: true, min: 0 },
      },
    ],
    category: { type: String, enum: CATEGORIES, default: 'other' },
    splitType: { type: String, enum: ['equal', 'exact', 'percent'], default: 'equal' },
    date: { type: Date, default: Date.now }, // when it was spent (can be backdated)
    // A payment between two people settles debt but is not "spending".
    isPayment: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Expense', expenseSchema);
