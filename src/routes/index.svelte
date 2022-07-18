<script>
  import Readme from './_README.md';
  import Examples from './_examples.svelte';

  let readmeActive = true;
</script>

<div class="container mt-4">
  <div class="row">
    <div class="col-auto">
      <ul class="nav nav-pills flex-column">
        <li class="nav-item">
          <a class="nav-link" class:active={readmeActive} aria-current="page" href="#home" on:click|preventDefault={() => readmeActive = true }>Readme.md</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" class:active={!readmeActive}  href="#home" on:click|preventDefault={() => readmeActive = false }>Examples</a>
        </li>
      </ul>
      
      <a href="https://github.com/mskocik/svelty-picker">
        <img alt="GitHub package.json version" src="https://img.shields.io/github/package-json/v/mskocik/svelty-picker?logo=github&logoColor=g">
      </a>
    </div>
    <div class="col">
      <div class="tab-content" id="myTabContent">
        <div class="tab-pane fade" class:active={readmeActive} class:show={readmeActive} id="index" role="tabpanel" aria-labelledby="home-tab">
          <Readme></Readme>
        </div>
        <div class="tab-pane fade" id="profile" class:active={!readmeActive} class:show={!readmeActive} role="tabpanel" aria-labelledby="profile-tab">
          <Examples></Examples>
        </div>
      </div>
    </div>
  </div>
</div>
