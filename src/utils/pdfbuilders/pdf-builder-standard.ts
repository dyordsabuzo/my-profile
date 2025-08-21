import {
  ModularPDFBuilder,
  type PDFLayout,
  type FontStyles,
} from "../pdf/PdfModule.js";
import { lineSplit, rgb } from "pdf-lib";
import { List } from "../pdf/ListComponent.js";
import { MultiText } from "../pdf/MultitextComponent.js";
import { SectionHeader } from "../pdf/SectionComponent.js";
import { Text } from "../pdf/TextComponent.js";
import { StructuredText } from "../pdf/StructuredComponent.js";

// Define your layout
const layout: PDFLayout = {
  pageSize: [595, 842], // A4 size
  margins: {
    top: 30,
    bottom: 30,
    left: 30,
    right: 30,
  },
  gaps: {
    sectionToSection: 10,
    headerToContent: 6,
  },
  sections: {
    head: {
      height: 60,
      backgroundColor: rgb(0.9, 0.9, 0.9),
    },
    main: {
      height: 500,
      backgroundColor: rgb(0.95, 0.95, 0.95),
    },
    footer: {
      height: 80,
      backgroundColor: rgb(0.9, 0.9, 0.9),
    },
  },
  columns: {
    leftWidth: 0.7, // 65% for left column
    rightWidth: 0.3, // 30% for right column
    gap: 15, // 25pt gap between columns
  },
};

// Define your font styles
const styles: FontStyles = {
  large: { size: 18, color: rgb(0.1, 0.1, 0.1) },
  medium: { size: 12, color: rgb(0.2, 0.2, 0.2) },
  normal: { size: 10, color: rgb(0.1, 0.1, 0.1) },
  small: { size: 8, color: rgb(0.4, 0.4, 0.4) },
};

// Build your resume PDF
export async function buildResumePDF(resumeData: any) {
  const builder = new ModularPDFBuilder(layout, styles);

  // HEADER SECTION
  builder
    .addComponent(
      Text("name", "header", 1, {
        fontSize: "large",
        isBold: true,
        alignment: "left",
        spacing: { after: 1 },
      })
    )
    .addComponent(
      Text("title", "header", 2, {
        fontSize: "medium",
        spacing: { after: 2 },
      })
    )
    .addComponent(
      Text("contact", "header", 3, {
        fontSize: "small",
        spacing: { after: 2 },
      })
    );

  // LEFT SECTION (Main Content)
  builder
    .addComponent(
      SectionHeader("summary-header", "left", 1, {
        fontSize: "medium",
        spacing: { after: layout.gaps.headerToContent ?? 10 },
        showLine: true,
      })
    )
    .addComponent(
      Text("summary", "left", 2, {
        fontSize: "small",
        spacing: { after: layout.gaps.sectionToSection ?? 20 },
        addTextHeight: true,
      })
    );

  builder
    .addComponent(
      SectionHeader("experience-header", "left", 3, {
        fontSize: "medium",
        spacing: { after: layout.gaps.headerToContent ?? 10 },
        showLine: true,
      })
    )
    .addComponent(
      StructuredText("experiences", "left", 4, {
        fontSize: "normal",
        spacing: { after: layout.gaps.sectionToSection ?? 20 },
        lineSpacing: 1,
        fieldOrder: ["title", "sub_title", "years", "details"],
        lineColor: rgb(0.8, 0.8, 0.8),
        lineThickness: 0.5,
      })
    );

  // RIGHT SECTION (Sidebar)
  builder
    .addComponent(
      SectionHeader("skills-header", "right", 3, {
        fontSize: "medium",
        spacing: { after: layout.gaps.headerToContent ?? 10 },
        showLine: true,
      })
    )
    .addComponent(
      List("skills", "right", 5, {
        fontSize: "normal",
        bulletStyle: "•",
        itemSpacing: 2,
        spacing: { after: layout.gaps.sectionToSection ?? 20 },
      })
    )
    .addComponent(
      SectionHeader("achievements-header", "right", 1, {
        fontSize: "medium",
        spacing: { after: layout.gaps.headerToContent ?? 10 },
        showLine: true,
      })
    )
    .addComponent(
      List("achievements", "right", 2, {
        fontSize: "normal",
        bulletStyle: "•",
        itemSpacing: 8,
        spacing: { after: 20 },
        showDashLine: true,
        lineColor: rgb(0.8, 0.8, 0.8),
        lineThickness: 0.5,
      })
    );

  // Prepare your data
  const data = {
    // Header data
    name: resumeData.personalInfo.name,
    title: resumeData.personalInfo.title,
    contact: resumeData.contactInfo.join(" | "),

    // Left section data
    "summary-header": "SUMMARY",
    summary: resumeData.personalInfo.summary,
    "experience-header": "EXPERIENCE",
    experiences: resumeData.experiences,
    // "experience-details": resumeData.experience.map(
    //   (exp) =>
    //     `${exp.position}\n${exp.company} | ${
    //       exp.duration
    //     }\n${exp.achievements.join("\n")}`
    // ),

    // Right section data
    "skills-header": "TECHNICAL SKILLS",
    skills: resumeData.skills,
    "achievements-header": "ACHIEVEMENTS",
    achievements: resumeData.achievements,
  };

  return builder.build(data);
}
