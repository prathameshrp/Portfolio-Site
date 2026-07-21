---
title: Project RAPHAEL
description: Real-time Agentic Desktop Focus Agent featuring an LLM Load Balancer, fast regex pre-filtering, and a KDE Plasma HUD.
order: 1
tech: [Python, GenAI, Groq, Flask, SQLite, QML]
url: https://github.com/prathameshrp/Raphael
url_live: https://0xprathamesh.is-a.dev/posts/introducing-raphael-the-sardonic-adhd-hud/
cover: /assets/img/raphael-hud.png
---

RAPHAEL (Real-time Agentic Process & Human Attention Evaluation Loop) is a background Linux desktop agent and frosted-glass HUD overlay that classifies focus context using an LLM pipeline, calls out distractions, and enforces focus rules.

## Key Technical Highlights

- **Multi-Provider LLM Load Balancer**: Round-robin key rotation across Groq (Llama 3.1 8B), Gemini 1.5 Flash, DeepSeek, and OpenAI with automatic HTTP 429 rate limit failover.
- **Zero Latency Fast Path**: Bypasses network calls for known developer tools (VS Code, terminal, docs) via regex pre-filtering, reducing classification latency to 0ms for 90%+ events.
- **Async Thread Pool**: Offloads LLM requests to background `threading.Thread` worker pools with a thread-safe `window_cache` dictionary, eliminating Linux desktop shell UI stutters.
- **Web Telemetry Dashboard**: Serves real-time focus timelines, top application distribution charts, and dynamic AI coaching insights at `http://localhost:5757/dashboard`.