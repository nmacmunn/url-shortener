import { Link } from "@prisma/client";
import { Pool } from "pg";
import { randomString } from "./string";

/*
 * Centralize and abstract database access through prisma
 */

// const prisma = new PrismaClient();

const pool = new Pool();

/**
 * Increment the view count for the link with the specified slug
 */
export async function countView(slug: string) {
  const link = await getLinkBySlug(slug);
  if (!link) {
    return "Link not found";
  }
  if (link.deletedAt) {
    return "Link has been deleted";
  }
  const query = `UPDATE "Link" SET "viewCount" = ("viewCount" + 1) WHERE ("slug" = $1 AND "deletedAt" IS NULL)`;
  await pool.query(query, [slug]);
  // await prisma.link.updateMany({
  //   where: { slug, deletedAt: null },
  //   data: {
  //     viewCount: {
  //       increment: 1,
  //     },
  //   },
  // });
}

/**
 * Create a link with the specified url and slug
 */
export async function createLink(
  url: string,
  slug: string
): Promise<Link | { error: string }> {
  try {
    const queryText =
      'INSERT INTO "Link" ("id", "createdAt", "slug", "url", "viewCount") VALUES ($1, NOW(), $2, $3, 0) RETURNING "id", "createdAt", "deletedAt", "slug", "url", "viewCount"';
    const id = randomString(20);
    const [result] = (await pool.query(queryText, [id, slug, url])).rows;
    return result;
    // return await prisma.link.create({
    //   data: {
    //     slug,
    //     url,
    //   },
    // });
  } catch (e) {
    return { error: "Failed to create link" };
  }
}

/**
 * Get a full link object by id if it exists, otherwise null
 */
export async function getLinkById(id: string): Promise<Link | null> {
  const query = `SELECT * FROM "Link" WHERE ("id" = $1) LIMIT 1`;
  const [result] = (await pool.query(query, [id])).rows;
  return result || null;
  // return prisma.link.findUnique({ where: { id } });
}

/**
 * Get a link's deleteAt and url fields by id if it exists, otherwise null
 */
export async function getLinkBySlug(
  slug: string
): Promise<Pick<Link, "deletedAt" | "url"> | null> {
  const query = `SELECT "id", "deletedAt", "url" FROM "Link" WHERE ("slug" = $1) LIMIT 1`;
  const [result] = (await pool.query(query, [slug])).rows;
  return result || null;
  // return prisma.link.findUnique({
  //   where: { slug },
  //   select: {
  //     deletedAt: true,
  //     url: true,
  //   },
  // });
}

/**
 * Set the deleted at time for the link with the specified id
 */
export async function markLinkDeleted(id: string) {
  const link = await getLinkById(id);
  if (!link) {
    return "Link not found";
  }
  if (link.deletedAt) {
    return "Link already deleted";
  }
  const query = `UPDATE "Link" SET "deletedAt" = NOW() WHERE ("id" = $1 AND "deletedAt" IS NULL)`;
  await pool.query(query, [id]);
  // await prisma.link.updateMany({
  //   where: { id, deletedAt: null },
  //   data: {
  //     deletedAt: new Date(),
  //   },
  // });
}
