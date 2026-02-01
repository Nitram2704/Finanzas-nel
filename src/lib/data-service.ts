import { CONFIG } from './config';

export interface FinancialTotals {
    available: number;
    income: number;
    expenses: number;
    savings: number;
}

export interface TransactionRecord {
    type: 'income' | 'expense' | 'saving';
    date: string;
    month: string;
    category: string;
    amount: number;
    description: string;
}

export interface SheetCategories {
    months: string[];
    expenses: string[];
    income: string[];
    savings: string[];
}

export interface SheetData {
    totals: FinancialTotals;
    history: TransactionRecord[];
    categories?: SheetCategories;
    budgetLimits?: Record<string, number>;
    spentMap?: Record<string, number>;
}

/**
 * Obtiene todos los datos (totales, historial y categorías) en una sola llamada.
 */
export const fetchRealSheetData = async (): Promise<SheetData | null> => {
    try {
        const response = await fetch(CONFIG.GAS_WEBAPP_URL);
        const text = await response.text();

        try {
            const data = JSON.parse(text);
            if (data.error) {
                console.error('GAS Logic Error:', data.error);
                return null;
            }
            return data as SheetData;
        } catch (parseError) {
            console.error('JSON Parse Error from GAS. Response starts with:', text.substring(0, 500));
            return null;
        }
    } catch (err) {
        console.error('Network error fetching from GAS:', err);
        return null;
    }
};

/**
 * Guarda una nueva transacción en el Google Sheet.
 */
export const syncTransactionToSheet = async (transaction: any): Promise<boolean> => {
    try {
        // Enriquecer con el nombre del mes si falta
        if (!transaction.month && transaction.date) {
            const dateObj = new Date(transaction.date);
            const months = [
                'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
            ];
            transaction.month = months[dateObj.getMonth()];
        }

        const response = await fetch(CONFIG.GAS_WEBAPP_URL, {
            method: 'POST',
            body: JSON.stringify(transaction),
        });

        const result = await response.json();
        return result.success === true;
    } catch (err) {
        console.error('Error syncing to GAS:', err);
        return false;
    }
};


/**
 * Wrapper para mantener compatibilidad con componentes que solo piden categorías.
 */
export const fetchSheetCategories = async (): Promise<SheetCategories | null> => {
    const data = await fetchRealSheetData();
    return data?.categories || null;
};
