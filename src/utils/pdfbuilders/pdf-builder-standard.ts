import {
  ModularPDFBuilder,
  type PDFLayout,
  type FontStyles,
} from "../pdf/PdfModule";
import { rgb } from "pdf-lib";
import { List } from "../pdf/ListComponent";
import { SectionHeader } from "../pdf/SectionComponent";
import { Text } from "../pdf/TextComponent";
import { StructuredText } from "../pdf/StructuredComponent";
import { Logger } from "../common/logger";

// Define your layout
const generalMargin = 40;
const layout: PDFLayout = {
  pageSize: [595, 842], // A4 size
  margins: {
    top: generalMargin,
    bottom: generalMargin,
    left: generalMargin,
    right: generalMargin,
  },
  gaps: {
    sectionToSection: {
      left: 9,
      right: 9,
    },
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
    gap: 12, // 25pt gap between columns
  },
};

// Define your font styles
const styles: FontStyles = {
  large: { size: 18, color: rgb(0.1, 0.1, 0.1) },
  medium: { size: 12, color: rgb(0.2, 0.2, 0.2) },
  normal: { size: 10, color: rgb(0.1, 0.1, 0.1) },
  base: { size: 9, color: rgb(0.1, 0.1, 0.1) },
  small: { size: 8, color: rgb(0.1, 0.1, 0.1) },
  xsmall: { size: 7, color: rgb(0.1, 0.1, 0.1) },
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
        fontSize: "normal",
        spacing: { after: 2 },
      })
    )
    .addComponent(
      Text("contact", "header", 3, {
        fontSize: "xsmall",
        spacing: { after: 2 },
      })
    )
    .addComponent(
      Text("webProfile", "header", 3, {
        fontSize: "xsmall",
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
        spacing: { after: layout.gaps.sectionToSection.left ?? 20 },
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
        spacing: { after: layout.gaps.sectionToSection.left ?? 20 },
        lineSpacing: 1,
        structure: {
          header: "title",
          subheader: "sub_title",
          dateinfo: "years",
          details: "details",
          subdetails: "subdetails",
          location: "location",
          overview: "overview",
        },
        lineColor: rgb(0.8, 0.8, 0.8),
        lineThickness: 0.5,
        drawDashLine: true,
      })
    );

  builder
    .addComponent(
      SectionHeader("education-header", "left", 5, {
        fontSize: "medium",
        spacing: { after: layout.gaps.headerToContent ?? 10 },
        showLine: true,
      })
    )
    .addComponent(
      StructuredText("education", "left", 6, {
        fontSize: "base",
        spacing: { after: layout.gaps.sectionToSection.left ?? 20 },
        lineSpacing: 1,
        structure: {
          header: "title",
          subheader: "sub_title",
          dateinfo: "years",
          location: "location",
        },
        lineColor: rgb(0.8, 0.8, 0.8),
        lineThickness: 0.5,
        drawDashLine: true,
      })
    );

  // RIGHT SECTION (Sidebar)
  builder
    .addComponent(
      SectionHeader("achievements-header", "right", 1, {
        fontSize: "medium",
        spacing: { after: layout.gaps.headerToContent ?? 10 },
        showLine: true,
      })
    )
    .addComponent(
      List("achievements", "right", 2, {
        fontSize: "small",
        bulletStyle: "•",
        itemSpacing: 8,
        spacing: { after: layout.gaps.sectionToSection.right ?? 20 },
        showDashLine: true,
        lineColor: rgb(0.8, 0.8, 0.8),
        lineThickness: 0.5,
      })
    );

  builder
    .addComponent(
      SectionHeader("skills-header", "right", 3, {
        fontSize: "medium",
        spacing: { after: layout.gaps.headerToContent ?? 10 },
        showLine: true,
      })
    )
    .addComponent(
      StructuredText("skills", "right", 4, {
        fontSize: "base",
        spacing: { after: layout.gaps.sectionToSection.right ?? 20 },
        lineSpacing: 1,
        structure: {
          subheader: "sub_title",
          overview: "overview",
        },
        lineColor: rgb(0.8, 0.8, 0.8),
        lineThickness: 0.5,
        drawDashLine: true,
      })
    );

  builder
    .addComponent(
      SectionHeader("projects-header", "right", 5, {
        fontSize: "medium",
        spacing: { after: layout.gaps.headerToContent ?? 10 },
        showLine: true,
      })
    )
    .addComponent(
      StructuredText("projects", "right", 6, {
        fontSize: "base",
        spacing: { after: layout.gaps.sectionToSection.right ?? 20 },
        lineSpacing: 1,
        structure: {
          subheader: "sub_title",
          overview: "overview",
        },
        lineColor: rgb(0.8, 0.8, 0.8),
        lineThickness: 0.5,
        drawDashLine: true,
      })
    );

  const filteredExperiences = resumeData.experiences.filter(
    (e: any) => !(e.exclude ?? false)
  );

  const formattedSkills = [];
  Object.values(resumeData.skills).forEach((value) => {
    const { name, items, exclude } = value as {
      name: string;
      items: any[];
      exclude: boolean;
    };

    if (!exclude) {
      formattedSkills.push({
        sub_title: name,
        overview: items
          .filter((item) => !item.exclude)
          .map((item) => item.name)
          .join(" | "),
      });
    }
  });

  const formattedProjects = resumeData.projects.map((project) => {
    return {
      sub_title: project.type,
      overview: `${project.title} | ${project.link}`,
    };
  });

  Logger.debug("Data", {
    filteredExperiences,
    formattedSkills,
    formattedProjects,
    ...resumeData.education,
  });

  // Prepare your data
  const data = {
    // Header data
    name: resumeData.personalInfo.name,
    title: resumeData.personalInfo.title,
    contact: resumeData.contactInfo
      .filter((item: string) => !item.includes("LinkedIn"))
      .map((item: string) => {
        // if (item.includes("@")) {
        //   return "✉ " + item;
        // } else if (item.match(/\d/)) {
        //   return "☎ " + item;
        // }
        return item;
      })
      .join(" | "),
    webProfile: resumeData.webProfile
      .filter((item: string) => !item.includes("LinkedIn"))
      .map((item: string) => {
        // if (item.includes("@")) {
        //   return "✉ " + item;
        // } else if (item.match(/\d/)) {
        //   return "☎ " + item;
        // }
        return item;
      })
      .join(" | "),

    // Left section data
    "summary-header": "SUMMARY",
    summary: resumeData.personalInfo.summary,
    "experience-header": "EXPERIENCE",

    experiences: filteredExperiences,

    // Right section data
    "skills-header": "SKILLS",
    skills: formattedSkills,

    "achievements-header": "ACHIEVEMENTS",
    achievements: resumeData.achievements
      .filter((e: any) => !(e.exclude ?? false))
      .map((a) => a.description),

    "projects-header": "PROJECTS",
    projects: formattedProjects,

    "education-header": "EDUCATION",
    education: resumeData.education.filter((e: any) => !(e.exclude ?? false)),
  };

  return builder.build(data);
}
