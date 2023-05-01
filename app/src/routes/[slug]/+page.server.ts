import { error, redirect } from "@sveltejs/kit";
import { countView, getURL } from "../../util/api";
import type { PageServerLoad } from "./$types";

/**
 * Redirect to the long url and increment the link's view count
 */
export const load = (async ({ params }) => {
  const result = await getURL(params.slug);
  if ("error" in result) {
    throw error(400, result.error);
  }
  const { url } = result;
  if (!url) {
    throw redirect(302, "/nah");
  }
  countView(params.slug);
  throw redirect(302, url);
}) satisfies PageServerLoad;
