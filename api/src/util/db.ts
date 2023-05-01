import { PrismaClient } from "@prisma/client";

/*
 * Centralize and abstract database access through prisma
 */

const prisma = new PrismaClient();

/**
 * Increment the view count for the link with the specified slug
 */
export async function countView(slug: string) {
  const link = await prisma.link.findUnique({ where: { slug } });
  if (!link) {
    return "Link not found";
  }
  if (link.deletedAt) {
    return "Link has been deleted";
  }
  await prisma.link.updateMany({
    where: { slug, deletedAt: null },
    data: {
      viewCount: {
        increment: 1,
      },
    },
  });
}

/**
 * Create a link with the specified url and slug
 */
export async function createLink(url: string, slug: string) {
  try {
    return await prisma.link.create({
      data: {
        slug,
        url,
      },
    });
  } catch (e) {
    return { error: "Failed to create link" };
  }
}

/**
 * Get a full link object by id if it exists, otherwise null
 */
export const getLinkById = (id: string) =>
  prisma.link.findUnique({ where: { id } });

/**
 * Get a link's deleteAt and url fields by id if it exists, otherwise null
 */
export const getLinkBySlug = (slug: string) =>
  prisma.link.findUnique({
    where: { slug },
    select: {
      deletedAt: true,
      url: true,
    },
  });

/**
 * Set the deleted at time for the link with the specified id
 */
export async function markLinkDeleted(id: string) {
  const link = await prisma.link.findUnique({ where: { id } });
  if (!link) {
    return "Link not found";
  }
  if (link.deletedAt) {
    return "Link already deleted";
  }
  await prisma.link.updateMany({
    where: { id, deletedAt: null },
    data: {
      deletedAt: new Date(),
    },
  });
}
