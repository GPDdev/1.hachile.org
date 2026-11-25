import { writeFileSync } from 'node:fs';
import { projects, writing, photos, sites } from './content.mjs';

const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const arrow = '<span class="arrow" aria-hidden="true">↗</span>';
const mark = '<span class="mark" aria-hidden="true">1</span>';
const link = (url, label) => `<a class="text-link" href="${escape(url)}">${escape(label)} ${arrow}</a>`;
const labels = {robot: 'Embodied AI', dendrite: 'Image analysis', metro: 'Transit planning', journal: 'Android'};

const cards = projects.map(p => `<article class="work-card" data-category="${escape(p.category)}">
  <a href="${escape(p.href)}"><div class="cover"><img src="./assets/${escape(p.kind)}.webp" width="840" height="400" loading="lazy" alt=""></div>
  <div class="work-meta"><span>${escape(p.category)}</span><span lang="en">${escape(labels[p.kind])}</span></div>
  <h3>${escape(p.title)} ${arrow}</h3><p>${escape(p.summary)}</p></a></article>`).join('\n');
const entries = writing.map(w => `<a class="entry" href="${escape(w.href)}">
  <time datetime="${escape(w.date)}">${escape(w.date.replaceAll('-', '.'))}</time>
  <h3>${escape(w.title)}</h3><span class="entry-topic">${escape(w.category)}</span>${arrow}</a>`).join('\n');
const plates = photos.map(p => `<figure><a href="${escape(p.href)}"><div class="photo"><img src="${escape(p.src)}" loading="lazy" decoding="async" alt="${escape(p.title)}"></div>
  <figcaption>${escape(p.title)} ${arrow}</figcaption></a></figure>`).join('\n');
const directory = sites.map(g => `<section class="site-group"><h3>${escape(g.title)}</h3><ul>${g.links.map(s => `<li>
  <a href="${escape(s.href)}"><strong>${escape(s.name)}</strong>${arrow}<small>${escape(s.description)}</small></a></li>`).join('')}</ul></section>`).join('\n');
const page = `<!doctype html>
<html lang="zh-CN"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#f8f8f4">
<title>Gunpowder Lab | 个人实验室</title>
<meta name="description" content="Gunpowder 的个人实验室。从同济的机器人研究、开发项目，到写作、图像与社群。">
<link rel="canonical" href="https://1.hachile.org/"><link rel="icon" href="./assets/icon.png">
<meta property="og:title" content="Gunpowder Lab | 个人实验室"><meta property="og:type" content="website"><meta property="og:url" content="https://1.hachile.org/">
<link rel="stylesheet" href="./assets/lab.css"><script defer src="./assets/sculpture.js"></script><script defer src="./assets/lab.js"></script>
</head><body id="top">
<a class="skip" href="#main">跳到正文</a>
<header class="topbar"><div class="wrap bar-inner"><a class="brand" href="#top">${mark}<span>Gunpowder Lab</span></a>
<nav aria-label="主导航"><a href="#work">作品</a><a href="#writing">手记</a><a href="#network">站点</a><a href="#about">关于</a></nav>
<a class="github" href="https://github.com/GPDdev">GitHub ${arrow}</a></div></header>
<main id="main">
<section class="hero wrap" aria-labelledby="hero-title"><div class="intro">
<div class="eyebrow"><i class="status-dot"></i>PERSONAL LAB <span>/</span> 上海</div>
<h1 id="hero-title"><span>Gunpowder</span><em lang="en">Lab.</em></h1>
<p>我是 Gunpowder，同济大学机器人专业本科生。<br class="wide-only">这里收藏我的研究、代码，以及屏幕之外的创作。</p>
<div class="actions"><a class="button" href="#work">探索作品 <span aria-hidden="true">↓</span></a><a class="secondary" href="#about">认识我</a></div>
</div>
<figure class="instrument"><div class="instrument-info"><span class="mono">FIG. 01</span><span class="model-label">三维模型</span></div>
<div class="stage"><img class="fallback" src="./assets/trefoil.webp" alt="" width="800" height="480"><canvas id="specimen" tabindex="0" aria-label="三叶结模型，拖动或使用方向键旋转"></canvas></div>
<figcaption><div><span class="target" aria-hidden="true">⊙</span> <strong>三叶结</strong> <i lang="en">Trefoil knot</i></div>
<button type="button" id="motion-toggle" aria-pressed="false" hidden>暂停旋转</button></figcaption></figure>
</section>

<section class="wrap chapter work" id="work" aria-labelledby="work-title">
<div class="section-head"><div><div class="eyebrow">SELECTED WORK</div><h2 id="work-title">精选作品<span class="period">.</span></h2></div>
<div class="filters" aria-label="筛选作品" role="group" hidden><button type="button" aria-pressed="true" data-filter="全部">全部</button><button type="button" aria-pressed="false" data-filter="研究">研究</button><button type="button" aria-pressed="false" data-filter="开发">开发</button></div></div>
<div class="work-grid">${cards}</div></section>

<section class="wrap chapter" id="writing" aria-labelledby="writing-title">
<div class="section-head"><div><div class="eyebrow">FIELD NOTES</div><h2 id="writing-title">文章与手记<span class="period">.</span></h2></div>${link('https://blog.hachile.org/', '全部文章')}</div>
<div class="entries">${entries}</div></section>

<section class="wrap chapter" id="gallery" aria-labelledby="gallery-title"><div class="section-head"><div>
<div class="eyebrow">VISUAL ARCHIVE</div><h2 id="gallery-title">视觉手稿<span class="period">.</span></h2></div>${link('https://gallery.hachile.org/', '进入画廊')}</div>
<div class="gallery-grid">${plates}</div></section>

<section class="network" id="network" aria-labelledby="network-title"><div class="wrap chapter"><div class="section-head">
<div><div class="eyebrow">HACHILE NETWORK</div><h2 id="network-title">个人站点<span class="period">.</span></h2></div>${link('https://site.hachile.org/', '完整站点目录')}</div>
<div class="directory">${directory}</div></div></section>
</main>
<footer id="about"><div class="wrap"><div class="about-grid"><div><div class="eyebrow">ABOUT ME</div><h2>你好，我是<br><em>Gunpowder.</em></h2></div>
<div class="about-copy"><p>我在同济大学国豪书院未来技术班学习机器人，关注具身智能和世界模型。从 OI 到机器人，我一直喜欢把想法做成可以运行的东西。</p>
<p>Gunpowder 这个网名从 2020 年用到现在。除了写代码，我也画画、写文章，运营着 100 多个网络社群。</p>
<div class="about-links">${link('https://home.hachile.org/#contact', '联系我')}${link('https://terminal.hachile.org/', 'Terminal Me')}</div></div></div>
<div class="footer-line"><div class="brand">${mark}<span>Gunpowder Lab</span></div><span>© 2026 GPDdev</span><a href="#top">回到顶部 ↑</a></div></div></footer>
</body></html>\n`;
writeFileSync(new URL('./index.html', import.meta.url), page);
