<script>
  import Example from './_examples.svelte';
</script>

<div class="container mt-4">
  <div class="row">
    <div class="col-auto">
      <ul class="nav nav-pills flex-column">
        <li class="nav-item">
          <a class="nav-link" aria-current="page" href="/svelty-picker/">Readme.md</a>
        </li>
        <li class="nav-item">
          <span class="nav-link active">Examples</span>
        </li>
      </ul>
      
      <a href="https://github.com/mskocik/svelty-picker">
        <img alt="GitHub package.json version" src="https://img.shields.io/github/package-json/v/mskocik/svelty-picker?logo=github&logoColor=g">
      </a>
    </div>
    <div class="col">
      <div class="tab-content" id="myTabContent">
        <div class="tab-pane fade active show"  id="index" role="tabpanel" aria-labelledby="home-tab">
          <Example></Example>
        </div>
      </div>
    </div>
  </div>
</div>