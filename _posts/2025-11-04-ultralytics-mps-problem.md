---
title: "Ultralytics' MPS problem"
date: 2025-11-04
permalink: /posts/2025/11/ultralytics-mps-problem/
tags:
  - Weird MPS Problems
---

You can't really use Ultralytics' pose models (training and inference) on MPS devices. There will be strange results.

Ultralytics' MPS Problem

======
My team member in the HKU Herkules RoboMaster Team recently tried to use Ultralytics' pose models on MPS devices (MacBook Pro with M2 Pro). However, both training and inference produced strange results. According to this [GitHub issue](https://github.com/ultralytics/ultralytics/issues/4031), it seems to be MPS-related. I suspect that it has something to do with MPS's poor support for non-contiguous tensors. That happened to me before when indexing non-contiguous tensors on MPS devices (I tried to stick an image tensor into a larger blank tensor, and the result was all zeros somehow. I had to use `.contiguous()` on all related Tensors.).
