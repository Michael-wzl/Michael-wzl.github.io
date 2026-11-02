---
title: "AFRBench / AFRLib"
excerpt: "An open-source benchmark and library for anti-facial-recognition research: 26 method implementations, 24 benchmarked methods, and retrieval evaluation with 22.8 million distractor faces."
collection: portfolio
permalink: /portfolio/afrbench/
---

**AFRBench** evaluates privacy protection methods against face-recognition-based image retrieval. **AFRLib** brings these methods behind shared interfaces so researchers can train, protect images, and evaluate them through a common workflow.

The two components serve different roles:

- **AFRLib:** 26 anti-facial-recognition method implementations with consistent interfaces.
- **AFRBench:** a common retrieval evaluation protocol for 24 methods, with support for the 45+ models supplied by FRBench.
- **Evaluation data:** 5,000 photos of 50 protectees, with 22.8 million distractor faces for large-scale retrieval evaluation.
- **AFRBench-DF:** a complementary dataset derived from DeeperForensics source videos for studying pose and expression variation.

The public release includes configuration-based experiment workflows, dataset preparation tools, and documentation for extending the library. FR models are supplied by [FRBench](https://github.com/HKU-TASR/FRBench).

The first public release, [v1.0.0](https://github.com/HKU-TASR/AFRBench/releases/tag/v1.0.0), was published on 2 October 2026. See the [repository and documentation](https://github.com/HKU-TASR/AFRBench) for the current scope and release roadmap.
