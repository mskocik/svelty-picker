<script>
  import "../app.postcss";
  import "./../styles/index.css";
  import { base } from "$app/paths";
  import { page } from "$app/stores";
  import { onDestroy, onMount, setContext } from "svelte";
  // @ts-nocheck
  import { writable } from "svelte/store";
  import TableOfContents from "./TableOfContents.svelte";
  import { ProgressBar } from '@prgm/sveltekit-progress-bar'
  import ThemeToggle from "./ThemeToggle.svelte";

    /** @type {import('./$types').LayoutData} */
    export let data = [];

  const theme = writable(null);

  setContext('theme', theme);

  let navToggle = false;
  let isWide = false;
  $: navbarShow = isWide || navToggle;
  $: {
    if ($page.routeId || $page.routeId === "") {
      navToggle = false;
    }
  }

  onMount(() => {
    const navMenuMedia = matchMedia("(min-width: 1024px)");
    isWide = navMenuMedia.matches;
    navMenuMedia.addEventListener("change", (query) => {
      navToggle = false;
      isWide = query.matches;
      document[isWide ? 'removeEventListener' : 'addEventListener']('click', outsideNavClick);
    });
    !isWide && document.addEventListener('click', outsideNavClick);

  });
  
  onDestroy(() => {
    !isWide && typeof document !== 'undefined' && document.removeEventListener('click', outsideNavClick);
    theme.subscribe(val => console.log('Theme val', val));
  });

  function outsideNavClick(e) {
    !isWide && navToggle && (
      e.target.closest('aside') === null
      || e.target.closest('a.row') !== null
     ) && onNavToggle();
  }

  function onNavToggle() {
    navToggle = !navToggle;
  }
</script>

<ProgressBar color="#7F57F1" />
<div class="fullbody">
  <div class="header flex shadow-lg relative z-10">
    <div class="flex items-center flex-1">
      <div class="lg:hidden">
        <button
          class="flex items-center"
          on:click|stopPropagation={() => (navToggle = !navToggle)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
          <span class="leading-4">Menu</span>
        </button>
      </div>
      <a href="{base}/" class="home-link flex-1 lg:flex-none text-center lg:text-left">📅 Svelty Picker</a>
    </div>
    <div class="flex items-center">
      <a class="inline-flex" href="https://github.com/mskocik/svelty-picker" target="_blank" rel="noreferrer" title="GitHub repository">
        <svg width="36px" height="36px" preserveAspectRatio="xMidYMid meet" viewBox="0 0 32 32" data-v-8ff9b2e6=""><path fill="currentColor" fill-rule="evenodd" d="M16 2a14 14 0 0 0-4.43 27.28c.7.13 1-.3 1-.67v-2.38c-3.89.84-4.71-1.88-4.71-1.88a3.71 3.71 0 0 0-1.62-2.05c-1.27-.86.1-.85.1-.85a2.94 2.94 0 0 1 2.14 1.45a3 3 0 0 0 4.08 1.16a2.93 2.93 0 0 1 .88-1.87c-3.1-.36-6.37-1.56-6.37-6.92a5.4 5.4 0 0 1 1.44-3.76a5 5 0 0 1 .14-3.7s1.17-.38 3.85 1.43a13.3 13.3 0 0 1 7 0c2.67-1.81 3.84-1.43 3.84-1.43a5 5 0 0 1 .14 3.7a5.4 5.4 0 0 1 1.44 3.76c0 5.38-3.27 6.56-6.39 6.91a3.33 3.33 0 0 1 .95 2.59v3.84c0 .46.25.81 1 .67A14 14 0 0 0 16 2Z"/></svg>
      </a>
      <ThemeToggle />
    </div>
  </div>

  <div class="flex flex-auto items-stretch">
    <aside class:opened={navbarShow}>
      <div>
        <nav>
          <TableOfContents pages={data.navigation} active_section={data.slug} />
        </nav>
        <div>
          <a href="https://github.com/mskocik/svelty-picker"><img alt="GitHub package.json version" src="https://img.shields.io/npm/v/svelty-picker.svg?style=flat"></a>
        </div>
        <div class="mt-2">
          <a href="https://github.com/mskocik/svelty-picker"
            ><img
              alt="GitHub package.json version (branch)"
              src="https://img.shields.io/github/package-json/v/mskocik/svelty-picker/main?label=next&logo=github"
              /></a
              >
        </div>
      </div>
    </aside>
    <main class="p-4 lg:p-10">
      <slot></slot>
    </main>
  </div>
</div>

<style>
  aside {
    padding: 32px;
    background-color: var(--sk-back-1);
    transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
  }
  aside.opened {
    transform: translateX(0);
  }
  @media screen and (max-width: 1023px) {
    aside {
      z-index: 15;
      top: 0;
      position: absolute;
      transform: translateX(-100%);
      bottom: 0;
      overflow-y: auto;
    }
    aside.opened {
      box-shadow: 0 20px 20px #ccc;
    }
  }
  main {
    flex: 1 1 0;
  }
  .home-link {
    font-size: 24px;
    font-weight: 700;
  }
  .header {
    padding: 16px;
    justify-content: space-between;
    border-bottom: 2px solid var(--sk-back-3);
  }
  .fullbody {
    min-height: 100vh;
    display: flex;
    flex-flow: column;
  }
</style>
