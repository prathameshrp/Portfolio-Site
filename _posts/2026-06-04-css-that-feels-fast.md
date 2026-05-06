---
title: "CSS that feels fast (without any JavaScript)"
date: 2026-06-04 18:30:00 +0530
tags: [Web, CSS, Performance]
excerpt: "Perceived performance is mostly motion and feedback. A few CSS techniques that make an interface feel instant — no framework required."
---

"Fast" is partly a measurement and partly a *feeling*. You can ship a snappy app
and still have it feel sluggish if nothing responds to the user. Here are the
CSS-only tricks I reach for first.

## Animate the cheap properties

The browser can animate `transform` and `opacity` on the GPU without triggering
layout. Animating `width`, `top`, or `margin`? That's a repaint tax on every
frame.

```css
/* smooth — compositor only */
.card { transition: transform .3s cubic-bezier(.22, 1, .36, 1); }
.card:hover { transform: translateY(-6px); }

/* janky — forces layout every frame */
.card-bad { transition: margin-top .3s; }
.card-bad:hover { margin-top: -6px; }
```

## Give instant feedback on interaction

A button that visibly reacts the moment it's pressed feels faster than one that
waits for the network. Reward the click before the work finishes.

```css
.btn { transition: transform .15s ease; }
.btn:active { transform: scale(.97); }
```

## Use skeletons, not spinners

Spinners say "wait." Skeletons say "your content is almost here" — and they hint
at the shape of what's coming, which reduces the perceived wait.

```css
.skeleton::after {
  content: "";
  position: absolute; inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.08), transparent);
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer { 100% { transform: translateX(100%); } }
```

## Respect people who opt out of motion

All of this should bow to user preference. One media query covers it:

```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: .001ms !important; transition-duration: .001ms !important; }
}
```

Speed isn't just milliseconds — it's the conversation your interface has with the
person using it. Make that conversation responsive and the whole thing *feels*
fast.
