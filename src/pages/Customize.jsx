import { Link } from "react-router-dom";
import { useQR } from "../context/QRContext";

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
        foreground: "#0369a1",
        background: "#e0f2fe",
    },
    forest: {
        name: "Forest",
        foreground: "#166534",
        background: "#dcfce7",
    },
};

function Customize() {
    const {
        globalQRSettings,
        updateGlobalQRSetting,
    } = useQR();

    const applyPreset = (preset) => {
        updateGlobalQRSetting("foreground", preset.foreground);
        updateGlobalQRSetting("background", preset.background);
    };

    return (
        <div className="customize-page">
            <header className="header">
                <Link to="/" className="app-logo">
                    QRForge
                </Link>
                <p>Customize your QR code.</p>
            </header>

            <main className="customize-main">
                <div className="customize-heading">
                    <span className="card-label">DESIGN</span>
                    <h1>Customize</h1>
                    <p>Fine-tune the appearance and scanning characteristics of your QR code.</p>
                </div>

                <section className="customize-panel">
                    <div className="customize-section">
                        <h2>QR Size</h2>

                        <div className="customize-row">
                            <label htmlFor="customize-size">
                                Size: {globalQRSettings.size}px
                            </label>

                            <input
                                id="customize-size"
                                type="range"
                                min="128"
                                max="512"
                                step="16"
                                value={globalQRSettings.size}
                                onChange={(e) =>
                                    updateGlobalQRSetting("size", Number(e.target.value))
                                }
                            />
                        </div>
                    </div>

                    <div className="customize-section">
                        <h2>Colors</h2>

                        <div className="customize-row">
                            <label htmlFor="customize-foreground">
                                Foreground
                            </label>

                            <input
                                id="customize-foreground"
                                type="color"
                                value={globalQRSettings.foreground}
                                onChange={(e) =>
                                    updateGlobalQRSetting("foreground", e.target.value)
                                }
                            />
                        </div>
                        <div className="customization-section">
                            <h3>QR Gradient</h3>

                            <div className="setting-row">
                                <label htmlFor="gradient-toggle">
                                    Enable Gradient
                                </label>

                                <input
                                    id="gradient-toggle"
                                    type="checkbox"
                                    checked={globalQRSettings.gradient}
                                    onChange={(e) =>
                                        updateGlobalQRSetting(
                                            "gradient",
                                            e.target.checked
                                        )
                                    }
                                />
                            </div>

                            {globalQRSettings.gradient && (
                                <>
                                    <div className="setting-row">
                                        <label htmlFor="gradient-start">
                                            Start Color
                                        </label>

                                        <input
                                            id="gradient-start"
                                            type="color"
                                            value={globalQRSettings.gradientStart}
                                            onChange={(e) =>
                                                updateGlobalQRSetting(
                                                    "gradientStart",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="setting-row">
                                        <label htmlFor="gradient-end">
                                            End Color
                                        </label>

                                        <input
                                            id="gradient-end"
                                            type="color"
                                            value={globalQRSettings.gradientEnd}
                                            onChange={(e) =>
                                                updateGlobalQRSetting(
                                                    "gradientEnd",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* QR Pattern — OUTSIDE gradient conditional */}
                        <div className="customization-section">
                            <h3>QR Pattern</h3>

                            <div className="setting-row">
                                <label htmlFor="qr-pattern">
                                    Pattern
                                </label>

                                <select
                                    id="qr-pattern"
                                    value={globalQRSettings.pattern}
                                    onChange={(e) =>
                                        updateGlobalQRSetting(
                                            "pattern",
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="square">Square</option>
                                    <option value="rounded">Rounded</option>
                                    <option value="dots">Dots</option>
                                </select>
                            </div>
                        </div>

                        <div className="customize-row">
                            <label htmlFor="customize-background">
                                Background
                            </label>

                            <input
                                id="customize-background"
                                type="color"
                                value={globalQRSettings.background}
                                onChange={(e) =>
                                    updateGlobalQRSetting("background", e.target.value)
                                }
                            />
                        </div>
                    </div>

                    <div className="customize-section">
                        <h2>Error Correction</h2>

                        <div className="customize-row">
                            <label htmlFor="customize-error">
                                Level
                            </label>

                            <select
                                id="customize-error"
                                value={globalQRSettings.errorCorrection}
                                onChange={(e) =>
                                    updateGlobalQRSetting("errorCorrection", e.target.value)
                                }
                            >
                                <option value="L">Low (7%)</option>
                                <option value="M">Medium (15%)</option>
                                <option value="Q">Quartile (25%)</option>
                                <option value="H">High (30%)</option>
                            </select>
                        </div>
                    </div>

                    <div className="customize-section">
                        <h2>Margin</h2>

                        <div className="customize-row">
                            <label htmlFor="customize-margin">
                                Margin: {globalQRSettings.margin}
                            </label>

                            <input
                                id="customize-margin"
                                type="range"
                                min="0"
                                max="12"
                                step="1"
                                value={globalQRSettings.margin}
                                onChange={(e) =>
                                    updateGlobalQRSetting("margin", Number(e.target.value))
                                }
                            />
                        </div>
                    </div>

                    <div className="customize-section">
                        <h2>Presets</h2>

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

                <Link to="/generator" className="customize-back">
                    ← Back to Generator
                </Link>
            </main>
        </div>
    );
}

export default Customize;