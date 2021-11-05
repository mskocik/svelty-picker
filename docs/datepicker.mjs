
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
function null_to_empty(value) {
    return value == null ? '' : value;
}
function action_destroyer(action_result) {
    return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
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
function empty() {
    return text('');
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
function set_input_value(input, value) {
    input.value = value == null ? '' : value;
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
function createEventDispatcher() {
    const component = get_current_component();
    return (type, detail) => {
        const callbacks = component.$$.callbacks[type];
        if (callbacks) {
            // TODO are there situations where events could be dispatched
            // in a server (non-DOM) environment?
            const event = custom_event(type, detail);
            callbacks.slice().forEach(fn => {
                fn.call(component, event);
            });
        }
    };
}
// TODO figure out if we still want to support
// shorthand events, or if we want to implement
// a real bubbling mechanism
function bubble(component, event) {
    const callbacks = component.$$.callbacks[event.type];
    if (callbacks) {
        callbacks.slice().forEach(fn => fn(event));
    }
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
function tick() {
    schedule_update();
    return resolved_promise;
}
function add_render_callback(fn) {
    render_callbacks.push(fn);
}
function add_flush_callback(fn) {
    flush_callbacks.push(fn);
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
let outros;
function group_outros() {
    outros = {
        r: 0,
        c: [],
        p: outros // parent group
    };
}
function check_outros() {
    if (!outros.r) {
        run_all(outros.c);
    }
    outros = outros.p;
}
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
}
function transition_out(block, local, detach, callback) {
    if (block && block.o) {
        if (outroing.has(block))
            return;
        outroing.add(block);
        outros.c.push(() => {
            outroing.delete(block);
            if (callback) {
                if (detach)
                    block.d(1);
                callback();
            }
        });
        block.o(local);
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
function create_bidirectional_transition(node, fn, params, intro) {
    let config = fn(node, params);
    let t = intro ? 0 : 1;
    let running_program = null;
    let pending_program = null;
    let animation_name = null;
    function clear_animation() {
        if (animation_name)
            delete_rule(node, animation_name);
    }
    function init(program, duration) {
        const d = program.b - t;
        duration *= Math.abs(d);
        return {
            a: t,
            b: program.b,
            d,
            duration,
            start: program.start,
            end: program.start + duration,
            group: program.group
        };
    }
    function go(b) {
        const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
        const program = {
            start: now() + delay,
            b
        };
        if (!b) {
            // @ts-ignore todo: improve typings
            program.group = outros;
            outros.r += 1;
        }
        if (running_program || pending_program) {
            pending_program = program;
        }
        else {
            // if this is an intro, and there's a delay, we need to do
            // an initial tick and/or apply CSS animation immediately
            if (css) {
                clear_animation();
                animation_name = create_rule(node, t, b, duration, delay, easing, css);
            }
            if (b)
                tick(0, 1);
            running_program = init(program, duration);
            add_render_callback(() => dispatch(node, b, 'start'));
            loop(now => {
                if (pending_program && now > pending_program.start) {
                    running_program = init(pending_program, duration);
                    pending_program = null;
                    dispatch(node, running_program.b, 'start');
                    if (css) {
                        clear_animation();
                        animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                    }
                }
                if (running_program) {
                    if (now >= running_program.end) {
                        tick(t = running_program.b, 1 - t);
                        dispatch(node, running_program.b, 'end');
                        if (!pending_program) {
                            // we're done
                            if (running_program.b) {
                                // intro — we can tidy up immediately
                                clear_animation();
                            }
                            else {
                                // outro — needs to be coordinated
                                if (!--running_program.group.r)
                                    run_all(running_program.group.c);
                            }
                        }
                        running_program = null;
                    }
                    else if (now >= running_program.start) {
                        const p = now - running_program.start;
                        t = running_program.a + running_program.d * easing(p / running_program.duration);
                        tick(t, 1 - t);
                    }
                }
                return !!(running_program || pending_program);
            });
        }
    }
    return {
        run(b) {
            if (is_function(config)) {
                wait().then(() => {
                    // @ts-ignore
                    config = config();
                    go(b);
                });
            }
            else {
                go(b);
            }
        },
        end() {
            clear_animation();
            running_program = pending_program = null;
        }
    };
}

function destroy_block(block, lookup) {
    block.d(1);
    lookup.delete(block.key);
}
function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
    let o = old_blocks.length;
    let n = list.length;
    let i = o;
    const old_indexes = {};
    while (i--)
        old_indexes[old_blocks[i].key] = i;
    const new_blocks = [];
    const new_lookup = new Map();
    const deltas = new Map();
    i = n;
    while (i--) {
        const child_ctx = get_context(ctx, list, i);
        const key = get_key(child_ctx);
        let block = lookup.get(key);
        if (!block) {
            block = create_each_block(key, child_ctx);
            block.c();
        }
        else if (dynamic) {
            block.p(child_ctx, dirty);
        }
        new_lookup.set(key, new_blocks[i] = block);
        if (key in old_indexes)
            deltas.set(key, Math.abs(i - old_indexes[key]));
    }
    const will_move = new Set();
    const did_move = new Set();
    function insert(block) {
        transition_in(block, 1);
        block.m(node, next);
        lookup.set(block.key, block);
        next = block.first;
        n--;
    }
    while (o && n) {
        const new_block = new_blocks[n - 1];
        const old_block = old_blocks[o - 1];
        const new_key = new_block.key;
        const old_key = old_block.key;
        if (new_block === old_block) {
            // do nothing
            next = new_block.first;
            o--;
            n--;
        }
        else if (!new_lookup.has(old_key)) {
            // remove old block
            destroy(old_block, lookup);
            o--;
        }
        else if (!lookup.has(new_key) || will_move.has(new_key)) {
            insert(new_block);
        }
        else if (did_move.has(old_key)) {
            o--;
        }
        else if (deltas.get(new_key) > deltas.get(old_key)) {
            did_move.add(new_key);
            insert(new_block);
        }
        else {
            will_move.add(old_key);
            o--;
        }
    }
    while (o--) {
        const old_block = old_blocks[o];
        if (!new_lookup.has(old_block.key))
            destroy(old_block, lookup);
    }
    while (n)
        insert(new_blocks[n - 1]);
    return new_blocks;
}

function bind(component, name, callback) {
    const index = component.$$.props[name];
    if (index !== undefined) {
        component.$$.bound[index] = callback;
        callback(component.$$.ctx[index]);
    }
}
function create_component(block) {
    block && block.c();
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

function compute(currentDate, selectedDate, view, locale) {

  // years 4 x 3
  if (view === MODE_DECADE) {
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
    let selectionMark = null;
    if (!selectedDate) {
      selectedDate = new Date();
    }
    if (selectedDate.getUTCFullYear() >= currYear) {
      selectionMark = selectedDate.getUTCFullYear() % currYear;
    }

    const obj =
      { yearGrid, todayMark, nextFrom, prevTo, selectionMark};
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
    let selectionMark = null;
    if (!selectedDate) {
      selectedDate = new Date();
    }
    if (selectedDate.getUTCFullYear() === currentDate.getUTCFullYear()) {
      selectionMark = selectedDate.getUTCMonth();
    }

    return {
      monthGrid, todayMark, nextFrom, prevTo, selectionMark
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
  let selectionMark = null;
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
      todayMark = inc;
    }
    if (!selectionMark && selectedDate
      && prevMonth.getUTCFullYear() === selectedDate.getUTCFullYear()
      && prevMonth.getMonth() === selectedDate.getMonth()
      && prevMonth.getUTCDate() === selectedDate.getUTCDate()
    ) {
      selectionMark = inc;
    }
    
    if (dayRow.length === 7) {
      dayGrid.push(dayRow);
      dayRow = [];
    }
  }
  return { dayGrid, todayMark, prevTo, nextFrom, selectionMark };
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

function formatDate(date, format, i18n, type) {
  if (date === null) {
    return '';
  }
  var val;
  if (type === 'standard') {
    val = {
      t:    date.getTime(),
      // year
      yy:   date.getUTCFullYear().toString().substring(2),
      yyyy: date.getUTCFullYear(),
      // month
      m:    date.getUTCMonth() + 1,
      M:    i18n.monthsShort[date.getUTCMonth()],
      MM:   i18n.months[date.getUTCMonth()],
      // day
      d:    date.getUTCDate(),
      D:    i18n.daysShort[date.getUTCDay()],
      DD:   i18n.days[date.getUTCDay()],
      p:    (i18n.meridiem.length === 2 ? i18n.meridiem[date.getUTCHours() < 12 ? 0 : 1] : ''),
      // hour
      h:    date.getUTCHours(),
      // minute
      i:    date.getUTCMinutes(),
      // second
      s:    date.getUTCSeconds(),
      // timezone
      z:    date.toLocaleDateString(undefined, {day:'2-digit',timeZoneName: 'long' }).substring(4)
    };

    if (i18n.meridiem.length === 2) {
      val.H = (val.h % 12 === 0 ? 12 : val.h % 12);
    }
    else {
      val.H = val.h;
    }
    val.HH = (val.H < 10 ? '0' : '') + val.H;
    val.P = val.p.toUpperCase();
    val.Z = val.z;
    val.hh = (val.h < 10 ? '0' : '') + val.h;
    val.ii = (val.i < 10 ? '0' : '') + val.i;
    val.ss = (val.s < 10 ? '0' : '') + val.s;
    val.dd = (val.d < 10 ? '0' : '') + val.d;
    val.mm = (val.m < 10 ? '0' : '') + val.m;
  } else if (type === 'php') {
    // php format
    val = {
      // year
      y: date.getUTCFullYear().toString().substring(2),
      Y: date.getUTCFullYear(),
      // month
      F: i18n.months[date.getUTCMonth()],
      M: i18n.monthsShort[date.getUTCMonth()],
      n: date.getUTCMonth() + 1,
      t: utils.getDaysInMonth(date.getUTCFullYear(), date.getUTCMonth()),
      // day
      j: date.getUTCDate(),
      l: i18n.days[date.getUTCDay()],
      D: i18n.daysShort[date.getUTCDay()],
      w: date.getUTCDay(), // 0 -> 6
      N: (date.getUTCDay() === 0 ? 7 : date.getUTCDay()),       // 1 -> 7
      S: (date.getUTCDate() % 10 <= i18n.suffix.length ? i18n.suffix[date.getUTCDate() % 10 - 1] : ''),
      // hour
      a: (i18n.meridiem.length === 2 ? i18n.meridiem[date.getUTCHours() < 12 ? 0 : 1] : ''),
      g: (date.getUTCHours() % 12 === 0 ? 12 : date.getUTCHours() % 12),
      G: date.getUTCHours(),
      // minute
      i: date.getUTCMinutes(),
      // second
      s: date.getUTCSeconds()
    };
    val.m = (val.n < 10 ? '0' : '') + val.n;
    val.d = (val.j < 10 ? '0' : '') + val.j;
    val.A = val.a.toString().toUpperCase();
    val.h = (val.g < 10 ? '0' : '') + val.g;
    val.H = (val.G < 10 ? '0' : '') + val.G;
    val.i = (val.i < 10 ? '0' : '') + val.i;
    val.s = (val.s < 10 ? '0' : '') + val.s;
  } else {
    throw new Error('Invalid format type.');
  }
  let dateArr = [];
  format = formatHelper.parseFormat(format, type);
  for (var i = 0, cnt = format.parts.length; i < cnt; i++) {
    if (format.separators.length) {
      dateArr.push(format.separators.shift());
    }
    dateArr.push(val[format.parts[i]]);
  }
  if (format.separators.length) {
    dateArr.push(format.separators.shift());
  }
  return dateArr.join('');
}

const formatHelper = {
  validParts: function (type) {
    if (type === 'standard') {
      return /t|hh?|HH?|p|P|z|Z|ii?|ss?|dd?|DD?|mm?|MM?|yy(?:yy)?/g;
    } else if (type === 'php') {
      return /[dDjlNwzFmMnStyYaABgGhHis]/g;
    } else {
      throw new Error('Invalid format type.');
    }
  },
  nonpunctuation: /[^ -\/:-@\[-`{-~\t\n\rTZ]+/g,
  parseFormat: function (format, type) {
      // IE treats \0 as a string end in inputs (truncating the value),
      // so it's a bad format delimiter, anyway
    var separators = format.replace(this.validParts(type), '\0').split('\0'),
    parts = format.match(this.validParts(type));
    if (!separators || !separators.length || !parts || parts.length === 0) {
      throw new Error('Invalid date format.');
    }
    return {separators: separators, parts: parts};
  },
};

/* src\Calendar.svelte generated by Svelte v3.37.0 */

function add_css$1() {
	var style = element("style");
	style.id = "svelte-snram0-style";
	style.textContent = ".sdt-cal-td.svelte-snram0.svelte-snram0{padding:0;font-size:90%;text-align:center}.sdt-calendar.svelte-snram0.svelte-snram0{padding-top:0.5rem}.sdt-table.svelte-snram0.svelte-snram0{width:100%}.sdt-today.svelte-snram0.svelte-snram0{color:red}.not-current.svelte-snram0.svelte-snram0{color:#ccc}.std-btn.svelte-snram0.svelte-snram0{border:0;background:transparent;text-align:center;width:100%;border-radius:4px;cursor:pointer;padding:0.375rem}.std-btn-header.svelte-snram0.svelte-snram0{width:auto;font-weight:bold;padding:0.375rem 0.5rem}.std-btn.svelte-snram0.svelte-snram0:hover{background-color:#eee;border-color:#ddd}.is-selected.svelte-snram0 .std-btn.svelte-snram0{background-color:#286090;border-color:#204d74;color:white;opacity:0.9}.std-btn-header.svelte-snram0.svelte-snram0:hover{background-color:rgb(223, 223, 223);color:black}.sdt-tbody-lg.svelte-snram0 .std-btn.svelte-snram0{height:60px}.sdt-thead-nav.svelte-snram0.svelte-snram0{display:flex}.sdt-nav-btns.svelte-snram0.svelte-snram0{white-space:nowrap}.sdt-toggle-btn.svelte-snram0.svelte-snram0{width:100%;text-align:left}.sdt-today.svelte-snram0.svelte-snram0:before{position:absolute;content:'';margin-left:4px;margin-top:4px;border-left:4px solid #ccc;border-top:4px solid #ccc;border-bottom:4px solid transparent;border-right:4px solid transparent;border-radius:2px;height:4px;z-index:2}.sdt-today.svelte-snram0.svelte-snram0:hover:before{border-left-color:#286090;border-top-color:#286090}.is-selected.sdt-today.svelte-snram0.svelte-snram0:before{border-left-color:#eee;border-top-color:#eee}";
	append(document.head, style);
}

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[24] = list[i];
	child_ctx[26] = i;
	return child_ctx;
}

function get_each_context_1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[27] = list[i];
	child_ctx[29] = i;
	return child_ctx;
}

function get_each_context_2(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[30] = list[i];
	return child_ctx;
}

function get_each_context_3(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[24] = list[i];
	child_ctx[26] = i;
	return child_ctx;
}

function get_each_context_4(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[34] = list[i];
	child_ctx[29] = i;
	return child_ctx;
}

function get_each_context_5(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[24] = list[i];
	child_ctx[26] = i;
	return child_ctx;
}

function get_each_context_6(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[37] = list[i];
	child_ctx[29] = i;
	return child_ctx;
}

// (97:4) {#if currentView === MODE_DECADE}
function create_if_block_2$1(ctx) {
	let tbody;
	let tbody_intro;
	let each_value_5 = /*dataset*/ ctx[1].yearGrid;
	let each_blocks = [];

	for (let i = 0; i < each_value_5.length; i += 1) {
		each_blocks[i] = create_each_block_5(get_each_context_5(ctx, each_value_5, i));
	}

	return {
		c() {
			tbody = element("tbody");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(tbody, "class", "sdt-tbody-lg svelte-snram0");
		},
		m(target, anchor) {
			insert(target, tbody, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(tbody, null);
			}
		},
		p(ctx, dirty) {
			if (dirty[0] & /*dataset, updateInternalDate*/ 258) {
				each_value_5 = /*dataset*/ ctx[1].yearGrid;
				let i;

				for (i = 0; i < each_value_5.length; i += 1) {
					const child_ctx = get_each_context_5(ctx, each_value_5, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_5(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(tbody, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_5.length;
			}
		},
		i(local) {
			if (!tbody_intro) {
				add_render_callback(() => {
					tbody_intro = create_in_transition(tbody, fade, { duration: 300 });
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

// (101:8) {#each row as year, j(j)}
function create_each_block_6(key_1, ctx) {
	let td;
	let button;
	let t_value = /*year*/ ctx[37] + "";
	let t;
	let mounted;
	let dispose;

	function click_handler_2() {
		return /*click_handler_2*/ ctx[18](/*year*/ ctx[37]);
	}

	return {
		key: key_1,
		first: null,
		c() {
			td = element("td");
			button = element("button");
			t = text(t_value);
			attr(button, "class", "std-btn svelte-snram0");
			attr(td, "class", "svelte-snram0");
			toggle_class(td, "is-selected", /*i*/ ctx[26] * 4 + /*j*/ ctx[29] === /*dataset*/ ctx[1].selectionMark);
			this.first = td;
		},
		m(target, anchor) {
			insert(target, td, anchor);
			append(td, button);
			append(button, t);

			if (!mounted) {
				dispose = listen(button, "click", prevent_default(click_handler_2));
				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			if (dirty[0] & /*dataset*/ 2 && t_value !== (t_value = /*year*/ ctx[37] + "")) set_data(t, t_value);

			if (dirty[0] & /*dataset*/ 2) {
				toggle_class(td, "is-selected", /*i*/ ctx[26] * 4 + /*j*/ ctx[29] === /*dataset*/ ctx[1].selectionMark);
			}
		},
		d(detaching) {
			if (detaching) detach(td);
			mounted = false;
			dispose();
		}
	};
}

// (99:6) {#each dataset.yearGrid as row, i}
function create_each_block_5(ctx) {
	let tr;
	let each_blocks = [];
	let each_1_lookup = new Map();
	let t;
	let each_value_6 = /*row*/ ctx[24];
	const get_key = ctx => /*j*/ ctx[29];

	for (let i = 0; i < each_value_6.length; i += 1) {
		let child_ctx = get_each_context_6(ctx, each_value_6, i);
		let key = get_key(child_ctx);
		each_1_lookup.set(key, each_blocks[i] = create_each_block_6(key, child_ctx));
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
			if (dirty[0] & /*dataset, updateInternalDate*/ 258) {
				each_value_6 = /*row*/ ctx[24];
				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_6, each_1_lookup, tr, destroy_block, create_each_block_6, t, get_each_context_6);
			}
		},
		d(detaching) {
			if (detaching) detach(tr);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].d();
			}
		}
	};
}

// (113:4) {#if currentView === MODE_YEAR}
function create_if_block_1$1(ctx) {
	let tbody;
	let tbody_intro;
	let each_value_3 = /*dataset*/ ctx[1].monthGrid;
	let each_blocks = [];

	for (let i = 0; i < each_value_3.length; i += 1) {
		each_blocks[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
	}

	return {
		c() {
			tbody = element("tbody");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(tbody, "class", "sdt-tbody-lg svelte-snram0");
		},
		m(target, anchor) {
			insert(target, tbody, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(tbody, null);
			}
		},
		p(ctx, dirty) {
			if (dirty[0] & /*dataset, updateInternalDate*/ 258) {
				each_value_3 = /*dataset*/ ctx[1].monthGrid;
				let i;

				for (i = 0; i < each_value_3.length; i += 1) {
					const child_ctx = get_each_context_3(ctx, each_value_3, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_3(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(tbody, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_3.length;
			}
		},
		i(local) {
			if (!tbody_intro) {
				add_render_callback(() => {
					tbody_intro = create_in_transition(tbody, fade, { duration: 300 });
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

// (117:8) {#each row as month, j(j)}
function create_each_block_4(key_1, ctx) {
	let td;
	let button;
	let t_value = /*month*/ ctx[34] + "";
	let t;
	let mounted;
	let dispose;

	function click_handler_3() {
		return /*click_handler_3*/ ctx[19](/*month*/ ctx[34]);
	}

	return {
		key: key_1,
		first: null,
		c() {
			td = element("td");
			button = element("button");
			t = text(t_value);
			attr(button, "class", "std-btn svelte-snram0");
			attr(td, "class", "svelte-snram0");
			toggle_class(td, "is-selected", /*i*/ ctx[26] * 4 + /*j*/ ctx[29] === /*dataset*/ ctx[1].selectionMark);
			this.first = td;
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
			if (dirty[0] & /*dataset*/ 2 && t_value !== (t_value = /*month*/ ctx[34] + "")) set_data(t, t_value);

			if (dirty[0] & /*dataset*/ 2) {
				toggle_class(td, "is-selected", /*i*/ ctx[26] * 4 + /*j*/ ctx[29] === /*dataset*/ ctx[1].selectionMark);
			}
		},
		d(detaching) {
			if (detaching) detach(td);
			mounted = false;
			dispose();
		}
	};
}

// (115:6) {#each dataset.monthGrid as row, i}
function create_each_block_3(ctx) {
	let tr;
	let each_blocks = [];
	let each_1_lookup = new Map();
	let t;
	let each_value_4 = /*row*/ ctx[24];
	const get_key = ctx => /*j*/ ctx[29];

	for (let i = 0; i < each_value_4.length; i += 1) {
		let child_ctx = get_each_context_4(ctx, each_value_4, i);
		let key = get_key(child_ctx);
		each_1_lookup.set(key, each_blocks[i] = create_each_block_4(key, child_ctx));
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
			if (dirty[0] & /*dataset, updateInternalDate*/ 258) {
				each_value_4 = /*row*/ ctx[24];
				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_4, each_1_lookup, tr, destroy_block, create_each_block_4, t, get_each_context_4);
			}
		},
		d(detaching) {
			if (detaching) detach(tr);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].d();
			}
		}
	};
}

// (128:4) {#if currentView === MODE_MONTH}
function create_if_block$1(ctx) {
	let tbody0;
	let tr;
	let t;
	let tbody1;
	let tbody1_intro;
	let each_value_2 = /*dayLabels*/ ctx[2];
	let each_blocks_1 = [];

	for (let i = 0; i < each_value_2.length; i += 1) {
		each_blocks_1[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
	}

	let each_value = /*dataset*/ ctx[1].dayGrid;
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	return {
		c() {
			tbody0 = element("tbody");
			tr = element("tr");

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				each_blocks_1[i].c();
			}

			t = space();
			tbody1 = element("tbody");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(tr, "class", "sdt-cal-td svelte-snram0");
			attr(tbody0, "class", "c-section-center");
		},
		m(target, anchor) {
			insert(target, tbody0, anchor);
			append(tbody0, tr);

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				each_blocks_1[i].m(tr, null);
			}

			insert(target, t, anchor);
			insert(target, tbody1, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(tbody1, null);
			}
		},
		p(ctx, dirty) {
			if (dirty[0] & /*dayLabels*/ 4) {
				each_value_2 = /*dayLabels*/ ctx[2];
				let i;

				for (i = 0; i < each_value_2.length; i += 1) {
					const child_ctx = get_each_context_2(ctx, each_value_2, i);

					if (each_blocks_1[i]) {
						each_blocks_1[i].p(child_ctx, dirty);
					} else {
						each_blocks_1[i] = create_each_block_2(child_ctx);
						each_blocks_1[i].c();
						each_blocks_1[i].m(tr, null);
					}
				}

				for (; i < each_blocks_1.length; i += 1) {
					each_blocks_1[i].d(1);
				}

				each_blocks_1.length = each_value_2.length;
			}

			if (dirty[0] & /*dataset, isDisabledDate, isBetween, updateInternalDate*/ 306) {
				each_value = /*dataset*/ ctx[1].dayGrid;
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(tbody1, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}
		},
		i(local) {
			if (!tbody1_intro) {
				add_render_callback(() => {
					tbody1_intro = create_in_transition(tbody1, fade, { duration: 200 });
					tbody1_intro.start();
				});
			}
		},
		o: noop,
		d(detaching) {
			if (detaching) detach(tbody0);
			destroy_each(each_blocks_1, detaching);
			if (detaching) detach(t);
			if (detaching) detach(tbody1);
			destroy_each(each_blocks, detaching);
		}
	};
}

// (131:6) {#each dayLabels as header}
function create_each_block_2(ctx) {
	let th;
	let t_value = /*header*/ ctx[30] + "";
	let t;

	return {
		c() {
			th = element("th");
			t = text(t_value);
		},
		m(target, anchor) {
			insert(target, th, anchor);
			append(th, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*dayLabels*/ 4 && t_value !== (t_value = /*header*/ ctx[30] + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(th);
		}
	};
}

// (139:8) {#each row as currDate, j(j)}
function create_each_block_1(key_1, ctx) {
	let td;
	let button;
	let t_value = /*currDate*/ ctx[27].getUTCDate() + "";
	let t;
	let button_disabled_value;
	let mounted;
	let dispose;

	function click_handler_4() {
		return /*click_handler_4*/ ctx[20](/*currDate*/ ctx[27]);
	}

	return {
		key: key_1,
		first: null,
		c() {
			td = element("td");
			button = element("button");
			t = text(t_value);
			attr(button, "class", "std-btn svelte-snram0");
			button.disabled = button_disabled_value = /*isDisabledDate*/ ctx[5](/*currDate*/ ctx[27]);
			toggle_class(button, "not-current", !/*isBetween*/ ctx[4](/*i*/ ctx[26] * 7 + /*j*/ ctx[29], /*currDate*/ ctx[27]));
			attr(td, "class", "sdt-cal-td svelte-snram0");
			toggle_class(td, "sdt-today", /*i*/ ctx[26] * 7 + /*j*/ ctx[29] === /*dataset*/ ctx[1].todayMark);
			toggle_class(td, "is-selected", /*i*/ ctx[26] * 7 + /*j*/ ctx[29] === /*dataset*/ ctx[1].selectionMark);
			this.first = td;
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
			if (dirty[0] & /*dataset*/ 2 && t_value !== (t_value = /*currDate*/ ctx[27].getUTCDate() + "")) set_data(t, t_value);

			if (dirty[0] & /*dataset*/ 2 && button_disabled_value !== (button_disabled_value = /*isDisabledDate*/ ctx[5](/*currDate*/ ctx[27]))) {
				button.disabled = button_disabled_value;
			}

			if (dirty[0] & /*isBetween, dataset*/ 18) {
				toggle_class(button, "not-current", !/*isBetween*/ ctx[4](/*i*/ ctx[26] * 7 + /*j*/ ctx[29], /*currDate*/ ctx[27]));
			}

			if (dirty[0] & /*dataset*/ 2) {
				toggle_class(td, "sdt-today", /*i*/ ctx[26] * 7 + /*j*/ ctx[29] === /*dataset*/ ctx[1].todayMark);
			}

			if (dirty[0] & /*dataset*/ 2) {
				toggle_class(td, "is-selected", /*i*/ ctx[26] * 7 + /*j*/ ctx[29] === /*dataset*/ ctx[1].selectionMark);
			}
		},
		d(detaching) {
			if (detaching) detach(td);
			mounted = false;
			dispose();
		}
	};
}

// (137:6) {#each dataset.dayGrid as row, i }
function create_each_block(ctx) {
	let tr;
	let each_blocks = [];
	let each_1_lookup = new Map();
	let t;
	let each_value_1 = /*row*/ ctx[24];
	const get_key = ctx => /*j*/ ctx[29];

	for (let i = 0; i < each_value_1.length; i += 1) {
		let child_ctx = get_each_context_1(ctx, each_value_1, i);
		let key = get_key(child_ctx);
		each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
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
			if (dirty[0] & /*dataset, isDisabledDate, isBetween, updateInternalDate*/ 306) {
				each_value_1 = /*row*/ ctx[24];
				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, tr, destroy_block, create_each_block_1, t, get_each_context_1);
			}
		},
		d(detaching) {
			if (detaching) detach(tr);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].d();
			}
		}
	};
}

function create_fragment$2(ctx) {
	let div1;
	let button0;
	let t0;
	let t1;
	let div0;
	let button1;
	let t3;
	let button2;
	let t5;
	let div2;
	let table;
	let t6;
	let t7;
	let mounted;
	let dispose;
	let if_block0 = /*currentView*/ ctx[0] === MODE_DECADE && create_if_block_2$1(ctx);
	let if_block1 = /*currentView*/ ctx[0] === MODE_YEAR && create_if_block_1$1(ctx);
	let if_block2 = /*currentView*/ ctx[0] === MODE_MONTH && create_if_block$1(ctx);

	return {
		c() {
			div1 = element("div");
			button0 = element("button");
			t0 = text(/*tableCaption*/ ctx[3]);
			t1 = space();
			div0 = element("div");
			button1 = element("button");
			button1.textContent = "⏶";
			t3 = space();
			button2 = element("button");
			button2.textContent = "⏷";
			t5 = space();
			div2 = element("div");
			table = element("table");
			if (if_block0) if_block0.c();
			t6 = space();
			if (if_block1) if_block1.c();
			t7 = space();
			if (if_block2) if_block2.c();
			attr(button0, "class", "std-btn std-btn-header sdt-toggle-btn svelte-snram0");
			attr(button1, "class", "std-btn std-btn-header svelte-snram0");
			attr(button2, "class", "std-btn std-btn-header svelte-snram0");
			attr(div0, "class", "sdt-nav-btns svelte-snram0");
			attr(div1, "class", "sdt-thead-nav svelte-snram0");
			attr(table, "class", "sdt-table svelte-snram0");
			attr(div2, "class", "sdt-calendar svelte-snram0");
		},
		m(target, anchor) {
			insert(target, div1, anchor);
			append(div1, button0);
			append(button0, t0);
			append(div1, t1);
			append(div1, div0);
			append(div0, button1);
			append(div0, t3);
			append(div0, button2);
			insert(target, t5, anchor);
			insert(target, div2, anchor);
			append(div2, table);
			if (if_block0) if_block0.m(table, null);
			append(table, t6);
			if (if_block1) if_block1.m(table, null);
			append(table, t7);
			if (if_block2) if_block2.m(table, null);

			if (!mounted) {
				dispose = [
					listen(button0, "click", prevent_default(/*onSwitchView*/ ctx[7])),
					listen(button1, "click", prevent_default(/*click_handler*/ ctx[16])),
					listen(button2, "click", prevent_default(/*click_handler_1*/ ctx[17]))
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty[0] & /*tableCaption*/ 8) set_data(t0, /*tableCaption*/ ctx[3]);

			if (/*currentView*/ ctx[0] === MODE_DECADE) {
				if (if_block0) {
					if_block0.p(ctx, dirty);

					if (dirty[0] & /*currentView*/ 1) {
						transition_in(if_block0, 1);
					}
				} else {
					if_block0 = create_if_block_2$1(ctx);
					if_block0.c();
					transition_in(if_block0, 1);
					if_block0.m(table, t6);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (/*currentView*/ ctx[0] === MODE_YEAR) {
				if (if_block1) {
					if_block1.p(ctx, dirty);

					if (dirty[0] & /*currentView*/ 1) {
						transition_in(if_block1, 1);
					}
				} else {
					if_block1 = create_if_block_1$1(ctx);
					if_block1.c();
					transition_in(if_block1, 1);
					if_block1.m(table, t7);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (/*currentView*/ ctx[0] === MODE_MONTH) {
				if (if_block2) {
					if_block2.p(ctx, dirty);

					if (dirty[0] & /*currentView*/ 1) {
						transition_in(if_block2, 1);
					}
				} else {
					if_block2 = create_if_block$1(ctx);
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
			if (detaching) detach(div1);
			if (detaching) detach(t5);
			if (detaching) detach(div2);
			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
			if (if_block2) if_block2.d();
			mounted = false;
			run_all(dispose);
		}
	};
}

function instance$2($$self, $$props, $$invalidate) {
	let dataset;
	let dayLabels;
	let tableCaption;
	let { date = null } = $$props;
	let { startDate = null } = $$props;
	let { endDate = null } = $$props;
	let { weekStart = 1 } = $$props;
	let { i18n } = $$props;
	let initial = (date || new Date()).toISOString().split("T")[0].substring(0, 10);
	let internalDate = new Date(initial);
	let activeDate = new Date(initial);
	const dispatch = createEventDispatcher();
	let currentView = MODE_MONTH;

	function isBetween(num) {
		return dataset.prevTo <= num && num < dataset.nextFrom;
	}

	function isDisabledDate(date) {
		if (startDate && startDate > date) return true;
		if (endDate && endDate < date) return true;
	}

	function changeMonth(val) {
		const multiplier = currentView === MODE_DECADE
		? 120
		: currentView === MODE_YEAR ? 12 : 1;

		activeDate.setUTCMonth(activeDate.getUTCMonth() + val * multiplier);
		$$invalidate(15, activeDate);
	}

	function onSwitchView() {
		currentView && $$invalidate(0, currentView--, currentView);
	}

	function updateInternalDate(value) {
		switch (currentView) {
			case 0:
				activeDate.setYear(value);
				$$invalidate(15, activeDate);
				break;
			case 1:
				activeDate.setUTCMonth(i18n.monthsShort.indexOf(value));
				$$invalidate(15, activeDate);
				break;
			case 2:
				$$invalidate(14, internalDate = new Date(value.toISOString().split("T")[0].substring(0, 10)));
				dispatch("date", internalDate);
				break;
		}

		currentView < MODE_MONTH && $$invalidate(0, currentView++, currentView);
	}

	function showCaption() {
		switch (currentView) {
			case 0:
				return `${dataset.yearGrid[0][1]} - ${dataset.yearGrid[2][2]}`;
			case 1:
				return activeDate.getUTCFullYear();
			case 2:
				return i18n.months[activeDate.getUTCMonth()] + " " + activeDate.getUTCFullYear();
		}
	}

	const click_handler = () => changeMonth(-1);
	const click_handler_1 = () => changeMonth(1);

	const click_handler_2 = year => {
		updateInternalDate(year);
	};

	const click_handler_3 = month => {
		updateInternalDate(month);
	};

	const click_handler_4 = currDate => {
		updateInternalDate(currDate);
	};

	$$self.$$set = $$props => {
		if ("date" in $$props) $$invalidate(9, date = $$props.date);
		if ("startDate" in $$props) $$invalidate(10, startDate = $$props.startDate);
		if ("endDate" in $$props) $$invalidate(11, endDate = $$props.endDate);
		if ("weekStart" in $$props) $$invalidate(12, weekStart = $$props.weekStart);
		if ("i18n" in $$props) $$invalidate(13, i18n = $$props.i18n);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty[0] & /*date, internalDate*/ 16896) {
			{
				if (date !== internalDate) {
					$$invalidate(14, internalDate = date);
				}
			}
		}

		if ($$self.$$.dirty[0] & /*activeDate, internalDate, currentView, i18n*/ 57345) {
			$$invalidate(1, dataset = compute(activeDate, internalDate, currentView, i18n));
		}

		if ($$self.$$.dirty[0] & /*weekStart, i18n*/ 12288) {
			$$invalidate(2, dayLabels = weekStart > 1
			? i18n.daysMin.concat(i18n.daysMin).slice(weekStart, 8)
			: i18n.daysMin.slice(weekStart, 8));
		}

		if ($$self.$$.dirty[0] & /*currentView, activeDate*/ 32769) {
			$$invalidate(3, tableCaption = showCaption());
		}
	};

	return [
		currentView,
		dataset,
		dayLabels,
		tableCaption,
		isBetween,
		isDisabledDate,
		changeMonth,
		onSwitchView,
		updateInternalDate,
		date,
		startDate,
		endDate,
		weekStart,
		i18n,
		internalDate,
		activeDate,
		click_handler,
		click_handler_1,
		click_handler_2,
		click_handler_3,
		click_handler_4
	];
}

class Calendar extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-snram0-style")) add_css$1();

		init(
			this,
			options,
			instance$2,
			create_fragment$2,
			safe_not_equal,
			{
				date: 9,
				startDate: 10,
				endDate: 11,
				weekStart: 12,
				i18n: 13
			},
			[-1, -1]
		);
	}
}

function usePosition(el, { inputEl, visible }) {
    if (!visible) {
      const rect = inputEl.getBoundingClientRect();
      const calRect = el.getBoundingClientRect();
      const style = ['position: absolute'];
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

const en = {
  days:        ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  daysShort:   ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  daysMin:     ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
  months:      ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  meridiem:    ['am', 'pm'],
  suffix:      ['st', 'nd', 'rd', 'th'],
  todayBtn:       'Today',
  clearBtn:       'Clear'
};

/* src\DatePicker.svelte generated by Svelte v3.37.0 */

function add_css() {
	var style = element("style");
	style.id = "svelte-18bbo59-style";
	style.textContent = ".std-calendar-wrap.svelte-18bbo59{width:280px;background-color:white;box-shadow:0 0 4px #777;border-radius:4px;padding:0.25rem 0.25rem 0.5rem}.std-btn-row.svelte-18bbo59{margin-top:0.5rem;display:flex;justify-content:space-evenly}";
	append(document.head, style);
}

// (62:0) {#if visible || isFocused}
function create_if_block(ctx) {
	let div;
	let calendar;
	let t;
	let positionFn_action;
	let div_transition;
	let current;
	let mounted;
	let dispose;

	calendar = new Calendar({
			props: {
				date: /*date*/ ctx[0],
				startDate: /*startDate*/ ctx[2],
				endDate: /*endDate*/ ctx[3],
				i18n: /*i18n*/ ctx[4]
			}
		});

	calendar.$on("date", /*onDate*/ ctx[14]);
	let if_block = (/*todayBtn*/ ctx[6] || /*clearBtn*/ ctx[7]) && create_if_block_1(ctx);

	return {
		c() {
			div = element("div");
			create_component(calendar.$$.fragment);
			t = space();
			if (if_block) if_block.c();
			attr(div, "class", "std-calendar-wrap svelte-18bbo59");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			mount_component(calendar, div, null);
			append(div, t);
			if (if_block) if_block.m(div, null);
			current = true;

			if (!mounted) {
				dispose = [
					listen(div, "mousedown", prevent_default(/*mousedown_handler*/ ctx[20])),
					action_destroyer(positionFn_action = /*positionFn*/ ctx[10].call(null, div, {
						inputEl: /*inputEl*/ ctx[12],
						visible: /*visible*/ ctx[5]
					}))
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
			const calendar_changes = {};
			if (dirty & /*date*/ 1) calendar_changes.date = /*date*/ ctx[0];
			if (dirty & /*startDate*/ 4) calendar_changes.startDate = /*startDate*/ ctx[2];
			if (dirty & /*endDate*/ 8) calendar_changes.endDate = /*endDate*/ ctx[3];
			if (dirty & /*i18n*/ 16) calendar_changes.i18n = /*i18n*/ ctx[4];
			calendar.$set(calendar_changes);

			if (/*todayBtn*/ ctx[6] || /*clearBtn*/ ctx[7]) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block_1(ctx);
					if_block.c();
					if_block.m(div, null);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			if (positionFn_action && is_function(positionFn_action.update) && dirty & /*inputEl, visible*/ 4128) positionFn_action.update.call(null, {
				inputEl: /*inputEl*/ ctx[12],
				visible: /*visible*/ ctx[5]
			});
		},
		i(local) {
			if (current) return;
			transition_in(calendar.$$.fragment, local);

			add_render_callback(() => {
				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 200 }, true);
				div_transition.run(1);
			});

			current = true;
		},
		o(local) {
			transition_out(calendar.$$.fragment, local);
			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 200 }, false);
			div_transition.run(0);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			destroy_component(calendar);
			if (if_block) if_block.d();
			if (detaching && div_transition) div_transition.end();
			mounted = false;
			run_all(dispose);
		}
	};
}

// (65:2) {#if todayBtn || clearBtn}
function create_if_block_1(ctx) {
	let div;
	let t;
	let if_block0 = /*todayBtn*/ ctx[6] && create_if_block_3(ctx);
	let if_block1 = /*clearBtn*/ ctx[7] && create_if_block_2(ctx);

	return {
		c() {
			div = element("div");
			if (if_block0) if_block0.c();
			t = space();
			if (if_block1) if_block1.c();
			attr(div, "class", "std-btn-row svelte-18bbo59");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			if (if_block0) if_block0.m(div, null);
			append(div, t);
			if (if_block1) if_block1.m(div, null);
		},
		p(ctx, dirty) {
			if (/*todayBtn*/ ctx[6]) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0 = create_if_block_3(ctx);
					if_block0.c();
					if_block0.m(div, t);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (/*clearBtn*/ ctx[7]) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1 = create_if_block_2(ctx);
					if_block1.c();
					if_block1.m(div, null);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}
		},
		d(detaching) {
			if (detaching) detach(div);
			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
		}
	};
}

// (67:4) {#if todayBtn}
function create_if_block_3(ctx) {
	let button;
	let t_value = /*i18n*/ ctx[4].todayBtn + "";
	let t;
	let mounted;
	let dispose;

	return {
		c() {
			button = element("button");
			t = text(t_value);
			attr(button, "class", "btn btn-primary btn-sm");
		},
		m(target, anchor) {
			insert(target, button, anchor);
			append(button, t);

			if (!mounted) {
				dispose = listen(button, "click", /*onToday*/ ctx[15]);
				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty & /*i18n*/ 16 && t_value !== (t_value = /*i18n*/ ctx[4].todayBtn + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(button);
			mounted = false;
			dispose();
		}
	};
}

// (70:4) {#if clearBtn}
function create_if_block_2(ctx) {
	let button;
	let t_value = /*i18n*/ ctx[4].clearBtn + "";
	let t;
	let mounted;
	let dispose;

	return {
		c() {
			button = element("button");
			t = text(t_value);
			attr(button, "class", "btn btn-outline-danger btn-sm");
		},
		m(target, anchor) {
			insert(target, button, anchor);
			append(button, t);

			if (!mounted) {
				dispose = listen(button, "click", /*onClear*/ ctx[16]);
				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty & /*i18n*/ 16 && t_value !== (t_value = /*i18n*/ ctx[4].clearBtn + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(button);
			mounted = false;
			dispose();
		}
	};
}

function create_fragment$1(ctx) {
	let input;
	let input_class_value;
	let t;
	let if_block_anchor;
	let current;
	let mounted;
	let dispose;
	let if_block = (/*visible*/ ctx[5] || /*isFocused*/ ctx[11]) && create_if_block(ctx);

	return {
		c() {
			input = element("input");
			t = space();
			if (if_block) if_block.c();
			if_block_anchor = empty();
			attr(input, "type", "text");
			attr(input, "name", /*name*/ ctx[1]);
			attr(input, "class", input_class_value = "" + (null_to_empty(/*inputClasses*/ ctx[9]) + " svelte-18bbo59"));
			input.required = /*required*/ ctx[8];
			input.readOnly = true;
		},
		m(target, anchor) {
			insert(target, input, anchor);
			/*input_binding*/ ctx[23](input);
			set_input_value(input, /*inputValue*/ ctx[13]);
			insert(target, t, anchor);
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;

			if (!mounted) {
				dispose = [
					listen(input, "focus", /*focus_handler*/ ctx[24]),
					listen(input, "blur", /*blur_handler*/ ctx[25]),
					listen(input, "click", /*click_handler*/ ctx[26]),
					listen(input, "input", /*input_input_handler*/ ctx[27]),
					listen(input, "input", /*input_handler*/ ctx[21]),
					listen(input, "change", /*change_handler*/ ctx[22])
				];

				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (!current || dirty & /*name*/ 2) {
				attr(input, "name", /*name*/ ctx[1]);
			}

			if (!current || dirty & /*inputClasses*/ 512 && input_class_value !== (input_class_value = "" + (null_to_empty(/*inputClasses*/ ctx[9]) + " svelte-18bbo59"))) {
				attr(input, "class", input_class_value);
			}

			if (!current || dirty & /*required*/ 256) {
				input.required = /*required*/ ctx[8];
			}

			if (dirty & /*inputValue*/ 8192 && input.value !== /*inputValue*/ ctx[13]) {
				set_input_value(input, /*inputValue*/ ctx[13]);
			}

			if (/*visible*/ ctx[5] || /*isFocused*/ ctx[11]) {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty & /*visible, isFocused*/ 2080) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(input);
			/*input_binding*/ ctx[23](null);
			if (detaching) detach(t);
			if (if_block) if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
			mounted = false;
			run_all(dispose);
		}
	};
}

function instance$1($$self, $$props, $$invalidate) {
	let inputValue;
	let { name = "date" } = $$props;
	let { date = null } = $$props;
	let { startDate = null } = $$props;
	let { endDate = null } = $$props;
	let { format = "yyyy-mm-dd" } = $$props;
	let { formatType = "standard" } = $$props;
	let { i18n = en } = $$props;
	let { visible = false } = $$props;
	let { autoclose = true } = $$props;
	let { todayBtn = true } = $$props;
	let { clearBtn = true } = $$props;
	let { required = false } = $$props;
	let { inputClasses } = $$props;
	let { positionFn = usePosition } = $$props;
	let isFocused = false;
	let inputEl = null;
	createEventDispatcher();
	if (typeof date === "string") date = new Date(date); // TODO: parse

	function onDate(e) {
		$$invalidate(0, date = e.detail || null);

		if (autoclose) {
			$$invalidate(11, isFocused = false);
		}

		tick().then(() => inputEl.dispatchEvent(new Event("input")));
	}

	function onToday() {
		onDate({ detail: new Date() });
	}

	function onClear() {
		onDate({ detail: null });
	}

	function mousedown_handler(event) {
		bubble($$self, event);
	}

	function input_handler(event) {
		bubble($$self, event);
	}

	function change_handler(event) {
		bubble($$self, event);
	}

	function input_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			inputEl = $$value;
			$$invalidate(12, inputEl);
		});
	}

	const focus_handler = () => {
		$$invalidate(11, isFocused = true);
	};

	const blur_handler = () => {
		$$invalidate(11, isFocused = false);
	};

	const click_handler = () => {
		if (!isFocused) $$invalidate(11, isFocused = true);
	};

	function input_input_handler() {
		inputValue = this.value;
		(((($$invalidate(13, inputValue), $$invalidate(0, date)), $$invalidate(17, format)), $$invalidate(4, i18n)), $$invalidate(18, formatType));
	}

	$$self.$$set = $$props => {
		if ("name" in $$props) $$invalidate(1, name = $$props.name);
		if ("date" in $$props) $$invalidate(0, date = $$props.date);
		if ("startDate" in $$props) $$invalidate(2, startDate = $$props.startDate);
		if ("endDate" in $$props) $$invalidate(3, endDate = $$props.endDate);
		if ("format" in $$props) $$invalidate(17, format = $$props.format);
		if ("formatType" in $$props) $$invalidate(18, formatType = $$props.formatType);
		if ("i18n" in $$props) $$invalidate(4, i18n = $$props.i18n);
		if ("visible" in $$props) $$invalidate(5, visible = $$props.visible);
		if ("autoclose" in $$props) $$invalidate(19, autoclose = $$props.autoclose);
		if ("todayBtn" in $$props) $$invalidate(6, todayBtn = $$props.todayBtn);
		if ("clearBtn" in $$props) $$invalidate(7, clearBtn = $$props.clearBtn);
		if ("required" in $$props) $$invalidate(8, required = $$props.required);
		if ("inputClasses" in $$props) $$invalidate(9, inputClasses = $$props.inputClasses);
		if ("positionFn" in $$props) $$invalidate(10, positionFn = $$props.positionFn);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*date, format, i18n, formatType*/ 393233) {
			$$invalidate(13, inputValue = formatDate(date, format, i18n, formatType));
		}
	};

	return [
		date,
		name,
		startDate,
		endDate,
		i18n,
		visible,
		todayBtn,
		clearBtn,
		required,
		inputClasses,
		positionFn,
		isFocused,
		inputEl,
		inputValue,
		onDate,
		onToday,
		onClear,
		format,
		formatType,
		autoclose,
		mousedown_handler,
		input_handler,
		change_handler,
		input_binding,
		focus_handler,
		blur_handler,
		click_handler,
		input_input_handler
	];
}

class DatePicker extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-18bbo59-style")) add_css();

		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
			name: 1,
			date: 0,
			startDate: 2,
			endDate: 3,
			format: 17,
			formatType: 18,
			i18n: 4,
			visible: 5,
			autoclose: 19,
			todayBtn: 6,
			clearBtn: 7,
			required: 8,
			inputClasses: 9,
			positionFn: 10
		});
	}
}

/* docs\docs.svelte generated by Svelte v3.37.0 */

function create_fragment(ctx) {
	let div4;
	let h3;
	let t1;
	let div2;
	let div0;
	let datepicker0;
	let updating_date;
	let t2;
	let div1;
	let datepicker1;
	let t3;
	let div3;
	let t4;
	let hr;
	let t5;
	let p0;
	let t7;
	let p1;
	let t9;
	let p2;
	let current;

	function datepicker0_date_binding(value) {
		/*datepicker0_date_binding*/ ctx[1](value);
	}

	let datepicker0_props = { visible: false };

	if (/*myProp*/ ctx[0] !== void 0) {
		datepicker0_props.date = /*myProp*/ ctx[0];
	}

	datepicker0 = new DatePicker({ props: datepicker0_props });
	binding_callbacks.push(() => bind(datepicker0, "date", datepicker0_date_binding));
	datepicker0.$on("input", /*input_handler*/ ctx[2]);
	datepicker1 = new DatePicker({ props: { visible: false } });

	return {
		c() {
			div4 = element("div");
			h3 = element("h3");
			h3.textContent = "Datepicker";
			t1 = space();
			div2 = element("div");
			div0 = element("div");
			create_component(datepicker0.$$.fragment);
			t2 = space();
			div1 = element("div");
			create_component(datepicker1.$$.fragment);
			t3 = space();
			div3 = element("div");
			div3.innerHTML = `<input class="bootstrap-datepicker" size="16" type="text" value="2021-04-19" data-provide="datepicker" data-date-weekstart="1" data-date-autoclose="true" data-date-format="yyyy-mm-dd"/>`;
			t4 = space();
			hr = element("hr");
			t5 = space();
			p0 = element("p");
			p0.textContent = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis commodi autem saepe iusto rem reiciendis adipisci officia id ea, repudiandae, perspiciatis maiores consequatur aperiam quos ab quia omnis explicabo accusamus?";
			t7 = space();
			p1 = element("p");
			p1.textContent = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis commodi autem saepe iusto rem reiciendis adipisci officia id ea, repudiandae, perspiciatis maiores consequatur aperiam quos ab quia omnis explicabo accusamus?";
			t9 = space();
			p2 = element("p");
			p2.textContent = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis commodi autem saepe iusto rem reiciendis adipisci officia id ea, repudiandae, perspiciatis maiores consequatur aperiam quos ab quia omnis explicabo accusamus?";
			attr(div0, "class", "mr-2");
			set_style(div0, "position", "relative");
			attr(div1, "class", "ml-4");
			attr(div2, "class", "d-flex");
			attr(div4, "class", "p-4");
		},
		m(target, anchor) {
			insert(target, div4, anchor);
			append(div4, h3);
			append(div4, t1);
			append(div4, div2);
			append(div2, div0);
			mount_component(datepicker0, div0, null);
			append(div2, t2);
			append(div2, div1);
			mount_component(datepicker1, div1, null);
			append(div4, t3);
			append(div4, div3);
			append(div4, t4);
			append(div4, hr);
			append(div4, t5);
			append(div4, p0);
			append(div4, t7);
			append(div4, p1);
			append(div4, t9);
			append(div4, p2);
			current = true;
		},
		p(ctx, [dirty]) {
			const datepicker0_changes = {};

			if (!updating_date && dirty & /*myProp*/ 1) {
				updating_date = true;
				datepicker0_changes.date = /*myProp*/ ctx[0];
				add_flush_callback(() => updating_date = false);
			}

			datepicker0.$set(datepicker0_changes);
		},
		i(local) {
			if (current) return;
			transition_in(datepicker0.$$.fragment, local);
			transition_in(datepicker1.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(datepicker0.$$.fragment, local);
			transition_out(datepicker1.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div4);
			destroy_component(datepicker0);
			destroy_component(datepicker1);
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	let myProp = "2021-01-04";

	function datepicker0_date_binding(value) {
		myProp = value;
		$$invalidate(0, myProp);
	}

	const input_handler = e => console.log(e.target.value);
	return [myProp, datepicker0_date_binding, input_handler];
}

class Docs extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, create_fragment, safe_not_equal, {});
	}
}

new Docs({
  target: document.body,
  props: {}
});
