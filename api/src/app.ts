import cors from "cors";
import express from "express";
import type { Request, Response, NextFunction } from "express";

import { checkURL, fetchURL, withProtocol } from "./util/url";
import {
  countView,
  createLink,
  getLinkById,
  getLinkBySlug,
  markLinkDeleted,
} from "./util/db";
import { checkSlug, generateSlug } from "./util/slug";

export const app = express();

/**
 * Allows CORS requests from the web app
 */
app.use(cors({ origin: process.env.APP_ORIGIN }));

/**
 * Parse requests with Content-Type: application/json
 */
app.use(express.json());

/**
 * Create a simple validator for top-level JSON property types
 */
const validate =
  (key: string, type: string) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (typeof req.body[key] !== type) {
      return res.status(400).json({ error: `${key} must be a ${type}` });
    }
    next();
  };

const validateURL = validate("url", "string");
const validateSlug = validate("slug", "string");

/**
 * Create a new link
 */
app.post("/link", validateURL, validateSlug, async (req, res) => {
  const slug = req.body.slug || generateSlug();
  const url = withProtocol(req.body.url);
  let error = await checkSlug(slug);
  error = error || (await fetchURL(url));
  error = error || (await checkURL(url));
  if (error) {
    return res.status(400).json({ error });
  }
  const result = await createLink(url, slug);
  if ("error" in result) {
    return res.status(400).json(result);
  }
  return res.json(result);
});

/**
 * Get link details
 */
app.get("/link/:id", async (req, res) => {
  const link = await getLinkById(req.params.id);
  res.json(link);
});

/**
 * Delete the link
 */
app.delete("/link/:id", async (req, res) => {
  const error = await markLinkDeleted(req.params.id);
  if (error) {
    return res.status(400).json({ error });
  }
  res.json({});
});

/**
 * Check whether slug is valid and available
 */
app.post("/slug/validate", validateSlug, async (req, res) => {
  const error = await checkSlug(req.body.slug);
  res.json({ error });
});

/**
 * Check whether URL is fetchable
 */
app.post("/url/validate", validateURL, async (req, res) => {
  const url = withProtocol(req.body.url);
  const error = await fetchURL(url);
  res.json({ error });
});

/**
 * Get the URL of a link by its slug
 */
app.get("/url/:slug", async (req, res) => {
  const link = await getLinkBySlug(req.params.slug);
  if (!link) {
    return res.status(400).json({ error: "Link not found" });
  }
  if (link.deletedAt !== null) {
    return res.status(400).json({ error: "Link has been deleted" });
  }
  return res.json({ url: link.url });
});

/**
 * Increment the views of a particular link
 */
app.put("/url/:slug/views", async (req, res) => {
  const error = await countView(req.params.slug);
  if (error) {
    return res.status(400).json({ error });
  }
  res.json({});
});
