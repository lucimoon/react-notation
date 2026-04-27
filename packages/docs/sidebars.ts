import type { SidebarsConfig } from '@docusaurus/plugin-content-docs'

const sidebars: SidebarsConfig = {
  mainSidebar: [
    'intro',
    'data-model',
    'theming',
    {
      type: 'category',
      label: 'Components',
      items: [
        'components/chord-sheet',
        'components/chord-chart',
        'components/chord-diagram',
        'components/lead-sheet',
        'components/tablature',
        'components/staff-notation',
        'components/player-bar',
        'components/print-view',
        'components/theme-provider',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/getting-started',
        'guides/theming',
      ],
    },
  ],
}

export default sidebars
