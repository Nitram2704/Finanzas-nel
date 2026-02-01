import { PowerSyncDatabase } from '@powersync/react-native';
import { AppSchema } from '../db/schema';
import { supabase } from './supabase';

export const db = new PowerSyncDatabase({
    schema: AppSchema,
    database: {
        dbFilename: 'finance-companion.db',
    },
});

// Implementation of the PowerSync connector to sync with Supabase
export const setupPowerSync = async () => {
    const connector = {
        async getSession() {
            const { data } = await supabase.auth.getSession();
            return {
                accessToken: data.session?.access_token,
                expiresAt: data.session?.expires_at,
            };
        },
        async fetchCredentials() {
            const { data } = await supabase.auth.getSession();
            return {
                endpoint: 'https://your-powersync-endpoint.powersync.com', // TODO: Update with actual endpoint
                token: data.session?.access_token,
            };
        },
        async uploadData(batch: any) {
            // Mapping local transactions to Google Sheets structure
            // Sheet Mapping: Fecha | Mes | Categoría | Valor | Descripción
            for (const op of batch.operations) {
                const record = op.row;
                const payload = {
                    date: record.date,
                    month: new Date(record.date).toLocaleString('es-ES', { month: 'long' }),
                    category: record.category,
                    amount: record.amount,
                    description: record.description,
                    type: record.type // income | expense | saving
                };

                // Send to Supabase Edge Function which acts as a bridge to Google Sheets
                const { error } = await supabase.functions.invoke('sync-to-sheets', {
                    body: payload,
                });

                if (error) console.error('Sync error:', error);
            }
        }
    };

    // Connect is used after the user is authenticated in a real scenario
    // await db.connect(connector);
};
