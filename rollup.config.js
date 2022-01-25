import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import css from 'rollup-plugin-css-only';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

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
      file: pkg.module
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
      file: pkg.main
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
    svelte(),
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
