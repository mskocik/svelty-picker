<script>
  import { createEventDispatcher, tick } from 'svelte';
  import { fade } from 'svelte/transition';

  /** @type {Date|null} */
  export let date = null;
  /** @type {Date|null} */
  export let startDate = null;
  /** @type {Date|null} */
  export let endDate = null;
  export let minuteIncrement = 1;
  export let showMeridian = false;
  export let hasDateComponent = false;
  /** @type {i18nType}*/
  export let i18n;
  /**
   * @param {boolean|null} val
   */
  export function minuteSwitch(val) {
    if (val === null) return isMinuteView;
    isMinuteView = val;
  }
  /**
   * @param {number} val
   */
  export function makeTick(val) {
    if (isMinuteView) {
      val = val * 5 + selectedMinutes;
      if (val % 5 !== 0) {
        val = val < selectedMinutes
          ? val + (5 - (val % 5))
          : val - (val % 5);
      }
    } else {
      val = selectedHour + val;
    }
    enableViewToggle = false;
    onClick({
      target: {
        tagName: 'BUTTON',
        dataset: {
          value: val
        }
      }
    });
    enableViewToggle = true;
  }
  /** @type {HTMLElement} */
  let clockEl;
  let isMinuteView = false;
  let handleMoveMove = false;
  let enableViewToggle = true;
  /** @type {Date} */
  let innerDate = date || new Date();
  if (!date) {
    date = innerDate;
    date.setHours(0,0,0,0);
  }
  const dispatch = createEventDispatcher();

  $: {
    let forceTimeUpdate = false;
    if (startDate && startDate.toDateString() === innerDate.toDateString()) {
      if (isDisabled(innerDate.getHours())) {
        innerDate.setHours(startDate.getHours());
        forceTimeUpdate = true;
      }
      if (isDisabled(innerDate.getMinutes(), true)) {
        innerDate.setMinutes(startDate.getMinutes());
        forceTimeUpdate = true;
      }
    }
    if (endDate && endDate.toDateString() === innerDate.toDateString()) {
      if (isDisabled(innerDate.getHours())) {
        innerDate.setHours(endDate.getHours());
        forceTimeUpdate = true;
      }
      if (isDisabled(innerDate.getMinutes(), true)) {
        innerDate.setMinutes(endDate.getMinutes());
        forceTimeUpdate = true;
      }
    }
    forceTimeUpdate && tick().then(() => dispatch('time', innerDate));
  }

  $: {
    if (date !== innerDate && date) {
      innerDate = date;
    }
  }
  $: selectedHour = innerDate ? innerDate.getHours() : 0;
  $: isPM = showMeridian
    ? selectedHour >= 12
    : false;
  $: selectedMinutes = innerDate ? innerDate.getMinutes() : 0;
  let handCss = '';
  $: {
    let nextDegree = isMinuteView
      ? selectedMinutes * 6
      : selectedHour % 12 * 30;
    handCss = isMinuteView || showMeridian || selectedHour < 12
      ? `transform: rotateZ(${nextDegree}deg);`
      : `transform: rotateZ(${nextDegree}deg); height: calc(25% + 1px)`
  }
  $: multiplier = isMinuteView ? 5 : 1;
  // @ts-ignore
  $: sameDateRestriction = startDate && endDate && ['getFullYear', 'getMonth', 'getDate'].every(p => endDate[p]() === startDate[p]())


  /**
   * @param {number} size
   * @param {number} offset
   * @param {string|number} valueForZero
   * @param {boolean} minuteView
   * @param {number} hourAdded
   */
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
  $: pos = positions(isMinuteView ? 260 : 220, 130, '00', false, 0);
  $: innerHours = positions(isMinuteView ? 220 : 140, 130, isMinuteView ? '00' : '12', isMinuteView, 12);

  /**
   * 
   * @param {number} value
   * @param {boolean} asMeridian
   */
  function view(value, asMeridian) {
    if (asMeridian) {
      if (isPM && value === 12) return 12;
      return value < 10 || (value % 12) < 10
        ? `0${value % 12}`
        : value % 12;
    }
    return value < 10
      ? `0${value}`
      : value;
  }

  /**
   * @param {number} selected
   * @param {string|number} val
   * @param {number} i
   */
  function isSelected(selected, val, i) {
    if (isMinuteView) {
      return val === selected || (i === 0 && i === selected)
    } else {
      if (showMeridian) {
        if (isPM && val == 12 && selected === 12) return true;
        if (!isPM && val == 12 && selected === 0) return true;
        return val === (selected ? selected % 12 : 12);
      } else if (+val > 12) {
        return (i ? multiplier * i + 12 : 0)  === selected;
      } else {
        return val === '00' || val === '12'
          ? ((selected === 12 && parseInt(val) == 12) || (val === '00' && selected === 0))
          : val === selected;
      }
    }
  }

  /**
   * @param {string|number} val
   * @param {boolean|undefined} isManualMinuteCheck
   */
  function isDisabled(val, isManualMinuteCheck = false) {
    if (typeof val === 'string') val = parseInt(val);
    if (startDate && endDate && sameDateRestriction) {
      if (isMinuteView || isManualMinuteCheck) {
        return (startDate.getHours() === innerDate.getHours() && startDate.getMinutes() > val)
          || (endDate.getHours() === innerDate.getHours() && endDate.getMinutes() < val);
      }
      return startDate.getHours() > val || endDate.getHours() < val;
    }
    if (startDate
      && startDate.getDate()     === innerDate.getDate()
      && startDate.getMonth()    === innerDate.getMonth()
      && startDate.getFullYear() === innerDate.getFullYear()
    ) {
      if (isMinuteView || isManualMinuteCheck) {
        return startDate.getHours() === innerDate.getHours() && startDate.getMinutes() > val;
      }
      return startDate.getHours() > val;
    } 
    if (endDate
      && endDate.getDate()     === innerDate.getDate()
      && endDate.getMonth()    === innerDate.getMonth()
      && endDate.getFullYear() === innerDate.getFullYear()
    ) {
      if (isMinuteView || isManualMinuteCheck) {
        return endDate.getHours() === innerDate.getHours() && endDate.getMinutes() < val;
      }
      return endDate.getHours() < val;
    }
    return false;
  }

  /**
   * @param {any} e
   */
  function onClick(e) {
    if (!e.target) return;
    let a = 0;
    let b = 0;
    if (e.target.tagName === 'BUTTON') {
      let val = parseInt(e.target.dataset.value);
      const setter = !isMinuteView ? 'setHours' : 'setMinutes';
      if (!isMinuteView && isPM) {
        val += 12;
      }
      if (isMinuteView && minuteIncrement !== 1) {
        val = val > selectedMinutes ? selectedMinutes + minuteIncrement : selectedMinutes - minuteIncrement;
      }

      innerDate[setter](val);
    } else if (isMinuteView) {
      // compute it out of x,y 
      const rect = clockEl.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      const cntX = 130, cntY = 130;
      let quadrant = null;
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
      let degree = 0;
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

      degree = Math.round((degree / 6) / minuteIncrement) * minuteIncrement;

      if (degree >= 60) {
        degree = 0;
      }

      innerDate.setMinutes(degree);
    }
    innerDate = innerDate;
    
    // handle only final click, not mouse move
    if (!handleMoveMove) {
      dispatch('time', innerDate);
      isMinuteView && setTimeout(() => { dispatch('close') }, 300);
      if (!isMinuteView && enableViewToggle) isMinuteView = true;
    }
  }

  /**
   * @param {MouseEvent} e
   */
  function onSwitchMeridian(e) {
    // @ts-ignore
    const val = parseInt(e.target.dataset.value);
    innerDate.setHours(val);
    innerDate = innerDate;
    dispatch('time', innerDate);
  }

  /**
   * @param {MouseEvent} e;
   */
  function onToggleMove(e) {
    handleMoveMove = e.type === 'mousedown';
  }

  function onModeSwitch() {
    dispatch('switch', 'date');
  }
  $: {
    dispatch('time-switch', isMinuteView)
  }
</script>

<div class="sdt-timer" in:fade={{duration: 200}}>
  
  <div class="sdt-time-head">
    {#if hasDateComponent}
    <button class="sdt-time-btn sdt-back-btn" title={i18n.backToDate} on:click={onModeSwitch}>
      <svg class="sdt-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"><path fill-rule="evenodd" d="M6.75 0a.75.75 0 01.75.75V3h9V.75a.75.75 0 011.5 0V3h2.75c.966 0 1.75.784 1.75 1.75v16a1.75 1.75 0 01-1.75 1.75H3.25a1.75 1.75 0 01-1.75-1.75v-16C1.5 3.784 2.284 3 3.25 3H6V.75A.75.75 0 016.75 0zm-3.5 4.5a.25.25 0 00-.25.25V8h18V4.75a.25.25 0 00-.25-.25H3.25zM21 9.5H3v11.25c0 .138.112.25.25.25h17.5a.25.25 0 00.25-.25V9.5z"></path></svg>
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
      <button type="button" class="sdt-time-btn sdt-time-figure is-active" on:click={onSwitchMeridian} data-value={isPM ? selectedHour % 12 : selectedHour + 12}>{isPM ? 'PM' : 'AM'}</button>
    </div>
    {/if}
  </div>
    
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="sdt-clock" on:click|preventDefault={onClick} on:mousedown={onToggleMove} on:mousemove={e => { handleMoveMove && onClick(e) }} on:mouseup={onToggleMove} bind:this={clockEl}>
    <div class="sdt-middle-dot"></div>
    <div class="sdt-hand-pointer" style={handCss}>
      <div class="sdt-hand-circle"></div>
    </div>
    {#each pos as p, i(p.val)}
      <button type="button" style={`left:${p.x}px; top:${p.y}px`} class="sdt-tick" class:outer-tick={isMinuteView} transition:fade|local={{duration: 200}}
        data-value={p.val}
        disabled={(startDate || endDate) && isDisabled(p.val, false)}
        class:is-selected={isSelected(selectedHour, p.val, i)}
      >{p.val}</button>
    {/each}
      {#each innerHours as p, i}
      <button type="button" style={`left:${p.x}px; top:${p.y}px;`} class="sdt-tick" class:outer-tick={showMeridian && !isMinuteView} transition:fade|local={{duration: 200}}
      data-value={p.val}
      disabled={(startDate || endDate) && isDisabled(p.val, false)}
      class:is-selected={isSelected(isMinuteView ? selectedMinutes : selectedHour, p.val, i)}
      >{p.val}</button>
      {/each}
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
  margin-bottom: 4px;
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
  background-color: var(--sdt-clock-bg);
  border-radius: 50%;
  transition: background-color 0.3s;
  overflow: hidden;
}
.sdt-time-btn {
  border: 0;
  background: transparent;
  text-align: center;
  border-radius: 4px;
  cursor: pointer;
  padding: 0 0.375rem;
  color: var(--sdt-color);
}
.sdt-svg {
  fill: var(--sdt-color);
}
.sdt-time-btn:not(.is-active) {
  opacity: 0.5;
}
.sdt-time-btn:hover {
  background-color: var(--sdt-btn-header-bg-hover);
}
.sdt-back-btn {
  position: absolute;
  top: 0;
  left: 0;
  padding: 0.375rem;
  opacity: 1 !important;
}
.sdt-meridian {
  position: absolute;
  top: 0;
  right: 40px;
  display: flex;
}
.sdt-meridian .sdt-time-btn {
  width: 56px;
  font-weight: bold;
}
.sdt-middle-dot {
  left: 50%;
  top: 50%;
  width: 6px;
  height: 6px;
  position: absolute;
  transform: translate(-50%, -50%);
  background-color: var(--sdt-primary);
  border-radius: 50%;
}
.sdt-hand-pointer {
  width: 2px;
  height: calc(40% + 1px);
  bottom: 50%;
  left: calc(50% - 1px);
  position: absolute;
  background-color: var(--sdt-primary);
  transform-origin: center bottom 0;
  transition: transform 0.3s ease, height 0.15s ease;
}
.sdt-hand-circle {
  left: -15px;
  top: -21px;
  position: relative;
  width: 4px;
  height: 4px;
  background-color: transparent;
  border: 14px solid var(--sdt-primary);
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
  line-height: 20px;
  cursor: pointer;
  background-color: transparent;
  transition: all 0.3s;
}
.sdt-tick[disabled] {
  cursor: not-allowed;
}
.sdt-tick.outer-tick {
  opacity: 0;
}
.sdt-tick.is-selected {
  animation: tick-selection 0s 0.175s ease-out forwards;
}
@keyframes tick-selection {
  0% {
    color: initial;
    background-color: transparent;
  }
  100% {
    background-color: var(--sdt-primary);
    color: var(--sdt-color-selected, var(--sdt-bg-main));
  }
}
</style>