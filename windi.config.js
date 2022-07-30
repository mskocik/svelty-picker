import typhography from 'windicss/plugin/typography'
import plugin from 'windicss/plugin'

export default {
  darkMode: 'class',
  plugins: [typhography({ dark: true }),
    plugin(({ addBase, addComponents }) => {
      addBase({
        'h2': {
          color: '#286090',
          fontWeight: 'bold',
          fontSize: '24px',
          marginBottom: '16px'
        },
        'h3': {
          color: '#286090',
          fontWeight: 'bold',
          fontSize: '20px',
          marginBottom: '16px'
        },
        '.dark h2': {
          color: '#2c6a9f',
          fontWeight: 'bold',
          fontSize: '24px',
          marginBottom: '16px'
        },
        '.dark h3': {
          color: '#2c6a9f',
          fontWeight: 'bold',
          fontSize: '20px',
          marginBottom: '16px'
        },
        'a:not(.nav)': {
          color: '#286090',
          textDecoration: 'underline',
          '&:hover': {
            color: '#3b82f6',
            textDecoration: 'none'
          }
        },
        '.dark a:not(.nav)': {
          color: '#2c6a9f'
        }
      });
      addComponents({
        '.nav': {
          textDecoration: 'none',
          '&.active': {
            color: '#286090',
            fontWeight: '500'
          },
          '.dark &.active': {
            color: '#2c6a9f'
          }
        },
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