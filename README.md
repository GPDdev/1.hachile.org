# Gunpowder Lab

[访问个人实验室](https://1.hachile.org/)　 [精选作品](https://1.hachile.org/#work)　 [文章与手记](https://1.hachile.org/#writing)　 [个人站点](https://1.hachile.org/#network)

Gunpowder 在同济学习机器人。在这个实验室里，可以从上海地铁换乘指南一路读到锂枝晶研究，翻阅柏拉图和 Transformer 的笔记，或沿着院徽设计稿进入他的画廊。

<div align="center"><img alt="GitHub Pages" src="https://img.shields.io/badge/hosting-GitHub_Pages-2849cf"> <img alt="无运行时依赖" src="https://img.shields.io/badge/runtime_dependencies-0-2849cf"> <img alt="MIT license" src="https://img.shields.io/badge/code_license-MIT-2849cf"></div>

## 浏览

首页的三叶结可以拖动旋转，也可以用方向键调整视角。可以随时暂停自动旋转，系统启用“减少动态效果”时默认暂停。关闭 JavaScript 仍可查看三叶结静帧、项目、文章、画廊和全部站点链接。

作品可按研究或开发筛选。项目介绍链接到源码或具体研究条目，文章日期与标题链接到博客原文，画廊图片来自 Gallery。个人站点按认识我、研究与开发、文字与图像、社群与身份分组。

## 本地运行

仓库包含生成好的首页。使用 Python 3 在仓库根目录预览。

```sh
python -m http.server 8000
```

打开 <http://localhost:8000/>。编辑项目资料后，用 Node.js 重新生成并检查首页。

```sh
node build.mjs
node check.mjs
```

| 文件 | 用途 |
| --- | --- |
| `content.mjs` | 项目摘要、文章日期和原文链接、画廊、站点目录 |
| `build.mjs` | 将数据生成为完整的静态首页 |
| `assets/lab.css`、`assets/lab.js` | 响应式排版与筛选 |
| `assets/sculpture.js`、`assets/trefoil.webp` | 原创 Canvas 三叶结和同一模型的静帧 |
| `assets/*.webp` | 项目封面为原创示意插画 |

## 发布与授权

GitHub Pages 从 `main` 根目录发布，`CNAME` 指定 `1.hachile.org`。提交内容数据时也要提交最新生成的 `index.html`。

页面编排参考了 [Ansyn Lab](https://github.com/7-an/ansyn-lab) 的个人实验室、作品与写作索引。本站独立实现排版、交互和模型。本站代码使用 [MIT 许可证](LICENSE)。引自其他站点的文章与图像沿用各自来源的署名和授权。
