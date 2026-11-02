---
title: "Veilgate"
excerpt: "A local prototype for filtering private information from school email. Combines on-device OCR, rules, and a local language model to prepare redacted text for online assistants."
collection: portfolio
permalink: /portfolio/veilgate/
selected_order: 4
selected_description: "A local prototype for filtering private information from school email. Combines on-device OCR, rules, and a local language model to prepare redacted text for online assistants."
selected_kind: "Personal prototype · Local OCR / language models"
codeurl: "https://github.com/Michael-wzl/Veilgate"
---

**Veilgate** is a local prototype for filtering private information from school email before sharing selected text with an online assistant.

The workflow combines on-device OCR for printed text in image attachments, local rules for obvious identifiers and secrets, and a local language model to identify other private passages. Users paste a message or open an `.eml` file, review the filtered text, and choose what to share.

The tool is experimental and does not provide a general privacy guarantee. See the [GitHub repository](https://github.com/Michael-wzl/Veilgate) for its current scope, supported inputs, and evaluation limitations.
