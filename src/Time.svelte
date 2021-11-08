<script>
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';
  import { UTCDate } from './dateUtils';

  export let date = null;
  export let showMeridian = false;
  export let hasDateComponent = false;
  export let i18n;

  let clockEl;
  let isMinuteView = false;
  let handleMoveMove = false;
  let enableViewToggle = false;
  let innerDate = date || UTCDate(0,0,0,0,0,0);
  if (!date) {
    date = innerDate;
  }
  const dispatch = createEventDispatcher();

  $: {
    if (date !== innerDate) {
      innerDate = date;
    }
  }
  $: selectedHour = innerDate ? innerDate.getUTCHours() : 0;
  $: isPM = showMeridian
    ? selectedHour >= 12
    : false;
  $: selectedMinutes = innerDate ? innerDate.getUTCMinutes() : 0;
  $: handCss = isMinuteView 
    ? `transform: rotateZ(${selectedMinutes * 6}deg)`
    : (showMeridian 
      ? `transform: rotateZ(${selectedHour % 12 * 30}deg);`
      : `transform: rotateZ(${selectedHour % 12 * 30}deg); ${selectedHour > 12 || !selectedHour ? 'height: calc(25% + 1px)' : ''}`
    );
  $: multiplier = isMinuteView ? 5 : 1;


  function positions(size, offset, valueForZero, minuteView, hourAdded) {
    const r = size / 2;
    offset = offset || r;
    const coeff = [0, 1-0.5, 1-0.134, 1, 1-0.134, 1-0.5];
    const xCoeff = coeff.concat(coeff);
    const yCoeff = coeff.slice(3).concat(coeff).concat(coeff.slice(0, 3));
    const pos = [];
    for (let i = 0; i < 12; i++) {
      pos.push({
        x: Math.abs(xCoeff[i] * r + ((i <= 6 ? 1 : -1) * offset)),
        y: Math.abs(yCoeff[i] * r + ((i >= 9 || i < 3 ? -1 : 1) * offset)),
        val: minuteView
          ? (i * 5 || valueForZero)
          : (i ? i + hourAdded : valueForZero)
      });
    }
    return pos;
  }
  $: pos = positions(220, 130, isMinuteView ? '00' : '12', isMinuteView, 0);
  $: innerHours = positions(140, 130, '00', false, 12);

  function view(value, asMeridian) {
    if (asMeridian) {
      if (isPM && value === 12) return 12;
      return value < 10 || (value % 12) < 10
        ? `0${value % 12}`
        : value;
    }
    return value < 10
      ? `0${value}`
      : value;
  }

  function isSelected(selected, val, i) {
    if (isMinuteView) {
      return val === selected || (i === 0 && i === selected)
    } else {
      if (showMeridian) {
        if (isPM && val == 12 && selected === 12) return true;
        if (!isPM && val == 12 && selected === 0) return true;
        return val === (selected ? selected % 12 : 12);
      } else if (val > 12) {
        return (i ? multiplier * i + 12 : 0)  === selected;
      } else {
        return val === '00' || val === '12'
          ? ((selected === 12 && val == 12) || (val === '00' && selected === 0))
          : val === selected;
      }
    }
  }

  function onClick(e) {
    if (e.type === 'mousemove' && !handleMoveMove) return;
    if (e.target.tagName === 'BUTTON') {
      let val = parseInt(e.target.dataset.value);
      const setter = e.meridianSwitch || !isMinuteView ? 'setUTCHours' : 'setUTCMinutes';
      innerDate[setter](val);
    } else if (isMinuteView) {
      // compute it out of x,y 
      const rect = clockEl.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      const cntX = 130, cntY = 130;
      let quadrant = null;
      let a, b;
      if (clientX > cntX) {
        quadrant = clientY > cntY ? 2 : 1
      } else {
        quadrant = clientY > cntY ? 3 : 4
      }
      switch (quadrant) {
        case 1:
          a = clientX - cntX;
          b = cntY - clientY;
          break;
        case 2:
          a = clientX - cntX;
          b = clientY - cntY;
          break;
        case 3:
          a = cntX - clientX;
          b = clientY - cntY;
          break;
        case 4:
          a = cntX - clientX;
          b = cntY - clientY;
          break;
      }
      const c = Math.sqrt(a*a + b*b);
      const beta = 90 - (Math.asin(a/c) * (180 / Math.PI));
      let degree;
      switch (quadrant) {
        case 1:
          degree = 90 - beta;
          break;
        case 2:
          degree = beta + 90;
          break;
        case 3:
          degree = 270 - beta;
          break;
        case 4:
          degree = beta + 270;
          break;
      }
      degree = Math.floor(degree / 6)
      innerDate.setMinutes(degree);
    }
    innerDate = innerDate;
    dispatch('time', innerDate);
    if (!e.meridianSwitch && !handleMoveMove && isMinuteView) setTimeout(() => {
      dispatch('close')
    }, 300);
    if (!e.meridianSwitch && !isMinuteView) isMinuteView = true;
    enableViewToggle = true;
    setTimeout(() => {
      enableViewToggle = false;
    }, 1000);
  }

  function onSwitchMeridian(e) {
    e.meridianSwitch = true;
    onClick(e)
  }

  function onToggleMove(e) {
    handleMoveMove = e.type === 'mousedown';
  }

  function onModeSwitch() {
    dispatch('switch', 'date');
  }
</script>

<div class="sdt-timer">
  <div class="sdt-time-head">
    {#if hasDateComponent}
    <button class="sdt-time-btn sdt-back-btn" title={i18n.backToDate} on:click={onModeSwitch}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"><path fill-rule="evenodd" d="M6.75 0a.75.75 0 01.75.75V3h9V.75a.75.75 0 011.5 0V3h2.75c.966 0 1.75.784 1.75 1.75v16a1.75 1.75 0 01-1.75 1.75H3.25a1.75 1.75 0 01-1.75-1.75v-16C1.5 3.784 2.284 3 3.25 3H6V.75A.75.75 0 016.75 0zm-3.5 4.5a.25.25 0 00-.25.25V8h18V4.75a.25.25 0 00-.25-.25H3.25zM21 9.5H3v11.25c0 .138.112.25.25.25h17.5a.25.25 0 00.25-.25V9.5z"></path></svg>
    </button>
    {/if}
    <button class="sdt-time-btn sdt-time-figure"
      class:is-active={!isMinuteView}
      on:click={() => isMinuteView = false}
    >{view(selectedHour, showMeridian)}</button>
    <span>:</span>
    <button  class="sdt-time-btn sdt-time-figure"
      class:is-active={isMinuteView}
      on:click={() => isMinuteView = true}
    >{view(selectedMinutes, false)}</button>
    {#if showMeridian}
    <div class="sdt-meridian">
      <button class="sdt-time-btn" class:is-active={selectedHour < 12} on:click={onSwitchMeridian} data-value={selectedHour % 12}>AM</button>
      <button class="sdt-time-btn" class:is-active={selectedHour >= 12} on:click={onSwitchMeridian} data-value={selectedHour % 12 + 12}>PM</button>
    </div>
    {/if}
  </div>
  <div class="sdt-clock" on:click={onClick} on:mousedown={onToggleMove} on:mousemove={e => { handleMoveMove && onClick(e) }} on:mouseup={onToggleMove} bind:this={clockEl}
    class:is-minute-view={isMinuteView}
  >
    <div class="sdt-middle-dot"></div>
    <div class="sdt-hand-pointer" style={handCss}>
      <div class="sdt-hand-circle"></div>
    </div>
    {#each pos as p, i(p.val)}
      <button style={`left:${p.x}px; top:${p.y}px`} class="sdt-tick" transition:fade|local={{duration: 200}}
        data-value={p.val}
        class:is-selected={isSelected(isMinuteView ? selectedMinutes : selectedHour, p.val, i)}
      >{p.val}</button>
    {/each}
    {#if !showMeridian && !isMinuteView}
      {#each innerHours as p, i}
      <button style={`left:${p.x}px; top:${p.y}px`} class="sdt-tick" transition:fade|local={{duration: 200}}
        data-value={p.val}
        class:is-selected={isSelected(selectedHour, p.val, i)}
      >{p.val}</button>
    {/each}
    {/if}
  </div>
</div>

<style>
  .sdt-timer {
    position: relative;
    width: 272px;
  }
  .sdt-time-head {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .sdt-time-figure {
    font-size: 1.5rem;
    font-weight: bold;
  }
  .sdt-clock {
    margin: auto;
    position: relative;
    width: 260px;
    height: 260px;
    background-color: #eeeded;
    border-radius: 50%;
    transition: background-color 0.3s;
  }
  .sdt-clock.is-minute-view {
    background-color: rgb(238, 237, 237, 0.25);
    box-shadow: 0 0 128px 2px #ddd inset;
  }
  .sdt-time-btn {
    border: 0;
    background: transparent;
    text-align: center;
    border-radius: 4px;
    cursor: pointer;
    padding: 0.375rem;
  }
  .sdt-time-btn:not(.is-active) {
    opacity: 0.5;
  }
  .sdt-time-btn:hover {
    background-color: rgb(223, 223, 223);
    color: black;
  }
  .sdt-back-btn {
    position: absolute;
    border: 1px solid #ddd;
    left: 0;
    opacity: 1 !important;
  }
  .sdt-meridian {
    position: absolute;
    top: 0.25rem;
    right: 0.25rem;
    display: flex;
    flex-flow: column;
    font-size: 90%;
  }
  .sdt-meridian .sdt-time-btn {
    padding: 0.15rem 0.5rem;
  }
  .sdt-meridian .sdt-time-btn.is-active {
    font-weight: bold;
  }
  .sdt-middle-dot {
    left: 50%;
    top: 50%;
    width: 6px;
    height: 6px;
    position: absolute;
    transform: translate(-50%, -50%);
    background-color: #286090;
    border-radius: 50%;
  }
  .sdt-hand-pointer {
    width: 2px;
    height: calc(40% + 1px);
    bottom: 50%;
    left: calc(50% - 1px);
    position: absolute;
    background-color: #286090;
    transform-origin: center bottom 0;
    transition: transform 0.2s ease, height 0.15s ease;
    
  }
  .sdt-hand-circle {
    left: -15px;
    top: -21px;
    position: relative;
    width: 4px;
    height: 4px;
    background-color: transparent;
    border: 14px solid #286090;
    border-radius: 50%;
    box-sizing: content-box;
  }
  .sdt-tick {
    position: absolute;
    width: 30px;
    height: 30px;
    border-width: 0;
    transform: translate(-50%, -50%);
    text-align: center;
    border-radius: 50%;
    line-height: 28px;
    cursor: pointer;
    background-color: transparent;
  }
  .sdt-tick.is-selected {
    background-color: #286090;
    color: #fff;
  }
</style>