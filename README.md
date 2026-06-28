# B-logs by Prathamesh — developer blog site

Live at: **https://prathameshrp.github.io/developer-site/**

---

## Writing posts reference for later -
1. Create a Markdown file in `_posts/` named `YYYY-MM-DD-your-title.md`.
2. front matter format:

   ```yaml
   ---
   title: "Your post title"
   date: 2026-06-25 10:00:00 +0530
   tags: [Web, JavaScript]      # used for filtering + the /tags/ page
   excerpt: "One-line summary shown on cards and previews."
   cover: /assets/img/your-cover.jpg   # optional; omit for an auto gradient
   ---
   ```


### code playground

```liquid
{% capture demo %}
console.log("hello from the browser");
[1, 2, 3].map(n => n * 2);
{% endcapture %}
{% include playground.html title="Try it" code=demo %}
```

---
### Run Locally

```bash
bundle install              # one-time
bundle exec jekyll serve    # http://localhost:4000/developer-site/
```

Live reload while editing:

```bash
bundle exec jekyll serve --livereload
```

---

## 🗂 Project structure

```
_config.yml              Site config (title, baseurl, plugins)
_data/                   Editable content (nav, social, home page)
  navigation.yml         Navbar links
  social.yml             Footer/contact social links
  home.yml               Hero text, stats, tech stack
_layouts/                Page templates (home, post, project, page, default)
_includes/               Reusable partials (navbar, footer, cards, playground…)
_posts/                  ← Blog posts go here
_projects/               Project collection entries
assets/
  css/                   SCSS design system (base / components / layouts)
  js/modules/            Theme, navbar, animation, search, code, skeleton
  img/                   Images & favicon
.github/workflows/       CI (PR build check) + Deploy (Pages)
```

## Customizing

- **Colors / theme:** `assets/css/base/variables.scss`
- **Navbar links:** `_data/navigation.yml`
- **Social links:** `_data/social.yml`
- **Home hero / stats / stack:** `_data/home.yml`
- **Contact form:** set a [Formspree](https://formspree.io) ID in `contact.md`
  front matter (`form_id`); leave blank to show a `mailto:` link instead.
