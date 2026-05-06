---
title: "Debugging like a detective, not a guesser"
date: 2026-06-12 09:00:00 +0530
tags: [Engineering, Debugging]
excerpt: "The fastest way to fix a bug is to stop guessing. A simple, repeatable loop for finding root causes instead of chasing symptoms."
---

The difference between an hour-long bug hunt and a five-minute one is rarely
skill — it's **method**. Guessing feels productive but it's a slot machine.
Here's the loop I actually use.

## 1. Reproduce it reliably

If you can't trigger the bug on demand, you can't know when it's fixed. Pin it
down to the smallest set of steps that makes it happen *every time*.

## 2. Form one hypothesis at a time

Write down what you *think* is happening, then design the cheapest possible test
to prove or disprove it. One variable per experiment.

```js
// Don't change three things and re-run. Change one. Observe. Repeat.
console.log("input:", input);
console.log("after parse:", parsed);
console.log("before write:", payload);
```

## 3. Bisect the problem space

Halve the search space each step. Comment out half the pipeline. Still broken?
The bug is in the half that's left. This turns a linear search into a
logarithmic one.

## 4. Read the error. All of it.

Stack traces are a map, not noise. The top frame is where it *blew up*; the bug
often lives a few frames down where the bad value was *created*.

## A mental model

Think of every bug as a contract violation: some function got an input it
promised to handle but didn't. Your job is to find the exact boundary where
reality diverged from the contract — and that boundary is almost always
discoverable, not mysterious.

> Slow is smooth, and smooth is fast. A methodical ten minutes beats a frantic
> hour every single time.
