import {
  PDFDocument,
  PDFFont,
  PDFPage,
  rgb,
  breakTextIntoLines,
} from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { loadGoogleFontTTF } from "./font-loader";
import type { FontSet, LayoutInfo, PDFConfig } from "../types/PdfProps";
import type { ResumeData } from "../types/ResumeData";

// Utility functions
class PDFTextUtils {
  static getWrappedTextHeight(
    text: string,
    font: PDFFont,
    size: number,
    maxWidth: number,
    lineHeight: number,
    wordBreaks: string[] = [" "]
  ): number {
    const getTextWidth = (t: string) => font.widthOfTextAtSize(t, size);
    const lines = breakTextIntoLines(text, wordBreaks, maxWidth, getTextWidth);
    return lines.length * lineHeight;
  }

  static drawWrappedText(
    page: PDFPage,
    text: string,
    x: number,
    y: number,
    font: PDFFont,
    size: number,
    color: ReturnType<typeof rgb>,
    maxWidth: number,
    lineHeight: number = size + 2,
    wordBreaks: string[] = [" "]
  ): number {
    const textHeight = this.getWrappedTextHeight(
      text,
      font,
      size,
      maxWidth,
      lineHeight,
      wordBreaks
    );

    page.drawText(text, {
      x,
      y,
      size,
      font,
      color,
      maxWidth,
      lineHeight,
      wordBreaks,
    });

    return textHeight;
  }
}

// Section drawing classes
class SectionDrawer {
  constructor(
    private page: PDFPage,
    private fonts: FontSet,
    private config: PDFConfig,
    private layout: LayoutInfo
  ) {}

  drawSectionHeader(text: string, x: number, y: number): void {
    this.page.drawText(text, {
      x,
      y,
      size: this.config.fontSizes.sectionHeader,
      font: this.fonts.bold,
      color: this.config.colors.name,
    });
  }

  drawSectionLine(x1: number, x2: number, y: number): void {
    this.page.drawLine({
      start: { x: x1, y: y - 6 },
      end: { x: x2, y: y - 6 },
      thickness: 1.5,
      color: this.config.colors.sectionDivider,
    });
  }

  drawDashedLine(x1: number, x2: number, y: number): void {
    this.page.drawLine({
      start: { x: x1, y },
      end: { x: x2, y },
      color: this.config.colors.itemDivider,
      thickness: 1,
      dashArray: [1, 2],
    });
  }

  drawListItems(
    items: string[],
    x: number,
    startY: number,
    isAchievement: boolean = false
  ): number {
    let currentY = startY;
    const itemSpacing = isAchievement
      ? this.config.spacing.achievementItem
      : this.config.spacing.skillItem;
    const itemSize = isAchievement
      ? this.config.fontSizes.achievementItem
      : this.config.fontSizes.listItem;
    const itemColor = this.config.colors.experienceDetails;

    items.forEach((item) => {
      this.page.drawText(`• ${item}`, {
        x,
        y: currentY,
        size: itemSize,
        font: this.fonts.regular,
        color: itemColor,
      });
      currentY -= itemSpacing;
    });

    return currentY;
  }
}

// Main section classes
class HeaderSection {
  constructor(
    private page: PDFPage,
    private fonts: FontSet,
    private config: PDFConfig,
    private layout: LayoutInfo
  ) {}

  draw(data: Pick<ResumeData, "personalInfo" | "contactInfo">): number {
    let currentY = this.layout.height - this.config.margins.top;
    const { leftColumnX } = this.layout;
    const maxWidth =
      this.layout.width - this.config.margins.left - this.config.margins.right;

    // Name
    this.page.drawText(data.personalInfo.name, {
      x: leftColumnX,
      y: currentY,
      size: this.config.fontSizes.name,
      font: this.fonts.bold,
      color: this.config.colors.name,
      maxWidth,
    });
    currentY -= this.config.spacing.nameToTitle;

    // Title
    this.page.drawText(data.personalInfo.title, {
      x: leftColumnX,
      y: currentY,
      size: this.config.fontSizes.title,
      font: this.fonts.regular,
      color: this.config.colors.title,
      maxWidth,
    });
    currentY -= this.config.spacing.titleToContact;

    // Contact info
    const contactInfo = data.contactInfo.join("  |  ");
    this.page.drawText(contactInfo, {
      x: leftColumnX,
      y: currentY,
      size: this.config.fontSizes.contactInfo,
      font: this.fonts.regular,
      color: this.config.colors.contactInfo,
      maxWidth,
      lineHeight: this.config.fontSizes.contactInfo,
      wordBreaks: [" "],
    });
    currentY -= this.config.spacing.contactItem;

    return currentY;
  }
}

class ExperienceSection {
  constructor(
    private page: PDFPage,
    private fonts: FontSet,
    private config: PDFConfig,
    private layout: LayoutInfo,
    private sectionDrawer: SectionDrawer
  ) {}

  draw(experiences: Experience[], startY: number): number {
    let currentY = startY - this.config.spacing.sectionDivider;
    const { leftColumnX } = this.layout;
    const rightEdge = this.layout.width - this.config.margins.right - 24;

    // Section header
    this.sectionDrawer.drawSectionHeader("EXPERIENCE", leftColumnX, currentY);
    this.sectionDrawer.drawSectionLine(leftColumnX, rightEdge, currentY);
    currentY -= this.config.spacing.sectionToContent;

    // Draw each experience
    experiences.forEach((exp, index) => {
      currentY = this.drawSingleExperience(exp, currentY);

      // Add divider line except for last item
      if (index < experiences.length - 1) {
        this.sectionDrawer.drawDashedLine(leftColumnX, rightEdge, currentY + 3);
        currentY -= this.config.spacing.experienceBlock + 2;
      }
    });

    return currentY;
  }

  private drawSingleExperience(exp: Experience, startY: number): number {
    let currentY = startY;
    const { leftColumnX } = this.layout;
    const maxWidth =
      this.layout.width -
      this.config.margins.left -
      this.config.margins.right -
      24;

    // Position
    this.page.drawText(exp.position, {
      x: leftColumnX,
      y: currentY,
      size: this.config.fontSizes.experiencePosition,
      font: this.fonts.bold,
      color: this.config.colors.title,
    });
    currentY -= this.config.spacing.positionToAchievements;

    // Company and duration
    this.page.drawText(`${exp.company} | ${exp.duration}`, {
      x: leftColumnX,
      y: currentY,
      size: this.config.fontSizes.experienceCompany,
      font: this.fonts.regular,
      color: this.config.colors.title,
    });
    currentY -= this.config.spacing.experienceToPosition;

    // Achievements
    exp.achievements.forEach((achievement) => {
      // Bullet point
      this.page.drawText("•", {
        x: leftColumnX,
        y: currentY,
        size: this.config.fontSizes.achievementItem,
        font: this.fonts.regular,
        color: this.config.colors.experienceDetails,
      });

      // Achievement text
      const textHeight = PDFTextUtils.getWrappedTextHeight(
        achievement,
        this.fonts.regular,
        this.config.fontSizes.achievementItem,
        maxWidth,
        this.config.fontSizes.achievementItem + 2
      );

      PDFTextUtils.drawWrappedText(
        this.page,
        achievement,
        leftColumnX + 10,
        currentY,
        this.fonts.regular,
        this.config.fontSizes.achievementItem,
        this.config.colors.experienceDetails,
        maxWidth,
        this.config.fontSizes.achievementItem + 2
      );

      currentY -= textHeight + 2;
    });

    return currentY;
  }
}

// Main PDF generator class
export class PDFGenerator {
  private fonts!: FontSet;
  private layout!: LayoutInfo;
  private sectionDrawer!: SectionDrawer;

  async generatePDF(data: ResumeData, config: PDFConfig): Promise<PDFDocument> {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    // Load fonts
    await this.loadFonts(pdfDoc);

    // Create page and setup layout
    const page = pdfDoc.addPage(config.pageSize);
    this.setupLayout(page, config);
    this.sectionDrawer = new SectionDrawer(
      page,
      this.fonts,
      config,
      this.layout
    );

    // Draw sections
    const headerSection = new HeaderSection(
      page,
      this.fonts,
      config,
      this.layout
    );
    const experienceSection = new ExperienceSection(
      page,
      this.fonts,
      config,
      this.layout,
      this.sectionDrawer
    );

    // Render header
    const afterHeaderY = headerSection.draw(data);

    // Render experience section
    experienceSection.draw(data.experience, afterHeaderY);

    // Render sidebar sections
    this.drawSidebarSections(page, data, config, afterHeaderY);

    return pdfDoc;
  }

  private async loadFonts(pdfDoc: PDFDocument): Promise<void> {
    const [regularBuffer, boldBuffer] = await Promise.all([
      loadGoogleFontTTF("Roboto", 400),
      loadGoogleFontTTF("Roboto", 700),
    ]);

    this.fonts = {
      regular: await pdfDoc.embedFont(regularBuffer),
      bold: await pdfDoc.embedFont(boldBuffer),
    };
  }

  private setupLayout(page: PDFPage, config: PDFConfig): void {
    const { width, height } = page.getSize();
    const columnWidth = width * config.columnWidthRatio;

    this.layout = {
      width,
      height,
      leftColumnX: config.margins.left,
      rightColumnX: width - columnWidth - config.margins.right,
      leftColumnWidth: columnWidth,
      rightColumnWidth: width - (width - columnWidth) - config.margins.right,
    };
  }

  private drawSidebarSections(
    page: PDFPage,
    data: ResumeData,
    config: PDFConfig,
    headerBottomY: number
  ): void {
    // Skills in left column
    let skillsY = this.layout.height - 300;
    this.sectionDrawer.drawSectionHeader(
      "SKILLS",
      this.layout.leftColumnX,
      skillsY
    );
    skillsY -= config.spacing.sectionToContent;
    this.sectionDrawer.drawListItems(
      data.skills,
      this.layout.leftColumnX,
      skillsY
    );

    // Achievements in right column
    let achievementsY = headerBottomY - config.spacing.sectionDivider;
    this.sectionDrawer.drawSectionHeader(
      "ACHIEVEMENTS",
      this.layout.rightColumnX,
      achievementsY
    );
    this.sectionDrawer.drawSectionLine(
      this.layout.rightColumnX,
      this.layout.rightColumnX + this.layout.rightColumnWidth,
      achievementsY
    );
    achievementsY -= config.spacing.sectionToContent;
    this.sectionDrawer.drawListItems(
      data.achievements,
      this.layout.rightColumnX,
      achievementsY,
      true
    );
  }
}

// Legacy function to maintain compatibility
export const generatePDF = async (
  data: ResumeData,
  config: PDFConfig
): Promise<PDFDocument> => {
  const generator = new PDFGenerator();
  return generator.generatePDF(data, config);
};
