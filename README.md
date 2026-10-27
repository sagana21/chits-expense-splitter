# Chits: Group Expense Splitter

Track shared expenses in a group (hostel room, flat, trip) and see exactly **who owes whom**, using the fewest possible payments.
Project Demo Video->
https://drive.google.com/file/d/15PfRmM-fSLDqQId1v4sCVCfkzqgAVIJZ/view?usp=drivesdk


## Core workflows
1. **Sign up / log in** (JWT authentication).
2. **Create a group** and add friends by the email they signed up with.
3. **Add expenses**: who paid, how much, category, date, and how to split it (equal, exact amounts, or percentages).
4. **Settle up**: the app shows the minimum set of payments; click *Mark paid* to record one.

## Features
- Three ways to split: **equal**, **exact amounts**, **percentages** (always add up to the paisa)
- **Edit** and delete expenses, **backdate** them, tag them with a **category**
- **Settle-up plan** with the fewest possible payments
- **Overview** of what you owe / are owed across all groups
- **Insights**: spending by category (donut chart) and who paid how much
- **Search** and filter the history by person
- **Share** the settle-up on WhatsApp, copy it, or export the group to **CSV**
- Light and **dark mode**, loading skeletons, count-up numbers, confetti when a group is fully settled

## Tech stack
| Layer | Tech |
|-------|------|
| Frontend | React 18, React Router, Vite |
| Backend | Node.js, Express |
| Database | MongoDB with Mongoose |
| Auth | JWT + bcrypt |

## Project structure
```
backend/
  config/        db.js                   MongoDB connection
  controllers/   auth, group, expense    Request handling
  middlewares/   auth, groupAccess,      JWT check, "is this user in this group?", error handling
                 errorHandler
  models/        User, Group, Expense    Mongoose schemas
  routes/        auth, group, expense    URL -> controller wiring
  utils/         splitter, money,        Pure money logic, input validation, helpers
                 expenseInput, ...
  tests/         *.test.js               Unit tests
  index.js                               App entry point
frontend/
  src/
    components/  BottomNav, Sheet, Gauge, Insights, Avatar, ExpenseForm, ExpenseList, SettleUp, BalanceCards, ...
    hooks/       useTheme, useCountUp
    context/     AuthContext             Login state
    pages/       AuthPage, GroupsPage, GroupPage, ProfilePage
    utils/       format.js
    api.js       fetch wrapper that attaches the token
```

## Run it locally

You need **Node 18+** and a **MongoDB** database (local install, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster).

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env        # Windows: copy .env.example .env
# edit .env: set MONGO_URI and a long random JWT_SECRET
npm run dev
```
API runs on http://localhost:5000.

### 2. Frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173. Create two accounts (use a second browser or a private window), make a group with the first, add the second by email, and add some expenses.

### Tests
```bash
cd backend
npm test
```

## API overview
All routes except `/api/auth/*` need `Authorization: Bearer <token>`.

| Method | Route | What it does |
|--------|-------|--------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/me` | Current user |
| GET | `/api/groups` | My groups, with my balance in each |
| POST | `/api/groups` | Create group |
| GET | `/api/groups/:id` | Members, expenses, balances, settle-up plan |
| DELETE | `/api/groups/:id` | Delete group (creator only) |
| POST | `/api/groups/:id/members` | Add member by email |
| POST | `/api/groups/:id/expenses` | Add expense or payment |
| PUT | `/api/groups/:id/expenses/:expenseId` | Edit an expense |
| DELETE | `/api/groups/:id/expenses/:expenseId` | Delete expense |

## UI notes
Mobile-app style layout: floating bottom navigation with a centre action button, segmented arc gauge showing how much of the debt is settled, avatar initials, filter chips, and bottom sheets for forms. The whole look lives in `frontend/src/index.css` (colours are variables at the top).

### Expense body
```json
{
  "description": "Dinner", "amount": 900, "paidBy": "<userId>",
  "category": "food", "date": "2026-10-27T12:00:00.000Z",
  "splitType": "equal | exact | percent",
  "splitAmong": ["<userId>", "..."],
  "splitDetails": [{ "user": "<userId>", "value": 300 }]
}
```
Use `splitAmong` for equal splits and `splitDetails` (rupees or percent) for exact / percent splits.

## Design notes
- **Money is stored as integer paise**, never floats, so totals never drift.
- **Percent splits use the largest-remainder method** and exact splits must add up to the amount, otherwise the API returns a clear error.
- **Validation lives in one place** (`backend/utils/expenseInput.js`) and is unit-tested.
- **Equal splits hand out leftover paise** one at a time, so shares always add up to exactly the expense amount.
- **Debt simplification** (`backend/utils/splitter.js`): compute each person's net balance, then repeatedly match the biggest debtor with the biggest creditor. N people need at most N-1 payments.
- **Payments are stored as expenses with `isPayment: true`**: they change balances but do not count as spending.
- **Access control**: the `loadGroup` middleware rejects anyone who is not a member of the group (403), so one user can never read or change another group's data.
- Passwords are hashed with bcrypt, `password` is excluded from queries by default, and React escapes all rendered text.

## Deploying
- **Database**: MongoDB Atlas free tier.
- **Backend** (Render / Railway): root `backend`, build `npm install`, start `npm start`. Set `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL` (your frontend URL).
- **Frontend** (Vercel / Netlify): root `frontend`, build `npm run build`, output `dist`. Set `VITE_API_URL` to `https://<your-backend>/api`.

## Possible future work
Unequal and percentage splits, receipts upload, expense categories with charts, email invites for people who haven't signed up.
