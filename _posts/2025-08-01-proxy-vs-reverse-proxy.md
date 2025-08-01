---
layout: article
title: "Understanding Proxies and Reverse Proxies: A Networking Foundation for Backend Developers"
date: 2025-08-01
modify_date: 2025-08-01
excerpt: "A clear guide to understanding proxies and reverse proxies, including use cases like caching, debugging, microservices, load balancing, and how they relate to real tools like NGINX and Fiddler."
tags:
  [
    "Networking",
    "Backend",
    "LectureNotes",
    "Proxies",
    "Microservices",
    "Hussein",
    "Protocols",
    "Software Engineering",
    "Fundamentals of Backend Engineering",
  ]
mathjax: false
mathjax_autoNumber: false
key: proxy-vs-reverse-proxy
---

## Introduction

I used to be puzzled by the terms _proxy_ and _reverse proxy_. One part of me thought they were the same, but the other part felt there must be a difference. In a recent lecture, the instructor clarified: **“a proxy is a server that makes requests on your behalf”** (for example, you ask to go to Google, but the proxy goes for you). In contrast, a **reverse proxy** sits on the **server-side**, acting _for_ the server rather than the client. This means a proxy is client-facing (the client knows the server), while a reverse proxy is server-facing (the client sees only the proxy and doesn’t know the real backend). My goal with these notes is to capture these insights and examples in a way I can easily recall later.

## Core Concepts

A **proxy (forward proxy)** is an intermediary that clients use to reach external servers. For example, if I configure my browser to use a proxy, all my requests first go to the proxy server. The proxy then connects to the final site (e.g. `google.com`) for me. In this flow, the client **knows the final server** it wants, but that server only ever sees the proxy’s IP. In other words, the proxy “speaks” to the server on behalf of the client. Often proxies are used to hide the client’s identity, cache content, or log traffic.

A **reverse proxy**, on the other hand, is an intermediary on the server side. It receives incoming client requests as if it were the real server, then forwards them to one or more real backend servers. Clients think the reverse proxy is the final destination. For example, a request to `example.com` might hit an NGINX reverse proxy, which then routes it to different internal servers based on the URL. The key is: _the client doesn’t know the true backend servers_, only the proxy’s address. This enables load balancing, centralized security, and other features.

## Key Characteristics

- **Forward Proxy (Client-side):** The client knows where it wants to go, but the external server sees the proxy’s address, not the client’s. The server normally _doesn’t know the original client_. The proxy can add headers like `X-Forwarded-For` if it wants the server to see the client IP, but otherwise it hides it. Proxies typically require the client to be configured to use them (unless transparently inserted by a network).

- **Reverse Proxy (Server-side):** The client knows only the proxy’s address (e.g. the public domain) and is unaware of the real internal servers. The reverse proxy _knows_ the backend servers and forwards requests to them. This flips the visibility: _clients don’t know the final servers_, but the servers often see the proxy’s IP as the client. The proxy may pass along headers to let servers see the real client IP if needed (common in HTTP proxies).

- **TCP/HTTP Flow:** In either case, the TCP connection from the client goes to the proxy IP first. In a forward proxy, the proxy opens a new connection to the destination server; in a reverse proxy, the proxy opens connections to backend servers. For HTTP, the proxy rewrites or processes the request (with `proxy_pass` or similar) before forwarding.

- **Visibility and Addressing:** Forward proxies often hide a client’s IP from the outside world (clients appear as the proxy). Reverse proxies hide internal server details from clients. _Server logs_ will see the proxy’s IP instead of the real peer (unless special headers are used).

- **Direction of Service:** A shorthand is: _Forward proxy = client-centric._ _Reverse proxy = server-centric._ The forward proxy makes requests on _your_ behalf. The reverse proxy receives requests on _the server’s_ behalf.

## Advantages & Disadvantages

- **Forward Proxy Pros:** _Privacy and control._ Can hide client IP (anonymity) and enforce policies. It can cache content for many clients, reducing bandwidth usage. It can log or filter client traffic. For example, corporate proxies block or cache sites, and tools like **Fiddler** act as local forward proxies for debugging.

- **Forward Proxy Cons:** Adds a point of failure: if the proxy is down, clients lose access. Can increase latency (all traffic is routed through an extra hop). Also, to inspect HTTPS traffic it may need to decrypt and re-encrypt (which can be complex and require trusting the proxy).

- **Reverse Proxy Pros:** _Load balancing and security._ It can distribute incoming load across multiple servers, improving scalability and reliability. It can terminate SSL/TLS (so backend servers don’t need to handle encryption) and filter malicious traffic (acting as a web firewall). It enables “blue/green” or **A/B testing** by routing a percentage of traffic to different server versions. It also centralizes caching and compression to speed up responses.

- **Reverse Proxy Cons:** Also a potential single point of failure: if it crashes, all traffic stops. It adds another layer of configuration complexity (SSL certs, routing rules) and requires maintenance. Misconfiguration could leak internal details or cause bottlenecks. Also, indirect routing might slightly increase latency, though usually it’s negligible.

## Use Cases & Examples

- **Anonymity & Filtering (Proxy):** People use forward proxies to hide their IP (e.g. tunneling through `company-proxy.com` for privacy) or to enforce content rules. Corporate networks often route web traffic through a proxy that **blocks certain sites** and logs requests.

- **Caching (Proxy or Reverse):** A proxy can cache common web resources, serving them instantly to many users. Reverse proxies do similar caching for backend content. Content Delivery Networks (CDNs) like Cloudflare or Fastly are essentially globally distributed reverse proxies that cache web content near users.

- **Monitoring/Logging (Proxy):** In microservice architectures, sidecar proxies (e.g. [Envoy](https://www.envoyproxy.io/)) are used for logging and tracing. Envoy is an L7 proxy designed for modern service meshes. It sits next to each service container and can capture request/response details (like in a service mesh).

- **Debugging Tools (Proxy):** Developer tools like **[Fiddler](https://www.telerik.com/fiddler)** run as forward proxies on your machine. They let you see every HTTP(S) request your browser or app sends. This is incredibly useful for debugging APIs or inspecting web traffic (by decrypting HTTPS).

  &#x20;_Figure: Fiddler (a web debugging proxy) capturing HTTP requests and responses. The left panel lists requests, and the right panel shows details of the selected request. This shows how a proxy intercepts traffic between client and server._

- **Load Balancing (Reverse Proxy):** Common web servers like **[NGINX](https://nginx.org/en/)** or **HAProxy** act as reverse proxies and distribute requests. For example, an API endpoint `api.example.com` might be a reverse proxy that sends requests to `app-server-A` or `app-server-B` in a round-robin fashion.

- **API Gateway & Content Routing:** A reverse proxy can direct different URL paths to different services. For instance, `/api/users` might go to one backend and `/api/orders` to another (often called an **API Gateway** or ingress controller). This is how platforms like Kubernetes use ingress controllers (often NGINX or HAProxy under the hood) to route traffic to the correct microservice.

- **A/B Testing / Canary Releases:** We can have rules like “route 10% of traffic to the new version, 90% to the old” using a reverse proxy. This enables safe rollouts: only a small segment of users sees the new code at first. Once happy, the rule can be changed.

- **SSL Termination & Firewall:** A reverse proxy often handles SSL certificates and inspects traffic. It can add security headers or block bad requests before they reach the real servers.

- **Example Config (NGINX):** A simple reverse proxy in NGINX uses the `proxy_pass` directive. For instance, an NGINX server block might look like this:

  ```nginx
  server {
      listen 80;
      server_name example.com www.example.com;

      location / {
          proxy_pass http://backend_servers;
      }
  }
  ```

  This tells NGINX to listen for requests to `example.com` and forward them to `http://backend_servers`. The `proxy_pass` line is what makes it a reverse proxy. (Nginx also includes headers like `X-Forwarded-For` to pass client info.)

- **Tools:** Popular software that serve as reverse proxies/load balancers include **NGINX** and **HAProxy** (high-performance TCP/HTTP proxy). HAProxy stands for _High Availability Proxy_ and is widely used to scale websites. For debugging/forward proxy use, tools include **Fiddler** and **mitmproxy**, which intercept and display traffic.

## Diagrams & Code Snippets

Here is an **ASCII flow diagram** for a **forward proxy** request:

```
Client (you) --HTTP--> [Forward Proxy] --HTTP--> Server/Internet
(Client requests google.com via proxy; proxy connects to google.com instead of client)
```

And for a **reverse proxy**:

```
Client --HTTP--> [Reverse Proxy] --HTTP--> Backend Server (real server)
(Client thinks proxy is target; proxy forwards to real server hidden from client)
```

These show who connects to whom.

Below is an example NGINX configuration snippet (reverse proxy), as noted above:

```nginx
server {
    listen 80;
    server_name mysite.com;
    location / {
        proxy_pass http://backend_pool;
    }
}
```

This block (from NGINX docs) enables reverse proxying using `proxy_pass`, sending all client requests to the `backend_pool` servers.

## Conclusion

This lecture and my notes helped me sort out the confusion: a **proxy** sits in front of the client (client-focused, often used for anonymity or filtering), while a **reverse proxy** sits in front of servers (server-focused, used for load balancing, routing, and security). Understanding this distinction is fundamental for backend and networking work. In modern architectures with microservices and containers, proxies (especially reverse proxies like **Envoy** or **Nginx**) and sidecar proxies are everywhere in service meshes and APIs. Remembering these basics will help me troubleshoot network setups, use tools like Fiddler for debugging, and configure web services securely. _Knowing that a proxy works “for the client” and a reverse proxy works “for the server” really clarifies their roles_ and ties together many concepts in distributed systems.
