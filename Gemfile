source 'https://rubygems.org'

# 使用 GitHub Pages 官方推荐的 meta gem，它内部已经固定（锁定）了 jekyll 及常用插件版本：
# jekyll, jekyll-feed, jekyll-sitemap, jekyll-redirect-from, jemoji 等。
# 单独再声明这些插件会迫使 Bundler 去解析最新版本，可能与 meta gem 的锁定矩阵冲突，
# 并触发更高 Ruby 版本 / nokogiri 版本的需求，造成你看到的 nokogiri/Ruby 冲突错误。
gem 'github-pages', group: :jekyll_plugins

group :jekyll_plugins do
  # Ruby 3 之后本地 `jekyll serve` 需要显式添加 webrick
  gem 'webrick', '~> 1.8'
  # 如需额外插件（不在 github-pages meta gem 中）可在此继续追加。
end

gem 'connection_pool', '2.5.0'
