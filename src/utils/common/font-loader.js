// import fontkit from "@pdf-lib/fontkit";

// Manual mapping of popular Google Fonts to their TTF URLs
const POPULAR_GOOGLE_FONTS = {
  Inter: {
    400: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.ttf",
    700: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiA.ttf",
  },
  Poppins: {
    400: "https://fonts.gstatic.com/s/poppins/v21/pxiEyp8kv8JHgFVrJJfecnFHGPc.ttf",
    700: "https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLCz7Z1xlFd2JQEk.ttf",
  },
  Roboto: {
    400: "https://fonts.gstatic.com/s/roboto/v48/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWuaabWmTggvWl0Qn.ttf",
    700: "https://fonts.gstatic.com/s/roboto/v48/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWuYjammTggvWl0Qn.ttf",
    light:
      "https://fonts.gstatic.com/s/roboto/v48/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWuaabWmTggvWl0Qn.ttf",
    regular:
      "https://fonts.gstatic.com/s/roboto/v48/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWubEbWmTggvWl0Qn.ttf",
    semibold:
      "https://fonts.gstatic.com/s/roboto/v48/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWuYaammTggvWl0Qn.ttf",
    bold: "https://fonts.gstatic.com/s/roboto/v48/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWuYjammTggvWl0Qn.ttf",
    extrabold:
      "https://fonts.gstatic.com/s/roboto/v48/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWuZEammTggvWl0Qn.ttf",
    icon: "https://fonts.gstatic.com/s/materialicons/v145/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2",
  },
};

export async function loadGoogleFontTTF(fontFamily, weight = "400") {
  const fontData = POPULAR_GOOGLE_FONTS[fontFamily];

  if (!fontData || !fontData[weight]) {
    throw new Error(`Font ${fontFamily} with weight ${weight} not available`);
  }

  try {
    const response = await fetch(fontData[weight]);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.arrayBuffer();
    // return fontkit.create(new Uint8Array(fontBuffer));
  } catch (error) {
    console.error(`Failed to load ${fontFamily} (${weight}):`, error);
    throw error;
  }
}
