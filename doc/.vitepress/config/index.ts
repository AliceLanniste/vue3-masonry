import { defineConfig } from 'vitepress'
import  { zh } from './zh';
import  { en } from './en';
import { fileURLToPath} from 'node:url'
// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "vue3-Masonry",
  description: "a component for masonry layout",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' }
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  },
  locales: {
    root: {label:'中文', ...zh},
    en: { label: 'English', ...en },
  },
  vite:{
    resolve:{
      alias: {
        // 'Masonry':fileURLToPath(
        //   //  new URL
        // )
      }
    }
  }
})
