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

    <div class="terminal-window" style="height: auto; margin-bottom: 2rem;">
      <div class="terminal-bar">
        <div class="window-dots">
          <div class="window-dot window-dot--red"></div>
          <div class="window-dot window-dot--yellow"></div>
          <div class="window-dot window-dot--green"></div>
        </div>
        <div class="terminal-title">prathameshrp@devlog:~/projects</div>
      </div>
      <div class="terminal-body" style="padding: 1.5rem 1.75rem; font-family: var(--font-mono); font-size: 0.88rem; line-height: 1.6; color: var(--text-soft);">
        <p><span class="t-prompt">~$</span> <span class="t-cmd">ls -la projects/</span></p>
        
        <div class="project-grid" style="margin-top: 1.25rem; font-family: var(--font-sans);">
          {%- assign projects = site.projects | sort: "order" -%}
          {%- for project in projects -%}
            {% include project-card.html project=project index=forloop.index %}
          {%- endfor -%}
        </div>
      </div>
    </div>
  </div>
</section>
