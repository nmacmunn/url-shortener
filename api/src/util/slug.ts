import { getLinkBySlug } from "./db";

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
