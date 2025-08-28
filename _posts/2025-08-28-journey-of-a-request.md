---
layout: article
title: "Journey of a Request to Backend"
date: 2025-08-28
modify_date: 2025-08-28
excerpt: "A simple overview of the path a web request takes from the frontend to the backend server, including key stages and hidden costs."
tags:
  [
    "Backend",
    "Networking",
    "Programming",
    "LectureNotes",
    "Hussein",
    "Protocols",
    "Software Engineering",
    "Fundamentals of Backend Engineering",
  ]
mathjax: false
mathjax_autoNumber: false
key: journey-of-a-request
---

## Introduction

> "I want to take you on a journey of what we call a request sent from a front end to a back end server."  
> Have you ever wondered what happens behind the scenes when you click a button or submit a form on a website? In this note, we break down the many steps a web request goes through from the browser (frontend) to the server (backend).

The goal of the lecture _"Journey of a Request to the Backend"_ is to make these hidden steps clear. Understanding each step is important for real-world performance and debugging: as the speaker notes, _"appreciating these steps makes you ... better aware of the performance implications."_

The main insight is that handling a request involves hidden expenses, so knowing this helps us optimize and troubleshoot server-side code.

## Core Concepts / Overview

1. **Accepting the connection**  
   The first step is establishing a network connection. The client (browser) and server must complete a handshake (usually a TCP three-way handshake) to open a communication channel. You _need a "pipe"_ called a connection to send data. The server must _accept_ this connection before reading any request data. This is not free work: setting up connections is complex, and many web servers specialize in just this task. Once the connection is accepted, data can flow over it.

2. **Reading the raw data**  
   After the connection is open, the server reads incoming bytes from the network. At this point, the data is just a stream of raw bytes. In networking we only send bytes; HTTP or JSON do not exist yet – just numbers.

3. **Decrypting the data**  
   If the request is using HTTPS, the bytes read are encrypted by TLS. The server must decrypt these bytes. Decrypting adds CPU overhead, especially during the initial handshake (which uses public-key cryptography). After the handshake, symmetric ciphers are efficient, but still add cost.

4. **Parsing the protocol**  
   Now the server has plain text (or binary) data. The next step is to parse the protocol format, usually HTTP. This means reading the request line and headers. For HTTP/1.1 it’s text lines (e.g. `GET /index.html HTTP/1.1`); for HTTP/2 it’s binary. After parsing, the server knows the HTTP method, path, protocol version, headers, and so on.

5. **Decoding the request body**  
   If the request has a body (for example, a POST with JSON data), the server must decode it into usable form. For instance, if the body is JSON text, the server must parse that text into an object.  
   In practice, frameworks help here. For example, Express.js has a built-in `express.json()` middleware that parses JSON HTTP request bodies into JavaScript objects. However, this step adds cost. Converting raw bytes into a structured object is work.

6. **Processing the request**  
   Finally, the server runs the application logic to produce a response. This often involves database or I/O operations. For example, the server might query a database and wait for the result. Importantly, this is usually asynchronous: while waiting for the database, the server can accept and process other requests. This is why non-blocking I/O can greatly increase throughput.

## Key Characteristics

- **Connection:** A transport channel (usually TCP) between the client and server. It is like a "pipe" for data.
- **Decryption:** With HTTPS, all incoming data is encrypted with TLS. The server must decrypt it, which uses CPU.
- **Reading vs. Parsing:** _Reading_ means fetching raw bytes from the network. _Parsing_ means interpreting them according to rules (HTTP, JSON, etc.).
- **Asynchronous processing:** Modern backends often use async I/O. This allows the server to handle other requests while waiting on long operations (like databases).

## Advantages & Disadvantages

- **Advantages:** Not covered in this lecture.
- **Disadvantages:** Not covered in this lecture.

## Practical Implementations / Examples

- **Express.js (Node.js):**  
  You can use built-in middleware to handle some of these steps. For example:

  ```js
  const express = require("express");
  const app = express();
  app.use(express.json()); // parse JSON bodies

  app.post("/api", (req, res) => {
    console.log(req.body);
    res.json({ received: true });
  });
  ```

---

Here, `express.json()` parses raw JSON into a usable JavaScript object (`req.body`).

## Conclusion

In summary, a single request travels through many hidden steps before your code runs:

- Accept connection
- Read raw bytes
- Decrypt (if HTTPS)
- Parse the protocol
- Decode the body
- Process the logic

Each step has a cost. As the lecture said: _"It's not free. Nothing is free."_

_Understanding this breakdown makes the backend feel less like a black box. Now, when I see a request arrive, I remember all the work behind it and can appreciate why efficient code and async handling matter._
