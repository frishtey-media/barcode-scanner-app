'use client';

import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function HomePage() {
  const [scanned, setScanned] = useState(null);
  const [status, setStatus] = useState('');
  const [scannerInstance, setScannerInstance] = useState(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      fps: 10,
      qrbox: { width: 300, height: 200 },
    });

    scanner.render(
      async (decodedText, decodedResult) => {
        if (!scanned) {
          setScanned(decodedText);
          setStatus('Saving...');

          try {
            const res = await fetch('/api/store-barcode', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ barcode: decodedText }),
            });

            const data = await res.json();
            if (data.success) {
              setStatus('✅ Saved to Google Sheet!');
            } else {
              setStatus(`❌ Error: ${data.error}`);
            }

            // Stop scanning after successful first scan
            scanner.clear().then(() => {
              console.log('Scanner stopped.');
            }).catch(err => {
              console.error('Failed to stop scanner', err);
            });

          } catch (err) {
            setStatus(`❌ Request error: ${err.message}`);
          }
        }
      },
      (errorMessage) => {
        // console.warn('Scan error:', errorMessage);
      }
    );

    setScannerInstance(scanner);
  }, []);

  return (
    <main style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>📷 Barcode Scanner</h1>
      <div id="reader" style={{ margin: 'auto', width: 'fit-content' }}></div>
      {scanned && (
        <>
          <p><strong>Scanned:</strong> {scanned}</p>
          <p>Status: {status}</p>
        </>
      )}
    </main>
  );
}
