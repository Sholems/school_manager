'use client';

/**
 * Converts any lab/lch/oklch colors to RGB for html2canvas compatibility
 */
const sanitizeColors = (element: HTMLElement): void => {
    const allElements = element.querySelectorAll('*');
    const elementsToProcess = [element, ...Array.from(allElements)] as HTMLElement[];
    
    elementsToProcess.forEach((el) => {
        if (el.style) {
            const computed = window.getComputedStyle(el);
            // Get computed RGB values (browser converts lab to rgb)
            const bgColor = computed.backgroundColor;
            const textColor = computed.color;
            const borderColor = computed.borderColor;
            
            // Apply computed values directly (these are already in rgb format)
            if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
                el.style.backgroundColor = bgColor;
            }
            if (textColor) {
                el.style.color = textColor;
            }
            if (borderColor) {
                el.style.borderColor = borderColor;
            }
        }
    });
};

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
    
    // Temporarily add to DOM to compute styles
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    document.body.appendChild(clone);
    
    // Sanitize colors (convert lab/oklch to rgb)
    sanitizeColors(clone);

    // Configure html2pdf options - optimized for speed
    const pdfOptions = {
        margin: [5, 5, 5, 5] as [number, number, number, number],
        filename: `${filename}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.85 },
        html2canvas: {
            scale: 1.5,
            useCORS: true,
            logging: false,
            windowWidth: 800,
            backgroundColor: '#ffffff',
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
    } finally {
        // Clean up
        document.body.removeChild(clone);
    }
};

/**
 * Check if device is mobile
 */
export const isMobileDevice = (): boolean => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};
