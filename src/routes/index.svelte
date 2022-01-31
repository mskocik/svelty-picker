<script lang="ts">
	import { joinClasses, copy } from '$lib/internal';
	// import { SveltyPicker } from '$lib';

	let btn: string =
		'rounded cursor-pointer select-none text-sm font-medium inline-flex items-center justify-center px-4 py-2 text-gray-200 rounded cursor-pointer select-none text-sm font-medium inline-flex items-center justify-center px-4 py-2 text-gray-200';

	let primary: string =
		'bg-orange-400 border border-orange-400 hover:bg-orange-500 focus:bg-orange-600 focus:outline outline-1 outline-orange-400 outline-offset-[3px]';

	let secondary: string =
		'bg-gray-800 border border-gray-700 hover:bg-gray-700 hover:border-gray-500 hover:text-gray-50 focus:border-gray-300 focus:outline focus:outline-1 focus:outline-gray-300';
</script>

<main class="max-w-screen-xl mx-auto px-5">
	<section class="h-[35rem] flex flex-col justify-center items-start mt-20">
		<h1 class="text-left text-4xl tracking-tighter font-sans font-bold sm:text-7xl mb-5">
			Simple Date & time picker
		</h1>
		<img class="w-full sm:w-1/2" src="/screenshot.png" alt="Svelty Picker Example" />
		<div class="mt-10 w-full flex flex-col gap-4 md:flex-row">
			<a class={joinClasses(btn, primary)} href="/docs">Get Started</a>
			<button
				class={joinClasses(btn, secondary)}
				on:click={() => copy('npm install svelty-picker')}
			>
				npm install svelty-picker
			</button>
		</div>
	</section>
</main>
