import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import css from 'rollup-plugin-css-only';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;


function serve() {
	let server;
	
	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true
			});

			process.on('SIGTERM', toExit);
			process.on('exit', toExit);
		}
	};
}

const module = {
  input: 'docs/index.js',
  output: [
    {
      sourcemap: false,
      format: 'es',
      file: 'docs/datepicker.mjs'
    },{
      sourcemap: false,
      format: 'iife',
      file: 'docs/datepicker.js'
    },
  ],
  plugins: [
    svelte({
      // Warnings are normally passed straight to Rollup. You can
      // optionally handle them here, for example to squelch
      // warnings with a particular code
      onwarn: (warning, handler) => {
        // e.g. don't warn on <marquee> elements, cos they're cool
        if (warning.code === 'module-script-reactive-declaration') return;

        // let Rollup handle all other warnings normally
        handler(warning);
      }
    }),
    css({output: 'datepicker.css'}),
    resolve(),
    
    !production && serve(),
    !production && livereload(),

    production && terser()
  ]
}

export default module;
