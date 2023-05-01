import { error } from "@sveltejs/kit";
import { getLink } from "../../../util/api";
import type { PageServerLoad } from "./$types";

/**
 * Load the link data to render the manage view
 */
export const load = (async ({ params }) => {
  const link = await getLink(params.id);
  if (!link) {
    throw error(404, "Not Found");
  }
  if ("error" in link) {
    throw error(400, link.error);
  }
  return { link };
}) satisfies PageServerLoad;
