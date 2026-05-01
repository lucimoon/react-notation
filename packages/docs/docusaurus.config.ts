import type { Config } from '@docusaurus/types'
import type * as Preset from '@docusaurus/preset-classic'

const config: Config = {
  title: 'react-notation',
  tagline: 'React components for rendering music notation',
  favicon: 'img/favicon.ico',
  url: 'https://lucimoon.github.io',
  baseUrl: '/react-notation/',
  organizationName: 'lucimoon',
  projectName: 'react-notation',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  headTags: [
    {
      tagName: 'style',
      attributes: {},
      innerHTML: `@font-face{font-family:'Bravura';src:url('/react-notation/fonts/Bravura.woff2') format('woff2');font-weight:normal;font-style:normal;font-display:block;}`,
    },
  ],
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],
  themeConfig: {
    navbar: {
      title: 'react-notation',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'mainSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://github.com/lucimoon/react-notation',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      copyright: `Copyright © ${new Date().getFullYear()} react-notation contributors.`,
    },
  } satisfies Preset.ThemeConfig,
}

export default config
