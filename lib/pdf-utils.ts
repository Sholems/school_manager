'use client';

/**
 * Converts a CSS color value to RGB hex format
 * Handles lab(), oklch(), lch(), rgb(), rgba(), hsl(), hsla(), and hex values
 */
const colorToHex = (color: string): string => {
    // Return if already hex
    if (/^#[0-9a-f]{3,8}$/i.test(color)) {
        return color;
    }

    // Skip if it contains unsupported color functions
    if (/^(?:lab|oklch|lch|hwb|color)\(/i.test(color)) {
        return '#000000'; // Fallback to black for unsupported formats
    }

    // Use canvas to convert color to RGB
    try {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d');
        if (!ctx) return '#000000';

        ctx.fillStyle = '#000000'; // Default
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 1, 1);

        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    } catch {
        return '#000000';
    }
};

/**
 * Recursively converts all CSS colors in an element tree to RGB hex
 * This prevents html2canvas from failing on lab()/oklch() colors
 */
const convertColorsToRgb = (element: HTMLElement): void => {
    const colorProperties = [
        'color',
        'backgroundColor',
        'borderColor',
        'borderTopColor',
        'borderRightColor',
        'borderBottomColor',
        'borderLeftColor',
        'outlineColor',
        'textDecorationColor',
        'caretColor'
    ];

    // Get computed styles
    const computed = window.getComputedStyle(element);

    // Apply converted colors as inline styles
    colorProperties.forEach(prop => {
        const value = computed.getPropertyValue(
            prop.replace(/([A-Z])/g, '-$1').toLowerCase()
        );
        if (value && value !== 'rgba(0, 0, 0, 0)' && value !== 'transparent') {
            // Check if it's a modern color function that needs conversion
            if (/(?:lab|oklch|lch|hwb|color)\(/i.test(value)) {
                (element.style as any)[prop] = colorToHex(value);
            }
        }
    });

    // Process children
    Array.from(element.children).forEach(child => {
        if (child instanceof HTMLElement) {
            convertColorsToRgb(child);
        }
    });
};

/**
 * Generates and downloads a PDF from an HTML element
 * Works on both desktop and mobile devices
 * Converts all colors to RGB to avoid lab()/oklch() parsing issues
 */
export const downloadPDF = async (
    elementId: string,
    filename: string,
    options?: {
        logoUrl?: string | null;
        title?: string;
    }
): Promise<void> => {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element with id "${elementId}" not found`);
        return;
    }

    // Dynamically import html2pdf to avoid SSR issues
    const html2pdf = (await import('html2pdf.js')).default;

    // Create an isolated container for PDF generation
    const container = document.createElement('div');
    container.style.cssText = 'position: absolute; left: -9999px; top: 0; width: 210mm; background: white;';
    document.body.appendChild(container);

    // Clone the element content
    const clone = element.cloneNode(true) as HTMLElement;
    clone.removeAttribute('id'); // Remove ID to avoid conflicts
    container.appendChild(clone);

    // Convert all colors in the cloned element to RGB
    convertColorsToRgb(clone);

    // Wait for any images to settle
    await new Promise(resolve => setTimeout(resolve, 150));

    // Configure html2pdf options with better compatibility settings
    const pdfOptions = {
        margin: [5, 5, 5, 5] as [number, number, number, number],
        filename: `${filename}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.92 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            // Ignore CSS color functions that html2canvas can't parse
            ignoreElements: (el: Element) => {
                return el.classList?.contains('no-pdf');
            },
        },
        jsPDF: {
            unit: 'mm' as const,
            format: 'a4' as const,
            orientation: 'portrait' as const,
        },
    };

    try {
        await html2pdf().set(pdfOptions).from(clone).save();
    } catch (error) {
        console.error('Error generating PDF:', error);

        // Fallback: Try using print window
        const printFallback = confirm(
            'PDF generation failed. Would you like to print instead?\n\n' +
            'Tip: In the print dialog, select "Save as PDF" as the destination.'
        );

        if (printFallback) {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>${filename}</title>
                        <style>
                            * { margin: 0; padding: 0; box-sizing: border-box; }
                            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; background: white; }
                            @media print { body { padding: 0; } }
                        </style>
                    </head>
                    <body>${element.innerHTML}</body>
                    </html>
                `);
                printWindow.document.close();
                printWindow.focus();
                setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                }, 300);
            }
        }
    } finally {
        document.body.removeChild(container);
    }
};

/**
 * Check if device is mobile
 */
export const isMobileDevice = (): boolean => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};
