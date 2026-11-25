import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { projects, writing, photos, sites } from './content.mjs';

const local = path => new URL(path, import.meta.url);
const page = readFileSync(local('./index.html'), 'utf8');
assert.equal(readFileSync(local('./CNAME'), 'utf8').trim(), '1.hachile.org');
for (const { title } of [...projects, ...writing, ...photos]) assert.ok(page.includes(title), title);
for (const { links } of sites) {
  for (const { href } of links) assert.ok(page.includes('href="' + href + '"'), href);
}
for (const [, path] of page.matchAll(/(?:src|href)="(\.\/[^"]+)"/g)) {
  assert.ok(existsSync(local(path)), '缺少本地资源 ' + path);
}
for (const [, anchor] of page.matchAll(/href="#([^"]+)"/g)) {
  assert.ok(page.includes('id="' + anchor + '"'), '缺少锚点 ' + anchor);
}
console.log('项目、文章、画廊、站点入口、本地资源和页内链接检查通过。');
