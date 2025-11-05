---
title: "FaceScrub's virus problem"
date: 2025-10-17
permalink: /posts/2025/10/face-scrub-virus-problem/
tags:
  - Lessons learned
---

FaceScrub requires downloading raw images from the links provided in the dataset. However, since FS is quite old, many of the links are broken, with some even leading to Trojan viruses.

FaceScrub's Virus Problem

======
I recently used the links provided in [the FaceScrub dataset](https://malea.winkler.site/facescrub.html) and the code provided in [the link](https://github.com/faceteam/facescrub) to download images for a face recognition project. Unfortunately, some links, named socialitelife.com and clearchannel.com, downloaded Trojan backdoors (fbliker and kryptik). The only fortunate thing is that the university inner web blocked the infected server without causing too much damage.

FaceScrub is a popular dataset for face recognition tasks, but most datasets named FaceScrub on Kaggle include only the metadata files or the cropped images. If you need uncropped images, you have to download them yourself using the provided URLs. However, it has a significant issue: many of the image links are broken as it is an old dataset. Some links are dead, others lead to irrelevant content, and a few point to malicious websites.

So my suggestion is: DO NOT USE your server to scape the net RAW! Use a VM! This will save you much trouble.
