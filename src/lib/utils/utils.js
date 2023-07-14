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
 * @param {HTMLElement} node 
 * @param {import('svelte/transition').ScaleParams} params
 * @returns {import('svelte/transition').TransitionConfig}
 */
export function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 } = {}) {
  const end = 1;
  const style = getComputedStyle(node);
  const target_opacity = +style.opacity;
  const transform = style.transform === 'none' ? '' : style.transform;
  const sd = 1 - start;
  const od = target_opacity * (1 - opacity);
  return {
      delay,
      duration,
      easing,
      css: (/** @type number */ _t, /** @type number */ u) => `
        transform: ${transform} scale(${end !== 1 ? start + end * u : 1 - (sd * u)});
        opacity: ${target_opacity - (od * u)};
      `
  };
}