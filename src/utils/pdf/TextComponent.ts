import { breakTextIntoLines, PDFFont, type PDFPage } from "pdf-lib";
import { Logger } from "../common/logger";
import {
  PDFComponent,
  type SectionType,
  type FontStyles,
  type SectionBounds,
} from "./PdfModule";

// Generic Text Component
export class TextComponent extends PDFComponent {
  constructor(
    id: string,
    section: SectionType,
    priority: number = 10,
    private options: {
      fontSize: keyof FontStyles;
      isBold?: boolean;
      alignment?: "left" | "center" | "right";
      maxLines?: number;
      spacing?: { before?: number; after?: number };
      addTextHeight?: boolean;
    } = { fontSize: "normal", addTextHeight: false }
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
    text: string
  ): number {
    return Logger.withTryCatchSync(() => {
      let currentY = bounds.currentY;

      if (this.config.spacing?.before) {
        currentY -= this.config.spacing.before;
      }

      const font = this.options.isBold ? fonts.bold : fonts.regular;
      const style = styles[this.options.fontSize];

      let x = bounds.x;
      if (this.options.alignment === "center") {
        const textWidth = font.widthOfTextAtSize(text, style.size);
        x = bounds.x + (bounds.width - textWidth) / 2;
      } else if (this.options.alignment === "right") {
        const textWidth = font.widthOfTextAtSize(text, style.size);
        x = bounds.x + bounds.width - textWidth;
      }

      // Calculate text height for wrapped text
      const textHeight = this.options.addTextHeight
        ? this.getWrappedTextHeight(
            text,
            font,
            style.size,
            bounds.width,
            style.size + 2
          )
        : 0;

      page.drawText(text, {
        x,
        y: currentY,
        size: style.size,
        font,
        color: style.color,
        maxWidth: bounds.width,
        lineHeight: style.size + 2,
        wordBreaks: [" "],
      });

      // const phoneSvgPath =
      //   "M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z";
      // page.drawSvgPath(phoneSvgPath, {
      //   x,
      //   y: currentY,
      //   color: style.color,
      //   scale: 5,
      // });

      currentY -= style.size + (this.config.spacing?.after || 10) + textHeight;

      Logger.debug(`Text component "${this.config.id}" rendered`, {
        section: this.config.section,
        text: text.substring(0, 30) + "...",
        newY: currentY,
      });

      return currentY;
    }, `rendering text component ${this.config.id}`);
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

export const Text = (
  id: string,
  section: SectionType,
  priority: number = 10,
  options?: any
) => new TextComponent(id, section, priority, options);
