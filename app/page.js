'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function HomePage() {
  const [scannedData, setScannedData] = useState(null);
  const [status, setStatus] = useState('');
  const [showScanAgain, setShowScanAgain] = useState(false);
  const scannerRef = useRef(null);

  const scannerId = 'reader';

  const startScan = async () => {
    setStatus('');
    setScannedData(null);
    setShowScanAgain(false);

    const html5QrCode = new Html5Qrcode(scannerId);
    scannerRef.current = html5QrCode;

    try {
      const devices = await Html5Qrcode.getCameras();

      if (devices && devices.length) {
        const cameraId = devices[0].id;

        await html5QrCode.start(
          cameraId,
          {
            fps: 10,
            qrbox: { width: 300, height: 200 },
          },
          async (decodedText, decodedResult) => {
            // ✅ Stop scanning immediately after detection
            await html5QrCode.stop();
            setScannedData(decodedText);
            setStatus('Saving to Google Sheet...');

            try {
              const response = await fetch('/api/store-barcode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ barcode: decodedText }),
              });

              const result = await response.json();
              if (result.success) {
                setStatus('✅ Saved successfully!');
              } else {
                setStatus(`❌ Error: ${result.error}`);
              }
            } catch (error) {
              setStatus(`❌ Error: ${error.message}`);
            } finally {
              setShowScanAgain(true);
            }
          },
          (errorMessage) => {
            // You can optionally log scan failure attempts
            // console.warn("Scanning error:", errorMessage);
          }
        );
      } else {
        setStatus('❌ No cameras found.');
      }
    } catch (err) {
      setStatus(`❌ Error accessing camera: ${err.message}`);
    }
  };

  const handleScanAgain = () => {
    // Clear preview
    const elem = document.getElementById(scannerId);
    if (elem) elem.innerHTML = '';
    startScan();
  };

  useEffect(() => {
    startScan();

    return () => {
      // Stop scanner on unmount
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => { });
      }
    };
  }, []);

  return (
    <main style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>📷 Barcode Scanner</h1>
      <div id={scannerId} style={{ width: '300px', margin: 'auto' }}></div>

      {scannedData && <p><strong>Scanned:</strong> {scannedData}</p>}
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
