---
layout: archive
title: "Sitemap"
permalink: /sitemap/
author_profile: true
---

{% include base_path %}

A list of all the posts and pages found on the site. For you robots out there, there is an [XML version]({{ base_path }}/sitemap.xml) available for digesting as well.

<h2>Pages</h2>
{% for post in site.pages %}
  {% unless post.sitemap == false %}
    {% include archive-single.html %}
  {% endunless %}
{% endfor %}

<h2>Posts</h2>
{% for post in site.posts %}
  {% include archive-single.html %}
{% endfor %}

{% for collection in site.collections %}
  {% unless collection.output == false or collection.label == "posts" or collection.docs == empty %}
    <h2>{{ collection.label }}</h2>
    {% for post in collection.docs %}
      {% unless post.sitemap == false %}
        {% include archive-single.html %}
      {% endunless %}
    {% endfor %}
  {% endunless %}
{% endfor %}
