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

    <div class="project-grid">
      {%- assign projects = site.projects | sort: "order" -%}
      {%- for project in projects -%}
        {% include project-card.html project=project index=forloop.index %}
      {%- endfor -%}
    </div>
  </div>
</section>
