function escapeWifiValue(value) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/:/g, "\\:");
}

export function buildQRPayload(qrType, formData) {
  switch (qrType) {
    case "url":
      return formData.url;

    case "text":
      return formData.text;

    case "phone":
      return `tel:${formData.phone}`;

    case "email":
      return `mailto:${encodeURIComponent(formData.email)}?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(formData.message)}`;

    case "wifi":
      return `WIFI:S:${escapeWifiValue(formData.wifiSSID)};T:${formData.wifiEncryption};P:${escapeWifiValue(formData.wifiPassword)};;`;

    default:
      return "";
  }
}