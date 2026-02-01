import { column, Schema, Table } from '@powersync/react-native';

const transactions = new Table({
    id: column.text,
    amount: column.real,
    category: column.text,
    date: column.text,
    description: column.text,
    type: column.text, // 'income' | 'expense' | 'saving'
    created_at: column.text,
});

export const AppSchema = new Schema({
    transactions,
});

export type TransactionRecord = {
    id: string;
    amount: number;
    category: string;
    date: string;
    description: string;
    type: 'income' | 'expense' | 'saving';
    created_at: string;
};
