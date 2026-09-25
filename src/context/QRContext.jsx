import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

const QRContext = createContext(null);

const defaultQRSettings = {
    size: 256,
    foreground: "#000000",
    background: "#ffffff",
    errorCorrection: "M",
    margin: 4,
    logo: null,
    gradient: false,
    gradientStart: "#000000",
    gradientEnd: "#2563eb",
    pattern: "square",
};

const defaultFormData = {
    url: "",
    text: "",
    email: "",
    subject: "",
    message: "",
    phone: "",
    wifiSSID: "",
    wifiPassword: "",
    wifiEncryption: "WPA",
};

export function QRProvider({ children }) {
    const [qrType, setQRTypeState] = useState("url");

    const [globalQRSettings, setGlobalQRSettings] =
        useState(defaultQRSettings);
    useEffect(() => {
        setCurrentQRSettings((previousSettings) => ({
            ...previousSettings,
            size: globalQRSettings.size,
            foreground: globalQRSettings.foreground,
            background: globalQRSettings.background,
            errorCorrection: globalQRSettings.errorCorrection,
            margin: globalQRSettings.margin,
            gradient: globalQRSettings.gradient,
            gradientStart: globalQRSettings.gradientStart,
            gradientEnd: globalQRSettings.gradientEnd,
            pattern: globalQRSettings.pattern,
        }));
    }, [globalQRSettings]);

    const [currentQRSettings, setCurrentQRSettings] =
        useState(defaultQRSettings);

    const [formData, setFormData] = useState(defaultFormData);
    const setQRType = (type) => {
        setQRTypeState(type);
        setCurrentQRSettings(globalQRSettings);
    };

    const updateQRSetting = (setting, value) => {
        setCurrentQRSettings((previousSettings) => ({
            ...previousSettings,
            [setting]: value,
        }));
    };
    const updateGlobalQRSetting = (setting, value) => {
        setGlobalQRSettings((previousSettings) => ({
            ...previousSettings,
            [setting]: value,
        }));

        setCurrentQRSettings((previousSettings) => ({
            ...previousSettings,
            [setting]: value,
        }));
    };
    const setLogo = (logo) => {
        setCurrentQRSettings((previousSettings) => ({
            ...previousSettings,
            logo,
        }));
    };
    const updateField = (field, value) => {
        setFormData((previousData) => ({
            ...previousData,
            [field]: value,
        }));
    };
    const loadHistoryEntry = (entry) => {
        setQRTypeState(entry.type);

        switch (entry.type) {
            case "url":
                setFormData((previousData) => ({
                    ...previousData,
                    url: entry.payload,
                }));
                break;

            case "text":
                setFormData((previousData) => ({
                    ...previousData,
                    text: entry.payload,
                }));
                break;

            case "phone":
                setFormData((previousData) => ({
                    ...previousData,
                    phone: entry.payload.replace(/^tel:/, ""),
                }));
                break;

            default:
                break;
        }

        if (entry.settings) {
            setCurrentQRSettings({
                ...defaultQRSettings,
                ...entry.settings,
            });
        } else {
            setCurrentQRSettings(globalQRSettings);
        }
    };
    return (
        <QRContext.Provider
            value={{
                qrType,
                setQRType,

                globalQRSettings,
                updateGlobalQRSetting,

                currentQRSettings,
                updateQRSetting,
                setLogo,

                formData,
                updateField,
                loadHistoryEntry,
            }}
        >
            {children}
        </QRContext.Provider>
    );
}

export function useQR() {
    return useContext(QRContext);
}