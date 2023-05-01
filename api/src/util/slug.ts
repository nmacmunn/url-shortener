import { getLinkBySlug } from "./db";

const defaultSlugLength = 6;

/**
 * Check whether the slug is valid and available
 */
export async function checkSlug(slug: string) {
  if (slug.length < 4) {
    return "Slug must be at least 4 characters long";
  }
  if (!/^[a-z0-9]+$/.test(slug)) {
    return "Slug may only contain lowercase letters or numbers";
  }
  if (await getLinkBySlug(slug)) {
    return "Slug is already in use";
  }
}

/**
 * Generate a (hopefully) unique slug
 */
export function generateSlug() {
  let result = "";
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < defaultSlugLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
}
