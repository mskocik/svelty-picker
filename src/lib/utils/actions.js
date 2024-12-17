import { computePosition, autoUpdate, shift, flip } from '@floating-ui/dom';

/**
 * @param {HTMLDivElement} node
 * @returns void
 */
export function usePosition(node) {
  const inputElement = node.parentElement?.querySelector('input[type=text]');
  if (!inputElement) return;

  const removeFloating = autoUpdate(inputElement, node, () =>
    computePosition(inputElement, node, {
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
