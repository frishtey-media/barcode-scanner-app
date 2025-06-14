'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function HomePage() {
  const [barcode, setBarcode] = useState(null);
  const [status, setStatus] = useState('');
  const [showScanAgain, setShowScanAgain] = useState(false);
  const scannerRef = useRef(null);
  const scannerId = 'reader';

  const startScanner = () => {
    setStatus('');
    setBarcode(null);
    setShowScanAgain(false);

    const html5QrCode = new Html5Qrcode(scannerId);
    scannerRef.current = html5QrCode;

    html5QrCode.start(
      { facingMode: 'environment' }, // rear camera
      {
        fps: 10,
        qrbox: { width: 300, height: 200 },
      },
      async (decodedText, decodedResult) => {
        // ✅ Immediately stop scanning
        await html5QrCode.stop();
        setBarcode(decodedText);
        setStatus('Saving to Google Sheet...');

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
      (errorMessage) => {
        // Optional: console.log('No barcode detected', errorMessage);
      }
    );
  };

  const handleScanAgain = () => {
    // Clean up previous scanner div
    const readerElem = document.getElementById(scannerId);
    if (readerElem) {
      readerElem.innerHTML = '';
    }
    startScanner();
  };

  useEffect(() => {
    startScanner();

    return () => {
      // Cleanup on unmount
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => { });
      }
    };
  }, []);

  return (
    <main style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>📷 Barcode Scanner</h1>
      <div id={scannerId} style={{ margin: 'auto', width: 'fit-content' }}></div>

      {barcode && (
        <p>
          <strong>Scanned:</strong> {barcode}
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
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          🔁 Scan Another
        </button>
      )}
    </main>
  );
}
