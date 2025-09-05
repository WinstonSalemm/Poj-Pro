import React from 'react';
import { JsonLd } from './JsonLd';
import { clean } from './jsonld.schemas';

export type ArticleAuthor = { name: string } | string;

export interface ArticleJsonLdProps {
  headline: string;
  description?: string;
  image?: string[];
  author: ArticleAuthor | ArticleAuthor[];
  datePublished: string; // ISO
  dateModified?: string; // ISO
  mainEntityOfPage: string; // canonical URL
  articleSection?: string; // category/section
  inLanguage?: 'ru' | 'uz' | 'en';
  articleBody?: string;
}

const ArticleJsonLd: React.FC<ArticleJsonLdProps> = (props) => {
  const data = clean({
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: props.mainEntityOfPage,
    headline: props.headline,
    description: props.description,
    image: props.image,
    author: Array.isArray(props.author) ? props.author : [props.author],
    datePublished: props.datePublished,
    dateModified: props.dateModified || props.datePublished,
    articleSection: props.articleSection,
    inLanguage: props.inLanguage,
    articleBody: props.articleBody,
  });

  return <JsonLd data={data} type="Article" />;
};

export default ArticleJsonLd;
