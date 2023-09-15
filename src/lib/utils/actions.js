import { computePosition, autoUpdate, shift, flip } from '@floating-ui/dom';

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
