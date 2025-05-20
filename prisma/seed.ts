import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Delete existing data
  await prisma.task.deleteMany();
  await prisma.column.deleteMany();

  // Create columns
  const todoColumn = await prisma.column.create({
    data: {
      title: "To Do",
      order: 1,
    },
  });

  const inProgressColumn = await prisma.column.create({
    data: {
      title: "In Progress",
      order: 2,
    },
  });

  const doneColumn = await prisma.column.create({
    data: {
      title: "Done",
      order: 3,
    },
  });

  // Create tasks
  await prisma.task.createMany({
    data: [
      {
        title: "Research competitors",
        description: "Analyze top 5 competitors and their features",
        priority: "high",
        status: "todo",
        order: 1,
        columnId: todoColumn.id,
      },
      {
        title: "Design homepage",
        description: "Create wireframes for the new homepage",
        priority: "medium",
        status: "todo",
        order: 2,
        columnId: todoColumn.id,
      },
      {
        title: "Setup authentication",
        description: "Implement user login and registration",
        priority: "high",
        status: "in-progress",
        order: 1,
        columnId: inProgressColumn.id,
      },
      {
        title: "API documentation",
        description: "Document all API endpoints for the frontend team",
        priority: "low",
        status: "in-progress",
        order: 2,
        columnId: inProgressColumn.id,
      },
      {
        title: "Fix navigation bug",
        description: "Fix the dropdown menu bug in mobile view",
        priority: "medium",
        status: "done",
        order: 1,
        columnId: doneColumn.id,
      },
      {
        title: "Implement dark mode",
        description: "Add dark mode support to the application",
        priority: "low",
        status: "done",
        order: 2,
        columnId: doneColumn.id,
      },
    ],
  });

  console.log("Database has been seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
