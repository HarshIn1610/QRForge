import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getQRHistory } from "../utils/history";
import { useSettings } from "../context/SettingsContext";
import { useNavigate } from "react-router-dom";
import { useQR } from "../context/QRContext";

function Dashboard() {
    const navigate = useNavigate();
    const { loadHistoryEntry } = useQR();
    const { historyEnabled, historyVersion } = useSettings();
    const [history, setHistory] = useState([]);

    useEffect(() => {
        if (historyEnabled) {
            setHistory(getQRHistory());
        } else {
            setHistory([]);
        }
    }, [historyEnabled, historyVersion]);
    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <Link to="/" className="dashboard-logo">
                    QRForge
                </Link>

                <p>Create. Customize. Scan.</p>
            </header>

            <main className="dashboard-main">
                <Link
                    to="/generator"
                    className="dashboard-card dashboard-card-large"
                >
                    <div>
                        <span className="card-label">CREATE</span>
                        <h2>Generator</h2>
                        <p>
                            Create QR codes for URLs, text, email, phone numbers, and Wi-Fi.
                        </p>
                    </div>

                    <span className="card-arrow">→</span>
                </Link>

                <div className="dashboard-card-row">
                    <Link to="/customize" className="dashboard-card">
                        <div>
                            <span className="card-label">DESIGN</span>
                            <h2>Customize</h2>
                            <p>
                                Control colors, size, error correction, presets, and more.
                            </p>
                        </div>

                        <span className="card-arrow">→</span>
                    </Link>

                    <Link to="/settings" className="dashboard-card">
                        <div>
                            <span className="card-label">PREFERENCES</span>
                            <h2>Settings</h2>
                            <p>
                                Manage themes, history, and application appearance.
                            </p>
                        </div>

                        <span className="card-arrow">→</span>
                    </Link>
                </div>

                {historyEnabled && history.length > 0 && (
                    <section className="history-section">
                        <div className="history-heading">
                            <div>
                                <span className="card-label">RECENT</span>
                                <h2>QR History</h2>
                            </div>

                            <span>{history.length} saved</span>
                        </div>

                        <div className="history-list">
                            {history.map((item) => (
                                <button
                                    className="history-item"
                                    key={item.id}
                                    onClick={() => {
                                        loadHistoryEntry(item);
                                        navigate("/generator");
                                    }}
                                >
                                    <div>
                                        <span className="history-type">
                                            {item.type.toUpperCase()}
                                        </span>

                                        <p>{item.payload}</p>
                                    </div>

                                    <span className="history-arrow">→</span>
                                </button>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}

export default Dashboard;