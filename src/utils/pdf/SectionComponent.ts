import type { rgb, PDFPage } from "pdf-lib";
import { Logger } from "../common/logger";
import {
  PDFComponent,
  type SectionType,
  type FontStyles,
  type SectionBounds,
} from "./PdfModule";

// Section Header Component
export class SectionHeaderComponent extends PDFComponent {
  constructor(
    id: string,
    section: SectionType,
    priority: number = 1, // Headers typically render first
    private options: {
      fontSize: keyof FontStyles;
      showLine?: boolean;
      lineColor?: ReturnType<typeof rgb>;
      lineThickness?: number;
      spacing?: { before?: number; after?: number };
    } = { fontSize: "medium", showLine: true, lineThickness: 1 }
  ) {
    super({
      id,
      section,
      priority,
      spacing: options.spacing,
    });
  }

  render(
    page: PDFPage,
    fonts: any,
    styles: FontStyles,
    bounds: SectionBounds,
    title: string
  ): number {
    return Logger.withTryCatchSync(() => {
      let currentY = bounds.currentY;

      if (this.config.spacing?.before) {
        currentY -= this.config.spacing.before;
      }

      const style = styles[this.options.fontSize];

      // Draw section title
      page.drawText(title, {
        x: bounds.x,
        y: currentY,
        size: style.size,
        font: fonts.bold,
        color: style.color,
        maxWidth: bounds.width,
      });

      // Draw line if enabled
      if (this.options.showLine) {
        const lineY = currentY - 4;
        page.drawLine({
          start: { x: bounds.x, y: lineY },
          end: { x: bounds.x + bounds.width - 10, y: lineY },
          color: this.options.lineColor || style.color,
          thickness: this.options.lineThickness || 1,
        });
      }

      currentY -= style.size + (this.config.spacing?.after || 15);

      Logger.debug(`Section header "${this.config.id}" rendered`, {
        section: this.config.section,
        title,
        newY: currentY,
        options: this.options,
      });

      return currentY;
    }, `rendering section header ${this.config.id}`);
  }
}

export const SectionHeader = (
  id: string,
  section: SectionType,
  priority: number = 1,
  options?: any
) => new SectionHeaderComponent(id, section, priority, options);
