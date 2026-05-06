source "https://rubygems.org"

# Core — Jekyll 4 (built via GitHub Actions, not the legacy github-pages gem)
gem "jekyll", "~> 4.3.3"

# Plugins
group :jekyll_plugins do
  gem "jekyll-feed", "~> 0.17"
  gem "jekyll-seo-tag", "~> 2.8"
  gem "jekyll-sitemap", "~> 1.4"
end

# Rouge for syntax highlighting (interactive code snippets)
gem "rouge", "~> 4.2"

# Ruby 3.x no longer bundles these stdlib gems — required for `jekyll serve`
gem "webrick", "~> 1.8"
gem "csv", "~> 3.3"
gem "base64", "~> 0.2"
gem "bigdecimal", "~> 3.1"

# Windows / JRuby timezone support
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

gem "wdm", "~> 0.1.0", :install_if => Gem.win_platform?
gem "http_parser.rb", "~> 0.6.0", :platforms => [:jruby]
