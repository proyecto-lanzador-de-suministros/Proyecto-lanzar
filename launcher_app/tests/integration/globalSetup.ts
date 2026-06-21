import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { execSync } from "child_process";

let contenedor: StartedPostgreSqlContainer;

export async function setup() {
  contenedor = await new PostgreSqlContainer("postgis/postgis:16-3.4")
    .withDatabase("launcher_test")
    .withUsername("test")
    .withPassword("test")
    .start();

  const url = contenedor.getConnectionUri();
  process.env.DATABASE_URL_TEST = url;

  // DATABASE_URL explícito en el env del proceso hijo tiene precedencia sobre dotenv
  execSync("npx prisma db push", {
    env: { ...process.env, DATABASE_URL: url },
    stdio: "inherit",
  });
}

export async function teardown() {
  await contenedor?.stop();
}
