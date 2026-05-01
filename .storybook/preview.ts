import type { Preview } from '@storybook/react'
import '../packages/core/src/fonts/music-font.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
