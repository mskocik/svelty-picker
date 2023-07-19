<script>
  import { factory } from "../documentation/factory";
  import Markdown from "./Markdown.svelte";

  let component;

  async function init() {
    component = await factory['home']();
  }
  init();
</script>

<Markdown content={component} ></Markdown>
