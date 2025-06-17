'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function Home() {
  const [scannedCode, setScannedCode] = useState(null);
  const [status, setStatus] = useState('');
  const [showScanAgain, setShowScanAgain] = useState(false);
  const html5QrScannerRef = useRef(null);
  const scannerId = 'html5-qrcode-scanner';

  const startScanner = () => {
    setScannedCode(null);
    setStatus('');
    setShowScanAgain(false);

    // Clear any previous scanner UI
    const scannerContainer = document.getElementById(scannerId);
    if (scannerContainer) scannerContainer.innerHTML = '';

    const config = {
      fps: 10,
      qrbox: { width: 300, height: 200 },
      rememberLastUsedCamera: true,
      showTorchButtonIfSupported: true,
      showZoomSliderIfSupported: true,
    };

    const scanner = new Html5QrcodeScanner(scannerId, config, false);
    html5QrScannerRef.current = scanner;

    scanner.render(
      async (decodedText) => {
        setScannedCode(decodedText);
        setStatus('⏳ Saving to Google Sheet...');

        // Stop scanning immediately
        await scanner.clear();

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
            setStatus(`❌ Failed to save: ${data.error}`);
          }
        } catch (error) {
          setStatus(`❌ Error: ${error.message}`);
        }

        setShowScanAgain(true);
      },
      (errorMessage) => {
        // Optional: handle scan error
        // console.warn("Scan error:", errorMessage);
      }
    );
  };

  const handleScanAgain = () => {
    startScanner();
  };

  useEffect(() => {
    startScanner();

    return () => {
      if (html5QrScannerRef.current) {
        html5QrScannerRef.current.clear().catch((err) =>
          console.warn('Scanner clear error on unmount', err)
        );
      }
    };
  }, []);

  return (
    <main style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>📦 Barcode Scanner to Google Sheet</h1>
      <div id={scannerId}></div>

      {scannedCode && (
        <p>
          <strong>Scanned:</strong> {scannedCode}
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
