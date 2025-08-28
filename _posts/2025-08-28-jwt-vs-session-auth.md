---
layout: article
title: "Session vs JWT Auth"
date: 2025-08-28
modify_date: 2025-08-28
excerpt: "Notes comparing session-based and JWT authentication, with a look at pros and cons."
tags:
  [
    "Backend",
    "Authentication",
    "LectureNotes",
    "Hussein",
    "Protocols",
    "Software Engineering",
    "Fundamentals of Backend Engineering",
  ]
key: jwt-vs-session-auth
---

## Introduction

In a recent lecture I learned how **session-based authentication** and **JWT (JSON Web Token) authentication** compare. The instructor explained that session-based auth existed for a long time but had limitations, so **JWTs were invented to solve certain problems**. He also emphasized that _“nothing in software engineering is perfect… everything has pros and cons”_. For example, JWTs are widely used in modern APIs and microservices: one central auth service issues a token, and any client or service with that token can authenticate without a central database lookup. The main insight is that each method has trade-offs, and the best choice depends on the use case.

## Core Concepts / Overview

**Session-based Authentication:** In this older approach, the server keeps track of each user’s session. After a successful login, the server creates a random **session ID** and stores it along with the user’s info (username, role, expiry, etc.) in a database. This session ID is sent to the client, typically in an HTTP-only cookie. On every subsequent request, the client sends this cookie and the server looks up the session ID in its store to identify the user.

> **“HTTP is a stateless protocol… So you need to identify yourself with every request.”**

The server-side session store makes the system **stateful** (server keeps state about each user). Logging out usually means deleting the session on the server and clearing the cookie.

**JWT-based Authentication:** Here the server also issues a token on login, but the token (JWT) _contains_ the user’s data. The token is a JSON object with three parts (header, payload, signature) that is signed with a secret key. For example, the payload might include the username and role, and a timestamp expiry. The key point is that **the JWT is self-contained**. The client stores this token (in a cookie or local storage) and sends it with each request. The server checks the token’s signature using its secret (or public key) and, if valid, trusts the data in the token. No database lookup is needed for each request.

> **“JWT stands for JSON Web Token. It is a completely stateless system… if I take that JWT and give it to a completely different service… it will be able to authenticate that user.”**

This means any service that knows the secret can verify the token independently, which makes JWT auth **stateless**. Often, systems use a short-lived JWT (access token) and a longer-lived refresh token to get new access tokens.

## Key Characteristics

- **Session-based Auth:**

  - Server keeps a `session ID` and user data in a database.
  - The client gets the session ID in a cookie (usually `HttpOnly`) and sends it with every request.
  - On each request, the server queries the DB for that session ID to authenticate the user.
  - The system is **stateful** (server stores state) and sessions can be invalidated by removing them from the DB.

- **JWT Auth:**
  - Server issues a signed JWT containing user info and expiry.
  - JWT has three parts (header, payload, signature) and is signed with a secret (HMAC) or private key.
  - The client sends the JWT with each request (e.g., in an Authorization header).
  - The server verifies the signature with its secret; if valid, it trusts the token data, _without_ a database lookup.
  - The system is **stateless** (the token itself holds the needed info). Often a refresh token is also used: the client sends a refresh token to get a new JWT when the old one expires.

## Advantages & Disadvantages

**Session-based Auth:**

- _Advantages:_ Not covered in this lecture (generally, sessions are simple and easy to revoke by server).
- _Disadvantages:_ Requires a database lookup on every request, adding latency. The server must store all session data (making the system stateful), which complicates scaling.

**JWT Auth:**

- _Advantages:_ The server does _not_ need to query a database on each request (stateless). JWTs scale well for APIs/microservices because one auth service can issue a token that any service uses. Tokens carry user info securely (since the data is signed).
- _Disadvantages:_ Key management is complex – all services must securely share the secret (or public key). JWTs are hard to revoke early (logout usually requires waiting for the token to expire or using a stateful refresh token strategy).

## Practical Implementations / Examples

**Session Authentication Example:** In the lecture’s code, a Postgres table `session_auth` stored login data and session IDs. When a user registers and logs in, the server generates a new session ID (a long random string) and saves it in the table along with the user’s role. The server then set this session ID in an HttpOnly cookie (so it’s automatically sent by the browser but not accessible to JavaScript). On each request, the server ran code to _“validate the session by querying the database”_. If the session ID exists and isn’t expired, it returns the protected content; otherwise it sends the login page. Logging out simply cleared the cookie and/or deleted the session in the database.

**JWT Authentication Example:** The instructor rewrote the app to use JWTs. On login, instead of a session ID, the server generated a signed JWT (using HMAC-SHA256) and a refresh token. _“I’m using the HMAC SHA256 to get the token. Set the token in the cookie and that’s it.”_ The client stored these tokens in cookies. For each request, the server used the secret key to verify the JWT, and did **not** perform a database query. _“This is not a query to the database... If it’s good I’m going to return it.”_ If the access token had expired, the client could hit the `/token` endpoint: the server checked the refresh token’s validity and, if valid, issued a new access token. This way the JWT-based code avoided querying the user table on each request, relying on the signed token instead.

## Conclusion

The key takeaway is that session auth and JWT auth each solve the “who is this user” problem in different ways. Session auth keeps server-side state and is simple to invalidate, while JWT auth packs all info into a token so it can be checked without a database. As the lecture emphasized, _“nothing in software engineering is perfect – everything has pros and cons”_.

In real-world terms, I see that JWTs are great for distributed APIs (you can verify a token anywhere), but sessions can be easier to manage in smaller apps since you control the state centrally. Understanding these methods and their trade-offs helps me feel confident choosing the right approach for each project. _I can see why engineers must carefully pick between session and token-based auth based on their needs._
