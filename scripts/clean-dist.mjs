#!/usr/bin/env node
import { rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

rmSync(resolve(root, 'docs/.vitepress/dist'), { recursive: true, force: true });
// VitePress 会缓存编译后的 SSR bundle。新增/改动带 <script setup> 的页面时，
// 残留缓存会让 Rollup 报 "failed to resolve import vue" 这类误导性错误，
// 所以 build 前一并清掉，保证从干净状态重建。
rmSync(resolve(root, 'docs/.vitepress/cache'), { recursive: true, force: true });
