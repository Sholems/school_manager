'use client';

/**
 * Generates and downloads a PDF from an HTML element
 * Works on both desktop and mobile devices
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

    // Clone the element to avoid modifying the original
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.width = '210mm'; // A4 width
    clone.style.padding = '15px';
    clone.style.background = 'white';

    // Configure html2pdf options - optimized for speed
    const pdfOptions = {
        margin: [5, 5, 5, 5] as [number, number, number, number],
        filename: `${filename}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.85 },
        html2canvas: {
            scale: 1.5, // Reduced from 2 for faster rendering
            useCORS: true,
            logging: false,
            windowWidth: 800,
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
        alert('Failed to generate PDF. Please try the Print option instead.');
    }
};

/**
 * Check if device is mobile
 */
export const isMobileDevice = (): boolean => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};
