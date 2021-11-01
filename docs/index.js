import DatePicker from './../src/DatePicker.svelte';

const d = new Date();

new DatePicker({
  target: document.body,
  props: {
    date: d
  }
});