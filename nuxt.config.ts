// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],
  plugins: [
    '~/plugins/vuex.ts', // Ensure Vuex is registered as a plugin
  ],
  app: {
    head: {
      title: "Users Crud",
    },
  },
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.js',
    exposeConfig: false,
    injectPosition: 0,
    viewer: true,
  },
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true }
})
