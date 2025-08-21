import { breakTextIntoLines, type PDFFont, type PDFPage } from "pdf-lib";
import { Logger } from "../common/logger";
import {
  PDFComponent,
  type SectionType,
  type FontStyles,
  type SectionBounds,
} from "./PdfModule";

// Multi-line Text Component for larger content
export class MultiTextComponent extends PDFComponent {
  constructor(
    id: string,
    section: SectionType,
    priority: number = 10,
    private options: {
      fontSize: keyof FontStyles;
      lineSpacing?: number;
      isBold?: boolean;
      spacing?: { before?: number; after?: number };
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
    lines: string[]
  ): number {
    return Logger.withTryCatchSync(() => {
      let currentY = bounds.currentY;

      if (this.config.spacing?.before) {
        currentY -= this.config.spacing.before;
      }

      const font = this.options.isBold ? fonts.bold : fonts.regular;
      const style = styles[this.options.fontSize];
      const lineSpacing = this.options.lineSpacing || 5;

      lines.forEach((line) => {
        page.drawText(line, {
          x: bounds.x,
          y: currentY,
          size: style.size,
          font,
          color: style.color,
          maxWidth: bounds.width,
        });

        const textHeight = this.getWrappedTextHeight(
          line,
          font,
          style.size,
          bounds.width,
          style.size + 2
        );

        currentY -= style.size + lineSpacing + textHeight;
      });

      if (this.config.spacing?.after) {
        currentY -= this.config.spacing.after;
      }

      Logger.debug(`Multi-text component "${this.config.id}" rendered`, {
        section: this.config.section,
        lineCount: lines.length,
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

export const MultiText = (
  id: string,
  section: SectionType,
  priority: number = 10,
  options?: any
) => new MultiTextComponent(id, section, priority, options);
