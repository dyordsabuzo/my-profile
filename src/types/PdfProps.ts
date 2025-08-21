import { PDFFont, rgb } from "pdf-lib";

export interface SectionConfig {
  fontSizes: {
    header: number;
  };
}

// Types
export interface PDFConfig {
  pageSize: [number, number];
  columnWidthRatio: number;
  margins: Record<"left" | "right" | "top" | "bottom", number>;
  fontSizes: {
    name: number;
    title: number;
    contactInfo: number;
    sectionHeader: number;
    experiencePosition: number;
    experienceCompany: number;
    achievementItem: number;
    listItem: number;
  };
  spacing: {
    nameToTitle: number;
    titleToContact: number;
    contactItem: number;
    sectionDivider: number;
    sectionToContent: number;
    positionToAchievements: number;
    experienceToPosition: number;
    experienceBlock: number;
    achievementItem: number;
    skillItem: number;
  };
  colors: {
    name: ReturnType<typeof rgb>;
    title: ReturnType<typeof rgb>;
    contactInfo: ReturnType<typeof rgb>;
    experienceDetails: ReturnType<typeof rgb>;
    sectionDivider: ReturnType<typeof rgb>;
    itemDivider: ReturnType<typeof rgb>;
  };
}

export interface FontSet {
  regular: PDFFont;
  bold: PDFFont;
}

export interface LayoutInfo {
  width: number;
  height: number;
  leftColumnX: number;
  rightColumnX: number;
  leftColumnWidth: number;
  rightColumnWidth: number;
}
