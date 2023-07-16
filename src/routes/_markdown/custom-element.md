```svelte
<script>
  import { registerSveltyPicker } from 'svelty-picker';

  registerElement('el-picker');
</script>

<!-- somewhere in HTML -->
<input type="text" is="el-picker">

```