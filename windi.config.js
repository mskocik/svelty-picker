import typhography from 'windicss/plugin/typography'

export default {
  darkMode: 'class',
  plugins: [typhography({ dark: true })],
  analyze: {
    server: {
      port: 4444,
      open: true
    }
  }
}