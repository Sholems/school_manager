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

    // Create a wrapper with watermark if logo provided
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position: relative; background: white; padding: 20px;';

    // Add watermark if logo URL provided
    if (options?.logoUrl) {
        const watermark = document.createElement('div');
        watermark.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.05;
            width: 300px;
            height: 300px;
            pointer-events: none;
            z-index: 0;
        `;
        watermark.innerHTML = `<img src="${options.logoUrl}" alt="" style="width: 100%; height: 100%; object-fit: contain;" />`;
        wrapper.appendChild(watermark);
    }

    // Clone content and add to wrapper
    const content = document.createElement('div');
    content.style.cssText = 'position: relative; z-index: 1;';
    content.innerHTML = element.innerHTML;
    wrapper.appendChild(content);

    // Configure html2pdf options
    const pdfOptions = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: `${filename}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true,
            logging: false,
        },
        jsPDF: {
            unit: 'mm' as const,
            format: 'a4' as const,
            orientation: 'portrait' as const,
        },
    };

    try {
        await html2pdf().set(pdfOptions).from(wrapper).save();
    } catch (error) {
        console.error('Error generating PDF:', error);
        // Fallback: try to open print dialog
        window.print();
    }
};

/**
 * Check if device is mobile
 */
export const isMobileDevice = (): boolean => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};
