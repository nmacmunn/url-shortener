import { PrismaClient } from "@prisma/client";
import request from "supertest";
import { app } from "../src/app";

const prisma = new PrismaClient();

beforeEach(async () => prisma.link.deleteMany());

describe("POST /link", () => {
  it("responds with an error if url is missing", async () => {
    const data = { slug: "" };
    const response = await request(app).post("/link").send(data);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error", "url must be a string");
  });
  it("responds with an error if slug is missing", async () => {
    const data = { url: "" };
    const response = await request(app).post("/link").send(data);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error", "slug must be a string");
  });
  it("responds with an error if url is unreachable", async () => {
    const data = { url: "foo", slug: "" };
    const response = await request(app).post("/link").send(data);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error", "Unable to load URL");
  });
  it("responds with an error if url is unsafe", async () => {
    const unsafeURL = "https://testsafebrowsing.appspot.com/s/malware.html";
    const data = { url: unsafeURL, slug: "" };
    const response = await request(app).post("/link").send(data);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error", "URL is unsafe");
  });
  it("responds with a link", async () => {
    const url = "https://www.google.com/";
    const data = { url, slug: "" };
    const response = await request(app).post("/link").send(data);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("createdAt");
    expect(response.body).toHaveProperty("deletedAt", null);
    expect(response.body).toHaveProperty("slug");
    expect(response.body).toHaveProperty("url", url);
    expect(response.body).toHaveProperty("viewCount", 0);
  });
  it("responds with a link with protocol prepended", async () => {
    const url = "google.com/";
    const data = { url, slug: "" };
    const response = await request(app).post("/link").send(data);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("createdAt");
    expect(response.body).toHaveProperty("deletedAt", null);
    expect(response.body).toHaveProperty("slug");
    expect(response.body).toHaveProperty("url", `http://${url}`);
    expect(response.body).toHaveProperty("viewCount", 0);
  });
  it("responds with a link having the specified slug", async () => {
    const url = "https://www.google.com/";
    const slug = "google";
    const data = { slug, url };
    const response = await request(app).post("/link").send(data);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("createdAt");
    expect(response.body).toHaveProperty("deletedAt", null);
    expect(response.body).toHaveProperty("slug", slug);
    expect(response.body).toHaveProperty("url", url);
    expect(response.body).toHaveProperty("viewCount", 0);
  });
  it("responds with an error if the specified slug exists", async () => {
    const url = "https://www.google.com/";
    const slug = "google";
    const data = { slug, url };
    const first = await request(app).post("/link").send(data);
    expect(first.status).toBe(200);
    const response = await request(app).post("/link").send(data);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error", "Slug is already in use");
  });
});

describe("GET /link/:id", () => {
  it("responds with a link if it exists", async () => {
    const url = "https://google.com";
    const slug = "google";
    const link = await prisma.link.create({ data: { slug, url } });
    const response = await request(app).get(`/link/${link.id}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("url", url);
  });
  it("responds with null if link does not exist", async () => {
    const response = await request(app).get(`/link/notalink`);
    expect(response.status).toBe(200);
    expect(response.body).toBe(null);
  });
});

describe("DELETE /link/:id", () => {
  it("responds with an empty object on success", async () => {
    const url = "https://google.com";
    const slug = "google";
    const { id } = await prisma.link.create({ data: { slug, url } });
    const response = await request(app).delete(`/link/${id}`);
    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual({});
    const link = await prisma.link.findUnique({ where: { id } });
    expect(link).not.toBe(null);
    expect(link).toHaveProperty("deletedAt");
  });
  it("responds with an error if link doesn't exist", async () => {
    const response = await request(app).delete(`/link/notalink`);
    expect(response.status).toBe(400);
    expect(response.body).toStrictEqual({ error: "Link not found" });
  });
  it("responds with an error if link was already deleted", async () => {
    const url = "https://google.com";
    const slug = "google";
    const { id } = await prisma.link.create({
      data: { deletedAt: new Date(), slug, url },
    });
    const response = await request(app).delete(`/link/${id}`);
    expect(response.status).toBe(400);
    expect(response.body).toStrictEqual({ error: "Link already deleted" });
  });
});

describe("POST /slug/validate", () => {
  it("responds with an empty object on success", async () => {
    const response = await request(app)
      .post(`/slug/validate`)
      .send({ slug: "google" });
    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual({});
  });
  it("responds with an error object if slug is too short", async () => {
    const response = await request(app)
      .post(`/slug/validate`)
      .send({ slug: "foo" });
    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual({
      error: "Slug must be at least 4 characters long",
    });
  });
  it("responds with an error object if slug contains invalid characters", async () => {
    const response = await request(app)
      .post(`/slug/validate`)
      .send({ slug: "wu-tang" });
    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual({
      error: "Slug may only contain lowercase letters or numbers",
    });
  });
  it("responds with an error object if slug is used", async () => {
    const url = "https://google.com";
    const slug = "google";
    await prisma.link.create({ data: { slug, url } });
    const response = await request(app)
      .post(`/slug/validate`)
      .send({ slug: "google" });
    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual({
      error: "Slug is already in use",
    });
  });
});

describe("POST /url/validate", () => {
  it("responds with an empty object on success", async () => {
    const response = await request(app)
      .post(`/url/validate`)
      .send({ url: "http://google.com" });
    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual({});
  });
  it("responds with an error object if url is invalid", async () => {
    const response = await request(app)
      .post(`/url/validate`)
      .send({ url: "http://google.com/invalidpath" });
    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual({
      error: "Unable to load URL",
    });
  });
});

describe("GET /url/:slug", () => {
  it("responds with a url", async () => {
    const url = "https://google.com";
    const slug = "google";
    await prisma.link.create({ data: { slug, url } });
    const response = await request(app).get(`/url/${slug}`);
    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual({ url: "https://google.com" });
  });
  it("responds with an error if link doesn't exist", async () => {
    const response = await request(app).get(`/url/google`);
    expect(response.status).toBe(400);
    expect(response.body).toStrictEqual({ error: "Link not found" });
  });
  it("responds with an error if link has been deleted", async () => {
    const url = "https://google.com";
    const slug = "google";
    await prisma.link.create({ data: { deletedAt: new Date(), slug, url } });
    const response = await request(app).get(`/url/${slug}`);
    expect(response.status).toBe(400);
    expect(response.body).toStrictEqual({ error: "Link has been deleted" });
  });
});

describe("PUT /url/:slug/views", () => {
  it("responds with an empty object on success", async () => {
    const url = "https://google.com";
    const slug = "google";
    const { id } = await prisma.link.create({ data: { slug, url } });
    const response = await request(app).put(`/url/${slug}/views`);
    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual({});
    const link = await prisma.link.findUnique({ where: { id } });
    expect(link).toHaveProperty("viewCount", 1);
  });
  it("responds with an error if link doesn't exist", async () => {
    const response = await request(app).put(`/url/google/views`);
    expect(response.status).toBe(400);
    expect(response.body).toStrictEqual({ error: "Link not found" });
  });
  it("responds with an error if link has been deleted", async () => {
    const url = "https://google.com";
    const slug = "google";
    await prisma.link.create({ data: { deletedAt: new Date(), slug, url } });
    const response = await request(app).put(`/url/${slug}/views`);
    expect(response.status).toBe(400);
    expect(response.body).toStrictEqual({ error: "Link has been deleted" });
  });
});
