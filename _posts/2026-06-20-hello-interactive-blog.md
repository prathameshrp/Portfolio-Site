---
title: "Building a blog where the code actually runs"
date: 2026-06-20 10:00:00 +0530
tags: [Web, JavaScript, Jekyll]
excerpt: "Most dev blogs show you code. This one lets you run it. Here's the why and the how behind the interactive playgrounds on this site."
---

Reading code is fine. *Running* it is better. When you can tweak a value and
immediately see what changes, the idea sticks. That's the whole reason this blog
ships with **runnable code playgrounds** baked into the posts.

Here's one right now — edit it and hit **Run** (or press `Cmd/Ctrl + Enter`):

{% capture demo_intro %}
const greet = (name) => `Hello, ${name}!`;

console.log(greet("world"));
console.log(greet("interactive blog"));

// try returning a value too:
[1, 2, 3].map(n => n * n);
{% endcapture %}
{% include playground.html title="Edit me and run" code=demo_intro %}

## How publishing works

There's no CMS and no dashboard. A post is a file; shipping it is a `git push`.
The diagram below draws itself as you reach it:

{% include diagram-pipeline.html %}

## How the playground works

Each playground is a textarea wired to a tiny runtime. When you click run, the
code executes and any `console.log` output — plus the final returned value — is
captured and printed below. No build step, no server round-trip.

The author side is dead simple. In a Markdown post you write:

```liquid
{% raw %}{% capture demo %}
console.log("hi from a post");
{% endcapture %}
{% include playground.html title="My demo" code=demo %}{% endraw %}
```

## Regular code blocks still shine

Not everything needs to be runnable. Normal fenced blocks get syntax
highlighting, a filename bar, and a one-click copy button:

```python
def fib(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a

print([fib(i) for i in range(10)])
```

## A second playground, because why not

Let's do something with a tiny bit more logic — a debounce helper:

{% capture demo_debounce %}
function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

let calls = 0;
const log = debounce(() => console.log("fired after quiet period"), 100);

// call it rapidly — only the last one should fire
log(); log(); log();
console.log("scheduled " + (++calls) + " burst");
{% endcapture %}
{% include playground.html title="Debounce in action" code=demo_debounce %}

> Tip: every post is just a Markdown file in `_posts/`. Drop one in, push, and
> the GitHub Actions pipeline publishes it. That's the entire workflow.

Go ahead — break something in the playgrounds above. That's what they're for.
