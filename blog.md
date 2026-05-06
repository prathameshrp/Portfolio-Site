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
      <p class="page-head__subtitle">Notes on building software — systems, performance, developer experience, and the occasional deep dive with runnable code.</p>
    </header>

    <div class="blog-controls reveal">
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

    <div class="card-grid" data-blog-grid>
      {%- for post in site.posts -%}
        {% include post-card.html post=post %}
      {%- endfor -%}
    </div>

    <p class="blog-empty" data-blog-empty>No articles match your search. Try another keyword.</p>
  </div>
</section>
