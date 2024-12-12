import { render } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import SveltyPicker from '$lib/components/SveltyPicker.svelte';
import userEvent from "@testing-library/user-event";

describe('DOM Render', async () => {
  it('input only', () => {
    const { container } = render(SveltyPicker, { props: {
      // value: new Date()
    }});

    expect(container.querySelector('input[type=text]')).toBeInTheDocument();
  });


  it('show popup after focus', async () => {
    const { container } = render(SveltyPicker, {
      onfocus: () => console.log('focuesed')
    });

    expect(container.querySelector('.sdt-calendar-wrap')).not.toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(container.querySelector('input[type=text]'));

    expect(container.querySelector('.sdt-calendar-wrap')).toBeInTheDocument();
  });


  it('pickerOnly', () => {
    const { container } = render(SveltyPicker, { props: {
      pickerOnly: true
    }});

    expect(container.querySelector('.sdt-component-wrap')).toBeInTheDocument();
    expect(container.querySelector('.sdt-calendar-wrap')).toBeInTheDocument();
  });

});
