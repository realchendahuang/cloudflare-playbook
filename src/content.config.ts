import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

// Starlight 使用 docs 集合读取 src/content/docs 下的 Markdown 和 MDX 页面。
export const collections = {
	docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
};
