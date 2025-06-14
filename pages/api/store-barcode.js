// pages/api/store-barcode.js
import { appendToSheet } from '@/lib/googleSheets';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

    const { barcode } = req.body;
    if (!barcode) return res.status(400).json({ error: 'Barcode is required' });

    try {
        await appendToSheet(barcode);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error appending to sheet:', error.message);
        res.status(500).json({ error: 'Failed to save barcode' });
    }
}
