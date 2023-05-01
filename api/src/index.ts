import { app } from "./app";

const keys = [
  "APP_NAME",
  "API_PORT",
  "APP_ORIGIN",
  "DATABASE_URL",
  "GOOGLE_API_KEY",
];

/**
 * Make sure required environment variables are specified
 */
for (const key of keys) {
  if (!(key in process.env)) {
    console.error(`Missing environment variable: ${key}`);
    process.exit(1);
  }
}

app.listen(process.env.API_PORT);
