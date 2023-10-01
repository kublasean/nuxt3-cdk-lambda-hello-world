// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  typescript: {
    shim: false
  },
  devtools: { enabled: true },
  css: ['~/assets/main.scss'],
  modules: ['@nuxtjs/google-fonts'],
  googleFonts: {
    families: {
      'Nunito+Sans:wght@400;900': true,
      'Syncopate:wght@400;700': true
    },
    display: 'swap'
  },
  nitro: {
    preset: 'aws_lambda',
    logLevel: 1,
    serveStatic: true
  },
  logLevel: 'verbose'
})