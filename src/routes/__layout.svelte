<script>
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  // @ts-nocheck
  import { writable } from 'svelte/store'

  import appCodeCss from './../app-code.css';

  const pages = {
    '' : 'Getting Started',
    options: 'Options',
    formatting: 'Formatting',
    styling: 'Styling',
    'custom-element': 'Custom Element',
    'i18n': 'Languages',
    playground: 'Playground'
  };

  /**
   * @param {string} key
   * @param {string} value
   */
  function localStore(key, value) {
    const data = typeof localStorage != 'undefined' ? localStorage.getItem(key) : null;
    const store = writable(value);
    if (data !== null) {
      store.set(data);
    }
    store.subscribe(val => {
      if (typeof localStorage == 'undefined') {
        return;
      }
      localStorage.setItem(key, val);
    })

    return store;
  }

  let navToggle = false;
  let isWide = false;
  $: navbarShow = isWide || navToggle;

  const theme = localStore('theme', '');

  function toggleTheme() {
    if ($theme === 'dark') {
      $theme = 'light';
      document.querySelector('html').classList.remove('dark');
    } else {
      $theme = 'dark'
      document.querySelector('html').classList.add('dark');
    }
  }
  onMount(() => {
    const navMenuMedia = matchMedia('(min-width: 768px)');
    isWide = navMenuMedia.matches;
    navMenuMedia.addEventListener('change', query => {
      navToggle = false;
      isWide = query.matches;
    })
  });
</script>

<div class="bg-white text-stroke-dark-900 dark:bg-dark-600 dark:text-light-200">

<div class="container !max-w-screen-xl p-3 flex mx-auto justify-between">
  <div class="flex items-center text-4xl font-semibold">
    <button class="inline-flex items-center flex-col mr-3 md:hidden" on:click={() => navToggle = !navToggle}>
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18" /></svg>
      <span class="text-xs font-bold">Menu</span>
    </button>
    <a href="/svelty-picker/">
      <h1 class="text-5">📅 Svelty Picker</h1>
    </a>
  </div>
  <div class="flex items-center text-2x">
    <a class="mx-4" href="https://github.com/mskocik/svelty-picker" target="_blank">
      <svg width="1.2em" height="1.2em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 32 32" data-v-8ff9b2e6=""><path fill="currentColor" fill-rule="evenodd" d="M16 2a14 14 0 0 0-4.43 27.28c.7.13 1-.3 1-.67v-2.38c-3.89.84-4.71-1.88-4.71-1.88a3.71 3.71 0 0 0-1.62-2.05c-1.27-.86.1-.85.1-.85a2.94 2.94 0 0 1 2.14 1.45a3 3 0 0 0 4.08 1.16a2.93 2.93 0 0 1 .88-1.87c-3.1-.36-6.37-1.56-6.37-6.92a5.4 5.4 0 0 1 1.44-3.76a5 5 0 0 1 .14-3.7s1.17-.38 3.85 1.43a13.3 13.3 0 0 1 7 0c2.67-1.81 3.84-1.43 3.84-1.43a5 5 0 0 1 .14 3.7a5.4 5.4 0 0 1 1.44 3.76c0 5.38-3.27 6.56-6.39 6.91a3.33 3.33 0 0 1 .95 2.59v3.84c0 .46.25.81 1 .67A14 14 0 0 0 16 2Z"></path></svg>
    </a>
    <!-- <button class="inline-flex text-xl p-2 text-black"  on:click={toggleTheme} aria-label="Switch theme">
      <svg width="1.2em" height="1.2em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24" class:hidden={$theme!=='dark'}><path fill="currentColor" d="M20.742 13.045a8.088 8.088 0 0 1-2.077.271c-2.135 0-4.14-.83-5.646-2.336a8.025 8.025 0 0 1-2.064-7.723A1 1 0 0 0 9.73 2.034a10.014 10.014 0 0 0-4.489 2.582c-3.898 3.898-3.898 10.243 0 14.143a9.937 9.937 0 0 0 7.072 2.93a9.93 9.93 0 0 0 7.07-2.929a10.007 10.007 0 0 0 2.583-4.491a1.001 1.001 0 0 0-1.224-1.224zm-2.772 4.301a7.947 7.947 0 0 1-5.656 2.343a7.953 7.953 0 0 1-5.658-2.344c-3.118-3.119-3.118-8.195 0-11.314a7.923 7.923 0 0 1 2.06-1.483a10.027 10.027 0 0 0 2.89 7.848a9.972 9.972 0 0 0 7.848 2.891a8.036 8.036 0 0 1-1.484 2.059z"></path></svg>
      <svg width="1.2em" height="1.2em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 512 512" class:hidden={$theme==='dark'}><path d="M256 387c-8.5 0-15.4 6.9-15.4 15.4v46.2c0 8.5 6.9 15.4 15.4 15.4s15.4-6.9 15.4-15.4v-46.2c0-8.5-6.9-15.4-15.4-15.4z" fill="currentColor"></path><path d="M256 48c-8.5 0-15.4 6.9-15.4 15.4v46.2c0 8.5 6.9 15.4 15.4 15.4s15.4-6.9 15.4-15.4V63.4c0-8.5-6.9-15.4-15.4-15.4z" fill="currentColor"></path><path d="M125 256c0-8.5-6.9-15.4-15.4-15.4H63.4c-8.5 0-15.4 6.9-15.4 15.4s6.9 15.4 15.4 15.4h46.2c8.5 0 15.4-6.9 15.4-15.4z" fill="currentColor"></path><path d="M448.6 240.6h-46.2c-8.5 0-15.4 6.9-15.4 15.4s6.9 15.4 15.4 15.4h46.2c8.5 0 15.4-6.9 15.4-15.4s-6.9-15.4-15.4-15.4z" fill="currentColor"></path><path d="M152.5 344.1c-4.1 0-8 1.6-10.9 4.5l-32.7 32.7c-2.9 2.9-4.5 6.8-4.5 10.9s1.6 8 4.5 10.9c2.9 2.9 6.8 4.5 10.9 4.5 4.1 0 8-1.6 10.9-4.5l32.7-32.7c6-6 6-15.8 0-21.8-2.9-2.9-6.8-4.5-10.9-4.5z" fill="currentColor"></path><path d="M359.5 167.9c4.1 0 8-1.6 10.9-4.5l32.7-32.7c2.9-2.9 4.5-6.8 4.5-10.9s-1.6-8-4.5-10.9c-2.9-2.9-6.8-4.5-10.9-4.5-4.1 0-8 1.6-10.9 4.5l-32.7 32.7c-2.9 2.9-4.5 6.8-4.5 10.9s1.6 8 4.5 10.9c2.9 2.9 6.8 4.5 10.9 4.5z" fill="currentColor"></path><path d="M130.7 108.9c-2.9-2.9-6.8-4.5-10.9-4.5-4.1 0-8 1.6-10.9 4.5-2.9 2.9-4.5 6.8-4.5 10.9 0 4.1 1.6 8 4.5 10.9l32.7 32.7c2.9 2.9 6.8 4.5 10.9 4.5 4.1 0 8-1.6 10.9-4.5 2.9-2.9 4.5-6.8 4.5-10.9s-1.6-8-4.5-10.9l-32.7-32.7z" fill="currentColor"></path><path d="M370.4 348.6c-2.9-2.9-6.8-4.5-10.9-4.5-4.1 0-8 1.6-10.9 4.5-6 6-6 15.8 0 21.8l32.7 32.7c2.9 2.9 6.8 4.5 10.9 4.5 4.1 0 8-1.6 10.9-4.5 2.9-2.9 4.5-6.8 4.5-10.9s-1.6-8-4.5-10.9l-32.7-32.7z" fill="currentColor"></path><path d="M256 160c-52.9 0-96 43.1-96 96s43.1 96 96 96 96-43.1 96-96-43.1-96-96-96z" fill="currentColor"></path></svg>
    </button> -->
  </div>
</div>


<div class="container !max-w-screen-xl px-3 mx-auto pt-$header-height flex">
	<aside class="sidebar z-50 lg:z-0 w-1/5" class:hidden={!navbarShow}>
    <div class="h-full">
      <nav>
        <ul class="py-4 lg:pt-3">
          <li>
            <h5 class="transition duration-100 font-bold py-2 parent-active">Documentation</h5>
            <ul class="mb-2 border-l-1 border-gray-300 border-solid">
              {#each Object.keys(pages) as item, i}
              <li>
                <a href={`/svelty-picker/${item}`} class="px-3 block my-1 hover:text-blue-500 text-blue-700" class:text-blue-700={$page.routeId === item} class:font-bold={$page.routeId === item}>
                  {pages[item]}
                </a>
              </li>
              {/each}
            </ul>
          </li>
        </ul>
      </nav>
      <a href="https://github.com/mskocik/svelty-picker"><img alt="GitHub package.json version" src="https://img.shields.io/github/package-json/v/mskocik/svelty-picker?logo=github&amp;logoColor=g"></a>
    </div>
  </aside>
	<main class="lg:px-6 md:px-8 lg:pt-6 w-4/5">
    <slot />
	</main>
</div>

</div>

<style windi:preflights:global windi:safelist:global>
  :global(code, .code) {
    @apply bg-gray-100 p-1 rounded-sm;
  }

  :global(h2.header) {
    @apply text-2xl mb-4;
  }
  :global(h3.header) {
    @apply text-xl my-4;
  }
  :global(.picker-style) {
    @apply border-2 rounded-md border-gray-300 p-1 w-full;
  }
  :global(body) {
    overflow-y: scroll !important;
  }
</style>
