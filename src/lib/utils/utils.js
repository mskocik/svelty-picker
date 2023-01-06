// @ts-nocheck
import { cubicOut } from 'svelte/easing';

export function usePosition(node, { visible }) {
  const onScrollHandler = () => visible && isOutOfViewport(node);
  onScrollHandler();
  document.addEventListener('scroll', onScrollHandler, { passive: true });

  return {
    update(newVal) {
      visible = newVal;
    },
    destroy() {
      document.removeEventListener('scroll', onScrollHandler, { passive: true });
    }
  }
}

/** slightly addapted from mskocik/svelecte */
function isOutOfViewport(elem) {
  if (!elem) return false;
  const parentBounding = elem
    .parentElement  // wrapper
    .getBoundingClientRect();
  const bounding = elem.getBoundingClientRect();

  elem.style.bottom = parentBounding.bottom + bounding.height > (window.innerHeight || document.documentElement.clientHeight)
    ? elem.previousElementSibling.clientHeight + 'px'
    : '';
};

export function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, end = 1, opacity = 0 } = {}) {
  const style = getComputedStyle(node);
  const target_opacity = +style.opacity;
  const transform = style.transform === 'none' ? '' : style.transform;
  const sd = 1 - start;
  const od = target_opacity * (1 - opacity);
  return {
      delay,
      duration,
      easing,
      css: (_t, u) => `
        transform: ${transform} scale(${end !== 1 ? start + end * u : 1 - (sd * u)});
        opacity: ${target_opacity - (od * u)};
      `
  };
}