import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { JWT } from "https://esm.sh/google-auth-library@8.7.0"

const SERVICE_ACCOUNT = {
    "type": "service_account",
    "project_id": "app-finanzas-485816",
    "private_key_id": "89f226f88f020b2a0de085258de27fd73d81dd87",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDUaxxqOJT4Sy0E\nvKr9bn3ZbeWTYUG29MFNXEdGw0li52W8zpC9k5Ogw+4ZW6tnu3rVVnWeoIq1WlbI\niPNS2+nkXwqkl8M6a/L0setSB9kumHkoI+/ecgyAOdTaJPzXzehW+vxSKM4ewTOv\n+81oJw1wICIZus1f0OFthaeBhffWAsPzOcxHnC9mNLiMXtGoN8+9ZVB7N8alRWaq\nZHCIA8IO6DgdD3Gtlu/pqnKtKmS2ND29mGcnU7GTexLSSvaB3NK15uVx2EdWyR+j\nBI36o/NaUYacfucC7LoQTwPE6+FHqvD11tLxugwJIowf3ZAq4v1ELl3qedxbJpYr\ncvGtd3FvAgMBAAECggEAMmq11NRXL1OQfNZW8039WtUFr2RfF5CiLL1hQX9qdKod\ncKHKouRbHsZCRgyG81kBP4+E3UCXi5HElVZEAn+l1Qll2kkXEk+62686/j5UowWX\nhBp7fV2ub+TKC3jJ9mKt6a8qokmDGrOalAN87mKOgvVtgpPe2QYX60nUxx5IA6g3\nkr7QESZS8jC46sd5uYrYinXZYHaVI0NnDmBTUGwyh7GsCB6QKQKfjXSDBFgEnNU7\n7TqJjWi/OAO85nE0dW93ZJuoZXyFNk4xiKk3ioXdhZNLq2F0GoJH/2E6/vpExHYx\nFwBJ02ouBWA9JwFZWjbYQBUUHkPtV5CJt3SLGjK0MQKBgQDzkXYZs53m/M5VsdLX\nCiRR/LtXcNJMhiV2qLRRYFAtz15GMssO2UrgR9Dxkc7JEtZJbno8JTMrf0Kj/dKs\nyS6w6psFyPHYalYI4a4waNSYAuincDR6XQCqrF1q2+amEAmgES1v1eo1IFBJf77D\nwSAXPO9YdMKt9g9XkX5pTO9pWQKBgQDfQqLzJHPrz+M/ylzFGL4fpGqDtVO5yFnH\n/CsZVUwkngC9zAIOijEHOJW9dbGZrqBqI4e3DEsB3ItuQD/0bUnf1I+t8EdXZFZj\npexCWk7OAvwIY3R7fl4rcKD/Y5wWSmSDFguLPMsG00HmmzUondSRBnvUT7bCgaFn\nDfpZfkYQBwKBgQDDkN8fwd2eEwxlODOPIACLp/6QNfFVKjy4arrlwAyAy8jpWm06\nTfRV4rP80tMTFcHjEgapdkEAwtyyKeJXg+2udaDlYzP0TWUpGnOvQOy55VQC5Q/t\n0/DuGRmk7E3ktmnUERbHfh3gbEKq0RxNtypaHj4baxzJaxFkgVjbmb99eQKBgC9Q\njvoacpq6Hv4I4+o9WSWZkZ1CE3Fe/W/9iCDBS/bCqYOPtavhK4zNOCbDx5S7RnHX\n/84SQ98sHzyJT0R82Ngf0ydYsbXapNhPdKeHPgY46bLZaPk3CbwJDYWyVYT/1RdW\n17F1e82BfgjiQbzO3hqyFhIjpqbIFC2j77eBpFWHAoGAYA6TtrvxUtcMPUYIX59n\ngJobxWaDyfgwG1gRl0TcgE96iQTYXYXF0y9AA64j26H3eyLj/j4alRjpIuWW39Ax\njJM4hAAoZjlG8MckbEgcAnq8iJcE/H072XwPyVyMsgpQpKXiSG5AAJpJxTN39/C3\nH5BRca9/ZmjwrtE6h60Ziog=\n-----END PRIVATE KEY-----\n",
    "client_email": "aa-526@app-finanzas-485816.iam.gserviceaccount.com",
};

const SPREADSHEET_ID = "1sQRRvJw2WQGwM0Drr77Lz5LHHdhyzC8XEjJYBWMXdJI";

serve(async (req: Request) => {
    try {
        const client = new JWT({
            email: SERVICE_ACCOUNT.client_email,
            key: SERVICE_ACCOUNT.private_key,
            scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
        });

        await client.authorize();

        // Test simple: solo leer la primera pestaña
        const testSheet = "Registro egresos";
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(testSheet)}!A2:E5`;

        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${client.credentials.access_token}` },
        });

        const responseText = await response.text();

        return new Response(JSON.stringify({
            success: response.ok,
            status: response.status,
            statusText: response.statusText,
            body: responseText,
            testSheet: testSheet,
            spreadsheetId: SPREADSHEET_ID
        }), {
            headers: { "Content-Type": "application/json" },
            status: 200, // Always return 200 so we can see the actual error
        });
    } catch (err: any) {
        return new Response(JSON.stringify({
            error: err.message,
            stack: err.stack
        }), {
            headers: { "Content-Type": "application/json" },
            status: 200, // Return 200 so app can read the error
        });
    }
});
