import typhography from 'windicss/plugin/typography'
import plugin from 'windicss/plugin'

export default {
  darkMode: 'class',
  plugins: [typhography({ dark: true }),
    plugin(({ addBase, addComponents }) => {
      addBase({
        'h2': {
          color: 'rgb(29, 78, 216)',
          fontWeight: 'bold',
          fontSize: '24px',
          marginBottom: '16px'
        },
        'h3': {
          color: 'rgb(29, 78, 216)',
          fontWeight: 'bold',
          fontSize: '20px',
          marginBottom: '16px'
        }
      });
      addComponents({
        '.table': {
          '& table': {
            border: '1px solid #ccc',
            borderCollapse: 'collapse',
            'tr:nth-child(2n)': {
              backgroundColor: '#f5f5f5'
            }
          },
          '& tr': {
            border: '1px solid #ccc',
            borderCollapse: 'collapse'
          },
          '& th': {
            padding: '4px',
            textAlign: 'left'
          },
          '& td': {
            padding: '4px',
            textAlign: 'left'
          }
        }
      });
    })
  ]
}