export function usePosition(el, { inputEl, visible, inputRect }) {
  if (!visible) {
    const calRect = el.getBoundingClientRect();
    const style = ['position: absolute', 'z-index: 12250'];
    style.push(inputRect.x + calRect.width > window.innerWidth
      ? `right: 1rem`
      : `left: ${inputRect.left}px`
    );
    if (calRect.height + calRect.top > (window.innerHeight + window.scrollY)) {
      style.push(`bottom: 1rem`);
    } else {
      style.push(`top: ${inputRect.top + inputRect.height + window.scrollY}px`);
    }
    el.style = style.join(';');
    el.hidden = false;
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
