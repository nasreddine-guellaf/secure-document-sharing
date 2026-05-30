const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const categories = [
  "Contrat",
  "Facture",
  "Rapport",
  "CV",
  "Diplôme",
  "Lettre administrative",
  "Autre"
];

const users = [
  {
    name: "Admin User",
    email: "admin@secure-share.test",
    password: "Admin123!",
    role: "ADMIN"
  },
  {
    name: "Normal User",
    email: "user@secure-share.test",
    password: "User123!",
    role: "USER"
  },
  {
    name: "Verifier User",
    email: "verifier@secure-share.test",
    password: "Verifier123!",
    role: "VERIFIER"
  }
];

async function main() {
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }

  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 10);

    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: user.role,
        passwordHash
      },
      create: {
        name: user.name,
        email: user.email,
        role: user.role,
        passwordHash
      }
    });
  }
}

main()
  .then(async () => {
    console.log("Database seeded successfully.");
    console.log("Admin: admin@secure-share.test / Admin123!");
    console.log("User: user@secure-share.test / User123!");
    console.log("Verifier: verifier@secure-share.test / Verifier123!");
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
