export function isValidURL(value) {
    if (!value.trim()) {
        return false;
    }

    try {
        const url = new URL(value);

        return (
            url.protocol === "http:" ||
            url.protocol === "https:"
        );
    } catch {
        return false;
    }
}

export function isValidEmail(value) {
    if (!value.trim()) {
        return false;
    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        value.trim()
    );
}

export function isValidPhone(value) {
    if (!value.trim()) {
        return false;
    }

    const cleaned = value.replace(
        /[\s().-]/g,
        ""
    );

    return /^\+?\d{7,15}$/.test(cleaned);
}

export function isValidWiFiSSID(value) {
    return value.trim().length > 0;
}

export function isValidWiFiPassword(
    password,
    encryption
) {
    if (encryption === "nopass") {
        return true;
    }

    return password.trim().length >= 8;
}

/*
 * Convert HEX color to RGB.
 */
function hexToRGB(hex) {
    const cleanHex = hex.replace("#", "");

    if (cleanHex.length !== 6) {
        return null;
    }

    return {
        r: parseInt(cleanHex.slice(0, 2), 16),
        g: parseInt(cleanHex.slice(2, 4), 16),
        b: parseInt(cleanHex.slice(4, 6), 16),
    };
}

/*
 * Calculate relative luminance.
 */
function getLuminance(rgb) {
    if (!rgb) {
        return null;
    }

    const channels = [
        rgb.r,
        rgb.g,
        rgb.b,
    ].map((channel) => {
        const value = channel / 255;

        return value <= 0.03928
            ? value / 12.92
            : Math.pow(
                (value + 0.055) / 1.055,
                2.4
            );
    });

    return (
        0.2126 * channels[0] +
        0.7152 * channels[1] +
        0.0722 * channels[2]
    );
}

/*
 * Calculate contrast ratio between two colors.
 */
function getContrastRatio(
    foreground,
    background
) {
    const foregroundRGB = hexToRGB(foreground);
    const backgroundRGB = hexToRGB(background);

    const foregroundLuminance =
        getLuminance(foregroundRGB);

    const backgroundLuminance =
        getLuminance(backgroundRGB);

    if (
        foregroundLuminance === null ||
        backgroundLuminance === null
    ) {
        return null;
    }

    const lighter = Math.max(
        foregroundLuminance,
        backgroundLuminance
    );

    const darker = Math.min(
        foregroundLuminance,
        backgroundLuminance
    );

    return (
        (lighter + 0.05) /
        (darker + 0.05)
    );
}

export function getScanWarnings(settings) {
    const warnings = [];

    if (!settings) {
        return warnings;
    }

    /*
     * Small QR codes.
     */
    if (settings.size < 192) {
        warnings.push(
            "Small QR size may reduce scanning reliability."
        );
    }

    /*
     * Logo and error correction.
     */
    if (settings.logo) {
        if (settings.errorCorrection === "L") {
            warnings.push(
                "A logo with Low error correction may be difficult to scan."
            );
        } else if (settings.errorCorrection === "M") {
            warnings.push(
                "A logo is present. Higher error correction is recommended."
            );
        }
    }

    /*
     * Stylized patterns.
     */
    if (
        settings.pattern === "dots" ||
        settings.pattern === "rounded"
    ) {
        warnings.push(
            "Stylized QR patterns may reduce scanning reliability on some devices."
        );
    }

    /*
     * Normal foreground/background contrast.
     */
    if (!settings.gradient) {
        const contrast = getContrastRatio(
            settings.foreground,
            settings.background
        );

        if (
            contrast !== null &&
            contrast < 3
        ) {
            warnings.push(
                "Low foreground/background contrast may make the QR code difficult to scan."
            );
        }
    }

    /*
     * Gradient contrast.
     *
     * Check the beginning, middle, and end
     * of the gradient against the QR background.
     */
    if (settings.gradient) {
        const gradientColors = [
            settings.gradientStart,
            blendColors(
                settings.gradientStart,
                settings.gradientEnd,
                0.5
            ),
            settings.gradientEnd,
        ];

        const hasLowContrast =
            gradientColors.some((color) => {
                const contrast = getContrastRatio(
                    color,
                    settings.background
                );

                return (
                    contrast !== null &&
                    contrast < 3
                );
            });

        if (hasLowContrast) {
            warnings.push(
                "The QR gradient has low contrast with the background and may be difficult to scan."
            );
        }
    }

    return warnings;
}

/*
 * Blend two HEX colors.
 */
function blendColors(
    color1,
    color2,
    amount
) {
    const rgb1 = hexToRGB(color1);
    const rgb2 = hexToRGB(color2);

    if (!rgb1 || !rgb2) {
        return color1;
    }

    const r = Math.round(
        rgb1.r +
        (rgb2.r - rgb1.r) * amount
    );

    const g = Math.round(
        rgb1.g +
        (rgb2.g - rgb1.g) * amount
    );

    const b = Math.round(
        rgb1.b +
        (rgb2.b - rgb1.b) * amount
    );

    return (
        "#" +
        [r, g, b]
            .map((value) =>
                value
                    .toString(16)
                    .padStart(2, "0")
            )
            .join("")
    );
}