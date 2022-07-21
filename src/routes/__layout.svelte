<script>
  // @ts-nocheck
  import "../app.css";
  import { writable } from 'svelte/store'

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
</script>

<div class="d-flex flex-items-between">
  <div>
    <button>
      <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18" /></svg>
    </button>
    <a href="/svelty/picker">
      <h1 class="text-5">📅 Svelty Picker</h1>
    </a>
  </div>
  <div>
    <div>
      <a class="minimal icon css-1is33jg" href="https://github.com/mskocik/svelty-picker" target="_blank">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
      </a>
    </div>
    <div>
      <button class="minimal icon css-1is33jg"  on:click={toggleTheme} aria-label="Switch to light mode">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
      </button>
    </div>
  </div>
</div>

<slot />
