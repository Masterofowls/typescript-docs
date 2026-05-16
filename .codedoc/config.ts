
import { configuration } from '@codedoc/core';
import { theme } from './theme';


export const config = /*#__PURE__*/configuration({
  theme,

  src: {
    base: 'docs/md',
  },

  dest: {
    html: '.',
    assets: '.',
    bundle: 'docs/assets',
    styles: 'docs/styles',
    namespace: '/typescript-docs',
  },

  page: {
    title: {
      base: 'TypeScript: Beginner to Pro',
    },
    favicon: '/typescript-docs/favicon.ico',
    meta: {
      subject: 'Advanced TypeScript Documentation',
      description: 'Comprehensive TypeScript guide covering types, interfaces, classes, generics, decorators, Express routes, REST APIs, and Jest testing.',
      keywords: ['typescript', 'javascript', 'types', 'interfaces', 'generics', 'express', 'jest', 'api'],
    },
  },

  misc: {
    github: {
      user: 'Masterofowls',
      repo: 'typescript-docs',
    },
  },
});
