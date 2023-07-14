import { computePosition, autoUpdate, shift, flip } from '@floating-ui/dom';
import { cubicOut } from 'svelte/easing';

/**
 * @param {HTMLDivElement} node
 * @returns void
 */
export function usePosition(node) {
  if (node?.previousElementSibling === null) return;
  /** @type Element */
  const prevElement = node?.previousElementSibling;
  const removeFloating = autoUpdate(prevElement, node, () => 
    computePosition(prevElement, node, {
      placement: 'bottom-start',
      middleware: [
        shift({
          padding: 5
        }),
        flip()
      ]
    }).then(({x, y}) => {
      Object.assign(node.style, {
        left: `${x}px`,
        top: `${y}px`,
      });
    })
  )

  return {
    destroy() {
      removeFloating();
    }
  }
}

/**
 * 
 * @typedef {object} ScaleParams
 * @property {number} duration
 * @property {number} start
 * @property {number} opacity
 * @property {number|undefined} end
 * 
 * @param {HTMLElement} node 
 * @param {ScaleParams | import('svelte/transition').FadeParams} params
 * @returns {import('svelte/transition').TransitionConfig}
 */
// @ts-ignore
export function scale(node, { duration = 400, start = 0, end = 1, opacity = 0 }) {
  const style = getComputedStyle(node);
  const target_opacity = +style.opacity;
  const transform = style.transform === 'none' ? '' : style.transform;
  const sd = 1 - start;
  const od = target_opacity * (1 - opacity);
  end = end || 1;
  return {
      delay: 0,
      duration,
      easing: cubicOut,
      css: (/** @type number */ _t, /** @type number */ u) => `
        transform: ${transform} scale(${end !== 1 ? start + end * u : 1 - (sd * u)});
        opacity: ${target_opacity - (od * u)};
      `
  };
}