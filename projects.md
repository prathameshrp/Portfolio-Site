---
layout: default
title: Projects
permalink: /projects/
description: A selection of things I've designed, built, and shipped.
---

<section class="page-shell">
  <div class="container">
    <header class="page-head reveal">
      <h1 class="page-head__title">Projects</h1>
      <p class="page-head__subtitle">A selection of things I've designed, built, and shipped — from developer tooling to full products.</p>
    </header>
    <!-- CLI launch prompt on top of the terminal frame -->
    <div style="margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem; font-family: var(--font-mono); font-size: 0.82rem; color: var(--text-soft);" class="reveal">
      <span style="color: var(--jinx);">~$</span>
      <span>ls -la projects/</span>
      <span style="display: inline-block; width: 6px; height: 12px; background: var(--powder); margin-left: 0.25rem;" class="animate-flicker"></span>
    </div>

    <div style="position: relative; width: 100%;">
      <!-- Depth plates -->
      <div style="position: absolute; inset: 0; transform: translate(8px, 8px); border: 1px solid color-mix(in oklab, var(--jinx) 50%, transparent); pointer-events: none; z-index: 0;"></div>
      <div style="position: absolute; inset: 0; transform: translate(4px, 4px); border: 1px solid color-mix(in oklab, var(--teal) 40%, transparent); pointer-events: none; z-index: 0;"></div>

      <div class="terminal-window" style="position: relative; z-index: 1; height: auto; margin-bottom: 2rem; background: var(--card); border: 1px solid var(--border);">
        <div class="terminal-bar">
          <div class="window-dots">
            <div class="window-dot window-dot--red"></div>
            <div class="window-dot window-dot--yellow"></div>
            <div class="window-dot window-dot--green"></div>
          </div>
          <div class="terminal-title">prathameshrp@devlog:~/projects</div>
        </div>
        <div class="terminal-body" style="padding: 1.5rem 1.75rem; font-family: var(--font-mono); font-size: 0.88rem; line-height: 1.6; color: var(--text-soft);">
          
          <div class="project-grid" style="margin-top: 1.25rem; font-family: var(--font-sans);">
            {%- assign projects = site.projects | sort: "order" -%}
            {%- for project in projects -%}
              {% include project-card.html project=project index=forloop.index %}
            {%- endfor -%}
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
