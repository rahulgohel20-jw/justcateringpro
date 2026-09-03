// components/ShareQrCode.jsx
import { QRCodeCanvas } from "qrcode.react";

const ShareQrCode = ({ link, size = 180 }) => {
  if (!link) return null;

  const handleDownload = () => {
    const canvas = document.getElementById("share-qr-canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "qr-code.png";
    a.click();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <QRCodeCanvas
        id="share-qr-canvas"
        value={link}
        size={size}
        level="M"
        includeMargin
      />
      <button
        type="button"
        onClick={handleDownload}
        className="btn btn-light btn-sm"
      >
        Download QR
      </button>
    </div>
  );
};

export default ShareQrCode;