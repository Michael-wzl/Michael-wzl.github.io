---
title: "FRBench"
excerpt: "An easy-to-use, end-to-end differentiable face-recognition benchmark that ships 45+ pretrained weights, covering 25 backbones, 9 loss functions, and 3 training datasets spanning generations from 2015 to 2024. Available on [GitHub](https://github.com/HKU-TASR/FRBench)."
collection: portfolio
---

**FRBench** is an easy-to-use, end-to-end differentiable face-recognition module developed at the [HKU TASR Lab](https://github.com/HKU-TASR). It is designed to serve as a unified benchmark and plug-and-play backbone library for face recognition research and downstream applications (e.g., face privacy protection, adversarial robustness evaluation, and retrieval system testing).

See the [GitHub repo](https://github.com/HKU-TASR/FRBench) for full documentation and usage.

## Highlights

- **45+ pretrained weights** — ready to use out of the box, no manual weight hunting.
- **25 backbones** — from classic lightweight networks to modern large-capacity architectures.
- **9 loss functions** — ArcFace, CosFace, SphereFace, AdaFace, and more.
- **3 training datasets** — spanning a decade of face recognition benchmarks from 2015 to 2024.
- **End-to-end differentiable** — the entire pipeline (preprocessing → backbone → loss head) is differentiable, making FRBench natively compatible with gradient-based attacks, adversarial training, and privacy protection methods such as [Protego](https://arxiv.org/abs/2508.02034).

## Motivation

Most face recognition codebases scatter pretrained weights across different repositories with inconsistent interfaces, making fair cross-model comparison painful. FRBench centralises everything behind a single, consistent API so that:

1. Researchers can **swap backbones and loss functions with one line of code**.
2. Adversarial / privacy-protection methods can **attack or evaluate any model without rewriting the forward pass**.
3. Results are **reproducible** — fixed preprocessing, fixed weight sources, fixed evaluation protocol.

## Design

| Component | Details |
| --- | --- |
| **Backbone zoo** | 25 architectures including IResNet-{18,34,50,100,200}, MobileFaceNet, EfficientNet variants, ViT-based models, and more |
| **Loss heads** | ArcFace · CosFace · SphereFace · AdaFace · MagFace · ElasticFace · CurricularFace · AirFace · CircleLoss |
| **Training sets** | MS1MV2 (2019), WebFace4M (2021), and a 2024-generation large-scale dataset |
| **Evaluation** | LFW · CFP-FP · AgeDB-30 · IJB-B · IJB-C protocols built-in |
| **Differentiability** | Full gradient flow through image normalisation, backbone, and loss head — no NumPy detours |

## Usage

```python
import frbench

# Load a pretrained model in one line
model = frbench.load("iresnet50", loss="arcface", dataset="ms1mv2")
model.eval()

# Forward pass (fully differentiable)
embeddings = model(images)  # images: (B, 3, 112, 112) tensor
```

Gradient-based usage (e.g., for adversarial perturbation):

```python
images.requires_grad_(True)
loss = criterion(model(images), targets)
loss.backward()  # gradients flow all the way back to pixel space
```
