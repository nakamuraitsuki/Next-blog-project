---
title: 'Unifiedのプラグインで色々したはなし'
date: '2024-12-27'
description: 'Markdownで書いた記事を充実させるべく、Unifiedのプラグインを調べてみる'
---

## 概要
---
MarkdownをHTMLにするためのパーサーは色々あります。

[markdown-it](https://github.com/markdown-it/markdown-it)とか、[marked](https://marked.js.org/)とかとか…

このブログでは [**Unified(remark/rehype)**](https://unifiedjs.com/) を使ってMarkdownをHTMLにしています。

導入理由は、この記事にこれから書くようにプラグインを使っていじいじしてみたかったからです。

いじいじしている間に学んだことをメモしていきます。