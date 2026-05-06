---
layout: default
title: Topics
permalink: /tags/
description: Browse posts by topic.
---

{%- assign all_tags = "" | split: "" -%}
{%- for post in site.posts -%}
  {%- for t in post.tags -%}{%- assign all_tags = all_tags | push: t -%}{%- endfor -%}
{%- endfor -%}
{%- assign all_tags = all_tags | uniq | sort -%}

<section class="page-shell">
  <div class="container container--narrow">
    <header class="page-head reveal">
      <h1 class="page-head__title">Topics</h1>
      <p class="page-head__subtitle">Drop a post into any topic just by adding tags in its front matter — these pages build themselves.</p>
    </header>

    <div class="tag-cloud reveal">
      {%- for t in all_tags -%}
        <a class="chip" href="#{{ t | slugify }}">{% include icon.html name="tag" %} {{ t }}</a>
      {%- endfor -%}
    </div>

    <div class="tag-archive">
      {%- for t in all_tags -%}
        <section class="tag-group reveal" id="{{ t | slugify }}">
          <div class="tag-group__head">
            <span class="tag-group__name">{{ t }}</span>
            {%- assign count = 0 -%}
            {%- for post in site.posts -%}{%- if post.tags contains t -%}{%- assign count = count | plus: 1 -%}{%- endif -%}{%- endfor -%}
            <span class="tag-group__count">{{ count }} post{% if count != 1 %}s{% endif %}</span>
          </div>
          <div class="tag-list">
            {%- for post in site.posts -%}
              {%- if post.tags contains t -%}
                <a class="tag-list__item" href="{{ post.url | relative_url }}">
                  <span class="tag-list__date">{{ post.date | date: "%b %-d, %Y" }}</span>
                  <span class="tag-list__title">{{ post.title }}</span>
                </a>
              {%- endif -%}
            {%- endfor -%}
          </div>
        </section>
      {%- endfor -%}
    </div>
  </div>
</section>
