import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

const SettingsContext = createContext(null);

function getStoredSetting(key, fallback) {
    const storedValue = localStorage.getItem(key);
    return storedValue ?? fallback;
}

export function SettingsProvider({ children }) {
    const [theme, setTheme] = useState(() =>
        getStoredSetting("qrforge-theme", "light")
    );

    const [historyEnabled, setHistoryEnabled] = useState(() =>
        getStoredSetting(
            "qrforge-history-enabled",
            "true"
        ) === "true"
    );

    const [backgroundMode, setBackgroundMode] =
        useState(() =>
            getStoredSetting(
                "qrforge-background",
                "classic"
            )
        );

    /*
     * Application background gradient colors
     */
    const [backgroundStart, setBackgroundStart] =
        useState(() =>
            getStoredSetting(
                "qrforge-background-start",
                "#eef2ff"
            )
        );

    const [backgroundEnd, setBackgroundEnd] =
        useState(() =>
            getStoredSetting(
                "qrforge-background-end",
                "#ecfeff"
            )
        );

    const [historyVersion, setHistoryVersion] =
        useState(0);

    /*
     * Persist theme
     */
    useEffect(() => {
        localStorage.setItem(
            "qrforge-theme",
            theme
        );
    }, [theme]);

    /*
     * Persist history setting
     */
    useEffect(() => {
        localStorage.setItem(
            "qrforge-history-enabled",
            String(historyEnabled)
        );
    }, [historyEnabled]);

    /*
     * Persist background mode
     */
    useEffect(() => {
        localStorage.setItem(
            "qrforge-background",
            backgroundMode
        );
    }, [backgroundMode]);

    /*
     * Persist background gradient start
     */
    useEffect(() => {
        localStorage.setItem(
            "qrforge-background-start",
            backgroundStart
        );
    }, [backgroundStart]);

    /*
     * Persist background gradient end
     */
    useEffect(() => {
        localStorage.setItem(
            "qrforge-background-end",
            backgroundEnd
        );
    }, [backgroundEnd]);

    const clearHistory = () => {
        localStorage.removeItem("qrforge-history");
        setHistoryVersion(
            (version) => version + 1
        );
    };

    return (
        <SettingsContext.Provider
            value={{
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
                historyVersion,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    return useContext(SettingsContext);
}