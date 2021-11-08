import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import css from 'rollup-plugin-css-only';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';

const isProduction = !process.env.ROLLUP_WATCH;


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
  input: 'index.js',
  output: [
    {
      sourcemap: false,
      format: 'es',
      file: 'dist/svelty-picker.mjs'
    }
  ],
  plugins: [
    svelte({
      emitCss: true
    }),
    css({output: 'svelty-picker.css'}),
    resolve(),

    isProduction && terser()
  ]
}

const component = {
  input: 'component.js',
  output: [
    {
      sourcemap: false,
      format: 'iife',
      name: 'SveltyPicker',
      file: 'dist/svelty-picker-element.js'
    }
  ],
  plugins: [
    svelte({
      emitCss: true
    }),
    css({output: false}),
    resolve(),
    isProduction && terser()
  ]
};

const componentBundle = {
  input: 'component.js',
  output: [
    {
      sourcemap: false,
      format: 'iife',
      name: 'SveltyPicker',
      file: 'dist/svelty-picker-element-bundle.js'
    }
  ],
  plugins: [
    svelte({
      emitCss: false
    }),
    resolve(),
    isProduction && terser()
  ]
};

const docs = {
  input: 'docs/index.js',
  output: [
    {
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
    
    !isProduction && serve(),
    !isProduction && livereload(),

    isProduction && terser()
  ]
}

export default isProduction
  ? [module, component, componentBundle, docs]
  : docs;
