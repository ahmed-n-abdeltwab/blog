---
layout: article
title: "How ChatGPT Uses SSE Internally"
date: 2025-08-25
modify_date: 2025-08-25
excerpt: "The lecture explored how ChatGPT uses **Server-Sent Events** (SSE) and modern HTTP protocols (HTTP/2, HTTP/3) to stream responses and manage conversation state. *It covers key details like message IDs linking conversation context, short-lived tokens and pagination, and even a fun demo of two ChatGPT instances talking to each other.*"
tags:
  [
    "ChatGPT",
    "WebProtocols",
    "LectureNotes",
    "SSE",
    "HTTP2",
    "Hussein",
    "Protocols",
    "Software Engineering",
    "Fundamentals of Backend Engineering",
  ]
key: chatgpt-sse-architecture
---

# Introduction

In this lecture summary, I dive into how ChatGPT’s web client and backend communicate using **Server-Sent Events (SSE)**. The presenter walked through the low-level details: how HTTP/2 (and even HTTP/3) is used for efficient streaming, how the access tokens work, and how conversations and messages are managed via unique IDs. I’ll try to capture the main insights in a clear way, as if explaining to my future self.

The core idea is that when you ask ChatGPT a question in the browser, the answer is streamed back token-by-token over an SSE connection. _Instead of waiting for the whole answer, the UI receives chunks in real time._ Under the hood, this uses an HTTP POST to the ChatGPT API (with `Content-Type: text/event-stream`), and the client reads the streaming response. Interestingly, ChatGPT doesn’t use the standard browser `EventSource` API for SSE – it has its own lightweight solution. We’ll see what that means in practice.

# Core Concepts / Overview

**Server-Sent Events (SSE)** is a one-way streaming protocol over HTTP: the server sends updates, the client receives them. In ChatGPT’s case, after authenticating, the UI sends a POST to the ChatGPT conversation endpoint (something like `/backend-api/conversation`) with the user’s message and relevant headers. The server replies with a streaming response (`text/event-stream`) that contains the generated tokens. As the lecturer noted:

> “We sent a post request to this conversation API … saying ‘I’m expecting an event stream’ … The response content type is actually `text/event-stream`.”

Each message from the model comes as an SSE event. However, since ChatGPT didn’t use `EventSource`, the DevTools network tab shows nothing under “EventStream” by default. Instead, the front-end uses a `fetch()` request with a **stream reader**:

```js
const response = await fetch("/backend-api/conversation", {
  method: "POST",
  headers: {
    /* auth headers, SSE header */
  },
  body: JSON.stringify({
    /* message, conversationId, parentMessageId */
  }),
});

const reader = response.body.getReader();
const decoder = new TextDecoder("utf-8");
let partial = "";

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const chunk = decoder.decode(value);
  partial += chunk;
  console.log("Received chunk:", chunk);
}
```

_Insight:_ ChatGPT’s streaming is basically "sending a request and just reading a stream of responses." The server continuously pushes tokens, and the client appends them to the chat window.

---

**Conversation and Message IDs:** Each chat is a _conversation_ with a unique ID. Messages have `messageId` and `parentMessageId` fields, forming a chain so the model can track context.

The “conversations” endpoint returns a list of all conversations. Titles are auto-generated (ChatGPT names them itself!).

# Key Characteristics

- **HTTP Version:** Uses **HTTP/2** (multiplexing on one TCP connection). Cloudflare front-end also advertises HTTP/3.
- **Token Handling:** Refresh token (cookie) + short-lived access token (bearer). Expiry can break UX.
- **API Structure:** Conversations and messages use unique IDs. Parent/child links keep context.
- **Pagination:** `/conversations?offset=0&limit=20`. Offset-based paging may be slow at scale.
- **Unique IDs:** Random UUIDs. Lecturer suggested ULIDs would be better for database locality.
- **Frontend Interaction:** Endpoints include `/session`, `/conversations`, `/conversation`, `/message_feedback`.
- **SSE Handling:** Uses `fetch` + `ReadableStream` instead of EventSource. More control, but DevTools doesn’t show events.

# Advantages & Disadvantages

**Advantages**

- Real-time token streaming.
- Efficient connection reuse with HTTP/2.
- Simplicity of SSE (lightweight push).
- Clean API structure.
- Extensible and easy to script.

**Disadvantages**

- Tokens expire quickly → 403s.
- Offset pagination not scalable for huge history.
- Random UUIDs = poor DB locality.
- No standard SSE client → custom parsing.
- SSE is one-way only.
- Same-origin cookie reliance for automation.

# Practical Implementations / Examples

**Streaming via fetch:**

```js
async function streamChatResponse(message, conversationId, parentMessageId) {
  const headers = {
    "Content-Type": "application/json",
    // Authorization: Bearer <access-token>
  };
  const body = JSON.stringify({ message, conversationId, parentMessageId });
  const response = await fetch("/backend-api/conversation", {
    method: "POST",
    headers,
    body,
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    fullText += chunk;
    processNewStreamData(chunk); // UI updates
  }

  console.log("Complete response:", fullText);
}
```

**Two ChatGPTs talking:**
The lecturer wrote a script that opened two ChatGPT iframes and let them pass answers back and forth. For example:

- Bot A: “What is photosynthesis?”
- Bot B: answers, then asks “What’s your favorite sport?”
- Bot A: answers (“I don’t have preferences”) and asks a new question.

It often went into loops but sometimes produced fun exchanges (enzymes, states of matter, etc.). The main insight was that because of same-origin cookies, this had to run inside the openai.com domain.

# Conclusion

This lecture gave me a clear peek under the hood of ChatGPT’s web stack.

- **Main takeaway:** ChatGPT streams answers using **HTTP/2 SSE** with fetch + streams, not EventSource.
- **Other insights:** Short-lived tokens can expire mid-session, pagination uses offsets, and random UUIDs might not scale well in DB.

The demo of two bots chatting was a fun reminder: under all the magic, it’s just HTTP calls and streamed JSON.

_Future me: remember, if things feel slow or broken, it might be token expiry or offset pagination limits. And don’t forget how elegant the fetch-streaming trick is!_
