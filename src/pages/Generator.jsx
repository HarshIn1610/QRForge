import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQR } from "../context/QRContext";
import { useSettings } from "../context/SettingsContext";
import QRCode from "qrcode";
import { buildQRPayload } from "../utils/qrPayload";
import {
    isValidURL,
    isValidEmail,
    isValidPhone,
    isValidWiFiSSID,
    isValidWiFiPassword,
    getScanWarnings,
} from "../utils/validation";
import { addToQRHistory } from "../utils/history";
import "../App.css";

const qrTypeConfig = {
    url: { label: "URL", placeholder: "https://example.com" },
    text: { label: "Text", placeholder: "Enter text..." },
    email: { label: "Email", placeholder: "user@example.com" },
    phone: { label: "Phone Number", placeholder: "+1234567890" },
    wifi: { label: "Wi-Fi Network Name", placeholder: "Enter Wi-Fi network name" },
};

const presets = {
    classic: {
        name: "Classic",
        foreground: "#000000",
        background: "#ffffff",
    },
    midnight: {
        name: "Midnight",
        foreground: "#ffffff",
        background: "#111827",
    },
    ocean: {
        name: "Ocean",
        foreground: "#35d8f9",
        background: "#0d507d",
    },
    forest: {
        name: "Forest",
        foreground: "#41d84e",
        background: "#1f6136",
    },
};
function Generator() {
    const navigate = useNavigate();
    const {
        qrType,
        setQRType,
        currentQRSettings,
        updateQRSetting,
        formData,
        updateField,
    } = useQR();
    const { historyEnabled } = useSettings();
    const [urlError, setUrlError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [wifiError, setWifiError] = useState("");
    const scanWarnings = getScanWarnings(
        currentQRSettings
    );
    const applyPreset = (preset) => {
        updateQRSetting("foreground", preset.foreground);
        updateQRSetting("background", preset.background);
    };
    const isFinderModule = (row, col, moduleCount) => {
        const finderSize = 7;

        const topLeft =
            row < finderSize &&
            col < finderSize;

        const topRight =
            row < finderSize &&
            col >= moduleCount - finderSize;

        const bottomLeft =
            row >= moduleCount - finderSize &&
            col < finderSize;

        return topLeft || topRight || bottomLeft;
    };
    const downloadSVG = () => {
        if (!qrPayload) return;

        try {
            const qr = QRCode.create(qrPayload, {
                errorCorrectionLevel:
                    currentQRSettings.errorCorrection,
            });

            const modules = qr.modules;
            const moduleCount = modules.size;

            const size = currentQRSettings.size;
            const quietZone = currentQRSettings.margin * 4;
            const availableSize = size - quietZone * 2;
            const moduleSize = availableSize / moduleCount;

            const pattern =
                currentQRSettings.pattern || "square";

            const background =
                currentQRSettings.background;

            const foreground =
                currentQRSettings.foreground;

            let svgContent = "";

            /*
             * Background
             */
            svgContent += `
            <rect
                width="${size}"
                height="${size}"
                fill="${background}"
            />
        `;

            /*
             * Gradient definition
             */
            if (currentQRSettings.gradient) {
                svgContent += `
                <defs>
                    <linearGradient
                        id="qrGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                    >
                        <stop
                            offset="0%"
                            stop-color="${currentQRSettings.gradientStart}"
                        />
                        <stop
                            offset="100%"
                            stop-color="${currentQRSettings.gradientEnd}"
                        />
                    </linearGradient>
                </defs>
            `;
            }

            const qrFill = currentQRSettings.gradient
                ? "url(#qrGradient)"
                : foreground;

            /*
             * QR modules
             */
            for (let row = 0; row < moduleCount; row++) {
                for (let col = 0; col < moduleCount; col++) {
                    if (!modules.get(row, col)) {
                        continue;
                    }

                    const x =
                        quietZone +
                        col * moduleSize;

                    const y =
                        quietZone +
                        row * moduleSize;

                    const finderModule = isFinderModule(
                        row,
                        col,
                        moduleCount
                    );

                    if (!finderModule && pattern === "dots") {
                        const radius =
                            moduleSize * 0.42;

                        svgContent += `
        <circle
            cx="${x + moduleSize / 2}"
            cy="${y + moduleSize / 2}"
            r="${radius}"
            fill="${qrFill}"
        />
    `;
                    } else if (!finderModule && pattern === "rounded") {
                        const radius =
                            moduleSize * 0.25;

                        svgContent += `
        <rect
            x="${x}"
            y="${y}"
            width="${moduleSize}"
            height="${moduleSize}"
            rx="${radius}"
            fill="${qrFill}"
        />
    `;
                    } else {
                        svgContent += `
        <rect
            x="${x}"
            y="${y}"
            width="${moduleSize}"
            height="${moduleSize}"
            fill="${qrFill}"
        />
    `;
                    }
                }
            }

            /*
             * Logo
             */
            if (currentQRSettings.logo) {
                const logoSize = size * 0.2;

                const logoX =
                    (size - logoSize) / 2;

                const logoY =
                    (size - logoSize) / 2;

                svgContent += `
                <rect
                    x="${logoX - 6}"
                    y="${logoY - 6}"
                    width="${logoSize + 12}"
                    height="${logoSize + 12}"
                    fill="${background}"
                />
            `;

                svgContent += `
                <image
                    href="${currentQRSettings.logo}"
                    x="${logoX}"
                    y="${logoY}"
                    width="${logoSize}"
                    height="${logoSize}"
                    preserveAspectRatio="xMidYMid meet"
                />
            `;
            }

            const svg = `
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="${size}"
                height="${size}"
                viewBox="0 0 ${size} ${size}"
            >
                ${svgContent}
            </svg>
        `;

            const blob = new Blob(
                [svg],
                {
                    type: "image/svg+xml",
                }
            );

            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");

            link.href = url;
            link.download = "qrforge-qr.svg";

            link.click();

            URL.revokeObjectURL(url);
        } catch (error) {
            console.error(
                "SVG generation failed:",
                error
            );
        }
    };
    const downloadQR = () => {
        if (!qrCanvasRef.current || !qrPayload) return;

        const link = document.createElement("a");
        link.download = "qrforge-qr.png";
        link.href = qrCanvasRef.current.toDataURL("image/png");
        link.click();

        if (historyEnabled) {
            addToQRHistory({
                id: crypto.randomUUID(),
                type: qrType,
                payload: qrPayload,
                settings: {
                    ...currentQRSettings,
                },
                createdAt: Date.now(),
            });
        }
    };

    const copyQRPayload = async () => {
        if (!qrPayload) {
            return;
        }

        try {
            await navigator.clipboard.writeText(qrPayload);
            alert("QR content copied!");
        } catch (error) {
            console.error("Copy failed:", error);
        }
    };

    const qrCanvasRef = useRef(null);



    const currentConfig = qrTypeConfig[qrType];
    const isFormValid = (() => {
        switch (qrType) {
            case "url":
                return isValidURL(formData.url);

            case "text":
                return formData.text.trim().length > 0;

            case "email":
                return (
                    isValidEmail(formData.email) &&
                    formData.subject.trim().length > 0 &&
                    formData.message.trim().length > 0
                );

            case "phone":
                return isValidPhone(formData.phone);

            case "wifi":
                return (
                    isValidWiFiSSID(formData.wifiSSID) &&
                    isValidWiFiPassword(
                        formData.wifiPassword,
                        formData.wifiEncryption
                    )
                );

            default:
                return false;
        }
    })();

    const qrPayload = isFormValid
        ? buildQRPayload(qrType, formData)
        : "";
    useEffect(() => {
        if (!qrCanvasRef.current) {
            return;
        }

        const canvas = qrCanvasRef.current;

        if (!qrPayload) {
            const ctx = canvas.getContext("2d");

            ctx.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );

            return;
        }

        try {
            const qr = QRCode.create(qrPayload, {
                errorCorrectionLevel:
                    currentQRSettings.errorCorrection,
            });

            const modules = qr.modules;
            const moduleCount = modules.size;

            const size = currentQRSettings.size;
            const margin = currentQRSettings.margin;

            canvas.width = size;
            canvas.height = size;

            const ctx = canvas.getContext("2d");

            ctx.clearRect(0, 0, size, size);

            /*
             * Background
             */
            ctx.fillStyle = currentQRSettings.background;

            ctx.fillRect(
                0,
                0,
                size,
                size
            );

            /*
             * QR drawing area
             */
            const quietZone = margin * 4;

            const availableSize =
                size - quietZone * 2;

            const moduleSize =
                availableSize / moduleCount;

            /*
             * QR gradient
             */
            let qrFill = currentQRSettings.foreground;

            if (currentQRSettings.gradient) {
                const gradient = ctx.createLinearGradient(
                    0,
                    0,
                    size,
                    size
                );

                gradient.addColorStop(
                    0,
                    currentQRSettings.gradientStart
                );

                gradient.addColorStop(
                    1,
                    currentQRSettings.gradientEnd
                );

                qrFill = gradient;
            }

            ctx.fillStyle = qrFill;

            /*
             * Draw QR modules
             */
            for (let row = 0; row < moduleCount; row++) {
                for (let col = 0; col < moduleCount; col++) {
                    if (!modules.get(row, col)) {
                        continue;
                    }

                    const x =
                        quietZone +
                        col * moduleSize;

                    const y =
                        quietZone +
                        row * moduleSize;

                    const pattern =
                        currentQRSettings.pattern || "square";

                    const finderModule = isFinderModule(
                        row,
                        col,
                        moduleCount
                    );

                    if (!finderModule && pattern === "dots") {
                        const radius =
                            moduleSize * 0.42;

                        ctx.beginPath();

                        ctx.arc(
                            x + moduleSize / 2,
                            y + moduleSize / 2,
                            radius,
                            0,
                            Math.PI * 2
                        );

                        ctx.fill();
                    } else if (!finderModule && pattern === "rounded") {
                        const radius =
                            moduleSize * 0.25;

                        ctx.beginPath();

                        ctx.roundRect(
                            x,
                            y,
                            moduleSize,
                            moduleSize,
                            radius
                        );

                        ctx.fill();
                    } else {
                        ctx.fillRect(
                            x,
                            y,
                            moduleSize,
                            moduleSize
                        );
                    }
                }
            }

            /*
             * Apply logo after pattern rendering
             */
            if (!currentQRSettings.logo) {
                return;
            }

            const logo = new Image();

            logo.onload = () => {
                const logoSize =
                    canvas.width * 0.2;

                const x =
                    (canvas.width - logoSize) / 2;

                const y =
                    (canvas.height - logoSize) / 2;

                ctx.fillStyle =
                    currentQRSettings.background;

                ctx.fillRect(
                    x - 6,
                    y - 6,
                    logoSize + 12,
                    logoSize + 12
                );

                ctx.drawImage(
                    logo,
                    x,
                    y,
                    logoSize,
                    logoSize
                );
            };

            logo.src = currentQRSettings.logo;

        } catch (error) {
            console.error(
                "QR generation failed:",
                error
            );
        }
    }, [qrPayload, currentQRSettings]);

    return (
        <div className="app">
            <header className="header">
                <Link to="/" className="app-logo">
                    QRForge
                </Link>
                <p>Create. Customize. Scan.</p>
            </header>

            <main className="main">
                <section className="controls">

                    <h2>Create your QR code</h2>

                    <div className="qr-types">
                        <button
                            className={qrType === "url" ? "active" : ""}
                            onClick={() => setQRType("url")}
                        >
                            URL
                        </button>

                        <button
                            className={qrType === "text" ? "active" : ""}
                            onClick={() => setQRType("text")}
                        >
                            Text
                        </button>

                        <button
                            className={qrType === "email" ? "active" : ""}
                            onClick={() => setQRType("email")}
                        >
                            Email
                        </button>

                        <button
                            className={qrType === "phone" ? "active" : ""}
                            onClick={() => setQRType("phone")}
                        >
                            Phone
                        </button>

                        <button
                            className={qrType === "wifi" ? "active" : ""}
                            onClick={() => setQRType("wifi")}
                        >
                            Wi-Fi
                        </button>
                    </div>

                    <div className="input-section">
                        {qrType === "url" && (
                            <>
                                <label>Enter URL</label>

                                <input
                                    type="text"
                                    placeholder="https://example.com"
                                    value={formData.url}
                                    className={
                                        urlError
                                            ? "input-invalid"
                                            : formData.url
                                                ? "input-valid"
                                                : ""
                                    }
                                    onChange={(e) => {
                                        const value = e.target.value;

                                        updateField("url", value);

                                        if (!value.trim()) {
                                            setUrlError("");
                                            return;
                                        }

                                        if (!isValidURL(value)) {
                                            setUrlError("Please enter a valid URL.");
                                        } else {
                                            setUrlError("");
                                        }
                                    }}
                                />

                                {urlError && (
                                    <p className="input-error">
                                        {urlError}
                                    </p>
                                )}
                            </>
                        )}

                        {qrType === "text" && (
                            <>
                                <label>Enter Text</label>

                                <textarea
                                    placeholder="Enter your text..."
                                    value={formData.text}
                                    onChange={(e) => updateField("text", e.target.value)}
                                />
                            </>
                        )}

                        {qrType === "email" && (
                            <>
                                <label>Email Address</label>

                                <input
                                    type="email"
                                    placeholder="user@example.com"
                                    value={formData.email}
                                    className={
                                        emailError
                                            ? "input-invalid"
                                            : formData.email
                                                ? "input-valid"
                                                : ""
                                    }
                                    onChange={(e) => {
                                        const value = e.target.value;

                                        updateField("email", value);

                                        if (!value.trim()) {
                                            setEmailError("");
                                            return;
                                        }

                                        if (!isValidEmail(value)) {
                                            setEmailError("Please enter a valid email address.");
                                        } else {
                                            setEmailError("");
                                        }
                                    }}
                                />

                                {emailError && (
                                    <p className="input-error">
                                        {emailError}
                                    </p>
                                )}

                                <label>Subject</label>

                                <input
                                    type="text"
                                    placeholder="Email subject"
                                    value={formData.subject}
                                    onChange={(e) => updateField("subject", e.target.value)}
                                />

                                <label>Message</label>

                                <textarea
                                    placeholder="Enter your message..."
                                    value={formData.message}
                                    onChange={(e) => updateField("message", e.target.value)}
                                />
                            </>
                        )}

                        {qrType === "phone" && (
                            <>
                                <label>Phone Number</label>

                                <input
                                    type="tel"
                                    placeholder="+919876543210"
                                    value={formData.phone}
                                    className={
                                        phoneError
                                            ? "input-invalid"
                                            : formData.phone
                                                ? "input-valid"
                                                : ""
                                    }
                                    onChange={(e) => {
                                        const value = e.target.value;

                                        updateField("phone", value);

                                        if (!value.trim()) {
                                            setPhoneError("");
                                            return;
                                        }

                                        if (!isValidPhone(value)) {
                                            setPhoneError(
                                                "Please enter a valid phone number."
                                            );
                                        } else {
                                            setPhoneError("");
                                        }
                                    }}
                                />

                                {phoneError && (
                                    <p className="input-error">
                                        {phoneError}
                                    </p>
                                )}
                            </>
                        )}

                        {qrType === "wifi" && (
                            <>
                                <label>Network Name</label>

                                <input
                                    type="text"
                                    placeholder="My Wi-Fi"
                                    value={formData.wifiSSID}
                                    className={
                                        wifiError
                                            ? "input-invalid"
                                            : formData.wifiSSID
                                                ? "input-valid"
                                                : ""
                                    }
                                    onChange={(e) => {
                                        const value = e.target.value;

                                        updateField("wifiSSID", value);

                                        if (!value.trim()) {
                                            setWifiError(
                                                "Wi-Fi network name cannot be empty."
                                            );
                                            return;
                                        }

                                        if (!isValidWiFiSSID(value)) {
                                            setWifiError(
                                                "Please enter a valid Wi-Fi network name."
                                            );
                                            return;
                                        }

                                        if (
                                            formData.wifiEncryption !==
                                            "nopass" &&
                                            !isValidWiFiPassword(
                                                formData.wifiPassword,
                                                formData.wifiEncryption
                                            )
                                        ) {
                                            setWifiError(
                                                "Wi-Fi password must be at least 8 characters."
                                            );
                                            return;
                                        }

                                        setWifiError("");
                                    }}
                                />

                                <label>Password</label>

                                <input
                                    type="password"
                                    placeholder="Wi-Fi password"
                                    value={formData.wifiPassword}
                                    className={
                                        wifiError
                                            ? "input-invalid"
                                            : formData.wifiPassword
                                                ? "input-valid"
                                                : ""
                                    }
                                    onChange={(e) => {
                                        const value = e.target.value;

                                        updateField("wifiPassword", value);

                                        if (
                                            formData.wifiEncryption !==
                                            "nopass" &&
                                            !isValidWiFiPassword(
                                                value,
                                                formData.wifiEncryption
                                            )
                                        ) {
                                            setWifiError(
                                                "Wi-Fi password must be at least 8 characters."
                                            );
                                        } else {
                                            setWifiError("");
                                        }
                                    }}
                                />

                                <label>Encryption</label>

                                <select
                                    value={formData.wifiEncryption}
                                    onChange={(e) => {
                                        const value = e.target.value;

                                        updateField(
                                            "wifiEncryption",
                                            value
                                        );

                                        if (value === "nopass") {
                                            setWifiError("");
                                        } else if (
                                            !isValidWiFiPassword(
                                                formData.wifiPassword,
                                                value
                                            )
                                        ) {
                                            setWifiError(
                                                "Wi-Fi password must be at least 8 characters."
                                            );
                                        } else {
                                            setWifiError("");
                                        }
                                    }}
                                >
                                    <option value="WPA">WPA/WPA2</option>
                                    <option value="WEP">WEP</option>
                                    <option value="nopass">No Password</option>
                                </select>

                                {wifiError && (
                                    <p className="input-error">
                                        {wifiError}
                                    </p>
                                )}
                            </>
                        )}

                    </div>
                    <div className="customization-section">
                        <h3>QR Size</h3>

                        <div className="setting-row">
                            <label htmlFor="qr-size">
                                Size: {currentQRSettings.size}px
                            </label>

                            <input
                                id="qr-size"
                                type="range"
                                min="128"
                                max="512"
                                step="16"
                                value={currentQRSettings.size}
                                onChange={(e) =>
                                    updateQRSetting("size", Number(e.target.value))
                                }
                            />
                        </div>
                    </div>
                    <div className="customization-section">
                        <h3>Colors</h3>

                        <div className="setting-row">
                            <label htmlFor="foreground-color">
                                Foreground
                            </label>

                            <input
                                id="foreground-color"
                                type="color"
                                value={currentQRSettings.foreground}
                                onChange={(e) =>
                                    updateQRSetting("foreground", e.target.value)
                                }
                            />
                        </div>

                        <div className="setting-row">
                            <label htmlFor="background-color">
                                Background
                            </label>

                            <input
                                id="background-color"
                                type="color"
                                value={currentQRSettings.background}
                                onChange={(e) =>
                                    updateQRSetting("background", e.target.value)
                                }
                            />
                        </div>
                    </div>
                    <div className="customization-section">
                        <h3>Error Correction</h3>

                        <div className="setting-row">
                            <label htmlFor="error-correction">
                                Level
                            </label>

                            <select
                                id="error-correction"
                                value={currentQRSettings.errorCorrection}
                                onChange={(e) =>
                                    updateQRSetting("errorCorrection", e.target.value)
                                }
                            >
                                <option value="L">Low (7%)</option>
                                <option value="M">Medium (15%)</option>
                                <option value="Q">Quartile (25%)</option>
                                <option value="H">High (30%)</option>
                            </select>
                        </div>
                    </div>
                    <div className="customization-section">
                        <h3>Margin</h3>

                        <div className="setting-row">
                            <label htmlFor="qr-margin">
                                Margin: {currentQRSettings.margin}
                            </label>

                            <input
                                id="qr-margin"
                                type="range"
                                min="0"
                                max="12"
                                step="1"
                                value={currentQRSettings.margin}
                                onChange={(e) =>
                                    updateQRSetting("margin", Number(e.target.value))
                                }
                            />
                        </div>
                    </div>
                    <div className="customization-section">
                        <h3>Presets</h3>

                        <div className="preset-grid">
                            {Object.values(presets).map((preset) => (
                                <button
                                    key={preset.name}
                                    onClick={() => applyPreset(preset)}
                                >
                                    {preset.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="preview">
                    <h2>Preview</h2>

                    <div className="qr-placeholder">
                        <canvas ref={qrCanvasRef}></canvas>
                    </div>
                    {scanWarnings.length > 0 && (
                        <div className="scan-warning">
                            <strong>Scan reliability</strong>

                            <ul>
                                {scanWarnings.map((warning, index) => (
                                    <li key={index}>
                                        {warning}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <div className="preview-actions">
                        <button onClick={downloadQR}>
                            Download PNG
                        </button>

                        <button onClick={downloadSVG}>
                            Download SVG
                        </button>

                        <button onClick={copyQRPayload}>
                            Copy Content
                        </button>

                        <button onClick={() => navigate("/customize")}>
                            Customize
                        </button>
                    </div>
                    <div className="customization-section">
                        <h3>Logo</h3>

                        <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={(event) => {
                                const file = event.target.files?.[0];

                                if (!file) return;

                                if (file.size > 2 * 1024 * 1024) {
                                    alert("Logo must be smaller than 2 MB.");
                                    return;
                                }

                                const reader = new FileReader();

                                reader.onload = () => {
                                    updateQRSetting("logo", reader.result);
                                };

                                reader.readAsDataURL(file);
                            }}
                        />

                        {currentQRSettings.logo && (
                            <button
                                type="button"
                                onClick={() => updateQRSetting("logo", null)}
                            >
                                Remove Logo
                            </button>
                        )}
                    </div>
                </section>
            </main>
        </div >
    );
}

export default Generator;