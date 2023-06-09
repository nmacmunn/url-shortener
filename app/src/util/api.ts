import { browser } from "$app/environment";
import { env } from "$env/dynamic/public";

/*
 * This file centralizes and provides an abstraction on API requests.
 */

/**
 * Generated by Prisma and manually copied.
 */
export type Link = {
  id: string;
  createdAt: Date;
  deletedAt: Date | null;
  slug: string;
  url: string;
  viewCount: number;
};

/**
 * This is only required because of Docker. The functions can run in the browser
 * (Docker host) or node (Docker container) which don't have the same localhost.
 * These two values can be the same when developing locally or in production
 * when the API is on a public URL.
 */
const origin = browser ? env.PUBLIC_API_ORIGIN : env.PUBLIC_API_ORIGIN_NODE;

export async function countView(slug: string): Promise<{ error?: string }> {
  try {
    const response = await fetch(`${origin}/url/${slug}/views`, { method: "PUT" });
    return response.json();
  } catch (e) {
    return { error: `Failed to increment views: ${e}` };
  }
}

export async function createLink(url: string, slug: string): Promise<Link | { error: string }> {
  try {
    const response = await fetch(`${origin}/link`, {
      method: "POST",
      body: JSON.stringify({ url, slug }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.json();
  } catch (e) {
    return { error: `Failed to create link: ${e}` };
  }
}

export async function deleteLink(id: string): Promise<{ error?: string }> {
  try {
    const response = await fetch(`${origin}/link/${id}`, {
      method: "DELETE",
    });
    return response.json();
  } catch (e) {
    return { error: `Failed to delete link: ${e}` };
  }
}

export async function getLink(id: string): Promise<Link | null | { error: string }> {
  try {
    const response = await fetch(`${origin}/link/${id}`);
    return response.json();
  } catch (e) {
    return { error: `Failed to get link: ${e}` };
  }
}

export async function getURL(slug: string): Promise<{ url: string } | { error: string }> {
  try {
    const response = await fetch(`${origin}/url/${slug}`);
    return response.json();
  } catch (e) {
    return { error: `Failed to get URL: ${e}` };
  }
}

export async function validateSlug(slug: string): Promise<{ error?: string }> {
  try {
    const response = await fetch(`${origin}/slug/validate`, {
      method: "POST",
      body: JSON.stringify({ slug }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.json();
  } catch (e) {
    return { error: `Failed validate slug: ${e}` };
  }
}

export async function validateURL(url: string): Promise<{ error?: string }> {
  try {
    const response = await fetch(`${origin}/url/validate`, {
      method: "POST",
      body: JSON.stringify({ url }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.json();
  } catch (e) {
    return { error: `Failed to validate URL: ${e}` };
  }
}
