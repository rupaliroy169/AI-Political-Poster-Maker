import puppeteer from "puppeteer";
import fs from "fs";
import { uploadToCloudinary } from "../config/cloudinary.js";
import { ITemplate } from "../models/Template.js";

export interface RenderPosterParams {
  name: string;
  designation: string;
  party: string;
  unionOrThana: string;
  district: string;
  occasion: string;
  headline: string;
  photos?: string[];
  template: Partial<ITemplate> | Record<string, any>;
}

function getBrowserExecutablePath(): string | undefined {
  if (
    process.env.PUPPETEER_EXECUTABLE_PATH &&
    fs.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)
  ) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  const candidatePaths = [
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  return undefined;
}

function generatePosterHTML(params: RenderPosterParams): string {
  const layout = params.template.layout || {};
  const primaryColor = layout.primaryColor || "#0b3c5d";
  const secondaryColor = layout.secondaryColor || "#d9534f";
  const textColor = layout.textColor || "#ffffff";
  const fontFamily = layout.fontFamily || "Arial, sans-serif";

  const candidatePhotoUrl =
    params.photos && params.photos.length > 0
      ? params.photos[0]
      : "https://placehold.co/400x500/cccccc/333333?text=Candidate+Photo";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Political Poster</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      width: 900px;
      height: 1200px;
      background: linear-gradient(135deg, ${primaryColor} 0%, #111827 100%);
      font-family: ${fontFamily};
      color: ${textColor};
      overflow: hidden;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 40px;
    }
    /* Top Decorative Border */
    .top-accent {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 14px;
      background: linear-gradient(90deg, ${secondaryColor}, #fbbf24, ${secondaryColor});
    }
    /* Header Section */
    .header-box {
      text-align: center;
      margin-top: 10px;
      padding: 20px;
      background: rgba(0, 0, 0, 0.35);
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
    }
    .occasion-badge {
      display: inline-block;
      padding: 8px 24px;
      background: ${secondaryColor};
      color: #ffffff;
      font-weight: 700;
      font-size: 20px;
      letter-spacing: 1px;
      text-transform: uppercase;
      border-radius: 30px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      margin-bottom: 12px;
    }
    .headline-text {
      font-size: 38px;
      font-weight: 800;
      line-height: 1.25;
      text-shadow: 2px 2px 8px rgba(0,0,0,0.7);
      letter-spacing: 0.5px;
    }
    /* Main Content Section */
    .content-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin: 20px 0;
      flex: 1;
    }
    .photo-container {
      width: 320px;
      height: 380px;
      border-radius: 20px;
      overflow: hidden;
      border: 6px solid #ffffff;
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.6);
      background: #e5e7eb;
      margin-bottom: 24px;
      position: relative;
    }
    .photo-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .candidate-name {
      font-size: 46px;
      font-weight: 900;
      color: #ffffff;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      text-shadow: 3px 3px 10px rgba(0,0,0,0.8);
      margin-bottom: 8px;
    }
    .designation-badge {
      font-size: 26px;
      font-weight: 600;
      color: #fbbf24;
      text-align: center;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
      text-shadow: 1px 1px 4px rgba(0,0,0,0.6);
    }
    .party-title {
      font-size: 28px;
      font-weight: 700;
      color: #ffffff;
      background: ${secondaryColor};
      padding: 6px 30px;
      border-radius: 25px;
      margin-top: 6px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.4);
    }
    /* Footer Section */
    .footer-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 18px 30px;
      background: rgba(0, 0, 0, 0.5);
      border-radius: 14px;
      border-top: 2px solid ${secondaryColor};
    }
    .location-info {
      font-size: 20px;
      font-weight: 600;
      color: #e5e7eb;
    }
    .location-info span {
      color: #fbbf24;
      font-weight: 700;
    }
    .slogan-info {
      font-size: 18px;
      font-style: italic;
      color: #d1d5db;
    }
  </style>
</head>
<body>
  <div class="top-accent"></div>

  <div class="header-box">
    <div class="occasion-badge">${params.occasion}</div>
    <div class="headline-text">${params.headline}</div>
  </div>

  <div class="content-section">
    <div class="photo-container">
      <img src="${candidatePhotoUrl}" alt="Candidate Photo" />
    </div>
    <div class="candidate-name">${params.name}</div>
    <div class="designation-badge">${params.designation}</div>
    <div class="party-title">${params.party}</div>
  </div>

  <div class="footer-box">
    <div class="location-info">
      Union / Thana: <span>${params.unionOrThana}</span> | District: <span>${params.district}</span>
    </div>
    <div class="slogan-info">
      ${params.template.name || "Political Campaign"}
    </div>
  </div>
</body>
</html>`;
}

export async function renderAndUploadPoster(
  params: RenderPosterParams
): Promise<string> {
  const executablePath = getBrowserExecutablePath();
  const launchOptions: Parameters<typeof puppeteer.launch>[0] = {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  };

  if (executablePath) {
    launchOptions.executablePath = executablePath;
  }

  const browser = await puppeteer.launch(launchOptions);

  try {
    const page = await browser.newPage();
    await page.setViewport({
      width: 900,
      height: 1200,
      deviceScaleFactor: 2, // High resolution output
    });

    const html = generatePosterHTML(params);
    await page.setContent(html, {
      waitUntil: "load",
    });

    const screenshotBuffer = await page.screenshot({
      type: "jpeg",
      quality: 90,
    });

    const secureUrl = await uploadToCloudinary(
      screenshotBuffer as Buffer,
      "generated_posters"
    );

    return secureUrl;
  } finally {
    await browser.close();
  }
}
