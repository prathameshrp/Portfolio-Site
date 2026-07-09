---
layout: default
title: Blog
permalink: /blog/
description: Articles on software engineering, systems design, and web development.
---

{%- comment -%} Collect all tags for the filter bar {%- endcomment -%}
{%- assign all_tags = "" | split: "" -%}
{%- for post in site.posts -%}
  {%- for t in post.tags -%}
    {%- assign all_tags = all_tags | push: t -%}
  {%- endfor -%}
{%- endfor -%}
{%- assign all_tags = all_tags | uniq | sort -%}

<section class="page-shell">
  <div class="container">
    <header class="page-head reveal">
      <h1 class="page-head__title">The Blog</h1>
      <p class="page-head__subtitle">Notes on building software, systems, performance, developer experience, and the occasional deep dive with runnable code.</p>
    </header>
    <!-- CLI launch prompt on top of the terminal frame -->
    <div style="margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem; font-family: var(--font-mono); font-size: 0.82rem; color: var(--text-soft);" class="reveal">
      <span style="color: var(--jinx);">~$</span>
      <span>ls -la posts/</span>
      <span style="display: inline-block; width: 6px; height: 12px; background: var(--powder); margin-left: 0.25rem;" class="animate-flicker"></span>
    </div>

    <div style="position: relative; width: 100%;" class="reveal">
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
          <div class="terminal-title">prathameshrp@devlog:~/blog</div>
        </div>
        <div class="terminal-body" style="padding: 1.5rem 1.75rem;">

          <div class="blog-controls" style="margin-bottom: 2rem;">
            <label class="blog-search">
              {% include icon.html name="search" %}
              <input type="text" data-blog-search placeholder="Search articles..." aria-label="Search articles">
            </label>
            <div class="blog-filters">
              <button class="filter-btn is-active" data-filter="all">All</button>
              {%- for t in all_tags -%}
                <button class="filter-btn" data-filter="{{ t | downcase }}">{{ t }}</button>
              {%- endfor -%}
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0;" data-blog-grid>
            {%- for post in site.posts -%}
              {% include post-card.html post=post %}
            {%- endfor -%}
          </div>

          <p class="blog-empty" data-blog-empty>
            No articles match your search. Try another keyword.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>
