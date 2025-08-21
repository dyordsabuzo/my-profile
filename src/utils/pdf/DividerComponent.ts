import { rgb, PDFPage } from "pdf-lib";
import { Logger } from "../common/logger";
import {
  PDFComponent,
  type SectionType,
  type FontStyles,
  type SectionBounds,
} from "./PdfModule";

// Divider Component
export class DividerComponent extends PDFComponent {
  constructor(
    id: string,
    section: SectionType,
    priority: number = 10,
    private options: {
      style?: "solid" | "dashed" | "dotted";
      thickness?: number;
      color?: ReturnType<typeof rgb>;
      width?: number; // Percentage of section width (0-1)
      spacing?: { before?: number; after?: number };
    } = { style: "solid", thickness: 1, width: 0.8 }
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
    _data?: any
  ): number {
    return Logger.withTryCatchSync(() => {
      let currentY = bounds.currentY;

      if (this.config.spacing?.before) {
        currentY -= this.config.spacing.before;
      }

      const lineWidth = bounds.width * (this.options.width || 0.8);
      const centerOffset = (bounds.width - lineWidth) / 2;

      const dashArray =
        this.options.style === "dashed"
          ? [3, 3]
          : this.options.style === "dotted"
          ? [1, 2]
          : undefined;

      page.drawLine({
        start: { x: bounds.x + centerOffset, y: currentY },
        end: { x: bounds.x + centerOffset + lineWidth, y: currentY },
        color: this.options.color || rgb(0.7, 0.7, 0.7),
        thickness: this.options.thickness || 1,
        ...(dashArray && { dashArray }),
      });

      currentY -= this.config.spacing?.after || 10;

      Logger.debug(`Divider component "${this.config.id}" rendered`, {
        section: this.config.section,
        newY: currentY,
      });

      return currentY;
    }, `rendering divider component ${this.config.id}`);
  }
}

export const Divider = (
  id: string,
  section: SectionType,
  priority: number = 10,
  options?: any
) => new DividerComponent(id, section, priority, options);
