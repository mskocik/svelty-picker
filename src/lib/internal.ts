import type { SvelteComponent } from 'svelte';
import { cubicOut } from 'svelte/easing';

export function usePosition(el, { inputEl, visible, inputRect }) {
	if (!visible) {
		const calRect = el.getBoundingClientRect();
		const style = ['position: absolute', 'z-index: 12250'];
		style.push(
			inputRect.x + calRect.width > window.innerWidth ? `right: 1rem` : `left: ${inputRect.left}px`
		);
		if (calRect.height + calRect.top > window.innerHeight + window.scrollY) {
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
	};
}

export function scale(
	node,
	{ delay = 0, duration = 400, easing = cubicOut, start = 0, end = 1, opacity = 0 } = {}
) {
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
        transform: ${transform} scale(${end !== 1 ? start + end * u : 1 - sd * u});
        opacity: ${target_opacity - od * u};
      `
	};
}

/**
 * Function that takes two tailwind class strings, and returns them together
 * used for long classnames
 * @param c1 first class
 * @param c2 second class
 * @returns A concatination of the two classes together
 */
export function joinClasses(c1: string, c2: string): string {
	return `${c1} ${c2}`;
}

/**
 * A function that copies text to the user's clipboard
 * @param text the text that should be copied to the clipboard
 */
export const copy = async (text: string): Promise<void> => {
	if (text === '') {
		throw new Error('Text must contain more than 0 charaters');
	}

	await navigator.clipboard.writeText(text);
};
