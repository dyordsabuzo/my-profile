import { PDFDocument, PDFFont, PDFPage, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { loadGoogleFontTTF } from "../common/font-loader.js";
import { Logger } from "../common/logger.js";

// Core types for the modular system
export type SectionType = "header" | "left" | "right";

export interface PDFLayout {
  pageSize: [number, number];
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  columns: {
    leftWidth: number; // Percentage of available width (0-1)
    rightWidth: number; // Percentage of available width (0-1)
    gap: number; // Gap between columns
  };
  sections: Record<
    string,
    { height: number; backgroundColor: ReturnType<typeof rgb> }
  >;
  gaps: {
    sectionToSection: Record<string, number>;
    headerToContent: number;
  };
  lineThickness?: Record<string, number>;
}

export interface FontStyles {
  large: { size: number; color: ReturnType<typeof rgb> };
  medium: { size: number; color: ReturnType<typeof rgb> };
  normal: { size: number; color: ReturnType<typeof rgb> };
  base: { size: number; color: ReturnType<typeof rgb> };
  small: { size: number; color: ReturnType<typeof rgb> };
  xsmall: { size: number; color: ReturnType<typeof rgb> };
}

export interface SectionBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  currentY: number;
}

export interface ComponentConfig {
  id: string;
  section: SectionType;
  priority: number; // Lower numbers render first
  spacing?: {
    before?: number;
    after?: number;
  };
}

// Abstract base component
export abstract class PDFComponent {
  protected config: ComponentConfig;

  constructor(config: ComponentConfig) {
    this.config = config;
  }

  abstract render(
    page: PDFPage,
    fonts: { regular: PDFFont; bold: PDFFont },
    styles: FontStyles,
    bounds: SectionBounds,
    data: any
  ): number; // Returns new Y position

  getConfig(): ComponentConfig {
    return this.config;
  }

  getId(): string {
    return this.config.id;
  }

  getSection(): SectionType {
    return this.config.section;
  }

  getPriority(): number {
    return this.config.priority;
  }
}

// Main modular PDF builder
export class ModularPDFBuilder {
  private components: PDFComponent[] = [];
  private fonts!: {
    light: PDFFont;
    regular: PDFFont;
    semibold: PDFFont;
    bold: PDFFont;
  };
  private layout: PDFLayout;
  private styles: FontStyles;

  constructor(layout: PDFLayout, styles: FontStyles) {
    this.layout = layout;
    this.styles = styles;
  }

  // Add a component to the builder
  addComponent(component: PDFComponent): this {
    this.components.push(component);
    return this;
  }

  // Add multiple components
  addComponents(components: PDFComponent[]): this {
    this.components.push(...components);
    return this;
  }

  // Remove a component by ID
  removeComponent(id: string): this {
    this.components = this.components.filter((c) => c.getId() !== id);
    return this;
  }

  // Get components by section
  getComponentsBySection(section: SectionType): PDFComponent[] {
    return this.components
      .filter((c) => c.getSection() === section)
      .sort((a, b) => a.getPriority() - b.getPriority());
  }

  // Build the PDF
  async build(data: Record<string, any>): Promise<PDFDocument> {
    return Logger.withTryCatch(async () => {
      const pdfDoc = await PDFDocument.create();
      pdfDoc.registerFontkit(fontkit);

      // Load fonts
      await this.loadFonts(pdfDoc);

      // Create page
      const page = pdfDoc.addPage(this.layout.pageSize);
      const { width, height } = page.getSize();

      // Calculate section bounds
      const bounds = this.calculateSectionBounds(width, height);

      // Render sections in order: header, then left and right
      await this.renderSection("header", page, bounds.header, data);
      await this.renderSection("left", page, bounds.left, data);
      await this.renderSection("right", page, bounds.right, data);

      Logger.success("Modular PDF built successfully", {
        totalComponents: this.components.length,
        headerComponents: this.getComponentsBySection("header").length,
        leftComponents: this.getComponentsBySection("left").length,
        rightComponents: this.getComponentsBySection("right").length,
      });

      return pdfDoc;
    }, "modular PDF building");
  }

  private async loadFonts(pdfDoc: PDFDocument): Promise<void> {
    const [lightBuffer, regularBuffer, semiboldBuffer, boldBuffer] =
      await Promise.all([
        loadGoogleFontTTF("Roboto", "light"),
        loadGoogleFontTTF("Roboto", "400"),
        loadGoogleFontTTF("Roboto", "semibold"),
        loadGoogleFontTTF("Roboto", "bold"),
      ]);

    this.fonts = {
      light: await pdfDoc.embedFont(lightBuffer),
      regular: await pdfDoc.embedFont(regularBuffer),
      semibold: await pdfDoc.embedFont(semiboldBuffer),
      bold: await pdfDoc.embedFont(boldBuffer),
    };
  }

  private calculateSectionBounds(
    width: number,
    height: number
  ): Record<SectionType, SectionBounds> {
    const availableWidth =
      width - this.layout.margins.left - this.layout.margins.right;
    const leftWidth = availableWidth * this.layout.columns.leftWidth;
    const rightWidth = availableWidth * this.layout.columns.rightWidth;
    const gap = this.layout.columns.gap;
    const headerHeight = this.layout.sections.head.height ?? 120;

    return {
      header: {
        x: this.layout.margins.left,
        y: height - this.layout.margins.top,
        width: availableWidth,
        height: headerHeight,
        currentY: height - this.layout.margins.top,
      },
      left: {
        x: this.layout.margins.left,
        y: height - this.layout.margins.top - headerHeight,
        width: leftWidth,
        height:
          height -
          this.layout.margins.top -
          this.layout.margins.bottom -
          headerHeight,
        currentY: height - this.layout.margins.top - headerHeight,
      },
      right: {
        x: this.layout.margins.left + leftWidth + gap,
        y: height - this.layout.margins.top - headerHeight,
        width: rightWidth,
        height:
          height -
          this.layout.margins.top -
          this.layout.margins.bottom -
          headerHeight,
        currentY: height - this.layout.margins.top - headerHeight,
      },
    };
  }

  private async renderSection(
    section: SectionType,
    page: PDFPage,
    bounds: SectionBounds,
    data: Record<string, any>
  ): Promise<void> {
    const components = this.getComponentsBySection(section);
    let currentY = bounds.currentY;

    for (const component of components) {
      try {
        const componentData = data[component.getId()];
        if (componentData !== undefined) {
          const sectionBounds: SectionBounds = { ...bounds, currentY };
          currentY = component.render(
            page,
            this.fonts,
            this.styles,
            sectionBounds,
            componentData
          );
        }
      } catch (error) {
        Logger.error(`Failed to render component ${component.getId()}`, error);
        // Continue with next component
      }
    }
  }
}
