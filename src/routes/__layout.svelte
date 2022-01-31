<script lang="ts">
	import Navbar from '../components/Navbar.svelte';
	import '../app.css';
</script>

<Navbar />
<div id="page" class="mt-20 mb-40">
	<slot />
</div>
