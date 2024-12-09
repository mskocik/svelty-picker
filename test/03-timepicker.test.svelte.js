import { describe, it, expect } from "vitest";
// import { render } from "vitest-browser-svelte";
import { render } from "@testing-library/svelte";
import SveltyPicker from "$lib/components/SveltyPicker.svelte";
import { userEvent } from "@testing-library/user-event";

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

describe('Time selection', async () => {
  it('simple', async () => {
    let props = $state({
      value: null,
      format: 'hh:ii'
    });

    const screen = render(SveltyPicker, { props });

    const mainInput = screen.container.querySelector('input[type=text]');

    const user = userEvent.setup();
    await user.click(mainInput);

    const hour = screen.getByText('12', { selector: 'button.sdt-tick' });
    await user.click(hour);

    const minute = screen.getByText('30', { selector: 'button.sdt-tick' });
    await user.click(minute);


    // popup should be closed, but is not in jsdom 🤷 TODO: use vite-browser here
    // expect(screen.container.querySelector('.sdt-calendar-wrap')).not.toBeInTheDocument();
    expect(props.value).toEqual('12:30');

  });
});


describe('Time selection [pickerOnly]', async () => {
  it('simple', async () => {
    let props = $state({
      value: null,
      format: 'hh:ii',
      pickerOnly: true
    });

    const screen = render(SveltyPicker, { props });

    const user = userEvent.setup();

    const hour = screen.getByText('12', { selector: 'button.sdt-tick' });
    await user.click(hour);

    const minute = screen.getByText('30', { selector: 'button.sdt-tick' });
    await user.click(minute);

    expect(minute.classList.contains('is-selected')).toBeTruthy();
    expect(screen.container.querySelector('button.is-selected[data-value="30"]')).toBeInTheDocument();
    expect(props.value).toEqual('12:30');

  });
});
