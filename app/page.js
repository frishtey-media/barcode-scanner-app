'use client';

import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function HomePage() {
  const [scanned, setScanned] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      fps: 10,
      qrbox: { width: 300, height: 200 },
    });

    scanner.render(
      async (decodedText) => {
        if (decodedText !== scanned) {
          setScanned(decodedText);
          setStatus('Saving...');
          const res = await fetch('/api/store-barcode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ barcode: decodedText }),
          });

          const data = await res.json();
          if (data.success) {
            setStatus('Saved to Google Sheet!');
          } else {
            setStatus(`Error: ${data.error}`);
          }
        }
      },
      (errorMessage) => {
        console.warn(errorMessage);
      }
    );
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
