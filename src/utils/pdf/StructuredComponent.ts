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
      fieldOrder?: string[];
      indent?: number;
      itemSpacing?: number;
      lineColor?: ReturnType<typeof rgb>;
      lineThickness?: number;
    } = { fontSize: "normal", lineSpacing: 5, fieldOrder: [] }
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
      const itemSpacing = this.options.itemSpacing || 1;
      const indent = this.options.indent || 10;

      // determine level of data by length of fieldOrder
      const level = this.options.fieldOrder.length;

      objects.forEach((object, index) => {
        const header = object[this.options.fieldOrder[0]];
        const subheader = object[this.options.fieldOrder[1]];
        const subinfo = object[this.options.fieldOrder[2]];
        const details = object[this.options.fieldOrder[3]];

        Logger.debug(`Rendering structured component with header: ${header}`);

        if (typeof header === "string") {
          page.drawText(header, {
            x: bounds.x,
            y: currentY,
            size: style.size + 2,
            font,
            color: style.color,
            maxWidth: bounds.width,
          });
        }

        currentY -= style.size + lineSpacing + 2;
        if (typeof subheader === "string") {
          page.drawText(subheader, {
            x: bounds.x,
            y: currentY,
            size: style.size,
            font: fonts.semibold,
            color: style.color,
            maxWidth: bounds.width,
          });
        }

        currentY -= style.size + lineSpacing;
        if (typeof subinfo === "string") {
          page.drawText(subinfo, {
            x: bounds.x,
            y: currentY,
            size: style.size - 2,
            font,
            color: style.color,
            maxWidth: bounds.width,
          });
        }

        currentY -= style.size + lineSpacing + 4;
        if (Array.isArray(details)) {
          const detailsFontSize = style.size - 2;
          const lineHeight = detailsFontSize + 2;
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
            const textHeight = this.getWrappedTextHeight(
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

            currentY -= textHeight + itemSpacing;
          });

          // Draw line if enabled
          if (index !== objects.length - 1) {
            const lineY = currentY + 4;
            page.drawLine({
              start: { x: bounds.x, y: lineY },
              end: { x: bounds.x + bounds.width - 10, y: lineY },
              color: this.options.lineColor || style.color,
              thickness: this.options.lineThickness || 0.5,
              dashArray: [1, 2],
            });
          }
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

      // if (this.config.spacing?.after) {
      //   currentY -= this.config.spacing.after;
      // }

      Logger.debug(`Multi-text component "${this.config.id}" rendered`, {
        section: this.config.section,
        // lineCount: lines.length,
        newY: currentY,
      });

      return currentY;
    }, `rendering multi-text component ${this.config.id}`);
  }

  private getWrappedTextHeight(
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
