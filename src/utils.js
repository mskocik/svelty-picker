  export function usePosition(el, { inputEl, visible }) {
    if (!visible) {
      const rect = inputEl.getBoundingClientRect();
      const calRect = el.getBoundingClientRect();
      const style = ['position: absolute', 'z-index: 12250'];
      style.push(calRect.x + calRect.width > window.innerWidth
        ? `right: 1rem`
        : `left: ${rect.left}px`
      );
      if (calRect.height + calRect.top > (window.innerHeight + window.scrollY)) {
        style.push(`bottom: 1rem`);
      } else {
        style.push(`top: ${rect.top + rect.height + window.scrollY}px`);
      }
      el.style = style.join(';');
      document.body.appendChild(el);
  }
  el.hidden = false;

  function destroy() {
    if (el.parentNode) {
      el.parentNode.removeChild(el);
    }
  }

  return {
    destroy
  }
}
