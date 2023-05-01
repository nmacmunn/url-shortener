import axios from "axios";

const platformTypes = ["ANY_PLATFORM"];
const safeBrowsingURL = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${process.env.GOOGLE_API_KEY}`;
const threatEntryTypes = ["URL"];
const threatTypes = [
  "MALWARE",
  "SOCIAL_ENGINEERING",
  "UNWANTED_SOFTWARE",
  "POTENTIALLY_HARMFUL_APPLICATION",
];

/**
 * Check whether the url exists and is safe
 */
export async function checkURL(url: string): Promise<string | undefined> {
  try {
    const response = await axios.post(safeBrowsingURL, {
      client: {
        clientId: process.env.APP_NAME,
        clientVersion: "1.0",
      },
      threatInfo: {
        threatTypes,
        platformTypes,
        threatEntryTypes,
        threatEntries: [{ url }],
      },
    });
    if (response.data.matches) {
      return "URL is unsafe";
    }
  } catch (e) {
    return "Unable to verify URL safety";
  }
}

/**
 * Fetch the specified URL and ensure it returns successfully
 */
export async function fetchURL(url: string): Promise<string | undefined> {
  try {
    const response = await axios.head(url);
    if (response.status >= 200 && response.status < 300) {
      return;
    } else {
      return `URL failed to load with ${response.status}: ${response.statusText}`;
    }
  } catch {
    return `Unable to load URL`;
  }
}

/**
 * Prepend url with http:// if there is no protocol
 */
export function withProtocol(url: string) {
  try {
    new URL(url);
    return url;
  } catch {
    return `http://${url}`;
  }
}
