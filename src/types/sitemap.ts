import type { MetadataRoute } from 'next';

export type SitemapEntry = MetadataRoute.Sitemap[number];

export type ChangeFrequency = NonNullable<SitemapEntry['changeFrequency']>;

export type StaticRouteConfig = {
  path: string;
  priority: number;
  changeFrequency?: ChangeFrequency;
  images?: string[];
};
