'use client';

/**
 * Removes lab(), oklch(), lch() and other modern CSS color functions from inline styles
 */
const stripModernColorFunctions = (html: string): string => {
    // Remove lab(), oklch(), lch() and similar color functions from style attributes
    return html.replace(/style="([^"]*)"/g, (match, styleContent) => {
        // Remove color properties with lab/oklch/lch functions
        const cleaned = styleContent
            .replace(/color\s*:\s*(?:lab|oklch|lch|hwb)\([^)]+\)[^;]*/gi, '')
            .replace(/background(?:-color)?\s*:\s*(?:lab|oklch|lch|hwb)\([^)]+\)[^;]*/gi, '')
            .replace(/border(?:-color)?\s*:\s*(?:lab|oklch|lch|hwb)\([^)]+\)[^;]*/gi, '')
            .replace(/;;+/g, ';') // Remove duplicate semicolons
            .replace(/;\s*$/, ''); // Remove trailing semicolon
        
        return cleaned ? `style="${cleaned}"` : '';
    });
};

/**
 * Generates and downloads a PDF from an HTML element
 * Works on both desktop and mobile devices
 * Uses iframe isolation to avoid CSS color parsing issues
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

    // Create an isolated iframe to avoid CSS parsing issues with lab() colors
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position: absolute; left: -9999px; width: 210mm; height: 297mm;';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
        document.body.removeChild(iframe);
        alert('Failed to generate PDF. Please try the Print option instead.');
        return;
    }

    // Get HTML and strip modern color functions
    let html = element.innerHTML;
    html = stripModernColorFunctions(html);

    // Write clean HTML with only inline styles (no external CSS with lab() colors)
    iframeDoc.open();
    iframeDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: 'Segoe UI', Arial, sans-serif; 
                    background: white; 
                    padding: 15px;
                    color: #333;
                }
                table { border-collapse: collapse; }
                img { max-width: 100%; height: auto; }
            </style>
        </head>
        <body>${html}</body>
        </html>
    `);
    iframeDoc.close();

    // Wait for images to load
    await new Promise(resolve => setTimeout(resolve, 100));

    // Configure html2pdf options
    const pdfOptions = {
        margin: [5, 5, 5, 5] as [number, number, number, number],
        filename: `${filename}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.9 },
        html2canvas: {
            scale: 1.5,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
        },
        jsPDF: {
            unit: 'mm' as const,
            format: 'a4' as const,
            orientation: 'portrait' as const,
        },
    };

    try {
        await html2pdf().set(pdfOptions).from(iframeDoc.body).save();
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Failed to generate PDF. Please try the Print option instead.');
    } finally {
        document.body.removeChild(iframe);
    }
};

/**
 * Check if device is mobile
 */
export const isMobileDevice = (): boolean => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};
