---
layout: article
title: "Understanding WebSockets: Real-time Communication for the Web"
date: 2025-07-02
modify_date: 2025-07-02
excerpt: "A lecture exploring WebSockets, their role in enabling real-time, bidirectional web communication, and a practical example of building a chat application."
tags:
  [
    "WebSockets",
    "Backend",
    "Programming",
    "Real-time",
    "LectureNotes",
    "Node.js",
    "Hussein",
    "Protocols",
    "Software Engineering",
    "Fundamentals of Backend Engineering",
  ]
mathjax: false
mathjax_autoNumber: false
key: websockets
---


## Understanding WebSockets: Real-time Communication for the Web

## Introduction

Have you ever wondered how modern web applications achieve real-time communication, like instant messaging or live updates without refreshing the page? The technology behind this is **WebSockets**. In this lecture, we explored what WebSockets are, why they are necessary, and how they work. We also looked at their advantages and disadvantages and even built a simple chat application to see them in action. *I found it fascinating to learn how WebSockets enable seamless, real-time interactions, something I’ve always taken for granted in apps like Discord or WhatsApp.* The key insight is that WebSockets provide a way to have instant, two-way communication on the web, which is essential for applications requiring live data updates.

## Core Concepts

**WebSockets** are a communication protocol that allows for **full-duplex** communication over a single TCP connection. This means both the client (like a web browser) and the server can send data to each other at any time, making them ideal for real-time applications such as chat apps, live feeds, and multiplayer games. Unlike traditional HTTP, which follows a request-response model where connections close after each request, WebSockets keep the connection open for continuous data exchange.

### How WebSockets Work

WebSockets begin with an HTTP connection that is upgraded to a WebSocket connection through a **handshake process**. Here’s how it works in simple terms:

1. **Client Request**: The client sends an HTTP GET request with special headers, including `Upgrade: websocket`, to signal it wants to switch to the WebSocket protocol.
2. **Server Response**: If the server supports WebSockets, it responds with an HTTP 101 status code ("Switching Protocols"), confirming the upgrade.
3. **Bidirectional Communication**: After the handshake, the connection becomes a WebSocket connection, allowing both parties to send messages in real-time without further HTTP requests.

Here’s an example of the client’s request:

```http
GET /chat HTTP/1.1
Host: servername
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Protocol: chat
```

And the server’s response:

```http
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
Sec-WebSocket-Protocol: chat
```

*This handshake process was eye-opening for me because it showed how WebSockets cleverly use HTTP to establish a secure connection before switching to a more efficient protocol.*

## Key Characteristics

Here are the main features of WebSockets, based on the lecture:

- **Bidirectional Communication**: Both client and server can initiate data transfer at any time.
- **Built on HTTP**: Uses HTTP for the initial handshake to ensure security and compatibility.
- **Real-time Data Transfer**: Supports instantaneous data exchange, perfect for live updates.
- **Standard Ports**: Uses ports 80 (ws://) and 443 (wss://), making it firewall-friendly.
- **Stateful Connection**: Unlike HTTP’s stateless nature, WebSockets maintain a persistent connection.

## Advantages

WebSockets offer several benefits that make them powerful for real-time applications:

- **Full-duplex Communication**: Allows simultaneous two-way communication, so both sides can send data without waiting.
- **No Polling Required**: Eliminates the need to repeatedly ask the server for updates, reducing latency and server load.
- **Firewall-Friendly**: Uses standard HTTP ports (80 and 443), avoiding issues with firewalls.
- **Efficient for Real-time Applications**: Ideal for scenarios like chat apps, live sports updates, or online gaming.

## Disadvantages

However, WebSockets also have some challenges:

- **Complexity in Management**: Handling long-lived connections, especially with proxies and load balancers, can be tricky.
- **Stateful Nature**: Makes scaling across multiple servers more difficult compared to stateless HTTP.
- **Connection Drops**: Intermediaries like routers may close idle connections, requiring “ping-pong” messages to keep them alive.
- **Resource Intensive**: Maintaining many open connections can consume significant server resources.

*I was surprised to learn about the need for ping-pong messages to keep connections alive, as it highlighted the practical challenges of using WebSockets in real-world applications.*

## Practical Example: Building a Chat Application

The lecture included a hands-on example of building a simple chat application using Node.js and the `ws` WebSocket library. This was one of the most exciting parts for me, as it brought the theory to life by showing how WebSockets work in a real-world scenario.

### Server-side (Node.js)

The server was set up to handle multiple client connections and broadcast messages to all connected users. It used the `ws` library and maintained an array of connections, identifying each client by their unique TCP remote port.

```javascript
const WebSocket = require('ws');
const http = require('http');
const server = http.createServer();
const wss = new WebSocket.Server({ server });
let connections = [];

wss.on('connection', (ws) => {
    connections.push(ws);
    const remotePort = ws._socket.remotePort;
    const joinMessage = `User ${remotePort} just connected`;
    connections.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(joinMessage);
        }
    });

    ws.on('message', (message) => {
        console.log(`User ${remotePort} says: ${message}`);
        connections.forEach((client) => {
            if (client.readyState === WebSocket.OPEN && client !== ws) {
                client.send(`User ${remotePort} says: ${message}`);
            }
        });
    });

    ws.on('close', () => {
        connections = connections.filter((client) => client !== ws);
        const leaveMessage = `User ${remotePort} disconnected`;
        connections.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(leaveMessage);
            }
        });
    });
});

server.listen(8080, () => {
    console.log('WebSocket server running on port 8080');
});
```

### Client-side (Browser JavaScript)

On the client side, each user connects to the server using the WebSocket API in the browser. They can send messages and receive updates in real-time.

```javascript
const ws = new WebSocket('ws://localhost:8080');

ws.onmessage = (event) => {
    console.log('Received message:', event.data);
};

function sendMessage(message) {
    ws.send(message);
}

document.getElementById('sendButton').addEventListener('click', () => {
    const message = document.getElementById('messageInput').value;
    sendMessage(message);
});
```

This example demonstrated the **push notification model**, where the server instantly pushes messages to all connected clients without them needing to request updates. *I found it really cool to see how a few lines of code could create a functional chat app, though the lecture also pointed out areas for improvement, like handling disconnections more robustly.*

### Key Features of the Example

| Feature | Description |
|---------|-------------|
| **Connection Management** | The server keeps an array of all connected clients, adding new ones and removing those that disconnect. |
| **Message Broadcasting** | When a client sends a message, the server sends it to all other clients, identified by their remote port. |
| **Real-time Updates** | Messages appear instantly in all connected browsers, showcasing WebSockets’ speed. |
| **Disconnection Handling** | The server detects when a client disconnects and notifies others, though it needs checks to avoid errors. |

## Alternatives to WebSockets

The lecture also discussed that WebSockets aren’t always the best choice. For simpler real-time needs, alternatives like **long polling** (where the client repeatedly asks the server for updates) or **server-sent events** (where the server pushes updates to the client) might be easier to implement. The speaker advised using WebSockets only when true bidirectional communication is necessary, due to their complexity and overhead. *This was a helpful reminder that choosing the right tool depends on the project’s specific needs.*

## Conclusion

WebSockets are a powerful tool for enabling real-time, two-way communication on the web. They allow applications to push data instantly, making them essential for things like chat apps, live feeds, and gaming. However, their complexity means they’re best used when bidirectional communication is critical. The practical example of building a chat application was incredibly helpful in understanding how WebSockets work in practice. This lecture gave me a solid foundation to start exploring real-time web development.
