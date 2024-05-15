import { primsa } from "../src/prisma";

async function seed() {
  await primsa.image.deleteMany();
}

seed();
