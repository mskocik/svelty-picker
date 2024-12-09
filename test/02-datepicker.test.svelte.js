import { describe, it, expect } from "vitest";
// import { render } from "vitest-browser-svelte";
import { render } from "@testing-library/svelte";
import SveltyPicker from "$lib/components/SveltyPicker.svelte";
import { userEvent } from "@testing-library/user-event";
import { test } from "vitest";
import { flushSync } from "svelte";

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}



describe('Date selection [pickerOnly]', async () => {
  it('simple', async () => {
    let props = $state({
      value: null,
      pickerOnly: true
    });

    const screen = render(SveltyPicker, { props });

    const user = userEvent.setup();

    const day = screen.getByText('12', { selector: 'button' });
    await user.click(day);

    // console.log(screen.container.innerHTML);

    expect(screen.container.querySelector('td.is-selected')).toBeInTheDocument();
    expect(props.value.split('-').pop()).toEqual('12');

  });

  it('with initial value', async () => {
    let props = $state({
      value: '2024-12-09',
      pickerOnly: true
    });

    const screen = render(SveltyPicker, { props });

    expect(screen.container.querySelector('td.is-selected').textContent).toEqual('9');

    const user = userEvent.setup();
    await user.click(screen.getByText('12', { exact: true }));


    expect(screen.container.querySelector('td.is-selected')).toBeInTheDocument();
    expect(screen.container.querySelector('td.is-selected').textContent).toEqual('12');
    expect(props.value).toEqual('2024-12-12');
  });


  it('autocommit: false', async () => {
    let props = $state({
      value: '2024-12-09',
      pickerOnly: true,
      autocommit: false,
    });

    const screen = render(SveltyPicker, { props });

    const user = userEvent.setup();
    // await user.click(screen.container.querySelector('input[type=text]'));

    await user.click(screen.getByText('12', { exact: true }));

    expect(props.value).toEqual('2024-12-09');

    // expect(screen.container.querySelector('.value-dirty')).toBeInTheDocument();

    await user.click(screen.getByText('Ok', { exact: true }));

    expect(screen.container.querySelector('td.is-selected')).toBeInTheDocument();
    expect(screen.container.querySelector('td.is-selected').textContent).toEqual('12');
    expect(props.value).toEqual('2024-12-12');
  });


  it('update value from parent', async () => {
    let props = $state({
      value: '2024-12-09',
      pickerOnly: true
    });

    const screen = render(SveltyPicker, { props });

    expect(screen.container.querySelector('td.is-selected').textContent).toEqual('9');

    props.value = '2024-12-12';

    await sleep(500);

    expect(screen.container.querySelector('td.is-selected').textContent).toEqual('12');
  });
});

describe('Date selection', async () => {
  it('simple', async () => {
    let props = $state({
      value: null,
    });

    const screen = render(SveltyPicker, { props });

    const user = userEvent.setup();
    await user.click(screen.container.querySelector('input[type=text]'));

    expect(props.value).toBeNull();

    const day = screen.getByText('12', { selector: 'button' });
    await user.click(day);

    expect(props.value.split('-').pop()).toEqual('12');

  });

  it('with initial value', async () => {
    let props = $state({
      value: '2024-12-09',
    });

    const screen = render(SveltyPicker, { props });

    const user = userEvent.setup();
    await user.click(screen.container.querySelector('input[type=text]'));

    expect(screen.container.querySelector('td.is-selected').textContent).toEqual('9');

    await user.click(screen.getByText('12', { exact: true }));

    expect(props.value).toEqual('2024-12-12');

    await user.click(screen.container.querySelector('input[type=text]'));

    expect(screen.container.querySelector('td.is-selected')).toBeInTheDocument();
    expect(screen.container.querySelector('td.is-selected').textContent).toEqual('12');
  });


  it('autocommit: false', async () => {
    let props = $state({
      value: '2024-12-09',
      autocommit: false,
    });

    const screen = render(SveltyPicker, { props });

    const user = userEvent.setup();
    await user.click(screen.container.querySelector('input[type=text]'));

    await user.click(screen.getByText('12', { exact: true }));

    expect(props.value).toEqual('2024-12-09');

    expect(screen.container.querySelector('.value-dirty')).toBeInTheDocument();

    await user.click(screen.getByText('Ok', { exact: true }));

    flushSync();

    // popup should be closed, but is not in jsdom 🤷 TODO: use vite-browser here
    // expect(screen.container.querySelector('.sdt-calendar-wrap')).not.toBeInTheDocument();
    // expect(screen.container.querySelector('td.is-selected')).not.toBeInTheDocument();

    expect(props.value).toEqual('2024-12-12');
  });


  it('update value from parent', async () => {
    let props = $state({
      value: '2024-12-09',
    });

    const screen = render(SveltyPicker, { props });

    const user = userEvent.setup();
    await user.click(screen.container.querySelector('input[type=text]'));

    expect(screen.container.querySelector('td.is-selected').textContent).toEqual('9');

    props.value = '2024-12-12';

    await sleep(500);

    expect(screen.container.querySelector('td.is-selected').textContent).toEqual('12');
  });
});


describe('formatting', () => {
  it('simple format test', async () => {
    let props = $state({
      value: '2024-12-09',
      displayFormat: 'yyyy.mm.dd',
      autocommit: false,
    });

    const screen = render(SveltyPicker, { props });

    expect(screen.container.querySelector('input[type=hidden]').value).toEqual('2024-12-09');
    expect(screen.container.querySelector('input[type=text]').value).toEqual('2024.12.09');
  });

  it('update [format]', async () => {
    let props = $state({
      value: '2024-12-09',
      autocommit: false,
    });

    const screen = render(SveltyPicker, { props });

    screen.rerender({
      format: 'dd.mm.yyyy'
    });

    await sleep(500);

    expect(screen.container.querySelector('input[type=hidden]').value).toEqual('09.12.2024');
    expect(screen.container.querySelector('input[type=text]').value).toEqual('09.12.2024');
  });

  it('update [displayFormat]', async () => {
    let props = $state({
      value: '2024-12-09',
      autocommit: false,
    });

    const screen = render(SveltyPicker, { props });

    screen.rerender({
      displayFormat: 'dd.mm.yyyy'
    });

    await sleep(500);

    expect(screen.container.querySelector('input[type=hidden]').value).toEqual('2024-12-09');
    expect(screen.container.querySelector('input[type=text]').value).toEqual('09.12.2024');
  });
})

test('clear', async () => {

  let props = $state({
    value: '10:24',
    mode: 'time',
    format: 'hh:ii',
    pickerOnly: true
  });
  const screen = render(SveltyPicker, { props });

  const user = userEvent.setup();
  await user.click(screen.getByText('Clear'));

  expect(props.value || null).toEqual(null);
});
