# Auto-generate a social/OG card (1200x630 SVG) for every post, and point
# each post's SEO image at the PNG that CI renders from it.
#
# Local builds emit the .svg; the deploy workflow converts svg -> png with
# librsvg so social scrapers get a real raster image.
module OgImages
  BRAND_GRAD_A = "#7c5cff".freeze
  BRAND_GRAD_B = "#22d3ee".freeze
  ACCENT_PINK  = "#f472b6".freeze

  class Generator < Jekyll::Generator
    safe true
    priority :low

    def generate(site)
      brand = site.config["title"] || "Blog"
      site.posts.docs.each do |post|
        slug = Jekyll::Utils.slugify(post.data["slug"] || File.basename(post.path, ".*"))
        rel  = "assets/og/#{slug}.svg"

        svg = render_card(
          title: post.data["title"].to_s,
          tags:  Array(post.data["tags"]),
          date:  post.data["date"] ? post.data["date"].strftime("%b %-d, %Y") : "",
          brand: brand
        )

        page = Jekyll::PageWithoutAFile.new(site, site.source, "assets/og", "#{slug}.svg")
        page.content = svg
        page.data["layout"] = nil
        page.data["sitemap"] = false
        page.output = svg
        site.pages << page

        # SEO image -> PNG produced by CI (falls back to svg if you prefer)
        post.data["image"] ||= "/assets/og/#{slug}.png"
      end
    end

    private

    def esc(s)
      s.to_s.gsub("&", "&amp;").gsub("<", "&lt;").gsub(">", "&gt;")
    end

    # naive word-wrap into <= max_chars lines (max_lines)
    def wrap(text, max_chars, max_lines)
      words = text.split(/\s+/)
      lines = []
      line = ""
      words.each do |w|
        candidate = line.empty? ? w : "#{line} #{w}"
        if candidate.length > max_chars && !line.empty?
          lines << line
          line = w
        else
          line = candidate
        end
      end
      lines << line unless line.empty?
      if lines.length > max_lines
        lines = lines[0...max_lines]
        lines[-1] = lines[-1][0...(max_chars - 1)] + "…"
      end
      lines
    end

    def render_card(title:, tags:, date:, brand:)
      lines = wrap(title, 22, 4)
      line_height = 78
      start_y = 300 - ((lines.length - 1) * line_height / 2)
      title_tspans = lines.each_with_index.map do |ln, i|
        %(<tspan x="90" y="#{start_y + i * line_height}">#{esc(ln)}</tspan>)
      end.join

      tag_text = tags.first(4).map { |t| "##{t}" }.join("   ")

      # a few decorative "constellation" stars
      stars = 14.times.map do |i|
        cx = 760 + (i * 53) % 380
        cy = 90 + (i * 97) % 460
        r  = 2 + (i % 3)
        op = 0.25 + (i % 4) * 0.12
        %(<circle cx="#{cx}" cy="#{cy}" r="#{r}" fill="##{i.even? ? '7c5cff' : '22d3ee'}" opacity="#{op}"/>)
      end.join
      edges = %(
        <line x1="813" y1="187" x2="866" y2="284" stroke="#22d3ee" stroke-width="1" opacity="0.3"/>
        <line x1="866" y1="284" x2="972" y2="187" stroke="#7c5cff" stroke-width="1" opacity="0.3"/>
        <line x1="972" y1="187" x2="1025" y2="381" stroke="#7c5cff" stroke-width="1" opacity="0.25"/>
      )

      <<~SVG
        <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#0a0a12"/>
              <stop offset="1" stop-color="#11111d"/>
            </linearGradient>
            <linearGradient id="brandgrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stop-color="#{BRAND_GRAD_A}"/>
              <stop offset="1" stop-color="#{BRAND_GRAD_B}"/>
            </linearGradient>
            <radialGradient id="glow1" cx="0.15" cy="0.1" r="0.6">
              <stop offset="0" stop-color="#{BRAND_GRAD_A}" stop-opacity="0.35"/>
              <stop offset="1" stop-color="#{BRAND_GRAD_A}" stop-opacity="0"/>
            </radialGradient>
            <radialGradient id="glow2" cx="0.95" cy="0.95" r="0.6">
              <stop offset="0" stop-color="#{ACCENT_PINK}" stop-opacity="0.30"/>
              <stop offset="1" stop-color="#{ACCENT_PINK}" stop-opacity="0"/>
            </radialGradient>
          </defs>

          <rect width="1200" height="630" fill="url(#bg)"/>
          <rect width="1200" height="630" fill="url(#glow1)"/>
          <rect width="1200" height="630" fill="url(#glow2)"/>
          #{edges}
          #{stars}
          <rect x="0" y="0" width="1200" height="8" fill="url(#brandgrad)"/>

          <text x="90" y="110" font-family="'JetBrains Mono', monospace" font-size="30" font-weight="700" fill="url(#brandgrad)">&lt;/&gt; #{esc(brand)}</text>

          <text font-family="'Space Grotesk','Helvetica Neue',Arial,sans-serif" font-size="64" font-weight="700" fill="#ecedf6" letter-spacing="-1">
            #{title_tspans}
          </text>

          <text x="90" y="560" font-family="'JetBrains Mono', monospace" font-size="26" fill="#22d3ee">#{esc(tag_text)}</text>
          <text x="1110" y="560" text-anchor="end" font-family="'JetBrains Mono', monospace" font-size="24" fill="#7a7d96">#{esc(date)}</text>
        </svg>
      SVG
    end
  end
end
