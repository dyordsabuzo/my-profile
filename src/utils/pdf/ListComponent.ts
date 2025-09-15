import { breakTextIntoLines, PDFFont, PDFPage, rgb } from "pdf-lib";
import {
  PDFComponent,
  type FontStyles,
  type SectionBounds,
  type SectionType,
} from "./PdfModule";
import { Logger } from "../common/logger";

export class ListComponent extends PDFComponent {
  constructor(
    id: string,
    section: SectionType,
    priority: number = 10,
    private options: {
      fontSize: keyof FontStyles;
      bulletStyle?: string;
      indent?: number;
      itemSpacing?: number;
      spacing?: { before?: number; after?: number };
      showDashLine?: boolean;
      lineColor?: ReturnType<typeof rgb>;
      lineThickness?: number;
    } = { fontSize: "normal", bulletStyle: "•", indent: 10, itemSpacing: 8 }
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
    items: string[]
  ): number {
    return Logger.withTryCatchSync(() => {
      let currentY = bounds.currentY;

      if (this.config.spacing?.before) {
        currentY -= this.config.spacing.before;
      }

      const font = fonts.regular;
      const style = styles[this.options.fontSize];
      const itemSpacing = this.options.itemSpacing || 8;
      const indent = this.options.indent || 10;

      items.forEach((item, index) => {
        // Draw bullet
        page.drawText(this.options.bulletStyle || "•", {
          x: bounds.x,
          y: currentY,
          size: style.size,
          font,
          color: style.color,
        });

        // Calculate text height for wrapped text
        const textHeight = this.getWrappedTextHeight(
          item,
          font,
          style.size,
          bounds.width - indent,
          style.size + 2
        );

        // Draw item text
        page.drawText(item, {
          x: bounds.x + indent,
          y: currentY,
          size: style.size,
          font,
          color: style.color,
          maxWidth: bounds.width - indent,
          lineHeight: style.size + 2,
          wordBreaks: [" "],
        });

        // Draw line if enabled
        if (this.options.showDashLine && index !== items.length - 1) {
          const lineY = currentY - textHeight + this.options.itemSpacing / 2;
          page.drawLine({
            start: { x: bounds.x, y: lineY },
            end: { x: bounds.x + bounds.width - 10, y: lineY },
            color: this.options.lineColor || style.color,
            thickness: this.options.lineThickness || 0.5,
            dashArray: [1, 2],
          });
        }

        currentY -= textHeight + itemSpacing;
      });

      if (this.config.spacing?.after) {
        currentY -= this.config.spacing.after;
      }

      Logger.debug(`List component "${this.config.id}" rendered`, {
        section: this.config.section,
        itemCount: items.length,
        newY: currentY,
      });

      return currentY;
    }, `rendering list component ${this.config.id}`);
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

export const List = (
  id: string,
  section: SectionType,
  priority: number = 10,
  options?: any
) => new ListComponent(id, section, priority, options);
