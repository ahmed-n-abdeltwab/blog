---
layout: article
title: "I Built a Coaching platform for my brother, from scratch to deployment, since no one is hiring jnr"
date: 2025-11-16
modify_date: 2025-11-16
excerpt: "A complete coaching platform I built for my brother — from scratch to deployment — at a time when junior developers could barely find opportunities."
tags:
  [
    "web development",
    "full-stack",
    "coaching platform",
    "software development",
    "from scratch to deployment",
  ]
key: built-coaching-platform
---

## Introduction

I finally built a coaching platform for my brother — something he had been asking for since my first year in university. At first, it was just curiosity. But OKAY Fine I will addmit: it was also pure desperation.

Because let's be real Landing a - **junior developer** job these days feels harder than breaking into a bank. if you are a developer with less than 3 years of experience . you get what i mean. and if you dont i genuinely Envy you.

But my brother’s project stayed in my mind. He’s a padel coach, and he needed a platform to manage his sessions, bookings, clients, and payments. I kept thinking, *“If I can engineer this from the ground up, maybe hiring managers will finally see I’m serious about my engineering career.”*

So I took the leap. And this is the story of that journey.

---


## Start

How do you even begin building something like this?  
Honestly… I was as clueless as anyone else starting a big project for the first time.

So I did what any engineer would do:  
**I researched. Or rather… I Googled. A lot.**

I went down rabbit holes — articles, blogs, research papers, YouTube videos, you name it. And from all that chaos, one piece of advice stood out:

**Before writing a single line of code, gather requirements and create UML diagrams.**

Activity diagrams, class diagrams, component diagrams, sequence diagrams, use-case diagrams — you don’t need all of them, but you need the ones that help you understand the system. These diagrams became my compass.

Next came the coding strategy:  
**Divide and conquer.**  
Break the huge monster into smaller monsters. Solve them one by one.

I like starting with the hardest task first. It gives me momentum — like a dopamine injection that keeps me excited for the rest of the project.

---

## Divide and Conquer

I started with the database.

I chose **PostgreSQL** because it’s reliable, powerful, and perfect for a solid foundation. I paired it with **Prisma** as my ORM.

For the backend, I used **NestJS**, and for the frontend, **React**.  
I added **Nginx** as a reverse proxy for caching and scalability.

Since I love structure, I used **Nx** to support a monorepo architecture.

For testing:
- **Nest/Jest** for unit tests.
- **SuperTest** for e2e tests.
- **TestCafe** for frontend testing.

For CI/CD:
- GitHub Actions — running tests before deploying.

For cloud hosting:  
I considered AWS, since I’m familiar with it, but decided to choose the provider later depending on cost and performance. and how much my brother was willing to pay.

---

## Backend

The backend needed:
- NestJS apps (CRUD endpoints, WebSockets, modules)
- Swagger API documentation
- Testing (unit, integration, e2e)
- Prisma schema with migrations

Once the backend was divided into smaller tasks, I made a clear plan.

---

## Initial Setup

I started by initializing Git and `package.json`. I kept everything simple — just the essentials:

- tsconfig  
- Prettier  
- ESLint  
- Nx workspace  
- Docker Compose for PostgreSQL

I tested everything — my “Hello World” showed up.  
A small victory, but a necessary step to move to the next one.

---

## Project Structure

```bash
coach-platform/
├── apps/
│   ├── api/                    # NestJS Backend API
│   │   ├── prisma/             # Database schema & migrations
│   │   ├── src/app/            # Feature modules (accounts, bookings, payments, etc.)
│   │   ├── src/common/         # Shared decorators, guards, DTOs
│   │   ├── src/config/         # Configuration modules
│   │   └── test/               # E2E & integration tests
│   │
│   └── web/                    # React Frontend
│       └── src/app/            # Components, pages, contexts, services
│
├── libs/                       # Shared libraries
│   ├── routes-helpers/         # Route utilities
│   └── utils/                  # Shared utility functions
│
├── docs/                       # Documentation & diagrams
├── .github/                    # CI/CD workflows
├── .husky/                     # Git hooks
├── .vscode/                    # VS Code settings
│
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── Dockerfile.api
├── Dockerfile.web
├── nginx.conf
│
├── nx.json
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
│
├── eslint.config.js
├── .prettierrc
├── jest.preset.js
├── commitlint.config.js
│
├── .env.example
└── README.md                   
````

---

## Coding

I started with the Prisma schema. do you remember the umls diagrams that i told you to make. The UML diagrams made translating everything into tables and columns much easier. I added scripts in `package.json` for migrations, schema deployment, and Prisma Studio.

Next came the NestJS modules:

* accounts
* iam
* booking-types
* calendar
* discounts
* health
* messages
* notifications
* payments
* prisma
* sessions
* time-slots

Each module had a clear responsibility.

### Responsibilities:

* **accounts:** user accounts CRUD
* **iam:** login, logout, roles, guards, strategies
* **booking-types:** types of coaching sessions
* **calendar:** Google Calendar integration
* **discounts:** discount management
* **health:** health check endpoints
* **messages:** real-time chat using WebSockets
* **notifications:** email notifications
* **payments:** PayPal + future payment methods
* **prisma:** database service
* **sessions:** managing booked sessions
* **time-slots:** coach availability management

After finishing the first version of all modules, I moved to Swagger. It was fast — NestJS makes documentation easy.


### And here’s the part I didn’t want you to miss — the Rocket.Chat influence.

When I finished writing the Nest modules, I wanted to work on the tests… but something kept bothering me.  
Since I’m using TypeScript, I kept thinking: *Why should I manually maintain all the API types for testing and frontend calls? Why not let the code generate the types itself?*

That idea didn’t come from nowhere.

It came from my previous work on **Rocket.Chat**, the open-source platform with more than 12 million users — basically an alternative to Slack and Microsoft Teams.  
While contributing there, especially on their core APIs and Swagger integration, I saw how they used advanced TypeScript techniques with utility types to sync API definitions with the client code.  
That experience hit me hard.  
It showed me how powerful TypeScript becomes when you let it drive the architecture instead of just using it for autocomplete.  
(Here’s the PR I contributed: [my merged PR](https://github.com/RocketChat/Rocket.Chat/pull/36246))

So naturally, I wanted to bring that same engineering taste into my own project.

### Turning Swagger into a “source of truth”

After finishing the Nest app and adding Swagger, I discovered that the generated document is just a JavaScript object.  
That was my “wait a second…” moment.

So I wrote a script that reads the Swagger JSON and creates a TypeScript file inside the `libs` folder.  
That file defines one interface — **Endpoints** — which becomes the single source of truth for all routes, methods, request types, and response types.

It looks like this:

```ts
export interface Endpoints {
  [path: string]: {
    [method: string]: (data: RequestType) => ResponseType;
  };
}
```

And the generated definitions look like this:

```ts
"/api/authentication/login": {
  POST: (body: { email: string; password: string }) => {
    accessToken: string;
    refreshToken: string;
    account: { id: string; email: string; role: string };
  };
};
```

Then I added a full set of advanced TypeScript utility types —
`ExtractMethods`, `ExtractRequestType`, `ExtractResponseType`, `PathsWithMethod`, `RequiresParams`, `ExtractPathParams`, and more.
All of these ensure that tests and frontend code stay 100% in sync with the backend API.

No more guessing.
No more outdated docs.
No more mismatched request/response shapes.

TypeScript handles it all.

And honestly… building this part made me feel proud.
It reminded me why I love engineering — that feeling of creating something that is both useful and elegant.

---

## See You Again

At this point, I’ve just finished the test setup. Next, I will write unit tests, integration tests, and e2e tests to cover all edge cases.

And that’s where this chapter ends.

I’m writing this blog while I’m still on the journey. I’ll continue updating it as I build, test, deploy, and hopefully make my brother happy with his new platform.

Or maybe — just maybe — a hiring manager will finally see that I’m serious about my engineering career.

See you next time.









