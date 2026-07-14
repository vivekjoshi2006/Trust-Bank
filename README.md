# 🏦 Trust Bank – Bank Management System

Trust Bank is a modern, responsive **Bank Management System** built with **Next.js 14 (App Router)**, **TypeScript**, and **Tailwind CSS**. The application simulates core banking operations including customer management, account transactions, fund transfers, authentication, and PDF statement generation while running entirely client-side using LocalStorage.

Designed for educational purposes and portfolio demonstration, the project provides a realistic banking workflow without requiring a backend or database.

---

# ✨ Features

## 🔐 Authentication
- Session-based admin login
- Persistent login using Session Storage
- Secure logout with session destruction

## 👤 Customer Management
- Register new customers
- Minimum deposit validation
- Edit customer details inline
- Activate/Deactivate customer accounts
- Real-time status updates

## 💳 Banking Operations
- Deposit funds
- Withdraw funds
- Balance validation
- Real-time account balance updates

## 💸 Fund Transfers
- Transfer money between active accounts
- Transaction validation
- Automatic debit and credit processing

## 📄 PDF Statement Generation
- Download complete bank ledger
- Generate individual customer statements
- Printable transaction history
- Customer profile summary

## 📊 Dashboard
- Customer overview
- Account balances
- Transaction history
- Live account status

## 💾 Data Persistence
- LocalStorage for customer records
- SessionStorage for authentication
- Automatic initialization of demo data

## 📱 Responsive Design
- Desktop, tablet, and mobile support
- Modern Tailwind CSS interface

---

# 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 14 (App Router) | React Framework |
| TypeScript | Type Safety |
| React | User Interface |
| Tailwind CSS | Styling |
| Lucide React | Icons |
| LocalStorage | Customer & Transaction Storage |
| SessionStorage | Authentication Session |
| Vercel | Deployment |

---

# 📂 Project Structure

```text
trust-bank/
│
├── src/
│   └── app/
│       ├── layout.tsx
│       ├── page.tsx
│       ├── globals.css
│       └── favicon.ico
│
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── vercel.json
└── README.md
```

---

# 🚀 Getting Started

## 1. Clone the Repository

```bash
git clone https://github.com/your-username/trust-bank.git
```

## 2. Navigate to the Project

```bash
cd trust-bank
```

## 3. Install Dependencies

```bash
npm install
```

## 4. Start the Development Server

```bash
npm run dev
```

## 5. Open in Your Browser

```
http://localhost:3000
```

---

# 🔑 Demo Login

Use the following credentials to access the dashboard:

| Field | Value |
|-------|-------|
| Password | `12` |

---

# 🎯 Core Functionalities

- Admin authentication
- Customer registration
- Deposit & withdrawal operations
- Fund transfers
- Account activation/deactivation
- Inline customer profile editing
- Transaction ledger
- PDF statement generation
- Local data persistence

---

# 📦 Available Scripts

| Command | Description |
|----------|-------------|
| `npm run dev` | Starts the development server |
| `npm run build` | Builds the application |
| `npm start` | Runs the production build |
| `npm run lint` | Runs ESLint |

---

# 💾 Data Storage

The application stores data locally using:

- **LocalStorage** – Customer records, balances, and transactions
- **SessionStorage** – Login session

If no data exists, the application automatically initializes a demo dataset.

To reset the application:

```javascript
localStorage.clear();
sessionStorage.clear();
```

Refresh the browser after clearing storage.

---

# 🎨 UI Highlights

- Responsive dashboard
- Modern banking interface
- Interactive data tables
- Inline editing
- Real-time notifications
- PDF statement export
- Tailwind CSS components

---

# 📱 Responsive Design

Optimized for:

- 💻 Desktop
- 💼 Laptop
- 📱 Mobile
- 📟 Tablet

---

# 🚀 Future Enhancements

- Backend integration
- Secure JWT authentication
- Database support (PostgreSQL/MySQL)
- Customer login portal
- Loan management
- Account search & filters
- Analytics dashboard
- Email notifications
- Multi-user roles
- Cloud deployment with persistent database

---

# ☁️ Deployment

The project is optimized for **Vercel**.

Deploy by:

1. Fork or clone the repository
2. Import it into Vercel
3. Deploy using the default Next.js settings

No additional configuration is required.

---

# 📄 Disclaimer

This project is a **banking simulation** created for educational and portfolio purposes only. It does **not** connect to real banking systems, payment gateways, or financial institutions.

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/new-feature
```

3. Commit your changes

```bash
git commit -m "Add new feature"
```

4. Push your branch

```bash
git push origin feature/new-feature
```

5. Open a Pull Request

---

# 📄 License

This project is licensed under the **MIT License**.

---

# 👨‍💻 Author

Built with ❤️ using **Next.js**, **TypeScript**, and **Tailwind CSS**.

If you found this project useful, consider giving it a ⭐ on GitHub!
