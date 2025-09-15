import { breakTextIntoLines, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { Logger } from "../common/logger";
import {
  PDFComponent,
  type SectionType,
  type FontStyles,
  type SectionBounds,
} from "./PdfModule";

// Structured Component for larger content
export class StructuredComponent extends PDFComponent {
  constructor(
    id: string,
    section: SectionType,
    priority: number = 10,
    private options: {
      fontSize: keyof FontStyles;
      lineSpacing?: number;
      isBold?: boolean;
      spacing?: { before?: number; after?: number };
      indent?: number;
      itemSpacing?: number;
      lineColor?: ReturnType<typeof rgb>;
      lineThickness?: number;
      structure?: {
        header?: string;
        subheader?: string;
        dateinfo?: string;
        location?: string;
        overview?: string;
        details?: string;
      };
    } = { fontSize: "normal", lineSpacing: 5 }
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
    objects: Record<string, string | string[]>[]
  ): number {
    return Logger.withTryCatchSync(() => {
      let currentY = bounds.currentY;

      if (this.config.spacing?.before) {
        currentY -= this.config.spacing.before;
      }

      const font = this.options.isBold ? fonts.bold : fonts.regular;
      const style = styles[this.options.fontSize];
      const lineSpacing = this.options.lineSpacing || 5;
      const itemSpacing = this.options.itemSpacing || 2;
      const indent = this.options.indent || 10;

      objects.forEach((object, index) => {
        const structure = this.options.structure;
        const header = structure.header ? object[structure.header] : null;
        const subheader = structure.subheader
          ? object[structure.subheader]
          : null;

        const dateinfo = structure.dateinfo ? object[structure.dateinfo] : null;
        const location = structure.location ? object[structure.location] : null;
        const overview = structure.overview ? object[structure.overview] : null;
        const details = structure.details ? object[structure.details] : null;

        if (header && typeof header === "string") {
          page.drawText(header, {
            x: bounds.x,
            y: currentY,
            size: style.size,
            font,
            color: style.color,
            maxWidth: bounds.width,
          });
        }

        if (dateinfo && typeof dateinfo === "string") {
          const dateinfosize =
            this.options.fontSize !== "base" ? style.size - 2 : style.size - 1;
          const dateinfowidth = font.widthOfTextAtSize(dateinfo, dateinfosize);

          page.drawText(dateinfo, {
            x: bounds.x + bounds.width - dateinfowidth - 10,
            y: currentY,
            size: dateinfosize,
            font,
            color: style.color,
          });
        }

        if (header || dateinfo) {
          currentY -= style.size + lineSpacing + 2;
        }

        if (subheader && typeof subheader === "string") {
          page.drawText(subheader, {
            x: bounds.x,
            y: currentY,
            size: style.size,
            font: fonts.semibold,
            color: style.color,
            maxWidth: bounds.width,
          });
        }

        if (location && typeof location === "string") {
          const locationsize =
            this.options.fontSize !== "base" ? style.size - 2 : style.size - 1;
          const locationwidth = font.widthOfTextAtSize(location, locationsize);

          page.drawText(location, {
            x: bounds.x + bounds.width - locationwidth - 10,
            y: currentY,
            size: locationsize,
            font,
            color: style.color,
          });
        }

        if (subheader || location) {
          currentY -= style.size + lineSpacing;
        }

        const detailsFontSize =
          this.options.fontSize !== "base" ? style.size - 2 : style.size - 1;
        const lineHeight = detailsFontSize + 2;
        if (overview && typeof overview === "string") {
          const textHeight = this.getWrappedTextDimension(
            overview,
            font,
            detailsFontSize,
            bounds.width,
            lineHeight
          );

          // Draw item text
          page.drawText(overview, {
            x: bounds.x,
            y: currentY,
            size: detailsFontSize,
            font,
            color: style.color,
            maxWidth: bounds.width,
            lineHeight,
            wordBreaks: [" "],
          });

          currentY -= textHeight;
        }

        if (Array.isArray(details)) {
          details.forEach((item) => {
            // Draw bullet
            page.drawText("•", {
              x: bounds.x,
              y: currentY,
              size: detailsFontSize,
              font,
              color: style.color,
            });

            // Calculate text height for wrapped text
            const textHeight = this.getWrappedTextDimension(
              item,
              font,
              detailsFontSize,
              bounds.width - indent,
              lineHeight
            );

            // Draw item text
            page.drawText(item, {
              x: bounds.x + indent,
              y: currentY,
              size: detailsFontSize,
              font,
              color: style.color,
              maxWidth: bounds.width - indent,
              lineHeight,
              wordBreaks: [" "],
            });

            currentY -= textHeight;
          });
        }

        // Draw line if enabled
        if (index !== objects.length - 1) {
          const lineY = currentY + itemSpacing;
          page.drawLine({
            start: { x: bounds.x, y: lineY },
            end: { x: bounds.x + bounds.width - 10, y: lineY },
            color: this.options.lineColor || style.color,
            thickness: this.options.lineThickness || 0.5,
            dashArray: [1, 2],
          });
        }

        currentY -= style.size + lineSpacing;
      });

      // lines.forEach((line) => {
      //   page.drawText(line, {
      //     x: bounds.x,
      //     y: currentY,
      //     size: style.size,
      //     font,
      //     color: style.color,
      //     maxWidth: bounds.width,
      //   });

      //   const textHeight = this.getWrappedTextHeight(
      //     line,
      //     font,
      //     style.size,
      //     bounds.width,
      //     style.size + 2
      //   );

      //   currentY -= style.size + lineSpacing + textHeight;
      // });

      if (this.config.spacing?.after) {
        currentY -= this.config.spacing.after;
      }

      Logger.debug(`Multi-text component "${this.config.id}" rendered`, {
        section: this.config.section,
        // lineCount: lines.length,
        newY: currentY,
      });

      return currentY;
    }, `rendering multi-text component ${this.config.id}`);
  }

  private getWrappedTextDimension(
    text: string,
    font: PDFFont,
    size: number,
    maxWidth: number,
    lineHeight: number
  ): number {
    const getTextWidth = (t: string) => font.widthOfTextAtSize(t, size);
    const lines = breakTextIntoLines(text, [" "], maxWidth, getTextWidth);
    return lines.length * lineHeight;
  }
}

export const StructuredText = (
  id: string,
  section: SectionType,
  priority: number = 10,
  options?: any
) => new StructuredComponent(id, section, priority, options);
