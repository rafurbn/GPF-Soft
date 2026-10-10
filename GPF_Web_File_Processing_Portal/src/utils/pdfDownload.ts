export const createPdfFileName = (prefix: string, applicantName: string) => {
  const safeName = applicantName
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-')
    .trim()
    .slice(0, 80);

  return `${prefix}_${safeName || 'application'}.pdf`;
};

export const downloadElementAsPdf = async (elementId: string, fileName: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`PDF content not found: ${elementId}`);
  }

  const { default: html2pdf } = await import('html2pdf.js');
  await document.fonts.ready;
  await html2pdf()
    .set({
      filename: fileName,
      margin: 0,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    })
    .from(element)
    .save();
};