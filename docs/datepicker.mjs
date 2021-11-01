
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
function noop() { }
const identity = x => x;
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function is_function(thing) {
    return typeof thing === 'function';
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
function is_empty(obj) {
    return Object.keys(obj).length === 0;
}

const is_client = typeof window !== 'undefined';
let now = is_client
    ? () => window.performance.now()
    : () => Date.now();
let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

const tasks = new Set();
function run_tasks(now) {
    tasks.forEach(task => {
        if (!task.c(now)) {
            tasks.delete(task);
            task.f();
        }
    });
    if (tasks.size !== 0)
        raf(run_tasks);
}
/**
 * Creates a new task that runs on each raf frame
 * until it returns a falsy value or is aborted
 */
function loop(callback) {
    let task;
    if (tasks.size === 0)
        raf(run_tasks);
    return {
        promise: new Promise(fulfill => {
            tasks.add(task = { c: callback, f: fulfill });
        }),
        abort() {
            tasks.delete(task);
        }
    };
}

function append(target, node) {
    target.appendChild(node);
}
function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
}
function detach(node) {
    node.parentNode.removeChild(node);
}
function destroy_each(iterations, detaching) {
    for (let i = 0; i < iterations.length; i += 1) {
        if (iterations[i])
            iterations[i].d(detaching);
    }
}
function element(name) {
    return document.createElement(name);
}
function text(data) {
    return document.createTextNode(data);
}
function space() {
    return text(' ');
}
function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
}
function prevent_default(fn) {
    return function (event) {
        event.preventDefault();
        // @ts-ignore
        return fn.call(this, event);
    };
}
function attr(node, attribute, value) {
    if (value == null)
        node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
        node.setAttribute(attribute, value);
}
function children(element) {
    return Array.from(element.childNodes);
}
function set_data(text, data) {
    data = '' + data;
    if (text.wholeText !== data)
        text.data = data;
}
function set_style(node, key, value, important) {
    node.style.setProperty(key, value, important ? 'important' : '');
}
function toggle_class(element, name, toggle) {
    element.classList[toggle ? 'add' : 'remove'](name);
}
function custom_event(type, detail) {
    const e = document.createEvent('CustomEvent');
    e.initCustomEvent(type, false, false, detail);
    return e;
}

const active_docs = new Set();
let active = 0;
// https://github.com/darkskyapp/string-hash/blob/master/index.js
function hash(str) {
    let hash = 5381;
    let i = str.length;
    while (i--)
        hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
    return hash >>> 0;
}
function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
    const step = 16.666 / duration;
    let keyframes = '{\n';
    for (let p = 0; p <= 1; p += step) {
        const t = a + (b - a) * ease(p);
        keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
    }
    const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
    const name = `__svelte_${hash(rule)}_${uid}`;
    const doc = node.ownerDocument;
    active_docs.add(doc);
    const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
    const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
    if (!current_rules[name]) {
        current_rules[name] = true;
        stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
    }
    const animation = node.style.animation || '';
    node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
    active += 1;
    return name;
}
function delete_rule(node, name) {
    const previous = (node.style.animation || '').split(', ');
    const next = previous.filter(name
        ? anim => anim.indexOf(name) < 0 // remove specific animation
        : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
    );
    const deleted = previous.length - next.length;
    if (deleted) {
        node.style.animation = next.join(', ');
        active -= deleted;
        if (!active)
            clear_rules();
    }
}
function clear_rules() {
    raf(() => {
        if (active)
            return;
        active_docs.forEach(doc => {
            const stylesheet = doc.__svelte_stylesheet;
            let i = stylesheet.cssRules.length;
            while (i--)
                stylesheet.deleteRule(i);
            doc.__svelte_rules = {};
        });
        active_docs.clear();
    });
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        throw new Error('Function called outside component initialization');
    return current_component;
}
function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
}

const dirty_components = [];
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;
function schedule_update() {
    if (!update_scheduled) {
        update_scheduled = true;
        resolved_promise.then(flush);
    }
}
function add_render_callback(fn) {
    render_callbacks.push(fn);
}
let flushing = false;
const seen_callbacks = new Set();
function flush() {
    if (flushing)
        return;
    flushing = true;
    do {
        // first, call beforeUpdate functions
        // and update components
        for (let i = 0; i < dirty_components.length; i += 1) {
            const component = dirty_components[i];
            set_current_component(component);
            update(component.$$);
        }
        set_current_component(null);
        dirty_components.length = 0;
        while (binding_callbacks.length)
            binding_callbacks.pop()();
        // then, once components are updated, call
        // afterUpdate functions. This may cause
        // subsequent updates...
        for (let i = 0; i < render_callbacks.length; i += 1) {
            const callback = render_callbacks[i];
            if (!seen_callbacks.has(callback)) {
                // ...so guard against infinite loops
                seen_callbacks.add(callback);
                callback();
            }
        }
        render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
        flush_callbacks.pop()();
    }
    update_scheduled = false;
    flushing = false;
    seen_callbacks.clear();
}
function update($$) {
    if ($$.fragment !== null) {
        $$.update();
        run_all($$.before_update);
        const dirty = $$.dirty;
        $$.dirty = [-1];
        $$.fragment && $$.fragment.p($$.ctx, dirty);
        $$.after_update.forEach(add_render_callback);
    }
}

let promise;
function wait() {
    if (!promise) {
        promise = Promise.resolve();
        promise.then(() => {
            promise = null;
        });
    }
    return promise;
}
function dispatch(node, direction, kind) {
    node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
}
const outroing = new Set();
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
}
const null_transition = { duration: 0 };
function create_in_transition(node, fn, params) {
    let config = fn(node, params);
    let running = false;
    let animation_name;
    let task;
    let uid = 0;
    function cleanup() {
        if (animation_name)
            delete_rule(node, animation_name);
    }
    function go() {
        const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
        if (css)
            animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
        tick(0, 1);
        const start_time = now() + delay;
        const end_time = start_time + duration;
        if (task)
            task.abort();
        running = true;
        add_render_callback(() => dispatch(node, true, 'start'));
        task = loop(now => {
            if (running) {
                if (now >= end_time) {
                    tick(1, 0);
                    dispatch(node, true, 'end');
                    cleanup();
                    return running = false;
                }
                if (now >= start_time) {
                    const t = easing((now - start_time) / duration);
                    tick(t, 1 - t);
                }
            }
            return running;
        });
    }
    let started = false;
    return {
        start() {
            if (started)
                return;
            delete_rule(node);
            if (is_function(config)) {
                config = config();
                wait().then(go);
            }
            else {
                go();
            }
        },
        invalidate() {
            started = false;
        },
        end() {
            if (running) {
                cleanup();
                running = false;
            }
        }
    };
}
function mount_component(component, target, anchor, customElement) {
    const { fragment, on_mount, on_destroy, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    if (!customElement) {
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
    }
    after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
        run_all($$.on_destroy);
        $$.fragment && $$.fragment.d(detaching);
        // TODO null out other refs, including component.$$ (but need to
        // preserve final state?)
        $$.on_destroy = $$.fragment = null;
        $$.ctx = [];
    }
}
function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
        dirty_components.push(component);
        schedule_update();
        component.$$.dirty.fill(0);
    }
    component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
}
function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const $$ = component.$$ = {
        fragment: null,
        ctx: null,
        // state
        props,
        update: noop,
        not_equal,
        bound: blank_object(),
        // lifecycle
        on_mount: [],
        on_destroy: [],
        on_disconnect: [],
        before_update: [],
        after_update: [],
        context: new Map(parent_component ? parent_component.$$.context : options.context || []),
        // everything else
        callbacks: blank_object(),
        dirty,
        skip_bound: false
    };
    let ready = false;
    $$.ctx = instance
        ? instance(component, options.props || {}, (i, ret, ...rest) => {
            const value = rest.length ? rest[0] : ret;
            if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                if (!$$.skip_bound && $$.bound[i])
                    $$.bound[i](value);
                if (ready)
                    make_dirty(component, i);
            }
            return ret;
        })
        : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    // `false` as a special case of no DOM component
    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
    if (options.target) {
        if (options.hydrate) {
            const nodes = children(options.target);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.l(nodes);
            nodes.forEach(detach);
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.c();
        }
        if (options.intro)
            transition_in(component.$$.fragment);
        mount_component(component, options.target, options.anchor, options.customElement);
        flush();
    }
    set_current_component(parent_component);
}
/**
 * Base class for Svelte components. Used when dev=false.
 */
class SvelteComponent {
    $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
    }
    $on(type, callback) {
        const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
        callbacks.push(callback);
        return () => {
            const index = callbacks.indexOf(callback);
            if (index !== -1)
                callbacks.splice(index, 1);
        };
    }
    $set($$props) {
        if (this.$$set && !is_empty($$props)) {
            this.$$.skip_bound = true;
            this.$$set($$props);
            this.$$.skip_bound = false;
        }
    }
}

function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
    const o = +getComputedStyle(node).opacity;
    return {
        delay,
        duration,
        easing,
        css: t => `opacity: ${t * o}`
    };
}

const MODE_DECADE = 0;
const MODE_YEAR = 1;
const MODE_MONTH = 2;

function compute(currentDate, view, locale) {
  // TODO: return dataset based on 'view' prop

  // years 4 x 3
  if (view === MODE_DECADE) {
    console.log('>', 'decade mode', currentDate);
    const nextFrom = 12;
    const prevTo = 1;
    const todayMark = -1;
    const yearGrid = [];
    let yearRow = [];
    let currYear = currentDate.getUTCFullYear() - (currentDate.getUTCFullYear() % 10) - 1;
    for (let i = 0; i < 12; i++) {
      yearRow.push(currYear + i);
      if (yearRow.length === 4) {
        yearGrid.push(yearRow);
        yearRow = [];
      }
    }
    const obj = { yearGrid, todayMark, nextFrom, prevTo};
    return obj;
  }

  // months 4 x 3
  if (view === MODE_YEAR) {
    let monthGrid = [];
    let monthRow = [];
    let prevTo = 0;
    let nextFrom = 12;
    const ISO = currentDate.toISOString().split('T')[0].substring(0, 8);
    const dateNormalized = new Date(ISO + '01 00:00:00');
    // TODO: implement todayMark
    let todayMark = 0;
    for (let i = 0; i < 12; i++) {
      dateNormalized.setUTCMonth(i);
      monthRow.push(locale.monthsShort[i]);
      if (monthRow.length === 4) {
        monthGrid.push(monthRow);
        monthRow = [];
      }
    }

    return {
      monthGrid, todayMark, nextFrom, prevTo
    }
  } 

  // days 7x6
  let d = currentDate || new Date(), // or currently selected date
      y = d.getUTCFullYear(),
      m = d.getUTCMonth();
      d.getUTCDate();
      d.getUTCHours();
      let today = new Date();
  let prevMonth = UTCDate(y, m-1, 28, 0, 0, 0, 0),
      day = utils.getDaysInMonth(prevMonth.getUTCFullYear(), prevMonth.getUTCMonth());
  
  prevMonth.setUTCDate(day);
  prevMonth.setUTCDate(day - (prevMonth.getUTCDay() - /** this.weekStart */ 1 + 7) % 7);

  let nextMonth = new Date(prevMonth);
  nextMonth.setUTCDate(nextMonth.getUTCDate() + 42);
  let nextMonthValue = nextMonth.valueOf();

  let dayGrid = [];
  let dayRow = [];
  let todayMark = -1;
  let prevTo = 0;
  let nextFrom = 42;

  let inc = 0;
  while(prevMonth.valueOf() < nextMonthValue) {
    inc++;
    dayRow.push(new Date(prevMonth));
    if (prevMonth.getUTCFullYear() < y || (prevMonth.getUTCFullYear() === y && prevMonth.getUTCMonth() < m)) {
      prevTo = inc;
    } else if (nextFrom === 42 && (prevMonth.getUTCFullYear() > y || (prevMonth.getUTCFullYear() === y && prevMonth.getUTCMonth() > m))) {
      nextFrom = inc - 1;
    }

    prevMonth.setUTCDate(prevMonth.getUTCDate() + 1);

    if (prevMonth.getUTCFullYear() === today.getFullYear() &&
      prevMonth.getUTCMonth() === today.getMonth() &&
      prevMonth.getUTCDate() === today.getDate()
    ) {
      // todayMark = dayGrid.length * 7 + dayRow.length;
      todayMark = inc;
    }

    if (dayRow.length === 7) {
      dayGrid.push(dayRow);
      dayRow = [];
    }
  }

  const obj = { dayGrid, todayMark, prevTo, nextFrom };
  console.log(obj);
  return obj;
}

const utils = {
  isLeapYear:       function (year) {
    return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0))
  },
  getDaysInMonth:   function (year, month) {
    return [31, (utils.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month]
  },
};

function UTCDate() {
  return new Date(Date.UTC.apply(Date, arguments));
}

const en = {
  days:        ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  daysShort:   ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  daysMin:     ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
  months:      ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  meridiem:    ['am', 'pm'],
  suffix:      ['st', 'nd', 'rd', 'th'],
  today:       'Today',
  clear:       'Clear'
};

/* src\DatePicker.svelte generated by Svelte v3.37.0 */

function add_css() {
	var style = element("style");
	style.id = "svelte-j2ppi7-style";
	style.textContent = ".is-today.svelte-j2ppi7{color:red}.not-current.svelte-j2ppi7{color:#ccc}";
	append(document.head, style);
}

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[18] = list[i];
	child_ctx[20] = i;
	return child_ctx;
}

function get_each_context_1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[0] = list[i];
	child_ctx[22] = i;
	return child_ctx;
}

function get_each_context_2(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[18] = list[i];
	child_ctx[20] = i;
	return child_ctx;
}

function get_each_context_3(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[24] = list[i];
	child_ctx[22] = i;
	return child_ctx;
}

function get_each_context_4(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[18] = list[i];
	child_ctx[20] = i;
	return child_ctx;
}

function get_each_context_5(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[27] = list[i];
	child_ctx[22] = i;
	return child_ctx;
}

// (89:6) {#if currentView === MODE_DECADE}
function create_if_block_2(ctx) {
	let tbody;
	let tbody_intro;
	let each_value_4 = /*dataset*/ ctx[4].yearGrid;
	let each_blocks = [];

	for (let i = 0; i < each_value_4.length; i += 1) {
		each_blocks[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
	}

	return {
		c() {
			tbody = element("tbody");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}
		},
		m(target, anchor) {
			insert(target, tbody, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(tbody, null);
			}
		},
		p(ctx, dirty) {
			if (dirty & /*dataset, updateActiveDate*/ 528) {
				each_value_4 = /*dataset*/ ctx[4].yearGrid;
				let i;

				for (i = 0; i < each_value_4.length; i += 1) {
					const child_ctx = get_each_context_4(ctx, each_value_4, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_4(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(tbody, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_4.length;
			}
		},
		i(local) {
			if (!tbody_intro) {
				add_render_callback(() => {
					tbody_intro = create_in_transition(tbody, fade, { duration: 200 });
					tbody_intro.start();
				});
			}
		},
		o: noop,
		d(detaching) {
			if (detaching) detach(tbody);
			destroy_each(each_blocks, detaching);
		}
	};
}

// (93:10) {#each row as year, j}
function create_each_block_5(ctx) {
	let td;
	let button;
	let t_value = /*year*/ ctx[27] + "";
	let t;
	let mounted;
	let dispose;

	function click_handler_3() {
		return /*click_handler_3*/ ctx[14](/*year*/ ctx[27]);
	}

	return {
		c() {
			td = element("td");
			button = element("button");
			t = text(t_value);
		},
		m(target, anchor) {
			insert(target, td, anchor);
			append(td, button);
			append(button, t);

			if (!mounted) {
				dispose = listen(button, "click", prevent_default(click_handler_3));
				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			if (dirty & /*dataset*/ 16 && t_value !== (t_value = /*year*/ ctx[27] + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(td);
			mounted = false;
			dispose();
		}
	};
}

// (91:8) {#each dataset.yearGrid as row, i}
function create_each_block_4(ctx) {
	let tr;
	let t;
	let each_value_5 = /*row*/ ctx[18];
	let each_blocks = [];

	for (let i = 0; i < each_value_5.length; i += 1) {
		each_blocks[i] = create_each_block_5(get_each_context_5(ctx, each_value_5, i));
	}

	return {
		c() {
			tr = element("tr");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t = space();
		},
		m(target, anchor) {
			insert(target, tr, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(tr, null);
			}

			append(tr, t);
		},
		p(ctx, dirty) {
			if (dirty & /*updateActiveDate, dataset*/ 528) {
				each_value_5 = /*row*/ ctx[18];
				let i;

				for (i = 0; i < each_value_5.length; i += 1) {
					const child_ctx = get_each_context_5(ctx, each_value_5, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_5(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(tr, t);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_5.length;
			}
		},
		d(detaching) {
			if (detaching) detach(tr);
			destroy_each(each_blocks, detaching);
		}
	};
}

// (102:6) {#if currentView === MODE_YEAR}
function create_if_block_1(ctx) {
	let tbody;
	let tbody_intro;
	let each_value_2 = /*dataset*/ ctx[4].monthGrid;
	let each_blocks = [];

	for (let i = 0; i < each_value_2.length; i += 1) {
		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
	}

	return {
		c() {
			tbody = element("tbody");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}
		},
		m(target, anchor) {
			insert(target, tbody, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(tbody, null);
			}
		},
		p(ctx, dirty) {
			if (dirty & /*dataset, updateActiveDate*/ 528) {
				each_value_2 = /*dataset*/ ctx[4].monthGrid;
				let i;

				for (i = 0; i < each_value_2.length; i += 1) {
					const child_ctx = get_each_context_2(ctx, each_value_2, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_2(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(tbody, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_2.length;
			}
		},
		i(local) {
			if (!tbody_intro) {
				add_render_callback(() => {
					tbody_intro = create_in_transition(tbody, fade, { duration: 200 });
					tbody_intro.start();
				});
			}
		},
		o: noop,
		d(detaching) {
			if (detaching) detach(tbody);
			destroy_each(each_blocks, detaching);
		}
	};
}

// (106:10) {#each row as month, j}
function create_each_block_3(ctx) {
	let td;
	let button;
	let t_value = /*month*/ ctx[24] + "";
	let t;
	let mounted;
	let dispose;

	function click_handler_4() {
		return /*click_handler_4*/ ctx[15](/*month*/ ctx[24]);
	}

	return {
		c() {
			td = element("td");
			button = element("button");
			t = text(t_value);
		},
		m(target, anchor) {
			insert(target, td, anchor);
			append(td, button);
			append(button, t);

			if (!mounted) {
				dispose = listen(button, "click", prevent_default(click_handler_4));
				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			if (dirty & /*dataset*/ 16 && t_value !== (t_value = /*month*/ ctx[24] + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(td);
			mounted = false;
			dispose();
		}
	};
}

// (104:8) {#each dataset.monthGrid as row, i}
function create_each_block_2(ctx) {
	let tr;
	let t;
	let each_value_3 = /*row*/ ctx[18];
	let each_blocks = [];

	for (let i = 0; i < each_value_3.length; i += 1) {
		each_blocks[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
	}

	return {
		c() {
			tr = element("tr");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t = space();
		},
		m(target, anchor) {
			insert(target, tr, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(tr, null);
			}

			append(tr, t);
		},
		p(ctx, dirty) {
			if (dirty & /*updateActiveDate, dataset*/ 528) {
				each_value_3 = /*row*/ ctx[18];
				let i;

				for (i = 0; i < each_value_3.length; i += 1) {
					const child_ctx = get_each_context_3(ctx, each_value_3, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_3(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(tr, t);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_3.length;
			}
		},
		d(detaching) {
			if (detaching) detach(tr);
			destroy_each(each_blocks, detaching);
		}
	};
}

// (115:6) {#if currentView === MODE_MONTH}
function create_if_block(ctx) {
	let tbody;
	let tbody_intro;
	let each_value = /*dataset*/ ctx[4].dayGrid;
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	return {
		c() {
			tbody = element("tbody");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}
		},
		m(target, anchor) {
			insert(target, tbody, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(tbody, null);
			}
		},
		p(ctx, dirty) {
			if (dirty & /*dataset, isBetween, updateActiveDate*/ 592) {
				each_value = /*dataset*/ ctx[4].dayGrid;
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(tbody, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}
		},
		i(local) {
			if (!tbody_intro) {
				add_render_callback(() => {
					tbody_intro = create_in_transition(tbody, fade, { duration: 200 });
					tbody_intro.start();
				});
			}
		},
		o: noop,
		d(detaching) {
			if (detaching) detach(tbody);
			destroy_each(each_blocks, detaching);
		}
	};
}

// (119:10) {#each row as date, j}
function create_each_block_1(ctx) {
	let td;
	let button;
	let t_value = /*date*/ ctx[0].getUTCDate() + "";
	let t;
	let mounted;
	let dispose;

	function click_handler_5() {
		return /*click_handler_5*/ ctx[16](/*date*/ ctx[0]);
	}

	return {
		c() {
			td = element("td");
			button = element("button");
			t = text(t_value);
			attr(td, "class", "svelte-j2ppi7");
			toggle_class(td, "is-today", /*i*/ ctx[20] * 7 + /*j*/ ctx[22] === /*dataset*/ ctx[4].todayMark);
			toggle_class(td, "not-current", !/*isBetween*/ ctx[6](/*i*/ ctx[20] * 7 + /*j*/ ctx[22], /*date*/ ctx[0]));
		},
		m(target, anchor) {
			insert(target, td, anchor);
			append(td, button);
			append(button, t);

			if (!mounted) {
				dispose = listen(button, "click", prevent_default(click_handler_5));
				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			if (dirty & /*dataset*/ 16 && t_value !== (t_value = /*date*/ ctx[0].getUTCDate() + "")) set_data(t, t_value);

			if (dirty & /*dataset*/ 16) {
				toggle_class(td, "is-today", /*i*/ ctx[20] * 7 + /*j*/ ctx[22] === /*dataset*/ ctx[4].todayMark);
			}

			if (dirty & /*isBetween, dataset*/ 80) {
				toggle_class(td, "not-current", !/*isBetween*/ ctx[6](/*i*/ ctx[20] * 7 + /*j*/ ctx[22], /*date*/ ctx[0]));
			}
		},
		d(detaching) {
			if (detaching) detach(td);
			mounted = false;
			dispose();
		}
	};
}

// (117:8) {#each dataset.dayGrid as row, i }
function create_each_block(ctx) {
	let tr;
	let t;
	let each_value_1 = /*row*/ ctx[18];
	let each_blocks = [];

	for (let i = 0; i < each_value_1.length; i += 1) {
		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
	}

	return {
		c() {
			tr = element("tr");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t = space();
		},
		m(target, anchor) {
			insert(target, tr, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(tr, null);
			}

			append(tr, t);
		},
		p(ctx, dirty) {
			if (dirty & /*dataset, isBetween, updateActiveDate*/ 592) {
				each_value_1 = /*row*/ ctx[18];
				let i;

				for (i = 0; i < each_value_1.length; i += 1) {
					const child_ctx = get_each_context_1(ctx, each_value_1, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_1(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(tr, t);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_1.length;
			}
		},
		d(detaching) {
			if (detaching) detach(tr);
			destroy_each(each_blocks, detaching);
		}
	};
}

function create_fragment(ctx) {
	let div0;
	let input;
	let t0;
	let t1_value = /*activeDate*/ ctx[1].toDateString() + "";
	let t1;
	let t2;
	let t3;
	let t4;
	let div2;
	let div1;
	let table;
	let thead;
	let tr;
	let td0;
	let button0;
	let t6;
	let td1;
	let button1;
	let t7;
	let t8;
	let button2;
	let t10;
	let td2;
	let button3;
	let t12;
	let t13;
	let t14;
	let mounted;
	let dispose;
	let if_block0 = /*currentView*/ ctx[2] === MODE_DECADE && create_if_block_2(ctx);
	let if_block1 = /*currentView*/ ctx[2] === MODE_YEAR && create_if_block_1(ctx);
	let if_block2 = /*currentView*/ ctx[2] === MODE_MONTH && create_if_block(ctx);

	return {
		c() {
			div0 = element("div");
			input = element("input");
			t0 = space();
			t1 = text(t1_value);
			t2 = space();
			t3 = text(/*currentView*/ ctx[2]);
			t4 = space();
			div2 = element("div");
			div1 = element("div");
			table = element("table");
			thead = element("thead");
			tr = element("tr");
			td0 = element("td");
			button0 = element("button");
			button0.textContent = "P";
			t6 = space();
			td1 = element("td");
			button1 = element("button");
			t7 = text(/*tableCaption*/ ctx[5]);
			t8 = space();
			button2 = element("button");
			button2.textContent = "+";
			t10 = space();
			td2 = element("td");
			button3 = element("button");
			button3.textContent = "N";
			t12 = space();
			if (if_block0) if_block0.c();
			t13 = space();
			if (if_block1) if_block1.c();
			t14 = space();
			if (if_block2) if_block2.c();
			attr(td1, "colspan", "5");
			attr(table, "class", "dt-table table");
			attr(div1, "class", "c-datepicker-section");
			attr(div2, "class", "c-datepicker");
			set_style(div2, "width", "400px");
		},
		m(target, anchor) {
			insert(target, div0, anchor);
			append(div0, input);
			/*input_binding*/ ctx[10](input);
			append(div0, t0);
			append(div0, t1);
			insert(target, t2, anchor);
			insert(target, t3, anchor);
			insert(target, t4, anchor);
			insert(target, div2, anchor);
			append(div2, div1);
			append(div1, table);
			append(table, thead);
			append(thead, tr);
			append(tr, td0);
			append(td0, button0);
			append(tr, t6);
			append(tr, td1);
			append(td1, button1);
			append(button1, t7);
			append(td1, t8);
			append(td1, button2);
			append(tr, t10);
			append(tr, td2);
			append(td2, button3);
			append(table, t12);
			if (if_block0) if_block0.m(table, null);
			append(table, t13);
			if (if_block1) if_block1.m(table, null);
			append(table, t14);
			if (if_block2) if_block2.m(table, null);

			if (!mounted) {
				dispose = [
					listen(button0, "click", /*click_handler*/ ctx[11]),
					listen(button1, "click", /*onSwitchView*/ ctx[8]),
					listen(button2, "click", /*click_handler_1*/ ctx[12]),
					listen(button3, "click", /*click_handler_2*/ ctx[13])
				];

				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (dirty & /*activeDate*/ 2 && t1_value !== (t1_value = /*activeDate*/ ctx[1].toDateString() + "")) set_data(t1, t1_value);
			if (dirty & /*currentView*/ 4) set_data(t3, /*currentView*/ ctx[2]);
			if (dirty & /*tableCaption*/ 32) set_data(t7, /*tableCaption*/ ctx[5]);

			if (/*currentView*/ ctx[2] === MODE_DECADE) {
				if (if_block0) {
					if_block0.p(ctx, dirty);

					if (dirty & /*currentView*/ 4) {
						transition_in(if_block0, 1);
					}
				} else {
					if_block0 = create_if_block_2(ctx);
					if_block0.c();
					transition_in(if_block0, 1);
					if_block0.m(table, t13);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (/*currentView*/ ctx[2] === MODE_YEAR) {
				if (if_block1) {
					if_block1.p(ctx, dirty);

					if (dirty & /*currentView*/ 4) {
						transition_in(if_block1, 1);
					}
				} else {
					if_block1 = create_if_block_1(ctx);
					if_block1.c();
					transition_in(if_block1, 1);
					if_block1.m(table, t14);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (/*currentView*/ ctx[2] === MODE_MONTH) {
				if (if_block2) {
					if_block2.p(ctx, dirty);

					if (dirty & /*currentView*/ 4) {
						transition_in(if_block2, 1);
					}
				} else {
					if_block2 = create_if_block(ctx);
					if_block2.c();
					transition_in(if_block2, 1);
					if_block2.m(table, null);
				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}
		},
		i(local) {
			transition_in(if_block0);
			transition_in(if_block1);
			transition_in(if_block2);
		},
		o: noop,
		d(detaching) {
			if (detaching) detach(div0);
			/*input_binding*/ ctx[10](null);
			if (detaching) detach(t2);
			if (detaching) detach(t3);
			if (detaching) detach(t4);
			if (detaching) detach(div2);
			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
			if (if_block2) if_block2.d();
			mounted = false;
			run_all(dispose);
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	let dataset;
	let tableCaption;
	let { date = new Date() } = $$props;
	let activeDate = date;
	let currentView = MODE_MONTH;
	let demoInput;

	function isBetween(num) {
		return dataset.prevTo <= num && num < dataset.nextFrom;
	}

	function changeMonth(val) {
		const multiplier = currentView === MODE_DECADE
		? 120
		: currentView === MODE_YEAR ? 12 : 1;

		activeDate.setUTCMonth(activeDate.getUTCMonth() + val * multiplier);
		$$invalidate(1, activeDate);
	}

	function onSwitchView() {
		currentView && $$invalidate(2, currentView--, currentView);
	}

	function updateActiveDate(value) {
		switch (currentView) {
			case 0:
				activeDate.setYear(value);
				break;
			case 1:
				activeDate.setUTCMonth(en.monthsShort.indexOf(value));
				break;
			case 2:
				activeDate.setDate(value);
				$$invalidate(1, activeDate);
				break;
		}

		currentView < MODE_MONTH && $$invalidate(2, currentView++, currentView);
	}

	function showCaption() {
		switch (currentView) {
			case 0:
				return `${dataset.yearGrid[0][1]} - ${dataset.yearGrid[2][2]}`;
			case 1:
				return activeDate.getUTCFullYear();
			case 2:
				return en.months[activeDate.getUTCMonth()] + " " + activeDate.getUTCFullYear();
		}
	}

	onMount(() => {
		demoInput.focus();
	});

	function input_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			demoInput = $$value;
			$$invalidate(3, demoInput);
		});
	}

	const click_handler = () => changeMonth(-1);

	const click_handler_1 = () => {
		$$invalidate(2, currentView++, currentView);
	};

	const click_handler_2 = () => changeMonth(1);

	const click_handler_3 = year => {
		updateActiveDate(year);
	};

	const click_handler_4 = month => {
		updateActiveDate(month);
	};

	const click_handler_5 = date => {
		updateActiveDate(date.getUTCDate());
	};

	$$self.$$set = $$props => {
		if ("date" in $$props) $$invalidate(0, date = $$props.date);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*activeDate, currentView*/ 6) {
			$$invalidate(4, dataset = compute(activeDate, currentView, en));
		}

		if ($$self.$$.dirty & /*currentView, activeDate*/ 6) {
			$$invalidate(5, tableCaption = showCaption());
		}
	};

	return [
		date,
		activeDate,
		currentView,
		demoInput,
		dataset,
		tableCaption,
		isBetween,
		changeMonth,
		onSwitchView,
		updateActiveDate,
		input_binding,
		click_handler,
		click_handler_1,
		click_handler_2,
		click_handler_3,
		click_handler_4,
		click_handler_5
	];
}

class DatePicker extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-j2ppi7-style")) add_css();
		init(this, options, instance, create_fragment, safe_not_equal, { date: 0 });
	}
}

const d = new Date();

new DatePicker({
  target: document.body,
  props: {
    date: d
  }
});
