import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Generator from "./pages/Generator";
import Customize from "./pages/Customize";
import Settings from "./pages/Settings";

import { QRProvider } from "./context/QRContext";
import { SettingsProvider, useSettings } from "./context/SettingsContext";

function AppContent() {
  const {
    theme,
    backgroundMode,
    backgroundStart,
    backgroundEnd,
  } = useSettings();

  return (
    <div
      className={`app-shell theme-${theme} background-${backgroundMode}`}
      style={{
        "--background-start": backgroundStart,
        "--background-end": backgroundEnd,
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/generator" element={<Generator />} />
          <Route path="/customize" element={<Customize />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

function App() {
  return (
    <SettingsProvider>
      <QRProvider>
        <AppContent />
      </QRProvider>
    </SettingsProvider>
  );
}

export default App;