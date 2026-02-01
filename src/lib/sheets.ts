import { supabase } from './supabase';

export interface SheetCategories {
    months: string[];
    expenses: string[];
    income: string[];
    savings: string[];
}

export const fetchSheetCategories = async (): Promise<SheetCategories | null> => {
    try {
        const { data, error } = await supabase.functions.invoke('get-categories');
        if (error) throw error;
        return data as SheetCategories;
    } catch (err) {
        console.error('Error fetching categories:', err);
        return null;
    }
};
