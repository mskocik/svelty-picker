<script>
  import { formatDate, parseDate } from 'svelty-picker';
  import { en } from 'svelty-picker/i18n';
</script>

Formatted date: {formatDate(new Date(), 'mm/dd/yyyy', en, 'standard')}
<br>
Parsed date: { !console.log( parseDate('24.7.2023', 'j.n.Y', en, 'php') ) && 'Shown in console'}

<p>
  ☝️ Notice the parsed date is always set to 00:00:00, but in <b>local</b> time. Therefore you can see difference
  between numbers in REPL and browser console.
</p>
