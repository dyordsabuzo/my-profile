import { buildResumePDF } from "../../utils/pdfbuilders/pdf-builder-standard";
import { Logger } from "../../utils/common/logger";
import { basic, contactInfo, experiences } from "../../config/cv.json";

export default function ReactButton() {
  const handleClick = async () => {
    try {
      const resumeData = {
        personalInfo: {
          ...basic,
        },
        contactInfo,
        experiences,
      };
      const pdfDoc = await buildResumePDF(resumeData);
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(blob);
      const newTab = window.open(pdfUrl, "_blank");

      // Handle popup blocker case
      if (!newTab) {
        Logger.warn("Popup blocked, falling back to download");
        // Fallback: download the file
        const link = document.createElement("a");
        link.href = pdfUrl;
        link.download = "resume.pdf";
        link.click();
      } else {
        Logger.info("📄 PDF opened in new tab");
      }

      // Clean up object URL after a delay to ensure it loads
      setTimeout(() => {
        URL.revokeObjectURL(pdfUrl);
      }, 1000);
    } catch (error) {
      Logger.error("Error generating PDF:", error);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className="inline-flex items-center justify-center px-10 py-4 text-base text-white
          font-semibold transition-all duration-200 rounded
          bg-primary hover:bg-secondary focus:bg-secondary"
      >
        Download CSV
      </button>
    </div>
  );
}
