import { Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";

function Settings() {
  const {
    theme,
    setTheme,
    historyEnabled,
    setHistoryEnabled,
    backgroundMode,
    setBackgroundMode,
    backgroundStart,
    setBackgroundStart,
    backgroundEnd,
    setBackgroundEnd,
    clearHistory,
  } = useSettings();

  return (
    <div className="settings-page">
      <header className="header">
        <Link to="/" className="app-logo">
          QRForge
        </Link>
        <p>Manage your application preferences.</p>
      </header>

      <main className="settings-main">
        <div className="settings-heading">
          <span className="card-label">PREFERENCES</span>
          <h1>Settings</h1>
          <p>
            Control how QRForge looks and how your QR history is handled.
          </p>
        </div>

        <section className="settings-panel">
          `<div className="settings-section">`
            <h2>Theme</h2>
            <p>Choose the appearance of the application.</p>

            <div className="settings-options">
              <button
                className={theme === "light" ? "selected" : ""}
                onClick={() => setTheme("light")}
              >
                Light
              </button>

              <button
                className={theme === "dark" ? "selected" : ""}
                onClick={() => setTheme("dark")}
              >
                Dark
              </button>
            </div>
          </div>

          <div className="settings-section">
            <h2>History</h2>
            <p>
              Store recently generated QR codes locally in your browser.
            </p>

            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={historyEnabled}
                onChange={(e) => setHistoryEnabled(e.target.checked)}
              />
              <span>Enable QR history</span>
            </label>

            <button className="danger-button" onClick={clearHistory}>
              Clear History
            </button>
          </div>

          <div className="settings-section">
            <h2>Application Background</h2>
            <p>Choose the background style used throughout QRForge.</p>

            <div className="settings-options">
              <button
                className={backgroundMode === "classic" ? "selected" : ""}
                onClick={() => setBackgroundMode("classic")}
              >
                Classic
              </button>

              <button
                className={backgroundMode === "gradient" ? "selected" : ""}
                onClick={() => setBackgroundMode("gradient")}
              >
                Gradient
              </button>
            </div>

            {backgroundMode === "gradient" && (
              <div className="background-gradient-controls">

                <label className="background-color-control">
                  <span className="background-color-label">
                    Start Color
                  </span>

                  <span className="background-color-picker">
                    <span
                      className="background-color-swatch"
                      style={{ backgroundColor: backgroundStart }}
                    />

                    <span className="background-color-value">
                      {backgroundStart.toUpperCase()}
                    </span>

                    <input
                      type="color"
                      value={backgroundStart}
                      onChange={(e) =>
                        setBackgroundStart(e.target.value)
                      }
                    />
                  </span>
                </label>

                <label className="background-color-control">
                  <span className="background-color-label">
                    End Color
                  </span>

                  <span className="background-color-picker">
                    <span
                      className="background-color-swatch"
                      style={{ backgroundColor: backgroundEnd }}
                    />

                    <span className="background-color-value">
                      {backgroundEnd.toUpperCase()}
                    </span>

                    <input
                      type="color"
                      value={backgroundEnd}
                      onChange={(e) =>
                        setBackgroundEnd(e.target.value)
                      }
                    />
                  </span>
                </label>

              </div>
            )}
          </div>
        </section>

        <Link to="/" className="settings-back">
          ← Back to Dashboard
        </Link>
      </main>
    </div>
  );
}

export default Settings;