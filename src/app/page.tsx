'use client';

import React, { useState, useEffect } from 'react';
import {
    Users,
    ArrowRightLeft,
    PlusCircle,
    History,
    CheckCircle,
    XCircle,
    TrendingUp,
    IndianRupee,
    AlertCircle
} from 'lucide-react';

// Data Structures
interface Account {
    id: string; // Account Number
    name: string;
    email: string;
    balance: number;
    isActive: boolean;
    createdAt: string;
}

interface Transaction {
    id: string;
    type: 'Deposit' | 'Withdrawal' | 'Transfer';
    fromAccount?: string;
    toAccount?: string;
    amount: number;
    timestamp: string;
    description: string;
}

// Mock Data
const INITIAL_ACCOUNTS: Account[] = [
    { id: "10012024", name: "NAME 1", email: "name1@gmail.com", balance: 5000, isActive: true, createdAt: "2026-01-10" },
    { id: "10022024", name: "NAME 2", email: "name2@gmail.com", balance: 2500, isActive: true, createdAt: "2026-02-12" },
    { id: "10032024", name: "NAME 3", email: "name3@gmail.com", balance: 1200, isActive: false, createdAt: "2026-03-01" },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
    { id: "TXN101", type: "Deposit", toAccount: "10012024", amount: 5000, timestamp: "2026-01-10 10:00", description: "Initial deposit" },
    { id: "TXN102", type: "Deposit", toAccount: "10022024", amount: 2500, timestamp: "2026-02-12 11:30", description: "Initial deposit" },
    { id: "TXN103", type: "Deposit", toAccount: "10032024", amount: 1200, timestamp: "2026-03-01 14:15", description: "Initial deposit" },
];

export default function BankManagementSystem() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isMounted, setIsMounted] = useState(false);

    // Admin Authentication States
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [adminName, setAdminName] = useState('');
    const [loginUser, setLoginUser] = useState('');
    const [loginPass, setLoginPass] = useState('');

    // Edit Account States
    const [editingAccId, setEditingAccId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');

    const [activeTab, setActiveTab] = useState<'overview' | 'accounts' | 'transactions' | 'transfer' | 'deposit-withdraw' | 'create-customer'>('overview');

    // Form States
    const [newAccName, setNewAccName] = useState('');
    const [newAccEmail, setNewAccEmail] = useState('');
    const [newAccDeposit, setNewAccDeposit] = useState('');

    const [transferFrom, setTransferFrom] = useState('');
    const [transferTo, setTransferTo] = useState('');
    const [transferAmount, setTransferAmount] = useState('');

    const [depWithAcc, setDepWithAcc] = useState('');
    const [depWithAmount, setDepWithAmount] = useState('');
    const [depWithType, setDepWithType] = useState<'Deposit' | 'Withdrawal'>('Deposit');

    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Safe client-side data loading
    useEffect(() => {
        setIsMounted(true);
        const storage = typeof globalThis !== 'undefined' ? (globalThis as any).localStorage : null;
        const session = typeof globalThis !== 'undefined' ? (globalThis as any).sessionStorage : null;

        if (storage) {
            const savedAccounts = storage.getItem('bank_accounts');
            const savedTxns = storage.getItem('bank_txns');

            if (savedAccounts && JSON.parse(savedAccounts).length > 0) {
                setAccounts(JSON.parse(savedAccounts));
            } else {
                setAccounts(INITIAL_ACCOUNTS);
                storage.setItem('bank_accounts', JSON.stringify(INITIAL_ACCOUNTS));
            }

            if (savedTxns && JSON.parse(savedTxns).length > 0) {
                setTransactions(JSON.parse(savedTxns));
            } else {
                setTransactions(INITIAL_TRANSACTIONS);
                storage.setItem('bank_txns', JSON.stringify(INITIAL_TRANSACTIONS));
            }
        }

        // Restores active admin session and their name on refresh
        if (session) {
            const sessionActive = session.getItem('bank_admin_session');
            const savedAdminName = session.getItem('bank_admin_name');
            if (sessionActive === 'true' && savedAdminName) {
                setIsLoggedIn(true);
                setAdminName(savedAdminName);
            }
        }
    }, []);

    // Save updates helper
    const updateData = (updatedAccounts: Account[], updatedTxns: Transaction[]) => {
        setAccounts(updatedAccounts);
        setTransactions(updatedTxns);

        const storage = typeof globalThis !== 'undefined' ? (globalThis as any).localStorage : null;
        if (storage) {
            storage.setItem('bank_accounts', JSON.stringify(updatedAccounts));
            storage.setItem('bank_txns', JSON.stringify(updatedTxns));
        }
    };

    // Generate and Download PDF Statement (All Transactions)
    const downloadTransactionPDF = () => {
        if (!transactions || transactions.length === 0) {
            triggerNotification("No transactions found to generate a statement.", "error");
            return;
        }

        const globalContext = typeof globalThis !== 'undefined' ? (globalThis as any) : null;
        if (!globalContext || !globalContext.open) {
            triggerNotification("Browser window context not fully initialized.", "error");
            return;
        }

        const printWindow = globalContext.open('', '_blank');
        if (!printWindow) {
            triggerNotification("Please allow popups to compile and download the statement.", "error");
            return;
        }

        const tableRows = transactions.map(txn => {
            const flow = txn.type === 'Transfer'
                ? `${txn.fromAccount} &rarr; ${txn.toAccount}`
                : `${txn.fromAccount || txn.toAccount || '-'}`;

            return `
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 13px; color: #334155;">${txn.id}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">
                        <span style="font-weight: 700; padding: 4px 8px; border-radius: 4px; font-size: 11px; text-transform: uppercase; ${txn.type === 'Deposit' ? 'background-color: #ecfdf5; color: #065f46;' :
                    txn.type === 'Withdrawal' ? 'background-color: #fef2f2; color: #991b1b;' :
                        'background-color: #eff6ff; color: #1e40af;'
                }">${txn.type}</span>
                    </td>
                    <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 13px; color: #475569;">${flow}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: 700; font-size: 13px; color: #0f172a;">Rs. ${txn.amount.toLocaleString()}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">${txn.timestamp}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">${txn.description}</td>
                </tr>
            `;
        }).join('');

        const statementHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title> Trust Bank - Statement of Account</title>
                <style>
                    body { font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #1e293b; margin: 40px; }
                    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #10b981; padding-bottom: 24px; margin-bottom: 32px; }
                    .bank-brand { font-size: 26px; font-weight: 800; color: #047857; letter-spacing: -0.025em; }
                    .statement-meta { text-align: right; }
                    .statement-meta h1 { margin: 0; font-size: 20px; font-weight: 700; color: #0f172a; }
                    .statement-meta p { margin: 4px 0 0 0; color: #64748b; font-size: 12px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 24px; }
                    th { background-color: #f8fafc; padding: 14px 10px; text-align: left; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #475569; border-bottom: 2px solid #cbd5e1; }
                    .footer { margin-top: 64px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 24px; line-height: 1.5; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="bank-brand">TRUST BANK</div>
                    <div class="statement-meta">
                        <h1>STATEMENT OF ACCOUNT</h1>
                        <p>Generated on: ${new Date().toLocaleString()}</p>
                        <p>Total Records: ${transactions.length}</p>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Reference ID</th>
                            <th>Category</th>
                            <th>Transaction Details</th>
                            <th>Amount</th>
                            <th>Timestamp</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
                <div class="footer">
                    <p>This is an official statement of account issued directly by Trust Bank Management Suite.</p>
                    <p>&copy; 2026 Trust Bank. All rights reserved.</p>
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 500);
                    }
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(statementHTML);
        printWindow.document.close();
    };

    // Generate and Download PDF Statement for a Specific User
    const downloadUserTransactionPDF = (account: any) => {
        const userTxns = transactions.filter(txn =>
            txn.fromAccount === account.id || txn.toAccount === account.id
        );

        if (userTxns.length === 0) {
            triggerNotification(`No transaction history found for ${account.name}.`, "error");
            return;
        }

        const globalContext = typeof globalThis !== 'undefined' ? (globalThis as any) : null;
        if (!globalContext || !globalContext.open) {
            triggerNotification("Browser window context not fully initialized.", "error");
            return;
        }

        const printWindow = globalContext.open('', '_blank');
        if (!printWindow) {
            triggerNotification("Please allow popups to compile and download the statement.", "error");
            return;
        }

        const tableRows = userTxns.map(txn => {
            let typeLabel: string = txn.type;
            let partyDetails: string = '-';

            if (txn.type === 'Transfer') {
                if (txn.fromAccount === account.id) {
                    typeLabel = 'Transfer (Debit)';
                    partyDetails = `To: ${txn.toAccount}`;
                } else {
                    typeLabel = 'Transfer (Credit)';
                    partyDetails = `From: ${txn.fromAccount}`;
                }
            } else {
                partyDetails = txn.type === 'Deposit' ? 'Self Credit' : 'Self Debit';
            }

            return `
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 13px; color: #334155;">${txn.id}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">
                        <span style="font-weight: 700; padding: 4px 8px; border-radius: 4px; font-size: 11px; text-transform: uppercase; ${txn.type === 'Deposit' || (txn.type === 'Transfer' && txn.toAccount === account.id) ? 'background-color: #ecfdf5; color: #065f46;' : 'background-color: #fef2f2; color: #991b1b;'
                }">${typeLabel}</span>
                    </td>
                    <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #475569;">${partyDetails}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: 700; font-size: 13px; color: #0f172a;">Rs. ${txn.amount.toLocaleString()}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">${txn.timestamp}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">${txn.description}</td>
                </tr>
            `;
        }).join('');

        const statementHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Trust Bank - Statement for ${account.name}</title>
                <style>
                    body { font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #1e293b; margin: 40px; }
                    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #10b981; padding-bottom: 24px; margin-bottom: 32px; }
                    .bank-brand { font-size: 26px; font-weight: 800; color: #047857; letter-spacing: -0.025em; }
                    .statement-meta { text-align: right; }
                    .statement-meta h1 { margin: 0; font-size: 20px; font-weight: 700; color: #0f172a; }
                    .statement-meta p { margin: 4px 0 0 0; color: #64748b; font-size: 12px; }
                    
                    .profile-summary { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 32px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
                    .profile-item { font-size: 13px; }
                    .profile-item span { font-weight: 700; color: #475569; display: block; margin-bottom: 4px; text-transform: uppercase; font-size: 11px; }
                    .profile-item p { margin: 0; font-size: 15px; color: #0f172a; font-weight: 600; }
                    
                    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
                    th { background-color: #f8fafc; padding: 14px 10px; text-align: left; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #475569; border-bottom: 2px solid #cbd5e1; }
                    .footer { margin-top: 64px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 24px; line-height: 1.5; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="bank-brand">TRUST BANK</div>
                    <div class="statement-meta">
                        <h1>STATEMENT OF ACCOUNT</h1>
                        <p>Generated on: ${new Date().toLocaleString()}</p>
                    </div>
                </div>

                <div class="profile-summary">
                    <div class="profile-item">
                        <span>Account Holder</span>
                        <p>${account.name}</p>
                    </div>
                    <div class="profile-item">
                        <span>Account Number</span>
                        <p style="font-family: monospace;">${account.id}</p>
                    </div>
                    <div class="profile-item">
                        <span>Email Address</span>
                        <p>${account.email}</p>
                    </div>
                    <div class="profile-item">
                        <span>Current Net Balance</span>
                        <p style="color: #047857; font-size: 18px;">Rs. ${account.balance?.toLocaleString()}</p>
                    </div>
                    <div class="profile-item">
                        <span>Account Status</span>
                        <p style="color: ${account.isActive ? '#047857' : '#b91c1c'}">${account.isActive ? 'ACTIVE' : 'DEACTIVATED'}</p>
                    </div>
                    <div class="profile-item">
                        <span>Member Since</span>
                        <p>${account.createdAt}</p>
                    </div>
                </div>
                
                <h3 style="font-size: 16px; margin-bottom: 12px; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Transaction Activity History</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Reference ID</th>
                            <th>Category</th>
                            <th>Counterparty Details</th>
                            <th>Amount</th>
                            <th>Timestamp</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>

                <div class="footer">
                    <p>This is an official computer-generated statement of account issued directly by Trust Bank Management Suite.</p>
                    <p>&copy; 2026 Trust Bank. All rights reserved.</p>
                </div>

                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 500);
                    }
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(statementHTML);
        printWindow.document.close();
    };

    // Trigger Notification Helper
    const triggerNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification(null);
        }, 4000);
    };

    // Handle Admin Authentication
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        if (loginUser.trim() !== '' && loginPass === '12') {
            const userName = loginUser.trim().toUpperCase();
            setIsLoggedIn(true);
            setAdminName(userName); // Stores in react state

            const session = typeof globalThis !== 'undefined' ? (globalThis as any).sessionStorage : null;
            if (session) {
                session.setItem('bank_admin_session', 'true');
                session.setItem('bank_admin_name', userName); // Stores name in session
            }

            triggerNotification(`Authentication successful. Welcome, ${userName}`, "success");

            setLoginUser('');
            setLoginPass('');
        } else {
            triggerNotification("Invalid credentials. Access denied.", "error");
        }
    };

    // Handle Admin Session (Logout)
    const handleLogout = () => {
        setIsLoggedIn(false);
        setAdminName(''); // Clears react state
        const session = typeof globalThis !== 'undefined' ? (globalThis as any).sessionStorage : null;
        if (session) {
            session.removeItem('bank_admin_session');
            session.removeItem('bank_admin_name'); // Clears name from session
        }
        triggerNotification("Administrative session closed.", "success");
    };

    // Start Inline Editing
    const startEditing = (acc: Account) => {
        setEditingAccId(acc.id);
        setEditName(acc.name);
        setEditEmail(acc.email);
    };

    // Cancel Inline Editing
    const cancelEditing = () => {
        setEditingAccId(null);
        setEditName('');
        setEditEmail('');
    };

    // Save the Edited Customer Details
    const handleSaveEdit = (id: string) => {
        if (!editName.trim() || !editEmail.trim()) {
            triggerNotification("Name and Email fields cannot be empty.", "error");
            return;
        }

        const updatedAccounts = accounts.map(acc => {
            if (acc.id === id) {
                return { ...acc, name: editName, email: editEmail };
            }
            return acc;
        });

        updateData(updatedAccounts, transactions);
        triggerNotification("Customer profile updated successfully!", "success");
        setEditingAccId(null);
    };

    // Create Customer Account
    const handleCreateAccount = (e: React.FormEvent) => {
        e.preventDefault();
        const depositVal = parseFloat(newAccDeposit);

        if (!newAccName || !newAccEmail || isNaN(depositVal) || depositVal < 1) {
            triggerNotification("Minimum initial deposit must be 1 Rs.", "error");
            return;
        }

        const newId = String(Math.floor(10000000 + Math.random() * 90000000));
        const newAccount: Account = {
            id: newId,
            name: newAccName,
            email: newAccEmail,
            balance: depositVal,
            isActive: true,
            createdAt: new Date().toISOString().split('T')[0]
        };

        const newTxn: Transaction = {
            id: `TXN${Math.floor(100000 + Math.random() * 900000)}`,
            type: 'Deposit',
            toAccount: newId,
            amount: depositVal,
            timestamp: new Date().toLocaleString(),
            description: 'Account Opening Deposit'
        };

        const updatedAccounts = [...accounts, newAccount];
        const updatedTxns = [newTxn, ...transactions];

        updateData(updatedAccounts, updatedTxns);
        triggerNotification(`Account ${newId} created successfully with Rs. ${depositVal}!`, "success");

        // Clear form
        setNewAccName('');
        setNewAccEmail('');
        setNewAccDeposit('');

        // Auto navigate to the accounts page to see the new creation
        setActiveTab('accounts');
    };

    // Manage Status (Toggle Active/Inactive)
    const toggleAccountStatus = (id: string) => {
        const updated = accounts.map(acc => {
            if (acc.id === id) {
                const newStatus = !acc.isActive;

                // Color: "success" (green) for Active, "error" (red) for Inactive
                const alertType = newStatus ? "success" : "error";

                triggerNotification(
                    `Account ${id} is now ${newStatus ? 'Active' : 'Inactive'}.`,
                    alertType
                );

                return { ...acc, isActive: newStatus };
            }
            return acc;
        });
        updateData(updated, transactions);
    };

    // Deposit & Withdraw Functionality
    const handleDepositWithdraw = (e: React.FormEvent) => {
        e.preventDefault();
        const amountVal = parseFloat(depWithAmount);
        const targetAcc = accounts.find(a => a.id === depWithAcc);

        if (!targetAcc) {
            triggerNotification("Account not found.", "error");
            return;
        }

        if (!targetAcc.isActive) {
            triggerNotification("Transaction failed. This account is inactive.", "error");
            return;
        }

        if (isNaN(amountVal) || amountVal < 1) {
            triggerNotification("Transaction amount must be at least 1 Rs.", "error");
            return;
        }

        if (depWithType === 'Withdrawal' && targetAcc.balance < amountVal) {
            triggerNotification("Insufficient funds in account.", "error");
            return;
        }

        const updatedAccounts = accounts.map(acc => {
            if (acc.id === depWithAcc) {
                const newBalance = depWithType === 'Deposit' ? acc.balance + amountVal : acc.balance - amountVal;
                return { ...acc, balance: newBalance };
            }
            return acc;
        });

        const newTxn: Transaction = {
            id: `TXN${Math.floor(100000 + Math.random() * 900000)}`,
            type: depWithType,
            [depWithType === 'Deposit' ? 'toAccount' : 'fromAccount']: depWithAcc,
            amount: amountVal,
            timestamp: new Date().toLocaleString(),
            description: `${depWithType} operation`
        };

        updateData(updatedAccounts, [newTxn, ...transactions]);
        triggerNotification(`${depWithType} of Rs. ${amountVal} completed!`, "success");
        setDepWithAcc('');
        setDepWithAmount('');
    };

    // Fund Transfer (Between two active accounts)
    const handleTransfer = (e: React.FormEvent) => {
        e.preventDefault();
        const amountVal = parseFloat(transferAmount);

        if (transferFrom === transferTo) {
            triggerNotification("Source and Destination accounts cannot be identical.", "error");
            return;
        }

        const source = accounts.find(a => a.id === transferFrom);
        const destination = accounts.find(a => a.id === transferTo);

        if (!source || !destination) {
            triggerNotification("One or both accounts do not exist.", "error");
            return;
        }

        if (!source.isActive || !destination.isActive) {
            triggerNotification("Transaction blocked. One or both accounts are inactive.", "error");
            return;
        }

        if (isNaN(amountVal) || amountVal < 1) {
            triggerNotification("Transfer amount must be at least 1 Rs.", "error");
            return;
        }

        if (source.balance < amountVal) {
            triggerNotification("Transfer declined: Insufficient funds.", "error");
            return;
        }

        const updatedAccounts = accounts.map(acc => {
            if (acc.id === transferFrom) {
                return { ...acc, balance: acc.balance - amountVal };
            }
            if (acc.id === transferTo) {
                return { ...acc, balance: acc.balance + amountVal };
            }
            return acc;
        });

        const newTxn: Transaction = {
            id: `TXN${Math.floor(100000 + Math.random() * 900000)}`,
            type: 'Transfer',
            fromAccount: transferFrom,
            toAccount: transferTo,
            amount: amountVal,
            timestamp: new Date().toLocaleString(),
            description: `Fund transfer from ${source.name} to ${destination.name}`
        };

        updateData(updatedAccounts, [newTxn, ...transactions]);
        triggerNotification(`Successfully transferred Rs. ${amountVal} from ${source.name} to ${destination.name}!`, "success");
        setTransferFrom('');
        setTransferTo('');
        setTransferAmount('');
    };

    if (!isMounted) {
        return (
            <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
                <div className="text-center animate-pulse">
                    <TrendingUp className="h-10 w-10 text-emerald-500 mx-auto mb-2 animate-bounce" />
                    <p className="text-xs text-slate-400 font-medium">Initializing Bank Terminal...</p>
                </div>
            </div>
        );
    }

    // Intercept rendering if not authenticated
    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 relative">
                {/* Floating Notification support inside login */}
                {notification && (
                    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl text-white ${notification.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                        <AlertCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">{notification.message}</span>
                    </div>
                )}

                <div className="max-w-md w-full bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl">
                    <div className="flex flex-col items-center mb-8">
                        <div className="bg-emerald-600 p-3 rounded-2xl mb-4 shadow-lg shadow-emerald-600/10">
                            <TrendingUp className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="font-extrabold text-2xl tracking-tight text-white">TRUST BANK</h1>
                        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">Administrative Control Panel</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Username</label>
                            <input
                                type="text"
                                required
                                value={loginUser}
                                onChange={(e: any) => setLoginUser(e.target.value)}
                                placeholder="VIVEK JOSHI"
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-all placeholder:text-slate-600"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Password</label>
                            <input
                                type="password"
                                required
                                value={loginPass}
                                onChange={(e: any) => setLoginPass(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-all placeholder:text-slate-600"
                            />
                        </div>
                        <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg text-sm transition-all shadow-lg shadow-emerald-600/10">
                            Authenticate & Enter
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Dashboard Stats Calculations
    const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);
    const activeCount = accounts.filter(a => a.isActive).length;

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-slate-900 text-slate-100">

            {/* Sidebar Navigation */}
            <aside className="w-full md:w-64 bg-slate-950 p-6 flex flex-col border-r border-slate-800">
                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-emerald-600 p-2 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight">TRUST BANK</h1>
                        <p className="text-xs text-slate-400">Bank Operations Suite</p>
                    </div>
                </div>

                <nav className="flex flex-col gap-2 flex-1">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
                    >
                        <TrendingUp className="h-4 w-4" /> Overview
                    </button>

                    {/*Create Customer*/}
                    <button
                        onClick={() => setActiveTab('create-customer')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'create-customer' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
                    >
                        <PlusCircle className="h-4 w-4" /> Create Customer
                    </button>

                    <button
                        onClick={() => setActiveTab('accounts')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'accounts' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
                    >
                        <Users className="h-4 w-4" /> Customer Accounts
                    </button>
                    <button
                        onClick={() => setActiveTab('deposit-withdraw')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'deposit-withdraw' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
                    >
                        <IndianRupee className="h-4 w-4" /> Deposit / Withdraw
                    </button>
                    <button
                        onClick={() => setActiveTab('transfer')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'transfer' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
                    >
                        <ArrowRightLeft className="h-4 w-4" /> Fund Transfer
                    </button>
                    <button
                        onClick={() => setActiveTab('transactions')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'transactions' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
                    >
                        <History className="h-4 w-4" /> Transaction Log
                    </button>
                </nav>
                <div className="mt-auto pt-6 border-t border-slate-800/80">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600/10 hover:bg-rose-600/20 text-rose-300 border border-rose-600/30 rounded-lg text-sm font-semibold transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-6 md:p-10 overflow-y-auto">
                {/* Floating System Notifications */}
                {notification && (
                    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl text-white ${notification.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                        <AlertCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">{notification.message}</span>
                    </div>
                )}

                {/* TOP PANEL */}
                <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                            <h2 className="text-2xl font-bold tracking-tight text-white">System Terminal</h2>
                            {adminName && (
                                <span className="text-sm font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                                    Welcome, {adminName}
                                </span>
                            )}
                        </div>
                        <p className="text-slate-400 text-sm mt-1">Monitor system balancing and manage active user access.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 min-w-[140px]">
                            <span className="text-xs text-slate-400">Total Liquidity</span>
                            <p className="text-xl font-bold text-emerald-400">Rs. {totalBalance.toLocaleString()}</p>
                        </div>
                        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 min-w-[140px]">
                            <span className="text-xs text-slate-400">Active Accounts</span>
                            <p className="text-xl font-bold text-slate-100">{activeCount} / {accounts.length}</p>
                        </div>
                    </div>
                </header>

                {/* OVERVIEW PANEL */}
                {activeTab === 'overview' && (
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <h3 className="text-lg font-semibold mb-4 text-white">Account Portfolio Preview</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-700 text-xs text-slate-400">
                                        <th className="pb-3 font-medium">Account Number</th>
                                        <th className="pb-3 font-medium">Client Info</th>
                                        <th className="pb-3 font-medium">Balance</th>
                                        <th className="pb-3 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {accounts.slice(0, 10).map((acc) => (
                                        <tr key={acc.id} className="text-sm">
                                            <td className="py-4 font-mono font-medium text-emerald-400">{acc.id}</td>
                                            <td className="py-4">
                                                <p className="font-semibold text-white">{acc.name}</p>
                                                <p className="text-xs text-slate-400">{acc.email}</p>
                                            </td>
                                            <td className="py-4 font-semibold text-white">Rs. {acc.balance.toLocaleString()}</td>
                                            <td className="py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${acc.isActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
                                                    {acc.isActive ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                                    {acc.isActive ? 'Active' : 'Deactivated'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* CREATE CUSTOMER TAB */}
                {activeTab === 'create-customer' && (
                    <div className="max-w-xl mx-auto bg-slate-800 p-8 rounded-2xl border border-slate-700">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 justify-center text-white">
                            <PlusCircle className="text-emerald-500" /> Open New Customer Account
                        </h3>
                        <form onSubmit={handleCreateAccount} className="space-y-5">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newAccName}
                                    onChange={(e: any) => setNewAccName(e.target.value)}
                                    placeholder="VIVEK JOSHI"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={newAccEmail}
                                    onChange={(e: any) => setNewAccEmail(e.target.value)}
                                    placeholder="vivekjoshi@gmail.com"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Initial Deposit (Rs.)</label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    value={newAccDeposit}
                                    onChange={(e: any) => setNewAccDeposit(e.target.value)}
                                    placeholder="Minimum 1 Rs."
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                />
                            </div>
                            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg text-sm transition-colors">
                                Generate Account File
                            </button>
                        </form>
                    </div>
                )}

                {/* MANAGE CUSTOMERS (ACTIVE OR NOT + EDIT ACTION) */}
                {activeTab === 'accounts' && (
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <h3 className="text-lg font-semibold mb-4 text-white">Customer Management</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-700 text-xs text-slate-400">
                                        <th className="pb-3">Account Reference</th>
                                        <th className="pb-3">Customer Profile</th>
                                        <th className="pb-3">Creation Date</th>
                                        <th className="pb-3">Current Balance</th>
                                        <th className="pb-3">Administrative Access Control</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50 text-sm">
                                    {accounts.map((acc) => {
                                        const isEditing = editingAccId === acc.id;
                                        return (
                                            <tr key={acc.id}>
                                                <td className="py-4 font-mono text-emerald-400 font-semibold">{acc.id}</td>
                                                <td className="py-4">
                                                    {isEditing ? (
                                                        <div className="flex flex-col gap-2 max-w-xs">
                                                            <input
                                                                type="text"
                                                                value={editName}
                                                                onChange={(e: any) => setEditName(e.target.value)}
                                                                className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                            />
                                                            <input
                                                                type="email"
                                                                value={editEmail}
                                                                onChange={(e: any) => setEditEmail(e.target.value)}
                                                                className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="font-semibold text-white">{acc.name}</div>
                                                            <div className="text-xs text-slate-400">{acc.email}</div>
                                                        </>
                                                    )}
                                                </td>
                                                <td className="py-4 text-slate-400">{acc.createdAt}</td>
                                                <td className="py-4 font-semibold text-white">Rs. {acc.balance.toLocaleString()}</td>
                                                <td className="py-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        {isEditing ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleSaveEdit(acc.id)}
                                                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
                                                                >
                                                                    Save
                                                                </button>
                                                                <button
                                                                    onClick={cancelEditing}
                                                                    className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition-colors"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => downloadUserTransactionPDF(acc)}
                                                                    className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-600/40 text-xs font-semibold transition-colors"
                                                                >
                                                                    Statement
                                                                </button>
                                                                <button
                                                                    onClick={() => startEditing(acc)}
                                                                    className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-600/40 text-xs font-semibold transition-colors"
                                                                >
                                                                    Edit Details
                                                                </button>
                                                                <button
                                                                    onClick={() => toggleAccountStatus(acc.id)}
                                                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${acc.isActive ? 'bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-600/40' : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-600/40'}`}
                                                                >
                                                                    {acc.isActive ? 'Deactivate Access' : 'Activate Access'}
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* DEPOSIT / WITHDRAWAL */}
                {activeTab === 'deposit-withdraw' && (
                    <div className="max-w-xl mx-auto bg-slate-800 p-8 rounded-2xl border border-slate-700">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 justify-center">
                            <IndianRupee className="text-emerald-500" /> Transaction Execution Desk
                        </h3>
                        <form onSubmit={handleDepositWithdraw} className="space-y-5">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Transaction Category</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setDepWithType('Deposit')}
                                        className={`py-2 rounded-lg font-semibold text-sm transition-colors ${depWithType === 'Deposit' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400'}`}
                                    >
                                        Credit (Deposit)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDepWithType('Withdrawal')}
                                        className={`py-2 rounded-lg font-semibold text-sm transition-colors ${depWithType === 'Withdrawal' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-400'}`}
                                    >
                                        Debit (Withdrawal)
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Target Account Number</label>
                                <select
                                    value={depWithAcc}
                                    onChange={(e: any) => setDepWithAcc(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                >
                                    <option value="">Select Account</option>
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>
                                            {acc.id} - {acc.name} (Rs. {acc.balance}) {acc.isActive ? "" : "(INACTIVE)"}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Transaction Amount (Rs.)</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={depWithAmount}
                                    onChange={(e: any) => setDepWithAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                />
                            </div>

                            <button type="submit" className="w-full bg-slate-100 hover:bg-white text-slate-900 font-bold py-3 rounded-lg text-sm transition-colors">
                                Authorize Transaction
                            </button>
                        </form>
                    </div>
                )}

                {/* FUND TRANSFER */}
                {activeTab === 'transfer' && (
                    <div className="max-w-xl mx-auto bg-slate-800 p-8 rounded-2xl border border-slate-700">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 justify-center">
                            <ArrowRightLeft className="text-emerald-500" /> Secure Fund Transfer
                        </h3>
                        <form onSubmit={handleTransfer} className="space-y-5">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Source Account (Sender)</label>
                                <select
                                    value={transferFrom}
                                    onChange={(e: any) => setTransferFrom(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                >
                                    <option value="">Select Sender Account</option>
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>
                                            {acc.id} - {acc.name} (Rs. {acc.balance}) {acc.isActive ? "" : "(INACTIVE)"}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Destination Account (Recipient)</label>
                                <select
                                    value={transferTo}
                                    onChange={(e: any) => setTransferTo(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                >
                                    <option value="">Select Recipient Account</option>
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>
                                            {acc.id} - {acc.name} (Rs. {acc.balance}) {acc.isActive ? "" : "(INACTIVE)"}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Amount to Transfer (Rs.)</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={transferAmount}
                                    onChange={(e: any) => setTransferAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                />
                            </div>

                            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg text-sm transition-colors">
                                Validate and Post Transfer
                            </button>
                        </form>
                    </div>
                )}

                {/* TRANSACTION HISTORY WITH PDF DOWNLOAD */}
                {activeTab === 'transactions' && (
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                            <h3 className="text-lg font-semibold text-white">Complete System Transaction Log</h3>
                            <button
                                onClick={downloadTransactionPDF}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition-colors shadow-md border border-emerald-500/20"
                            >
                                <History className="h-4 w-4" /> Download Statement (PDF)
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-700 text-xs text-slate-400">
                                        <th className="pb-3">Reference ID</th>
                                        <th className="pb-3">Type</th>
                                        <th className="pb-3">Flow (From/To)</th>
                                        <th className="pb-3">Amount</th>
                                        <th className="pb-3">Timestamp</th>
                                        <th className="pb-3">Context</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50 text-sm">
                                    {(!transactions || transactions.length === 0) ? (
                                        <tr>
                                            <td colSpan={6} className="py-8 text-center text-slate-500">
                                                No transactions registered yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        transactions.map((txn) => (
                                            <tr key={txn.id}>
                                                <td className="py-4 font-mono font-medium text-slate-400">{txn.id}</td>
                                                <td className="py-4">
                                                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${txn.type === 'Deposit' ? 'bg-emerald-500/15 text-emerald-400' :
                                                        txn.type === 'Withdrawal' ? 'bg-rose-500/15 text-rose-400' : 'bg-blue-500/15 text-blue-400'
                                                        }`}>
                                                        {txn.type}
                                                    </span>
                                                </td>
                                                <td className="py-4 font-mono text-xs text-slate-300">
                                                    {txn.type === 'Transfer' ? (
                                                        <span>{txn.fromAccount} &rarr; {txn.toAccount}</span>
                                                    ) : (
                                                        <span>{txn.fromAccount || txn.toAccount}</span>
                                                    )}
                                                </td>
                                                <td className="py-4 font-semibold text-slate-200">
                                                    Rs. {txn.amount.toLocaleString()}
                                                </td>
                                                <td className="py-4 text-slate-400 text-xs">{txn.timestamp}</td>
                                                <td className="py-4 text-slate-400 text-xs max-w-xs truncate">{txn.description}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div >
    );
}