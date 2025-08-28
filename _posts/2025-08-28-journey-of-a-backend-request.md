---
layout: article
title: "Journey of a Backend Request"
date: 2025-08-28
modify_date: 2025-08-28
excerpt: "Personal notes to my future self on what really happens when a request travels from the frontend through the kernel to the backend."
tags:
  [
    "Backend",
    "Programming",
    "LectureNotes",
    "Hussein",
    "Protocols",
    "Software Engineering",
    "Fundamentals of Backend Engineering",
  ]
key: journey-of-a-backend-request
---

# The Journey of a Request to the Backend (My Notes)

Hey future me 👋,  
I just read this blog about what happens when a request reaches the backend.  
I used to think the backend only _processes_ the request, but that’s actually the **last step**.  
Here’s the full journey to remember:

![Journey Diagram](https://img-c.udemycdn.com/redactor/raw/article_lecture/2024-09-29_21-27-34-c26332abcb558db1e85451d895d3c3c7.png)

---

## 1. Accept

- Client connects (TCP/QUIC).
- Kernel does the 3-way handshake → puts connection in the **accept queue**.
- Backend calls `accept()` to get it.

⚠️ If the app is slow here → backlog fills, new connections fail.  
Tip: `SO_REUSEPORT` lets multiple threads have their own queue → NGINX, HAProxy do this.

![Accept Queue](https://img-c.udemycdn.com/redactor/raw/article_lecture/2024-09-29_21-27-34-8bc1dae72d41415704e05b51e32a7292.png)

---

## 2. Read

- Client sends raw bytes (protocol decides boundaries).
- Bytes go into **receive queue** in kernel.
- Backend uses `read()` / `recv()` → moves bytes to user space.

At this stage → **still raw encrypted bytes**. Could be multiple requests, or half of one.

---

## 3. Decrypt

- Use SSL library (OpenSSL, etc.) to decrypt bytes.
- Until now, we can’t even see protocol boundaries.
- Heavy CPU operation.

---

## 4. Parse

- Plaintext bytes are parsed depending on protocol:
  - **HTTP/1.1** → headers, content-length, etc.
  - **HTTP/2/3** → more metadata, binary parsing.

Parsing costs CPU cycles, especially h2/h3. Easy to overlook this.

---

## 5. Decode

- Further work on request:
  - **JSON/Protobuf** → deserialize.
  - **UTF-8** → proper decoding of bytes.
  - **Compression** → decompress body if needed.

Even `JSON.parse()` in JS isn’t free.

---

## 6. Process

Finally:

- DB queries, disk reads, computation.
- Often handled by **worker pool** so the main loop isn’t blocked.

---

## My Takeaway

A request isn’t “ready” instantly.  
It goes through **Accept → Read → Decrypt → Parse → Decode → Process**.

Future me, keep this in mind when thinking about bottlenecks. Some systems put all steps in one thread, others split across many. Both can work — the trick is to **know the cost of each step**.

---

## Resources

- [📄 The Journey of a Request to the Backend (PDF)](https://att-c.udemycdn.com/2023-07-21_16-53-40-377cf3d4ef3e2740b4e9422ebab3723f/original.pdf)
- [🎥 journey-request.mp4](https://att-c.udemycdn.com/2024-02-12_17-43-13-789637ca09a60a51817956e55e968bf7/original.mp4)
