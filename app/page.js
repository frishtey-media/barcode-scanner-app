'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function Home() {
  const [scannedCode, setScannedCode] = useState(null);
  const [status, setStatus] = useState('');
  const [showScanAgain, setShowScanAgain] = useState(false);
  const scannerRef = useRef(null);
  const html5QrScannerRef = useRef(null);

  const scannerId = 'html5-qrcode-scanner';

  const initializeScanner = () => {
    setScannedCode(null);
    setStatus('');
    setShowScanAgain(false);

    const config = {
      fps: 10,
      qrbox: { width: 300, height: 200 },
      rememberLastUsedCamera: true,
      showTorchButtonIfSupported: true,
      showZoomSliderIfSupported: true,
    };

    // Clear any existing scanner UI
    const elem = document.getElementById(scannerId);
    if (elem) {
      elem.innerHTML = '';
    }

    const scanner = new Html5QrcodeScanner(scannerId, config, false);
    html5QrScannerRef.current = scanner;

    scanner.render(
      async (decodedText, decodedResult) => {
        if (scannedCode) return; // Prevent multiple calls

        setScannedCode(decodedText);
        setStatus('Saving to Google Sheet...');

        // Stop the scanner immediately
        scanner.clear().then(() => {
          console.log('Scanner stopped');
        });

        try {
          const res = await fetch('/api/store-barcode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ barcode: decodedText }),
          });

          const data = await res.json();

          if (data.success) {
            setStatus('✅ Saved successfully!');
          } else {
            setStatus(`❌ Failed: ${data.error}`);
          }
        } catch (err) {
          setStatus(`❌ Error: ${err.message}`);
        } finally {
          setShowScanAgain(true);
        }
      },
      (error) => {
        // console.log('Scan error', error);
      }
    );
  };

  const handleScanAgain = () => {
    initializeScanner();
  };

  useEffect(() => {
    initializeScanner();

    return () => {
      if (html5QrScannerRef.current) {
        html5QrScannerRef.current.clear().catch((err) =>
          console.warn('Failed to clear scanner on unmount', err)
        );
      }
    };
  }, []);

  return (
    <main style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>📷 Barcode Scanner with Google Sheet</h1>
      <div id={scannerId}></div>

      {scannedCode && (
        <p>
          <strong>Scanned Code:</strong> {scannedCode}
        </p>
      )}
      {status && <p>{status}</p>}

      {showScanAgain && (
        <button
          onClick={handleScanAgain}
          style={{
            marginTop: '1rem',
            padding: '10px 20px',
            fontSize: '16px',
            borderRadius: '6px',
            background: '#333',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          🔁 Scan Another
        </button>
      )}
    </main>
  );
}
