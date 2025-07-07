---
layout: article
title: "Exploring the Postgres Wire Protocol with Wireshark"
date: 2025-05-21
modify_date: 2025-05-21
excerpt: "This lecture shows how to use Wireshark to analyze the Postgres wire protocol by capturing packets between a Node.js client and a cloud-hosted Postgres database."
tags:
  [
    "Postgres",
    "Wireshark",
    "Network Protocol",
    "Database",
    "LectureNotes",
    "Hussein",
    "Software Engineering",
    "Fundamentals of Database Engineering",
  ]
mathjax: false
mathjax_autoNumber: false
key: postgres-wire-protocol-wireshark
---

## Introduction

Have you ever struggled to figure out why your database connection fails? This lecture, led by Hussein, dives into the **Postgres wire protocol** using **Wireshark** to uncover what happens when a Node.js client connects to a Postgres database. The goal is to understand the steps of connecting, authenticating, querying, and closing the connection by looking at network packets. We’ll cover setting up the environment, capturing packets, and analyzing key stages like the TCP handshake and error handling. The big revelation? Seeing exactly how the client and server talk—and why encryption matters!

## Core Concepts/Overview

- **Postgres Wire Protocol**: The rules Postgres uses to send messages between a client (like Node.js) and the database server over TCP.
- **Wireshark**: A tool that captures and shows network packets, helping us see the raw communication.
- **Setup**: A Node.js client connects to a cloud Postgres database (ElephantSQL), runs a `SELECT * FROM employees` query, and closes the connection.

## Key Characteristics

### TCP Connection Establishment

- Starts with a **three-way handshake**:
  - Client sends `SYN`
  - Server replies with `SYN-ACK`
  - Client sends `ACK`
- Postgres relies on TCP for stable communication.

### Authentication Process

- Client sends protocol version, username, and database name (no password yet!).
- Server checks details and asks for an MD5 password hash.
- Client sends the MD5 hash.
- Server confirms success and shares server info (e.g., version).

> _The password isn’t sent at first—smart, but still needs encryption!_

### Query Transmission

- Client sends the query (`SELECT * FROM employees`) as plain text.
- Server acknowledges it and sends back the results (e.g., employee data).

### Connection Termination

- Client sends an ‘X’ message to end the session.
- TCP closes with `FIN` and `ACK` packets, started by the client.

### Error Handling

- Wrong credentials? Server sends a vague error message and closes the connection.
- _Sometimes, errors show file names or line numbers—too much info for security!_

## Advantages & Disadvantages

### Advantages

- Helps debug connection or query problems by showing every step.
- Shows why encryption is critical (password hashes are visible without it).

### Disadvantages

- MD5 hashes aren’t secure if the connection isn’t encrypted.
- Error messages can leak server details, risking security.

## Practical Implementations/Examples

### Setting Up

- Use ElephantSQL for a quick Postgres database.
- Write a Node.js client with the `pg` library to connect and query.

### Capturing Packets

- Open Wireshark and filter by client and server IP addresses.
- Run the Node.js script (`node query.js`) to capture traffic.

### Analyzing Packets

- **Handshake**: Spot the `SYN`, `SYN-ACK`, `ACK` sequence.
- **Authentication**: See the username sent, then the MD5 hash request.
- **Query**: Check the plain-text query and result rows.
- **Errors**: Use wrong credentials to see the server’s error response.

## Conclusion

This lecture revealed how the **Postgres wire protocol** works step-by-step: connecting, authenticating, querying, and closing. Wireshark makes it easy to see everything, which is great for fixing issues. Key takeaways? Always encrypt connections to protect data, and watch out for chatty error messages. I’ll definitely use this knowledge to debug database problems smarter!
