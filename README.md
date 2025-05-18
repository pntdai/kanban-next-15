# Next.js 15 Project Structure

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Project Structure

```
project-root/
├── src/                    # Application source code
│   ├── app/                # Next.js App Router pages
│   │   ├── ui/             # Basic UI elements
│   │   └── features/       # Feature-specific components
│   ├── lib/                # Utility functions and shared logic
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript type definitions
│   └── styles/             # Global styles and theme
├── public/                 # Static assets
├── prisma/                 # Database schema (Prisma)
│   └── schema.prisma
├── app/                    # API routes (Next.js Route Handlers)
│   └── api/                # Backend API endpoints
│       └── [...]/route.ts
├── config/                 # Configuration files
├── scripts/                # Utility scripts
├── middleware.ts           # Next.js middleware
├── next.config.ts          # Next.js configuration
├── package.json
└── tsconfig.json
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Backend Integration

This project includes a backend API using Next.js Route Handlers located in the `app/api` directory. The API endpoints follow RESTful conventions and are protected by middleware where necessary.

### Database

The project uses Prisma ORM with PostgreSQL. The database schema is defined in `prisma/schema.prisma`.

To set up the database:

1. Create a `.env` file in the root directory with your database connection string:

   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/mydb?schema=public"
   ```

2. Run Prisma migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
