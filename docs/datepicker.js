
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
(function () {
    'use strict';

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
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
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
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
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

    function compute(currentDate, selectedDate, view, locale, weekStart) {
      // years 4 x 3
      if (view === MODE_DECADE) {
        const nextFrom = 12;
        const prevTo = 1;
        const todayMark = -1;
        const grid = [];
        let yearRow = [];
        let currYear = currentDate.getUTCFullYear() - (currentDate.getUTCFullYear() % 10) - 1;
        for (let i = 0; i < 12; i++) {
          yearRow.push(currYear + i);
          if (yearRow.length === 4) {
            grid.push(yearRow);
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

        return {
          grid, todayMark, nextFrom, prevTo, selectionMark
        }
      }

      // months 4 x 3
      if (view === MODE_YEAR) {
        let grid = [];
        let monthRow = [];
        let prevTo = 0;
        let nextFrom = 12;
        const ISO = currentDate.toISOString().split('T')[0].substring(0, 8);
        const dateNormalized = new Date(ISO + '01 00:00:00');
        let todayMark = 0;
        for (let i = 0; i < 12; i++) {
          dateNormalized.setUTCMonth(i);
          monthRow.push(locale.monthsShort[i]);
          if (monthRow.length === 4) {
            grid.push(monthRow);
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
          grid, todayMark, nextFrom, prevTo, selectionMark
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
      prevMonth.setUTCDate(day - (prevMonth.getUTCDay() - weekStart + 7) % 7);

      let nextMonth = new Date(prevMonth);
      nextMonth.setUTCDate(nextMonth.getUTCDate() + 42);
      let nextMonthValue = nextMonth.valueOf();

      let grid = [];
      let dayRow = [];
      let todayMark = -1;
      let selectionMark = null;
      let prevTo = 0;
      let nextFrom = 42;

      let inc = 0;
      console.log('SELECTED', selectedDate);
      while(prevMonth.valueOf() < nextMonthValue) {
        inc++;
        dayRow.push(new Date(prevMonth));
        if (prevMonth.getUTCFullYear() < y || (prevMonth.getUTCFullYear() === y && prevMonth.getUTCMonth() < m)) {
          prevTo = inc;
        } else if (nextFrom === 42 && (prevMonth.getUTCFullYear() > y || (prevMonth.getUTCFullYear() === y && prevMonth.getUTCMonth() > m))) {
          nextFrom = inc - 1;
        }

        prevMonth.setUTCDate(prevMonth.getUTCDate() + 1);


        if (prevMonth.getUTCFullYear() === today.getUTCFullYear() &&
          prevMonth.getUTCMonth() === today.getUTCMonth() &&
          prevMonth.getUTCDate() === today.getUTCDate()
        ) {
          todayMark = inc;
        }
        if (!selectionMark && selectedDate
          && prevMonth.getUTCFullYear() === selectedDate.getUTCFullYear()
          && prevMonth.getUTCMonth() === selectedDate.getUTCMonth()
          && prevMonth.getUTCDate() === selectedDate.getUTCDate()
        ) {
          selectionMark = inc;
          console.log('s', selectionMark);
        }
        
        if (dayRow.length === 7) {
          grid.push(dayRow);
          dayRow = [];
        }
      }
      return { grid, todayMark, prevTo, nextFrom, selectionMark };
    }

    function moveGrid(newPos, view) {
      if (view === MODE_MONTH) {
        if (newPos < 0) {
          newPos = 42 + newPos;
        }
        return {
          x: newPos % 7,
          y: Math.floor(newPos / 7)
        }
      }
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

    function parseDate(date, format, i18n, type) {
      if (date instanceof Date) {
        const dateUTC = new Date(date.valueOf() - date.getTimezoneOffset() * 60000);
        dateUTC.setMilliseconds(0);
        return dateUTC;
      }
      if (/^\d{4}\-\d{1,2}\-\d{1,2}$/.test(date)) {
        format = formatHelper.parseFormat('yyyy-mm-dd', type);
      } else 
      if (/^\d{4}\-\d{1,2}\-\d{1,2}[T ]\d{1,2}\:\d{1,2}$/.test(date)) {
        format = formatHelper.parseFormat('yyyy-mm-dd hh:ii', type);
      } else 
      if (/^\d{4}\-\d{1,2}\-\d{1,2}[T ]\d{1,2}\:\d{1,2}\:\d{1,2}[Z]{0,1}$/.test(date)) {
        format = formatHelper.parseFormat('yyyy-mm-dd hh:ii:ss', type);
      } else {
        format = formatHelper.parseFormat(format, type);
      }
      var parts = date && date.toString().match(formatHelper.nonpunctuation) || [],
        date = new Date(0, 0, 0, 0, 0, 0, 0),
        parsed = {},
        setters_order = ['hh', 'h', 'ii', 'i', 'ss', 's', 'yyyy', 'yy', 'M', 'MM', 'm', 'mm', 'D', 'DD', 'd', 'dd', 'H', 'HH', 'p', 'P', 'z', 'Z'],
        setters_map = {
          hh:   function (d, v) {
            return d.setUTCHours(v);
          },
          h:    function (d, v) {
            return d.setUTCHours(v);
          },
          HH:   function (d, v) {
            return d.setUTCHours(v === 12 ? 0 : v);
          },
          H:    function (d, v) {
            return d.setUTCHours(v === 12 ? 0 : v);
          },
          ii:   function (d, v) {
            return d.setUTCMinutes(v);
          },
          i:    function (d, v) {
            return d.setUTCMinutes(v);
          },
          ss:   function (d, v) {
            return d.setUTCSeconds(v);
          },
          s:    function (d, v) {
            return d.setUTCSeconds(v);
          },
          yyyy: function (d, v) {
            return d.setUTCFullYear(v);
          },
          yy:   function (d, v) {
            return d.setUTCFullYear(2000 + v);
          },
          m:    function (d, v) {
            v -= 1;
            while (v < 0) v += 12;
            v %= 12;
            d.setUTCMonth(v);
            while (d.getUTCMonth() !== v)
              if (isNaN(d.getUTCMonth()))
                return d;
              else
                d.setUTCDate(d.getUTCDate() - 1);
            return d;
          },
          d:    function (d, v) {
            return d.setUTCDate(v);
          },
          p:    function (d, v) {
            return d.setUTCHours(v === 1 ? d.getUTCHours() + 12 : d.getUTCHours());
          }
        },
        val, filtered, part;
      setters_map['M'] = setters_map['MM'] = setters_map['mm'] = setters_map['m'];
      setters_map['dd'] = setters_map['d'];
      setters_map['P'] = setters_map['p'];
      date = UTCDate(date.getFullYear(), date.getMonth(), date.getDate(), date.getUTCHours(), date.getUTCMinutes(), date.getSeconds());
      if (parts.length === format.parts.length) {
        for (var i = 0, cnt = format.parts.length; i < cnt; i++) {
          val = parseInt(parts[i], 10);
          part = format.parts[i];
          if (isNaN(val)) {
            switch (part) {
              case 'MM':
                val = i18n.months.indexOf(filtered[0]) + 1;
                break;
              case 'M':
                val= i18n.monthsShort.indexOf(val) + 1;
                break;
              case 'p':
              case 'P':
                console.log(val);
                val = i18n.meridiem.indexOf(parts[i].toLowerCase());
                break;
            }
          }
          parsed[part] = val;
        }
        for (var i = 0, s; i < setters_order.length; i++) {
          s = setters_order[i];
          if (s in parsed && !isNaN(parsed[s]))
            setters_map[s](date, parsed[s]);
        }
      }
      return date;
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

    function add_css$2() {
    	var style = element("style");
    	style.id = "svelte-1thbrav-style";
    	style.textContent = ".sdt-cal-td.svelte-1thbrav.svelte-1thbrav{padding:0;font-size:90%;text-align:center}.sdt-calendar.svelte-1thbrav.svelte-1thbrav{padding-top:0.5rem}.sdt-table.svelte-1thbrav.svelte-1thbrav{width:100%}.sdt-today.svelte-1thbrav.svelte-1thbrav{color:red}.not-current.svelte-1thbrav.svelte-1thbrav{color:#ccc}.std-btn.svelte-1thbrav.svelte-1thbrav{border:0;background:transparent;text-align:center;width:100%;border-radius:4px;cursor:pointer;padding:0.375rem}.std-btn-header.svelte-1thbrav.svelte-1thbrav{width:auto;font-weight:bold;padding:0.375rem 0.5rem}.std-btn-header.icon-btn.svelte-1thbrav.svelte-1thbrav:first-of-type{padding-left:0.375rem;padding-right:0.375rem}.std-btn-header.icon-btn.svelte-1thbrav.svelte-1thbrav{padding-left:0.25rem;padding-right:0.25rem}.std-btn.svelte-1thbrav.svelte-1thbrav:hover{background-color:#eee;border-color:#ddd}.is-selected.svelte-1thbrav .std-btn.svelte-1thbrav{background-color:#286090;border-color:#204d74;color:white;opacity:0.9}.std-btn-header.svelte-1thbrav.svelte-1thbrav:hover{background-color:rgb(223, 223, 223);color:black}.sdt-tbody-lg.svelte-1thbrav .std-btn.svelte-1thbrav{height:60px}.sdt-thead-nav.svelte-1thbrav.svelte-1thbrav{display:flex}.sdt-nav-btns.svelte-1thbrav.svelte-1thbrav{white-space:nowrap}.sdt-toggle-btn.svelte-1thbrav.svelte-1thbrav{width:100%;text-align:left}.sdt-today.svelte-1thbrav.svelte-1thbrav:before{position:absolute;content:'';margin-left:4px;margin-top:4px;border-left:4px solid #ccc;border-top:4px solid #ccc;border-bottom:4px solid transparent;border-right:4px solid transparent;border-radius:2px;height:4px;z-index:2}.sdt-today.svelte-1thbrav.svelte-1thbrav:hover:before{border-left-color:#286090;border-top-color:#286090}.is-selected.sdt-today.svelte-1thbrav.svelte-1thbrav:before{border-left-color:#eee;border-top-color:#eee}";
    	append(document.head, style);
    }

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[26] = list[i];
    	child_ctx[28] = i;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[29] = list[i];
    	child_ctx[31] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[32] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[26] = list[i];
    	child_ctx[28] = i;
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[36] = list[i];
    	child_ctx[31] = i;
    	return child_ctx;
    }

    function get_each_context_5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[26] = list[i];
    	child_ctx[28] = i;
    	return child_ctx;
    }

    function get_each_context_6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[39] = list[i];
    	child_ctx[31] = i;
    	return child_ctx;
    }

    // (162:4) {#if enableTimeToggle && internalDate}
    function create_if_block_3$1(ctx) {
    	let button;
    	let svg;
    	let path0;
    	let path1;
    	let button_title_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			button = element("button");
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr(path0, "d", "M12.5 7.25a.75.75 0 00-1.5 0v5.5c0 .27.144.518.378.651l3.5 2a.75.75 0 00.744-1.302L12.5 12.315V7.25z");
    			attr(path1, "fill-rule", "evenodd");
    			attr(path1, "d", "M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1zM2.5 12a9.5 9.5 0 1119 0 9.5 9.5 0 01-19 0z");
    			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr(svg, "viewBox", "0 0 24 24");
    			attr(svg, "width", "16");
    			attr(svg, "height", "16");
    			attr(button, "class", "std-btn std-btn-header icon-btn svelte-1thbrav");
    			attr(button, "title", button_title_value = /*i18n*/ ctx[0].timeView);
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);
    			append(button, svg);
    			append(svg, path0);
    			append(svg, path1);

    			if (!mounted) {
    				dispose = listen(button, "click", prevent_default(/*onTimeSwitch*/ ctx[12]));
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*i18n*/ 1 && button_title_value !== (button_title_value = /*i18n*/ ctx[0].timeView)) {
    				attr(button, "title", button_title_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (177:4) {#if currentView === MODE_DECADE}
    function create_if_block_2$2(ctx) {
    	let tbody;
    	let tbody_intro;
    	let each_value_5 = /*dataset*/ ctx[4].grid;
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

    			attr(tbody, "class", "sdt-tbody-lg svelte-1thbrav");
    		},
    		m(target, anchor) {
    			insert(target, tbody, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*dataset, onClick*/ 2064) {
    				each_value_5 = /*dataset*/ ctx[4].grid;
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

    // (181:8) {#each row as year, j(j)}
    function create_each_block_6(key_1, ctx) {
    	let td;
    	let button;
    	let t_value = /*year*/ ctx[39] + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler_2() {
    		return /*click_handler_2*/ ctx[21](/*year*/ ctx[39]);
    	}

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			td = element("td");
    			button = element("button");
    			t = text(t_value);
    			attr(button, "class", "std-btn svelte-1thbrav");
    			attr(td, "class", "svelte-1thbrav");
    			toggle_class(td, "is-selected", /*i*/ ctx[28] * 4 + /*j*/ ctx[31] === /*dataset*/ ctx[4].selectionMark);
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
    			if (dirty[0] & /*dataset*/ 16 && t_value !== (t_value = /*year*/ ctx[39] + "")) set_data(t, t_value);

    			if (dirty[0] & /*dataset*/ 16) {
    				toggle_class(td, "is-selected", /*i*/ ctx[28] * 4 + /*j*/ ctx[31] === /*dataset*/ ctx[4].selectionMark);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(td);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (179:6) {#each dataset.grid as row, i}
    function create_each_block_5(ctx) {
    	let tr;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t;
    	let each_value_6 = /*row*/ ctx[26];
    	const get_key = ctx => /*j*/ ctx[31];

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
    			if (dirty[0] & /*dataset, onClick*/ 2064) {
    				each_value_6 = /*row*/ ctx[26];
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

    // (193:4) {#if currentView === MODE_YEAR}
    function create_if_block_1$2(ctx) {
    	let tbody;
    	let tbody_intro;
    	let each_value_3 = /*dataset*/ ctx[4].grid;
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

    			attr(tbody, "class", "sdt-tbody-lg svelte-1thbrav");
    		},
    		m(target, anchor) {
    			insert(target, tbody, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*dataset, onClick*/ 2064) {
    				each_value_3 = /*dataset*/ ctx[4].grid;
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

    // (197:8) {#each row as month, j(j)}
    function create_each_block_4(key_1, ctx) {
    	let td;
    	let button;
    	let t_value = /*month*/ ctx[36] + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler_3() {
    		return /*click_handler_3*/ ctx[22](/*month*/ ctx[36]);
    	}

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			td = element("td");
    			button = element("button");
    			t = text(t_value);
    			attr(button, "class", "std-btn svelte-1thbrav");
    			attr(td, "class", "svelte-1thbrav");
    			toggle_class(td, "is-selected", /*i*/ ctx[28] * 4 + /*j*/ ctx[31] === /*dataset*/ ctx[4].selectionMark);
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
    			if (dirty[0] & /*dataset*/ 16 && t_value !== (t_value = /*month*/ ctx[36] + "")) set_data(t, t_value);

    			if (dirty[0] & /*dataset*/ 16) {
    				toggle_class(td, "is-selected", /*i*/ ctx[28] * 4 + /*j*/ ctx[31] === /*dataset*/ ctx[4].selectionMark);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(td);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (195:6) {#each dataset.grid as row, i}
    function create_each_block_3(ctx) {
    	let tr;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t;
    	let each_value_4 = /*row*/ ctx[26];
    	const get_key = ctx => /*j*/ ctx[31];

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
    			if (dirty[0] & /*dataset, onClick*/ 2064) {
    				each_value_4 = /*row*/ ctx[26];
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

    // (208:4) {#if currentView === MODE_MONTH}
    function create_if_block$2(ctx) {
    	let tbody0;
    	let tr;
    	let t;
    	let tbody1;
    	let tbody1_intro;
    	let each_value_2 = /*dayLabels*/ ctx[5];
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value = /*dataset*/ ctx[4].grid;
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
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

    			attr(tr, "class", "sdt-cal-td svelte-1thbrav");
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
    			if (dirty[0] & /*dayLabels*/ 32) {
    				each_value_2 = /*dayLabels*/ ctx[5];
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

    			if (dirty[0] & /*dataset, isDisabledDate, isBetween, onClick*/ 2448) {
    				each_value = /*dataset*/ ctx[4].grid;
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
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

    // (211:6) {#each dayLabels as header}
    function create_each_block_2(ctx) {
    	let th;
    	let t_value = /*header*/ ctx[32] + "";
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
    			if (dirty[0] & /*dayLabels*/ 32 && t_value !== (t_value = /*header*/ ctx[32] + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(th);
    		}
    	};
    }

    // (219:8) {#each row as currDate, j(j)}
    function create_each_block_1$1(key_1, ctx) {
    	let td;
    	let button;
    	let t_value = /*currDate*/ ctx[29].getUTCDate() + "";
    	let t;
    	let button_disabled_value;
    	let mounted;
    	let dispose;

    	function click_handler_4() {
    		return /*click_handler_4*/ ctx[23](/*currDate*/ ctx[29]);
    	}

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			td = element("td");
    			button = element("button");
    			t = text(t_value);
    			attr(button, "class", "std-btn svelte-1thbrav");
    			button.disabled = button_disabled_value = /*isDisabledDate*/ ctx[8](/*currDate*/ ctx[29]);
    			toggle_class(button, "not-current", !/*isBetween*/ ctx[7](/*i*/ ctx[28] * 7 + /*j*/ ctx[31], /*currDate*/ ctx[29]));
    			attr(td, "class", "sdt-cal-td svelte-1thbrav");
    			toggle_class(td, "sdt-today", /*i*/ ctx[28] * 7 + /*j*/ ctx[31] === /*dataset*/ ctx[4].todayMark);
    			toggle_class(td, "is-selected", /*i*/ ctx[28] * 7 + /*j*/ ctx[31] === /*dataset*/ ctx[4].selectionMark);
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
    			if (dirty[0] & /*dataset*/ 16 && t_value !== (t_value = /*currDate*/ ctx[29].getUTCDate() + "")) set_data(t, t_value);

    			if (dirty[0] & /*dataset*/ 16 && button_disabled_value !== (button_disabled_value = /*isDisabledDate*/ ctx[8](/*currDate*/ ctx[29]))) {
    				button.disabled = button_disabled_value;
    			}

    			if (dirty[0] & /*isBetween, dataset*/ 144) {
    				toggle_class(button, "not-current", !/*isBetween*/ ctx[7](/*i*/ ctx[28] * 7 + /*j*/ ctx[31], /*currDate*/ ctx[29]));
    			}

    			if (dirty[0] & /*dataset*/ 16) {
    				toggle_class(td, "sdt-today", /*i*/ ctx[28] * 7 + /*j*/ ctx[31] === /*dataset*/ ctx[4].todayMark);
    			}

    			if (dirty[0] & /*dataset*/ 16) {
    				toggle_class(td, "is-selected", /*i*/ ctx[28] * 7 + /*j*/ ctx[31] === /*dataset*/ ctx[4].selectionMark);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(td);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (217:6) {#each dataset.grid as row, i }
    function create_each_block$1(ctx) {
    	let tr;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t;
    	let each_value_1 = /*row*/ ctx[26];
    	const get_key = ctx => /*j*/ ctx[31];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1$1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1$1(key, child_ctx));
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
    			if (dirty[0] & /*dataset, isDisabledDate, isBetween, onClick*/ 2448) {
    				each_value_1 = /*row*/ ctx[26];
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, tr, destroy_block, create_each_block_1$1, t, get_each_context_1$1);
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

    function create_fragment$3(ctx) {
    	let div1;
    	let button0;
    	let t0;
    	let t1;
    	let div0;
    	let t2;
    	let button1;
    	let t3;
    	let button2;
    	let t4;
    	let div2;
    	let table;
    	let t5;
    	let t6;
    	let mounted;
    	let dispose;
    	let if_block0 = /*enableTimeToggle*/ ctx[1] && /*internalDate*/ ctx[2] && create_if_block_3$1(ctx);
    	let if_block1 = /*currentView*/ ctx[3] === MODE_DECADE && create_if_block_2$2(ctx);
    	let if_block2 = /*currentView*/ ctx[3] === MODE_YEAR && create_if_block_1$2(ctx);
    	let if_block3 = /*currentView*/ ctx[3] === MODE_MONTH && create_if_block$2(ctx);

    	return {
    		c() {
    			div1 = element("div");
    			button0 = element("button");
    			t0 = text(/*tableCaption*/ ctx[6]);
    			t1 = space();
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t2 = space();
    			button1 = element("button");
    			button1.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="24" height="24"><path d="M4.427 9.573l3.396-3.396a.25.25 0 01.354 0l3.396 3.396a.25.25 0 01-.177.427H4.604a.25.25 0 01-.177-.427z"></path></svg>`;
    			t3 = space();
    			button2 = element("button");
    			button2.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="24" height="24"><path d="M4.427 7.427l3.396 3.396a.25.25 0 00.354 0l3.396-3.396A.25.25 0 0011.396 7H4.604a.25.25 0 00-.177.427z"></path></svg>`;
    			t4 = space();
    			div2 = element("div");
    			table = element("table");
    			if (if_block1) if_block1.c();
    			t5 = space();
    			if (if_block2) if_block2.c();
    			t6 = space();
    			if (if_block3) if_block3.c();
    			attr(button0, "class", "std-btn std-btn-header sdt-toggle-btn svelte-1thbrav");
    			attr(button1, "class", "std-btn std-btn-header icon-btn svelte-1thbrav");
    			attr(button2, "class", "std-btn std-btn-header icon-btn svelte-1thbrav");
    			attr(div0, "class", "sdt-nav-btns svelte-1thbrav");
    			attr(div1, "class", "sdt-thead-nav svelte-1thbrav");
    			attr(table, "class", "sdt-table svelte-1thbrav");
    			attr(div2, "class", "sdt-calendar svelte-1thbrav");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, button0);
    			append(button0, t0);
    			append(div1, t1);
    			append(div1, div0);
    			if (if_block0) if_block0.m(div0, null);
    			append(div0, t2);
    			append(div0, button1);
    			append(div0, t3);
    			append(div0, button2);
    			insert(target, t4, anchor);
    			insert(target, div2, anchor);
    			append(div2, table);
    			if (if_block1) if_block1.m(table, null);
    			append(table, t5);
    			if (if_block2) if_block2.m(table, null);
    			append(table, t6);
    			if (if_block3) if_block3.m(table, null);

    			if (!mounted) {
    				dispose = [
    					listen(button0, "click", prevent_default(/*onSwitchView*/ ctx[10])),
    					listen(button1, "click", prevent_default(/*click_handler*/ ctx[19])),
    					listen(button2, "click", prevent_default(/*click_handler_1*/ ctx[20]))
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*tableCaption*/ 64) set_data(t0, /*tableCaption*/ ctx[6]);

    			if (/*enableTimeToggle*/ ctx[1] && /*internalDate*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_3$1(ctx);
    					if_block0.c();
    					if_block0.m(div0, t2);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*currentView*/ ctx[3] === MODE_DECADE) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*currentView*/ 8) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_2$2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(table, t5);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*currentView*/ ctx[3] === MODE_YEAR) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty[0] & /*currentView*/ 8) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_1$2(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(table, t6);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*currentView*/ ctx[3] === MODE_MONTH) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty[0] & /*currentView*/ 8) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block$2(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(table, null);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}
    		},
    		i(local) {
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(if_block3);
    		},
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div1);
    			if (if_block0) if_block0.d();
    			if (detaching) detach(t4);
    			if (detaching) detach(div2);
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let dataset;
    	let dayLabels;
    	let tableCaption;
    	let { date = null } = $$props;
    	let { startDate = null } = $$props;
    	let { endDate = null } = $$props;
    	let { weekStart = 1 } = $$props;
    	let { i18n } = $$props;
    	let { enableTimeToggle = false } = $$props;

    	function handleGridNav(key, shiftKey) {
    		if (!internalDate) {
    			onClick(new Date());
    			return;
    		}

    		let pos;

    		switch (key) {
    			case "ArrowDown":
    				pos = moveGrid(dataset.selectionMark + 7, currentView);
    				if (pos.y > 5) {
    					const tmpDate = new Date(activeDate.getUTCFullYear(), activeDate.getMonth() + 1, 1);
    					const tmpData = compute(tmpDate, internalDate, currentView, i18n, weekStart);

    					pos.y = tmpData.grid[0][pos.x].getUTCDate() === internalDate.getUTCDate()
    					? 1
    					: 0;

    					onChangeMonth(1);
    					onClick(tmpData.grid[pos.y][pos.x]);
    					return;
    				}
    				if (dataset.grid[pos.y][pos.x].getUTCMonth() !== activeDate.getUTCMonth()) {
    					onChangeMonth(1);
    				}
    				onClick(dataset.grid[pos.y][pos.x]);
    				break;
    			case "ArrowUp":
    				pos = moveGrid(dataset.selectionMark - 7, currentView);
    				if (pos.y === 5) {
    					const tmpDate = new Date(activeDate.getUTCFullYear(), activeDate.getMonth() > 0 ? activeDate.getMonth() : 11, 1);
    					const tmpData = compute(tmpDate, internalDate, currentView, i18n, weekStart);

    					pos.y = tmpData.grid[5][pos.x].getUTCDate() === internalDate.getUTCDate()
    					? 4
    					: 5;

    					onChangeMonth(-1);
    					onClick(tmpData.grid[pos.y][pos.x]);
    					return;
    				}
    				if (dataset.grid[pos.y][pos.x].getUTCMonth() !== activeDate.getUTCMonth()) {
    					onChangeMonth(-1);
    				}
    				onClick(dataset.grid[pos.y][pos.x]);
    				break;
    			case "ArrowLeft":
    				pos = moveGrid(dataset.selectionMark - 1, currentView);
    				if (dataset.grid[pos.y][pos.x].getUTCMonth() !== activeDate.getUTCMonth()) {
    					onChangeMonth(-1);
    				}
    				onClick(dataset.grid[pos.y][pos.x]);
    				break;
    			case "ArrowRight":
    				pos = moveGrid(dataset.selectionMark + 1, currentView);
    				if (dataset.grid[pos.y][pos.x].getUTCMonth() !== activeDate.getUTCMonth()) {
    					onChangeMonth(1);
    				}
    				onClick(dataset.grid[pos.y][pos.x]);
    				break;
    		}
    	}

    	let internalDate = date;
    	let activeDate = date ? new Date(date.valueOf()) : new Date();
    	activeDate.setDate(1);
    	const dispatch = createEventDispatcher();
    	let currentView = MODE_MONTH;

    	function isBetween(num) {
    		return dataset.prevTo <= num && num < dataset.nextFrom;
    	}

    	function isDisabledDate(date) {
    		if (startDate && startDate > date) return true;
    		if (endDate && endDate < date) return true;
    	}

    	function onChangeMonth(val) {
    		const multiplier = currentView === MODE_DECADE
    		? 120
    		: currentView === MODE_YEAR ? 12 : 1;

    		activeDate.setUTCMonth(activeDate.getUTCMonth() + val * multiplier);
    		(($$invalidate(18, activeDate), $$invalidate(13, date)), $$invalidate(2, internalDate));
    	}

    	function onSwitchView() {
    		currentView && $$invalidate(3, currentView--, currentView);
    	}

    	function onClick(value) {
    		switch (currentView) {
    			case 0:
    				activeDate.setYear(value);
    				(($$invalidate(18, activeDate), $$invalidate(13, date)), $$invalidate(2, internalDate));
    				break;
    			case 1:
    				activeDate.setUTCMonth(i18n.monthsShort.indexOf(value));
    				(($$invalidate(18, activeDate), $$invalidate(13, date)), $$invalidate(2, internalDate));
    				break;
    			case 2:
    				const newInternalDate = UTCDate(value.getUTCFullYear(), value.getMonth(), value.getDate());
    				if (internalDate) {
    					newInternalDate.setMinutes(internalDate.getMinutes());
    					newInternalDate.setUTCHours(internalDate.getUTCHours());
    				}
    				$$invalidate(2, internalDate = newInternalDate);
    				dispatch("date", internalDate);
    				break;
    		}

    		currentView < MODE_MONTH && $$invalidate(3, currentView++, currentView);
    	}

    	function onTimeSwitch() {
    		dispatch("switch", "time");
    	}

    	function showCaption() {
    		switch (currentView) {
    			case 0:
    				return `${dataset.grid[0][1]} - ${dataset.grid[2][2]}`;
    			case 1:
    				return activeDate.getUTCFullYear();
    			case 2:
    				return i18n.months[activeDate.getUTCMonth()] + " " + activeDate.getUTCFullYear();
    		}
    	}

    	const click_handler = () => onChangeMonth(-1);
    	const click_handler_1 = () => onChangeMonth(1);

    	const click_handler_2 = year => {
    		onClick(year);
    	};

    	const click_handler_3 = month => {
    		onClick(month);
    	};

    	const click_handler_4 = currDate => {
    		onClick(currDate);
    	};

    	$$self.$$set = $$props => {
    		if ("date" in $$props) $$invalidate(13, date = $$props.date);
    		if ("startDate" in $$props) $$invalidate(14, startDate = $$props.startDate);
    		if ("endDate" in $$props) $$invalidate(15, endDate = $$props.endDate);
    		if ("weekStart" in $$props) $$invalidate(16, weekStart = $$props.weekStart);
    		if ("i18n" in $$props) $$invalidate(0, i18n = $$props.i18n);
    		if ("enableTimeToggle" in $$props) $$invalidate(1, enableTimeToggle = $$props.enableTimeToggle);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*date, internalDate*/ 8196) {
    			{
    				if (date !== internalDate) {
    					$$invalidate(2, internalDate = date);

    					if (date) {
    						$$invalidate(18, activeDate = new Date(date.valueOf()));
    					}

    					
    					$$invalidate(3, currentView = MODE_MONTH);
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*activeDate, internalDate, currentView, i18n, weekStart*/ 327693) {
    			$$invalidate(4, dataset = compute(activeDate, internalDate, currentView, i18n, weekStart));
    		}

    		if ($$self.$$.dirty[0] & /*weekStart, i18n*/ 65537) {
    			$$invalidate(5, dayLabels = weekStart > -1
    			? i18n.daysMin.concat(i18n.daysMin).slice(weekStart, 7 + weekStart)
    			: i18n.daysMin.slice(weekStart, 7 + weekStart));
    		}

    		if ($$self.$$.dirty[0] & /*currentView, activeDate*/ 262152) {
    			$$invalidate(6, tableCaption = showCaption());
    		}
    	};

    	return [
    		i18n,
    		enableTimeToggle,
    		internalDate,
    		currentView,
    		dataset,
    		dayLabels,
    		tableCaption,
    		isBetween,
    		isDisabledDate,
    		onChangeMonth,
    		onSwitchView,
    		onClick,
    		onTimeSwitch,
    		date,
    		startDate,
    		endDate,
    		weekStart,
    		handleGridNav,
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
    		if (!document.getElementById("svelte-1thbrav-style")) add_css$2();

    		init(
    			this,
    			options,
    			instance$3,
    			create_fragment$3,
    			safe_not_equal,
    			{
    				date: 13,
    				startDate: 14,
    				endDate: 15,
    				weekStart: 16,
    				i18n: 0,
    				enableTimeToggle: 1,
    				handleGridNav: 17
    			},
    			[-1, -1]
    		);
    	}

    	get handleGridNav() {
    		return this.$$.ctx[17];
    	}
    }

    /* src\Time.svelte generated by Svelte v3.37.0 */

    function add_css$1() {
    	var style = element("style");
    	style.id = "svelte-vg2bsw-style";
    	style.textContent = ".sdt-timer.svelte-vg2bsw.svelte-vg2bsw{position:relative;width:272px}.sdt-time-head.svelte-vg2bsw.svelte-vg2bsw{position:relative;display:flex;justify-content:center;align-items:center}.sdt-time-figure.svelte-vg2bsw.svelte-vg2bsw{font-size:1.5rem;font-weight:bold}.sdt-clock.svelte-vg2bsw.svelte-vg2bsw{margin:auto;position:relative;width:260px;height:260px;background-color:#eeeded;border-radius:50%;transition:background-color 0.3s}.sdt-clock.is-minute-view.svelte-vg2bsw.svelte-vg2bsw{background-color:rgb(238, 237, 237, 0.25);box-shadow:0 0 128px 2px #ddd inset}.sdt-time-btn.svelte-vg2bsw.svelte-vg2bsw{border:0;background:transparent;text-align:center;border-radius:4px;cursor:pointer;padding:0.375rem}.sdt-time-btn.svelte-vg2bsw.svelte-vg2bsw:not(.is-active){opacity:0.5}.sdt-time-btn.svelte-vg2bsw.svelte-vg2bsw:hover{background-color:rgb(223, 223, 223);color:black}.sdt-back-btn.svelte-vg2bsw.svelte-vg2bsw{position:absolute;border:1px solid #ddd;left:0;opacity:1 !important}.sdt-meridian.svelte-vg2bsw.svelte-vg2bsw{position:absolute;top:0.25rem;right:0.25rem;display:flex;flex-flow:column;font-size:90%}.sdt-meridian.svelte-vg2bsw .sdt-time-btn.svelte-vg2bsw{padding:0.15rem 0.5rem}.sdt-meridian.svelte-vg2bsw .sdt-time-btn.is-active.svelte-vg2bsw{font-weight:bold}.sdt-middle-dot.svelte-vg2bsw.svelte-vg2bsw{left:50%;top:50%;width:6px;height:6px;position:absolute;transform:translate(-50%, -50%);background-color:#286090;border-radius:50%}.sdt-hand-pointer.svelte-vg2bsw.svelte-vg2bsw{width:2px;height:calc(40% + 1px);bottom:50%;left:calc(50% - 1px);position:absolute;background-color:#286090;transform-origin:center bottom 0;transition:transform 0.2s ease, height 0.15s ease}.sdt-hand-circle.svelte-vg2bsw.svelte-vg2bsw{left:-15px;top:-21px;position:relative;width:4px;height:4px;background-color:transparent;border:14px solid #286090;border-radius:50%;box-sizing:content-box}.sdt-tick.svelte-vg2bsw.svelte-vg2bsw{position:absolute;width:30px;height:30px;border-width:0;transform:translate(-50%, -50%);text-align:center;border-radius:50%;line-height:28px;cursor:pointer;background-color:transparent}.sdt-tick.is-selected.svelte-vg2bsw.svelte-vg2bsw{background-color:#286090;color:#fff}";
    	append(document.head, style);
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	child_ctx[30] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	child_ctx[30] = i;
    	return child_ctx;
    }

    // (176:4) {#if hasDateComponent}
    function create_if_block_2$1(ctx) {
    	let button;
    	let svg;
    	let path;
    	let button_title_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			button = element("button");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr(path, "fill-rule", "evenodd");
    			attr(path, "d", "M6.75 0a.75.75 0 01.75.75V3h9V.75a.75.75 0 011.5 0V3h2.75c.966 0 1.75.784 1.75 1.75v16a1.75 1.75 0 01-1.75 1.75H3.25a1.75 1.75 0 01-1.75-1.75v-16C1.5 3.784 2.284 3 3.25 3H6V.75A.75.75 0 016.75 0zm-3.5 4.5a.25.25 0 00-.25.25V8h18V4.75a.25.25 0 00-.25-.25H3.25zM21 9.5H3v11.25c0 .138.112.25.25.25h17.5a.25.25 0 00.25-.25V9.5z");
    			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr(svg, "viewBox", "0 0 24 24");
    			attr(svg, "width", "20");
    			attr(svg, "height", "20");
    			attr(button, "class", "sdt-time-btn sdt-back-btn svelte-vg2bsw");
    			attr(button, "title", button_title_value = /*i18n*/ ctx[2].backToDate);
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);
    			append(button, svg);
    			append(svg, path);

    			if (!mounted) {
    				dispose = listen(button, "click", /*onModeSwitch*/ ctx[16]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*i18n*/ 4 && button_title_value !== (button_title_value = /*i18n*/ ctx[2].backToDate)) {
    				attr(button, "title", button_title_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (190:4) {#if showMeridian}
    function create_if_block_1$1(ctx) {
    	let div;
    	let button0;
    	let t0;
    	let button0_data_value_value;
    	let t1;
    	let button1;
    	let t2;
    	let button1_data_value_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div = element("div");
    			button0 = element("button");
    			t0 = text("AM");
    			t1 = space();
    			button1 = element("button");
    			t2 = text("PM");
    			attr(button0, "class", "sdt-time-btn svelte-vg2bsw");
    			attr(button0, "data-value", button0_data_value_value = /*selectedHour*/ ctx[4] % 12);
    			toggle_class(button0, "is-active", /*selectedHour*/ ctx[4] < 12);
    			attr(button1, "class", "sdt-time-btn svelte-vg2bsw");
    			attr(button1, "data-value", button1_data_value_value = /*selectedHour*/ ctx[4] % 12 + 12);
    			toggle_class(button1, "is-active", /*selectedHour*/ ctx[4] >= 12);
    			attr(div, "class", "sdt-meridian svelte-vg2bsw");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, button0);
    			append(button0, t0);
    			append(div, t1);
    			append(div, button1);
    			append(button1, t2);

    			if (!mounted) {
    				dispose = [
    					listen(button0, "click", /*onSwitchMeridian*/ ctx[14]),
    					listen(button1, "click", /*onSwitchMeridian*/ ctx[14])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*selectedHour*/ 16 && button0_data_value_value !== (button0_data_value_value = /*selectedHour*/ ctx[4] % 12)) {
    				attr(button0, "data-value", button0_data_value_value);
    			}

    			if (dirty[0] & /*selectedHour*/ 16) {
    				toggle_class(button0, "is-active", /*selectedHour*/ ctx[4] < 12);
    			}

    			if (dirty[0] & /*selectedHour*/ 16 && button1_data_value_value !== (button1_data_value_value = /*selectedHour*/ ctx[4] % 12 + 12)) {
    				attr(button1, "data-value", button1_data_value_value);
    			}

    			if (dirty[0] & /*selectedHour*/ 16) {
    				toggle_class(button1, "is-active", /*selectedHour*/ ctx[4] >= 12);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (204:4) {#each pos as p, i(p.val)}
    function create_each_block_1(key_1, ctx) {
    	let button;
    	let t_value = /*p*/ ctx[28].val + "";
    	let t;
    	let button_style_value;
    	let button_data_value_value;
    	let button_transition;
    	let current;

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			button = element("button");
    			t = text(t_value);
    			attr(button, "style", button_style_value = `left:${/*p*/ ctx[28].x}px; top:${/*p*/ ctx[28].y}px`);
    			attr(button, "class", "sdt-tick svelte-vg2bsw");
    			attr(button, "data-value", button_data_value_value = /*p*/ ctx[28].val);

    			toggle_class(button, "is-selected", /*isSelected*/ ctx[12](
    				/*isMinuteView*/ ctx[3]
    				? /*selectedMinutes*/ ctx[5]
    				: /*selectedHour*/ ctx[4],
    				/*p*/ ctx[28].val,
    				/*i*/ ctx[30]
    			));

    			this.first = button;
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);
    			append(button, t);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty[0] & /*pos*/ 512) && t_value !== (t_value = /*p*/ ctx[28].val + "")) set_data(t, t_value);

    			if (!current || dirty[0] & /*pos*/ 512 && button_style_value !== (button_style_value = `left:${/*p*/ ctx[28].x}px; top:${/*p*/ ctx[28].y}px`)) {
    				attr(button, "style", button_style_value);
    			}

    			if (!current || dirty[0] & /*pos*/ 512 && button_data_value_value !== (button_data_value_value = /*p*/ ctx[28].val)) {
    				attr(button, "data-value", button_data_value_value);
    			}

    			if (dirty[0] & /*isSelected, isMinuteView, selectedMinutes, selectedHour, pos*/ 4664) {
    				toggle_class(button, "is-selected", /*isSelected*/ ctx[12](
    					/*isMinuteView*/ ctx[3]
    					? /*selectedMinutes*/ ctx[5]
    					: /*selectedHour*/ ctx[4],
    					/*p*/ ctx[28].val,
    					/*i*/ ctx[30]
    				));
    			}
    		},
    		i(local) {
    			if (current) return;

    			if (local) {
    				add_render_callback(() => {
    					if (!button_transition) button_transition = create_bidirectional_transition(button, fade, { duration: 200 }, true);
    					button_transition.run(1);
    				});
    			}

    			current = true;
    		},
    		o(local) {
    			if (local) {
    				if (!button_transition) button_transition = create_bidirectional_transition(button, fade, { duration: 200 }, false);
    				button_transition.run(0);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(button);
    			if (detaching && button_transition) button_transition.end();
    		}
    	};
    }

    // (210:4) {#if !showMeridian && !isMinuteView}
    function create_if_block$1(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*innerHours*/ ctx[10];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*innerHours, isSelected, selectedHour*/ 5136) {
    				each_value = /*innerHours*/ ctx[10];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach(each_1_anchor);
    		}
    	};
    }

    // (211:6) {#each innerHours as p, i}
    function create_each_block(ctx) {
    	let button;
    	let t_value = /*p*/ ctx[28].val + "";
    	let t;
    	let button_style_value;
    	let button_data_value_value;
    	let button_transition;
    	let current;

    	return {
    		c() {
    			button = element("button");
    			t = text(t_value);
    			attr(button, "style", button_style_value = `left:${/*p*/ ctx[28].x}px; top:${/*p*/ ctx[28].y}px`);
    			attr(button, "class", "sdt-tick svelte-vg2bsw");
    			attr(button, "data-value", button_data_value_value = /*p*/ ctx[28].val);
    			toggle_class(button, "is-selected", /*isSelected*/ ctx[12](/*selectedHour*/ ctx[4], /*p*/ ctx[28].val, /*i*/ ctx[30]));
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);
    			append(button, t);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if ((!current || dirty[0] & /*innerHours*/ 1024) && t_value !== (t_value = /*p*/ ctx[28].val + "")) set_data(t, t_value);

    			if (!current || dirty[0] & /*innerHours*/ 1024 && button_style_value !== (button_style_value = `left:${/*p*/ ctx[28].x}px; top:${/*p*/ ctx[28].y}px`)) {
    				attr(button, "style", button_style_value);
    			}

    			if (!current || dirty[0] & /*innerHours*/ 1024 && button_data_value_value !== (button_data_value_value = /*p*/ ctx[28].val)) {
    				attr(button, "data-value", button_data_value_value);
    			}

    			if (dirty[0] & /*isSelected, selectedHour, innerHours*/ 5136) {
    				toggle_class(button, "is-selected", /*isSelected*/ ctx[12](/*selectedHour*/ ctx[4], /*p*/ ctx[28].val, /*i*/ ctx[30]));
    			}
    		},
    		i(local) {
    			if (current) return;

    			if (local) {
    				add_render_callback(() => {
    					if (!button_transition) button_transition = create_bidirectional_transition(button, fade, { duration: 200 }, true);
    					button_transition.run(1);
    				});
    			}

    			current = true;
    		},
    		o(local) {
    			if (local) {
    				if (!button_transition) button_transition = create_bidirectional_transition(button, fade, { duration: 200 }, false);
    				button_transition.run(0);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(button);
    			if (detaching && button_transition) button_transition.end();
    		}
    	};
    }

    function create_fragment$2(ctx) {
    	let div5;
    	let div0;
    	let t0;
    	let button0;
    	let t1_value = /*view*/ ctx[11](/*selectedHour*/ ctx[4], /*showMeridian*/ ctx[0]) + "";
    	let t1;
    	let t2;
    	let span;
    	let t4;
    	let button1;
    	let t5_value = /*view*/ ctx[11](/*selectedMinutes*/ ctx[5], false) + "";
    	let t5;
    	let t6;
    	let t7;
    	let div4;
    	let div1;
    	let t8;
    	let div3;
    	let div2;
    	let t9;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t10;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*hasDateComponent*/ ctx[1] && create_if_block_2$1(ctx);
    	let if_block1 = /*showMeridian*/ ctx[0] && create_if_block_1$1(ctx);
    	let each_value_1 = /*pos*/ ctx[9];
    	const get_key = ctx => /*p*/ ctx[28].val;

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
    	}

    	let if_block2 = !/*showMeridian*/ ctx[0] && !/*isMinuteView*/ ctx[3] && create_if_block$1(ctx);

    	return {
    		c() {
    			div5 = element("div");
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			button0 = element("button");
    			t1 = text(t1_value);
    			t2 = space();
    			span = element("span");
    			span.textContent = ":";
    			t4 = space();
    			button1 = element("button");
    			t5 = text(t5_value);
    			t6 = space();
    			if (if_block1) if_block1.c();
    			t7 = space();
    			div4 = element("div");
    			div1 = element("div");
    			t8 = space();
    			div3 = element("div");
    			div2 = element("div");
    			t9 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t10 = space();
    			if (if_block2) if_block2.c();
    			attr(button0, "class", "sdt-time-btn sdt-time-figure svelte-vg2bsw");
    			toggle_class(button0, "is-active", !/*isMinuteView*/ ctx[3]);
    			attr(button1, "class", "sdt-time-btn sdt-time-figure svelte-vg2bsw");
    			toggle_class(button1, "is-active", /*isMinuteView*/ ctx[3]);
    			attr(div0, "class", "sdt-time-head svelte-vg2bsw");
    			attr(div1, "class", "sdt-middle-dot svelte-vg2bsw");
    			attr(div2, "class", "sdt-hand-circle svelte-vg2bsw");
    			attr(div3, "class", "sdt-hand-pointer svelte-vg2bsw");
    			attr(div3, "style", /*handCss*/ ctx[8]);
    			attr(div4, "class", "sdt-clock svelte-vg2bsw");
    			toggle_class(div4, "is-minute-view", /*isMinuteView*/ ctx[3]);
    			attr(div5, "class", "sdt-timer svelte-vg2bsw");
    		},
    		m(target, anchor) {
    			insert(target, div5, anchor);
    			append(div5, div0);
    			if (if_block0) if_block0.m(div0, null);
    			append(div0, t0);
    			append(div0, button0);
    			append(button0, t1);
    			append(div0, t2);
    			append(div0, span);
    			append(div0, t4);
    			append(div0, button1);
    			append(button1, t5);
    			append(div0, t6);
    			if (if_block1) if_block1.m(div0, null);
    			append(div5, t7);
    			append(div5, div4);
    			append(div4, div1);
    			append(div4, t8);
    			append(div4, div3);
    			append(div3, div2);
    			append(div4, t9);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div4, null);
    			}

    			append(div4, t10);
    			if (if_block2) if_block2.m(div4, null);
    			/*div4_binding*/ ctx[22](div4);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(button0, "click", /*click_handler*/ ctx[19]),
    					listen(button1, "click", /*click_handler_1*/ ctx[20]),
    					listen(div4, "click", /*onClick*/ ctx[13]),
    					listen(div4, "mousedown", /*onToggleMove*/ ctx[15]),
    					listen(div4, "mousemove", /*mousemove_handler*/ ctx[21]),
    					listen(div4, "mouseup", /*onToggleMove*/ ctx[15])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (/*hasDateComponent*/ ctx[1]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2$1(ctx);
    					if_block0.c();
    					if_block0.m(div0, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if ((!current || dirty[0] & /*selectedHour, showMeridian*/ 17) && t1_value !== (t1_value = /*view*/ ctx[11](/*selectedHour*/ ctx[4], /*showMeridian*/ ctx[0]) + "")) set_data(t1, t1_value);

    			if (dirty[0] & /*isMinuteView*/ 8) {
    				toggle_class(button0, "is-active", !/*isMinuteView*/ ctx[3]);
    			}

    			if ((!current || dirty[0] & /*selectedMinutes*/ 32) && t5_value !== (t5_value = /*view*/ ctx[11](/*selectedMinutes*/ ctx[5], false) + "")) set_data(t5, t5_value);

    			if (dirty[0] & /*isMinuteView*/ 8) {
    				toggle_class(button1, "is-active", /*isMinuteView*/ ctx[3]);
    			}

    			if (/*showMeridian*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$1(ctx);
    					if_block1.c();
    					if_block1.m(div0, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (!current || dirty[0] & /*handCss*/ 256) {
    				attr(div3, "style", /*handCss*/ ctx[8]);
    			}

    			if (dirty[0] & /*pos, isSelected, isMinuteView, selectedMinutes, selectedHour*/ 4664) {
    				each_value_1 = /*pos*/ ctx[9];
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, div4, outro_and_destroy_block, create_each_block_1, t10, get_each_context_1);
    				check_outros();
    			}

    			if (!/*showMeridian*/ ctx[0] && !/*isMinuteView*/ ctx[3]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty[0] & /*showMeridian, isMinuteView*/ 9) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block$1(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div4, null);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (dirty[0] & /*isMinuteView*/ 8) {
    				toggle_class(div4, "is-minute-view", /*isMinuteView*/ ctx[3]);
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(if_block2);
    			current = true;
    		},
    		o(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(if_block2);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div5);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (if_block2) if_block2.d();
    			/*div4_binding*/ ctx[22](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let selectedHour;
    	let isPM;
    	let selectedMinutes;
    	let handCss;
    	let multiplier;
    	let pos;
    	let innerHours;
    	let { date = null } = $$props;
    	let { showMeridian = false } = $$props;
    	let { hasDateComponent = false } = $$props;
    	let { i18n } = $$props;
    	let clockEl;
    	let isMinuteView = false;
    	let handleMoveMove = false;
    	let innerDate = date || new Date();

    	if (!date) {
    		date = innerDate;
    	}

    	const dispatch = createEventDispatcher();
    	console.log("I", innerDate);

    	function positions(size, offset, valueForZero, minuteView, hourAdded) {
    		const r = size / 2;
    		offset = offset || r;
    		const coeff = [0, 1 - 0.5, 1 - 0.134, 1, 1 - 0.134, 1 - 0.5];
    		const xCoeff = coeff.concat(coeff);
    		const yCoeff = coeff.slice(3).concat(coeff).concat(coeff.slice(0, 3));
    		const pos = [];

    		for (let i = 0; i < 12; i++) {
    			pos.push({
    				x: Math.abs(xCoeff[i] * r + (i <= 6 ? 1 : -1) * offset),
    				y: Math.abs(yCoeff[i] * r + (i >= 9 || i < 3 ? -1 : 1) * offset),
    				val: minuteView
    				? i * 5 || valueForZero
    				: i ? i + hourAdded : valueForZero
    			});
    		}

    		return pos;
    	}

    	function view(value, asMeridian) {
    		if (asMeridian) {
    			if (isPM && value === 12) return 12;
    			return value < 10 || value % 12 < 10 ? `0${value % 12}` : value;
    		}

    		return value < 10 ? `0${value}` : value;
    	}

    	function isSelected(selected, val, i) {
    		if (isMinuteView) {
    			console.log("v", selected, val, i);
    			return val === selected || i === 0 && i === selected;
    		} else {
    			if (showMeridian) {
    				if (isPM && val == 12 && selected === 12) return true;
    				if (!isPM && val == 12 && selected === 0) return true;
    				return val === (selected ? selected % 12 : 12);
    			} else if (val > 12) {
    				return (i ? multiplier * i + 12 : 0) === selected;
    			} else {
    				return val === selected;
    			}
    		}
    	}

    	function onClick(e) {
    		if (e.type === "mousemove" && !handleMoveMove) return;

    		if (e.target.tagName === "BUTTON") {
    			let val = parseInt(e.target.dataset.value);

    			const setter = e.meridianSwitch || !isMinuteView
    			? "setUTCHours"
    			: "setUTCMinutes";

    			innerDate[setter](val);
    		} else if (isMinuteView) {
    			// compute it out of x,y 
    			const rect = clockEl.getBoundingClientRect();

    			const clientX = e.clientX - rect.left;
    			const clientY = e.clientY - rect.top;
    			const cntX = 130, cntY = 130;
    			let quadrant = null;
    			let a, b;

    			if (clientX > cntX) {
    				quadrant = clientY > cntY ? 2 : 1;
    			} else {
    				quadrant = clientY > cntY ? 3 : 4;
    			}

    			switch (quadrant) {
    				case 1:
    					a = clientX - cntX;
    					b = cntY - clientY;
    					break;
    				case 2:
    					a = clientX - cntX;
    					b = clientY - cntY;
    					break;
    				case 3:
    					a = cntX - clientX;
    					b = clientY - cntY;
    					break;
    				case 4:
    					a = cntX - clientX;
    					b = cntY - clientY;
    					break;
    			}

    			const c = Math.sqrt(a * a + b * b);
    			const beta = 90 - Math.asin(a / c) * (180 / Math.PI);
    			let degree;

    			switch (quadrant) {
    				case 1:
    					degree = 90 - beta;
    					break;
    				case 2:
    					degree = beta + 90;
    					break;
    				case 3:
    					degree = 270 - beta;
    					break;
    				case 4:
    					degree = beta + 270;
    					break;
    			}

    			degree = Math.floor(degree / 6);
    			innerDate.setMinutes(degree);
    		}

    		($$invalidate(18, innerDate), $$invalidate(17, date));
    		dispatch("time", innerDate);

    		if (!e.meridianSwitch && !handleMoveMove && isMinuteView) setTimeout(
    			() => {
    				dispatch("close");
    			},
    			300
    		);

    		if (!e.meridianSwitch && !isMinuteView) $$invalidate(3, isMinuteView = true);

    		setTimeout(
    			() => {
    			},
    			1000
    		);
    	}

    	function onSwitchMeridian(e) {
    		e.meridianSwitch = true;
    		onClick(e);
    	}

    	function onToggleMove(e) {
    		$$invalidate(7, handleMoveMove = e.type === "mousedown");
    	}

    	function onModeSwitch() {
    		dispatch("switch", "date");
    	}

    	const click_handler = () => $$invalidate(3, isMinuteView = false);
    	const click_handler_1 = () => $$invalidate(3, isMinuteView = true);

    	const mousemove_handler = e => {
    		handleMoveMove && onClick(e);
    	};

    	function div4_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			clockEl = $$value;
    			$$invalidate(6, clockEl);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("date" in $$props) $$invalidate(17, date = $$props.date);
    		if ("showMeridian" in $$props) $$invalidate(0, showMeridian = $$props.showMeridian);
    		if ("hasDateComponent" in $$props) $$invalidate(1, hasDateComponent = $$props.hasDateComponent);
    		if ("i18n" in $$props) $$invalidate(2, i18n = $$props.i18n);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*date, innerDate*/ 393216) {
    			{
    				if (date !== innerDate) {
    					$$invalidate(18, innerDate = date);
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*innerDate*/ 262144) {
    			$$invalidate(4, selectedHour = innerDate ? innerDate.getUTCHours() : 0);
    		}

    		if ($$self.$$.dirty[0] & /*showMeridian, selectedHour*/ 17) {
    			isPM = showMeridian ? selectedHour >= 12 : false;
    		}

    		if ($$self.$$.dirty[0] & /*innerDate*/ 262144) {
    			$$invalidate(5, selectedMinutes = innerDate ? innerDate.getUTCMinutes() : 0);
    		}

    		if ($$self.$$.dirty[0] & /*isMinuteView, selectedMinutes, showMeridian, selectedHour*/ 57) {
    			$$invalidate(8, handCss = isMinuteView
    			? `transform: rotateZ(${selectedMinutes * 6}deg)`
    			: showMeridian
    				? `transform: rotateZ(${selectedHour % 12 * 30}deg);`
    				: `transform: rotateZ(${selectedHour % 12 * 30}deg); ${selectedHour > 12 || !selectedHour
					? "height: calc(25% + 1px)"
					: ""}`);
    		}

    		if ($$self.$$.dirty[0] & /*isMinuteView*/ 8) {
    			multiplier = isMinuteView ? 5 : 1;
    		}

    		if ($$self.$$.dirty[0] & /*isMinuteView*/ 8) {
    			$$invalidate(9, pos = positions(220, 130, isMinuteView ? "00" : "12", isMinuteView, 0));
    		}
    	};

    	$$invalidate(10, innerHours = positions(140, 130, "00", false, 12));

    	return [
    		showMeridian,
    		hasDateComponent,
    		i18n,
    		isMinuteView,
    		selectedHour,
    		selectedMinutes,
    		clockEl,
    		handleMoveMove,
    		handCss,
    		pos,
    		innerHours,
    		view,
    		isSelected,
    		onClick,
    		onSwitchMeridian,
    		onToggleMove,
    		onModeSwitch,
    		date,
    		innerDate,
    		click_handler,
    		click_handler_1,
    		mousemove_handler,
    		div4_binding
    	];
    }

    class Time extends SvelteComponent {
    	constructor(options) {
    		super();
    		if (!document.getElementById("svelte-vg2bsw-style")) add_css$1();

    		init(
    			this,
    			options,
    			instance$2,
    			create_fragment$2,
    			safe_not_equal,
    			{
    				date: 17,
    				showMeridian: 0,
    				hasDateComponent: 1,
    				i18n: 2
    			},
    			[-1, -1]
    		);
    	}
    }

    function usePosition(el, { inputEl, visible }) {
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

    const en = {
      days:        ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      daysShort:   ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      daysMin:     ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
      months:      ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      meridiem:    ['am', 'pm'],
      suffix:      ['st', 'nd', 'rd', 'th'],
      todayBtn:    'Today',
      clearBtn:    'Clear',
      timeView:    'Show time view',
      backToDate:  'Back to calendar view'
    };

    /* src\SveltyPicker.svelte generated by Svelte v3.37.0 */

    function add_css() {
    	var style = element("style");
    	style.id = "svelte-1up2u1m-style";
    	style.textContent = ".std-calendar-wrap.svelte-1up2u1m{width:280px;background-color:white;box-shadow:0 1px 6px #ccc;border-radius:4px;padding:0.25rem 0.25rem 0.5rem}.std-calendar-wrap.is-popup.svelte-1up2u1m{box-shadow:0 1px 6px #ccc}.std-btn-row.svelte-1up2u1m{margin-top:0.5rem;display:flex;justify-content:space-evenly}";
    	append(document.head, style);
    }

    // (163:0) {#if visible || isFocused}
    function create_if_block(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let positionFn_action;
    	let div_transition;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*currentMode*/ ctx[20] === "date") return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			div = element("div");
    			if_block.c();
    			attr(div, "class", "std-calendar-wrap is-popup svelte-1up2u1m");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(div, "mousedown", prevent_default(/*mousedown_handler*/ ctx[34])),
    					action_destroyer(positionFn_action = /*positionFn*/ ctx[15].call(null, div, {
    						inputEl: /*inputEl*/ ctx[18],
    						visible: /*internalVisibility*/ ctx[21]
    					}))
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}

    			if (positionFn_action && is_function(positionFn_action.update) && dirty[0] & /*inputEl, internalVisibility*/ 2359296) positionFn_action.update.call(null, {
    				inputEl: /*inputEl*/ ctx[18],
    				visible: /*internalVisibility*/ ctx[21]
    			});
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);

    			if (local) {
    				add_render_callback(() => {
    					if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 200 }, true);
    					div_transition.run(1);
    				});
    			}

    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);

    			if (local) {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 200 }, false);
    				div_transition.run(0);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if_blocks[current_block_type_index].d();
    			if (detaching && div_transition) div_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (185:2) {:else}
    function create_else_block(ctx) {
    	let time;
    	let current;

    	time = new Time({
    			props: {
    				date: /*innerDate*/ ctx[16],
    				hasDateComponent: /*resolvedMode*/ ctx[24] !== "time",
    				showMeridian: /*format*/ ctx[0].match("p|P"),
    				i18n: /*i18n*/ ctx[6]
    			}
    		});

    	time.$on("time", /*onDate*/ ctx[25]);
    	time.$on("switch", /*onModeSwitch*/ ctx[29]);
    	time.$on("close", /*close_handler*/ ctx[41]);

    	return {
    		c() {
    			create_component(time.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(time, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const time_changes = {};
    			if (dirty[0] & /*innerDate*/ 65536) time_changes.date = /*innerDate*/ ctx[16];
    			if (dirty[0] & /*format*/ 1) time_changes.showMeridian = /*format*/ ctx[0].match("p|P");
    			if (dirty[0] & /*i18n*/ 64) time_changes.i18n = /*i18n*/ ctx[6];
    			time.$set(time_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(time.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(time.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(time, detaching);
    		}
    	};
    }

    // (165:2) {#if currentMode === 'date'}
    function create_if_block_1(ctx) {
    	let calendar;
    	let t;
    	let if_block_anchor;
    	let current;

    	let calendar_props = {
    		date: /*innerDate*/ ctx[16],
    		startDate: /*startDate*/ ctx[3]
    		? parseDate(/*startDate*/ ctx[3], /*format*/ ctx[0], /*i18n*/ ctx[6], /*formatType*/ ctx[5])
    		: null,
    		endDate: /*endDate*/ ctx[4]
    		? parseDate(/*endDate*/ ctx[4], /*format*/ ctx[0], /*i18n*/ ctx[6], /*formatType*/ ctx[5])
    		: null,
    		enableTimeToggle: /*resolvedMode*/ ctx[24].includes("time"),
    		i18n: /*i18n*/ ctx[6],
    		weekStart: /*weekStart*/ ctx[7]
    	};

    	calendar = new Calendar({ props: calendar_props });
    	/*calendar_binding*/ ctx[40](calendar);
    	calendar.$on("date", /*onDate*/ ctx[25]);
    	calendar.$on("switch", /*onModeSwitch*/ ctx[29]);
    	let if_block = (/*todayBtn*/ ctx[11] || /*clearBtn*/ ctx[12]) && create_if_block_2(ctx);

    	return {
    		c() {
    			create_component(calendar.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			mount_component(calendar, target, anchor);
    			insert(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const calendar_changes = {};
    			if (dirty[0] & /*innerDate*/ 65536) calendar_changes.date = /*innerDate*/ ctx[16];

    			if (dirty[0] & /*startDate, format, i18n, formatType*/ 105) calendar_changes.startDate = /*startDate*/ ctx[3]
    			? parseDate(/*startDate*/ ctx[3], /*format*/ ctx[0], /*i18n*/ ctx[6], /*formatType*/ ctx[5])
    			: null;

    			if (dirty[0] & /*endDate, format, i18n, formatType*/ 113) calendar_changes.endDate = /*endDate*/ ctx[4]
    			? parseDate(/*endDate*/ ctx[4], /*format*/ ctx[0], /*i18n*/ ctx[6], /*formatType*/ ctx[5])
    			: null;

    			if (dirty[0] & /*i18n*/ 64) calendar_changes.i18n = /*i18n*/ ctx[6];
    			if (dirty[0] & /*weekStart*/ 128) calendar_changes.weekStart = /*weekStart*/ ctx[7];
    			calendar.$set(calendar_changes);

    			if (/*todayBtn*/ ctx[11] || /*clearBtn*/ ctx[12]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(calendar.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(calendar.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			/*calendar_binding*/ ctx[40](null);
    			destroy_component(calendar, detaching);
    			if (detaching) detach(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (175:4) {#if todayBtn || clearBtn}
    function create_if_block_2(ctx) {
    	let div;
    	let t;
    	let if_block0 = /*todayBtn*/ ctx[11] && create_if_block_4(ctx);
    	let if_block1 = /*clearBtn*/ ctx[12] && create_if_block_3(ctx);

    	return {
    		c() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			attr(div, "class", "std-btn-row svelte-1up2u1m");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append(div, t);
    			if (if_block1) if_block1.m(div, null);
    		},
    		p(ctx, dirty) {
    			if (/*todayBtn*/ ctx[11]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					if_block0.m(div, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*clearBtn*/ ctx[12]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_3(ctx);
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

    // (177:6) {#if todayBtn}
    function create_if_block_4(ctx) {
    	let button;
    	let t_value = /*i18n*/ ctx[6].todayBtn + "";
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
    				dispose = listen(button, "click", /*onToday*/ ctx[26]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*i18n*/ 64 && t_value !== (t_value = /*i18n*/ ctx[6].todayBtn + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (180:6) {#if clearBtn}
    function create_if_block_3(ctx) {
    	let button;
    	let t_value = /*i18n*/ ctx[6].clearBtn + "";
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
    				dispose = listen(button, "click", /*onClear*/ ctx[27]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*i18n*/ 64 && t_value !== (t_value = /*i18n*/ ctx[6].clearBtn + "")) set_data(t, t_value);
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
    	let input_type_value;
    	let input_class_value;
    	let t;
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = (/*visible*/ ctx[9] || /*isFocused*/ ctx[17]) && create_if_block(ctx);

    	return {
    		c() {
    			input = element("input");
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr(input, "type", input_type_value = /*pickerOnly*/ ctx[8] ? "hidden" : "text");
    			attr(input, "name", /*name*/ ctx[2]);
    			attr(input, "class", input_class_value = "" + (null_to_empty(/*inputClasses*/ ctx[14]) + " svelte-1up2u1m"));
    			input.required = /*required*/ ctx[13];
    			input.readOnly = /*isFocused*/ ctx[17];
    			input.value = /*value*/ ctx[1];
    		},
    		m(target, anchor) {
    			insert(target, input, anchor);
    			/*input_binding*/ ctx[37](input);
    			insert(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(/*inputAction*/ ctx[22].call(null, input, /*inputActionParams*/ ctx[23])),
    					listen(input, "focus", /*focus_handler*/ ctx[38]),
    					listen(input, "blur", /*onBlur*/ ctx[30]),
    					listen(input, "click", /*click_handler*/ ctx[39]),
    					listen(input, "input", /*input_handler*/ ctx[35]),
    					listen(input, "change", /*change_handler*/ ctx[36]),
    					listen(input, "keydown", /*onKeyDown*/ ctx[28])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (!current || dirty[0] & /*pickerOnly*/ 256 && input_type_value !== (input_type_value = /*pickerOnly*/ ctx[8] ? "hidden" : "text")) {
    				attr(input, "type", input_type_value);
    			}

    			if (!current || dirty[0] & /*name*/ 4) {
    				attr(input, "name", /*name*/ ctx[2]);
    			}

    			if (!current || dirty[0] & /*inputClasses*/ 16384 && input_class_value !== (input_class_value = "" + (null_to_empty(/*inputClasses*/ ctx[14]) + " svelte-1up2u1m"))) {
    				attr(input, "class", input_class_value);
    			}

    			if (!current || dirty[0] & /*required*/ 8192) {
    				input.required = /*required*/ ctx[13];
    			}

    			if (!current || dirty[0] & /*isFocused*/ 131072) {
    				input.readOnly = /*isFocused*/ ctx[17];
    			}

    			if (!current || dirty[0] & /*value*/ 2 && input.value !== /*value*/ ctx[1]) {
    				input.value = /*value*/ ctx[1];
    			}

    			if (/*visible*/ ctx[9] || /*isFocused*/ ctx[17]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*visible, isFocused*/ 131584) {
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
    			/*input_binding*/ ctx[37](null);
    			if (detaching) detach(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let internalVisibility;
    	let { name = "date" } = $$props;
    	let { value = null } = $$props;
    	let { initialDate = null } = $$props;
    	let { startDate = null } = $$props;
    	let { endDate = null } = $$props;
    	let { mode = "auto" } = $$props;
    	let { format = "yyyy-mm-dd" } = $$props;
    	let { formatType = "standard" } = $$props;
    	let { i18n = en } = $$props;
    	let { weekStart = 1 } = $$props;
    	let { pickerOnly = false } = $$props;
    	let { visible = false } = $$props;
    	let { autoclose = true } = $$props;
    	let { todayBtn = true } = $$props;
    	let { clearBtn = true } = $$props;
    	let { required = false } = $$props;
    	let { inputClasses } = $$props;
    	let { positionFn = usePosition } = $$props;
    	let { validatorAction = null } = $$props;

    	if (format === "yyyy-mm-dd" && mode === "time") {
    		format = "hh:ii";
    	}

    	let innerDate = initialDate && initialDate instanceof Date
    	? initialDate
    	: value
    		? parseDate(value, format, i18n, formatType)
    		: null;

    	let isFocused = pickerOnly;
    	let inputEl = null;

    	let inputAction = validatorAction
    	? validatorAction.shift()
    	: () => {
    			
    		};

    	let inputActionParams = validatorAction || [];
    	let calendarEl = null;
    	let preventClose = false;

    	let resolvedMode = mode === "auto"
    	? format.match(/hh?|ii?/i) && format.match(/y|m|d/i)
    		? "datetime"
    		: format.match(/hh?|ii?/i) ? "time" : "date"
    	: mode;

    	let currentMode = resolvedMode === "time" ? "time" : "date";

    	function onDate(e) {
    		let setter = e.detail || null;

    		if (e.detail && innerDate) {
    			if (innerDate.getUTCFullYear() === e.detail.getUTCFullYear() && innerDate.getUTCMonth() === e.detail.getUTCMonth() && innerDate.getUTCDate() === e.detail.getUTCDate() && resolvedMode === "date") setter = null;
    		}

    		$$invalidate(16, innerDate = setter);

    		if (autoclose && resolvedMode === "date" && !pickerOnly && !preventClose) {
    			$$invalidate(17, isFocused = false);
    		}

    		if (!preventClose && resolvedMode === "datetime" && currentMode === "date") {
    			$$invalidate(20, currentMode = "time");
    		}

    		preventClose = false;

    		tick().then(() => {
    			inputEl.dispatchEvent(new Event("input"));
    		});
    	}

    	function onToday() {
    		const today = new Date();

    		onDate({
    			detail: UTCDate(today.getUTCFullYear(), today.getMonth(), today.getDate(), today.getHours(), today.getMinutes(), 0)
    		});
    	}

    	function onClear() {
    		onDate({ detail: null });
    		$$invalidate(20, currentMode = "date");
    		if (resolvedMode === "date" && autoclose) $$invalidate(17, isFocused = false);
    	}

    	function onKeyDown(e) {
    		if (!isFocused) {
    			["Backspace", "Delete"].includes(e.key) && onClear();
    			$$invalidate(17, isFocused = true);
    			return;
    		}

    		switch (e.key) {
    			case "ArrowDown":
    			case "ArrowUp":
    			case "ArrowLeft":
    			case "ArrowRight":
    				e.preventDefault();
    				preventClose = true;
    				if (currentMode === "date") {
    					// TODO: handle shift
    					calendarEl.handleGridNav(e.key, e.shiftKey);
    				}
    				break;
    			case "Escape":
    				if (isFocused && !internalVisibility) {
    					$$invalidate(17, isFocused = false); // TODO: keyboard nav for timepicker
    				}
    				break;
    			case "Backspace":
    			case "Delete":
    				onClear();
    			case "Enter":
    				if (isFocused && resolvedMode === "date") $$invalidate(17, isFocused = false);
    				if (resolvedMode.includes("time")) {
    					$$invalidate(20, currentMode = "time");
    				}
    				break;
    			case "Tab":
    			case "F5":
    				break;
    			default:
    				e.preventDefault();
    		}
    	}

    	function onModeSwitch(e) {
    		$$invalidate(20, currentMode = e.detail);
    	}

    	function onBlur() {
    		$$invalidate(17, isFocused = false);
    		if (resolvedMode.includes("date")) $$invalidate(20, currentMode = "date");
    		dispatchEvent("blur");
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
    			$$invalidate(18, inputEl);
    		});
    	}

    	const focus_handler = () => {
    		$$invalidate(17, isFocused = true);
    	};

    	const click_handler = () => {
    		if (!isFocused) $$invalidate(17, isFocused = true);
    	};

    	function calendar_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			calendarEl = $$value;
    			$$invalidate(19, calendarEl);
    		});
    	}

    	const close_handler = () => autoclose && !pickerOnly && onBlur();

    	$$self.$$set = $$props => {
    		if ("name" in $$props) $$invalidate(2, name = $$props.name);
    		if ("value" in $$props) $$invalidate(1, value = $$props.value);
    		if ("initialDate" in $$props) $$invalidate(31, initialDate = $$props.initialDate);
    		if ("startDate" in $$props) $$invalidate(3, startDate = $$props.startDate);
    		if ("endDate" in $$props) $$invalidate(4, endDate = $$props.endDate);
    		if ("mode" in $$props) $$invalidate(32, mode = $$props.mode);
    		if ("format" in $$props) $$invalidate(0, format = $$props.format);
    		if ("formatType" in $$props) $$invalidate(5, formatType = $$props.formatType);
    		if ("i18n" in $$props) $$invalidate(6, i18n = $$props.i18n);
    		if ("weekStart" in $$props) $$invalidate(7, weekStart = $$props.weekStart);
    		if ("pickerOnly" in $$props) $$invalidate(8, pickerOnly = $$props.pickerOnly);
    		if ("visible" in $$props) $$invalidate(9, visible = $$props.visible);
    		if ("autoclose" in $$props) $$invalidate(10, autoclose = $$props.autoclose);
    		if ("todayBtn" in $$props) $$invalidate(11, todayBtn = $$props.todayBtn);
    		if ("clearBtn" in $$props) $$invalidate(12, clearBtn = $$props.clearBtn);
    		if ("required" in $$props) $$invalidate(13, required = $$props.required);
    		if ("inputClasses" in $$props) $$invalidate(14, inputClasses = $$props.inputClasses);
    		if ("positionFn" in $$props) $$invalidate(15, positionFn = $$props.positionFn);
    		if ("validatorAction" in $$props) $$invalidate(33, validatorAction = $$props.validatorAction);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*pickerOnly, visible*/ 768) {
    			$$invalidate(21, internalVisibility = pickerOnly ? true : visible);
    		}

    		if ($$self.$$.dirty[0] & /*innerDate, format, i18n, formatType*/ 65633) {
    			{
    				$$invalidate(1, value = formatDate(innerDate, format, i18n, formatType));
    			}
    		}
    	};

    	return [
    		format,
    		value,
    		name,
    		startDate,
    		endDate,
    		formatType,
    		i18n,
    		weekStart,
    		pickerOnly,
    		visible,
    		autoclose,
    		todayBtn,
    		clearBtn,
    		required,
    		inputClasses,
    		positionFn,
    		innerDate,
    		isFocused,
    		inputEl,
    		calendarEl,
    		currentMode,
    		internalVisibility,
    		inputAction,
    		inputActionParams,
    		resolvedMode,
    		onDate,
    		onToday,
    		onClear,
    		onKeyDown,
    		onModeSwitch,
    		onBlur,
    		initialDate,
    		mode,
    		validatorAction,
    		mousedown_handler,
    		input_handler,
    		change_handler,
    		input_binding,
    		focus_handler,
    		click_handler,
    		calendar_binding,
    		close_handler
    	];
    }

    class SveltyPicker extends SvelteComponent {
    	constructor(options) {
    		super();
    		if (!document.getElementById("svelte-1up2u1m-style")) add_css();

    		init(
    			this,
    			options,
    			instance$1,
    			create_fragment$1,
    			safe_not_equal,
    			{
    				name: 2,
    				value: 1,
    				initialDate: 31,
    				startDate: 3,
    				endDate: 4,
    				mode: 32,
    				format: 0,
    				formatType: 5,
    				i18n: 6,
    				weekStart: 7,
    				pickerOnly: 8,
    				visible: 9,
    				autoclose: 10,
    				todayBtn: 11,
    				clearBtn: 12,
    				required: 13,
    				inputClasses: 14,
    				positionFn: 15,
    				validatorAction: 33
    			},
    			[-1, -1]
    		);
    	}
    }

    /* docs\docs.svelte generated by Svelte v3.37.0 */

    function create_fragment(ctx) {
    	let div15;
    	let div0;
    	let t1;
    	let div3;
    	let div2;
    	let div1;
    	let span0;
    	let t3;
    	let sveltypicker0;
    	let updating_value;
    	let t4;
    	let div8;
    	let div5;
    	let div4;
    	let t5;
    	let sveltypicker1;
    	let t6;
    	let div7;
    	let div6;
    	let t7;
    	let sveltypicker2;
    	let t8;
    	let div11;
    	let div9;
    	let t9;
    	let sveltypicker3;
    	let t10;
    	let div10;
    	let t11;
    	let sveltypicker4;
    	let t12;
    	let div13;
    	let div12;
    	let button0;
    	let t13;
    	let t14_value = (/*modalProp*/ ctx[1] || "None yet") + "";
    	let t14;
    	let t15;
    	let hr;
    	let t16;
    	let div14;
    	let t17;
    	let div21;
    	let div20;
    	let div19;
    	let div16;
    	let t21;
    	let div17;
    	let p0;
    	let t23;
    	let p1;
    	let t24;
    	let sveltypicker5;
    	let updating_value_1;
    	let t25;
    	let div18;
    	let current;

    	function sveltypicker0_value_binding(value) {
    		/*sveltypicker0_value_binding*/ ctx[2](value);
    	}

    	let sveltypicker0_props = {
    		inputClasses: "form-control",
    		format: "yyyy-mm-dd hh:ii"
    	};

    	if (/*myProp*/ ctx[0] !== void 0) {
    		sveltypicker0_props.value = /*myProp*/ ctx[0];
    	}

    	sveltypicker0 = new SveltyPicker({ props: sveltypicker0_props });
    	binding_callbacks.push(() => bind(sveltypicker0, "value", sveltypicker0_value_binding));

    	sveltypicker1 = new SveltyPicker({
    			props: {
    				inputClasses: "form-control",
    				mode: "date",
    				startDate: "2021-11-04"
    			}
    		});

    	sveltypicker2 = new SveltyPicker({
    			props: {
    				inputClasses: "form-control",
    				mode: "time",
    				format: "hh:ii"
    			}
    		});

    	sveltypicker3 = new SveltyPicker({
    			props: {
    				inputClasses: "form-control",
    				mode: "date",
    				pickerOnly: true
    			}
    		});

    	sveltypicker4 = new SveltyPicker({
    			props: {
    				inputClasses: "form-control",
    				mode: "time",
    				value: "23:00",
    				format: "hh:ii",
    				pickerOnly: true
    			}
    		});

    	function sveltypicker5_value_binding(value) {
    		/*sveltypicker5_value_binding*/ ctx[3](value);
    	}

    	let sveltypicker5_props = {};

    	if (/*modalProp*/ ctx[1] !== void 0) {
    		sveltypicker5_props.value = /*modalProp*/ ctx[1];
    	}

    	sveltypicker5 = new SveltyPicker({ props: sveltypicker5_props });
    	binding_callbacks.push(() => bind(sveltypicker5, "value", sveltypicker5_value_binding));
    	sveltypicker5.$on("input", /*input_handler*/ ctx[4]);

    	return {
    		c() {
    			div15 = element("div");
    			div0 = element("div");
    			div0.innerHTML = `<h1>Simple Date &amp; time picker</h1>`;
    			t1 = space();
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			span0 = element("span");
    			span0.textContent = "Normal date picker (bootstrap style for input)";
    			t3 = space();
    			create_component(sveltypicker0.$$.fragment);
    			t4 = space();
    			div8 = element("div");
    			div5 = element("div");
    			div4 = element("div");
    			t5 = text("Date picker only:\r\n        ");
    			create_component(sveltypicker1.$$.fragment);
    			t6 = space();
    			div7 = element("div");
    			div6 = element("div");
    			t7 = text("Time picker only:\r\n        ");
    			create_component(sveltypicker2.$$.fragment);
    			t8 = space();
    			div11 = element("div");
    			div9 = element("div");
    			t9 = text("Date picker only (always visible)\r\n      ");
    			create_component(sveltypicker3.$$.fragment);
    			t10 = space();
    			div10 = element("div");
    			t11 = text("Time picker only (always visible)\r\n      ");
    			create_component(sveltypicker4.$$.fragment);
    			t12 = space();
    			div13 = element("div");
    			div12 = element("div");
    			button0 = element("button");
    			t13 = text("Picked date from modal: ");
    			t14 = text(t14_value);
    			t15 = space();
    			hr = element("hr");
    			t16 = space();
    			div14 = element("div");
    			t17 = space();
    			div21 = element("div");
    			div20 = element("div");
    			div19 = element("div");
    			div16 = element("div");

    			div16.innerHTML = `<h5 class="modal-title" id="exampleModalLabel">Modal title</h5> 
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>`;

    			t21 = space();
    			div17 = element("div");
    			p0 = element("p");
    			p0.textContent = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae harum explicabo optio mollitia, libero animi corporis quibusdam quia fuga odit exercitationem, iure, est neque ab officia facilis. Sequi, officiis at?";
    			t23 = space();
    			p1 = element("p");
    			t24 = space();
    			create_component(sveltypicker5.$$.fragment);
    			t25 = space();
    			div18 = element("div");

    			div18.innerHTML = `<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button> 
        <button type="button" class="btn btn-primary" data-dismiss="modal">Save changes</button>`;

    			attr(div0, "class", "text-center");
    			attr(span0, "class", "form-label");
    			attr(div1, "class", "form-group");
    			attr(div2, "class", "col-12");
    			attr(div3, "class", "row");
    			attr(div4, "class", "form-group");
    			attr(div5, "class", "col-6");
    			attr(div6, "class", "form-group");
    			attr(div7, "class", "col-6");
    			attr(div8, "class", "row");
    			attr(div9, "class", "col-6");
    			attr(div10, "class", "col-6");
    			attr(div11, "class", "row");
    			attr(button0, "type", "button");
    			attr(button0, "class", "btn btn-primary");
    			attr(button0, "data-toggle", "modal");
    			attr(button0, "data-target", "#exampleModal");
    			attr(div12, "class", "col");
    			attr(div13, "class", "row mt-4");
    			attr(div14, "id", "readme");
    			attr(div15, "class", "container");
    			attr(div16, "class", "modal-header");
    			attr(p1, "class", "mt-2 mb-2");
    			attr(div17, "class", "modal-body");
    			attr(div18, "class", "modal-footer");
    			attr(div19, "class", "modal-content");
    			attr(div20, "class", "modal-dialog");
    			attr(div21, "class", "modal fade");
    			attr(div21, "id", "exampleModal");
    			attr(div21, "tabindex", "-1");
    			attr(div21, "aria-labelledby", "exampleModalLabel");
    			attr(div21, "aria-hidden", "true");
    		},
    		m(target, anchor) {
    			insert(target, div15, anchor);
    			append(div15, div0);
    			append(div15, t1);
    			append(div15, div3);
    			append(div3, div2);
    			append(div2, div1);
    			append(div1, span0);
    			append(div1, t3);
    			mount_component(sveltypicker0, div1, null);
    			append(div15, t4);
    			append(div15, div8);
    			append(div8, div5);
    			append(div5, div4);
    			append(div4, t5);
    			mount_component(sveltypicker1, div4, null);
    			append(div8, t6);
    			append(div8, div7);
    			append(div7, div6);
    			append(div6, t7);
    			mount_component(sveltypicker2, div6, null);
    			append(div15, t8);
    			append(div15, div11);
    			append(div11, div9);
    			append(div9, t9);
    			mount_component(sveltypicker3, div9, null);
    			append(div11, t10);
    			append(div11, div10);
    			append(div10, t11);
    			mount_component(sveltypicker4, div10, null);
    			append(div15, t12);
    			append(div15, div13);
    			append(div13, div12);
    			append(div12, button0);
    			append(button0, t13);
    			append(button0, t14);
    			append(div15, t15);
    			append(div15, hr);
    			append(div15, t16);
    			append(div15, div14);
    			insert(target, t17, anchor);
    			insert(target, div21, anchor);
    			append(div21, div20);
    			append(div20, div19);
    			append(div19, div16);
    			append(div19, t21);
    			append(div19, div17);
    			append(div17, p0);
    			append(div17, t23);
    			append(div17, p1);
    			append(div17, t24);
    			mount_component(sveltypicker5, div17, null);
    			append(div19, t25);
    			append(div19, div18);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const sveltypicker0_changes = {};

    			if (!updating_value && dirty & /*myProp*/ 1) {
    				updating_value = true;
    				sveltypicker0_changes.value = /*myProp*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			sveltypicker0.$set(sveltypicker0_changes);
    			if ((!current || dirty & /*modalProp*/ 2) && t14_value !== (t14_value = (/*modalProp*/ ctx[1] || "None yet") + "")) set_data(t14, t14_value);
    			const sveltypicker5_changes = {};

    			if (!updating_value_1 && dirty & /*modalProp*/ 2) {
    				updating_value_1 = true;
    				sveltypicker5_changes.value = /*modalProp*/ ctx[1];
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			sveltypicker5.$set(sveltypicker5_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(sveltypicker0.$$.fragment, local);
    			transition_in(sveltypicker1.$$.fragment, local);
    			transition_in(sveltypicker2.$$.fragment, local);
    			transition_in(sveltypicker3.$$.fragment, local);
    			transition_in(sveltypicker4.$$.fragment, local);
    			transition_in(sveltypicker5.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(sveltypicker0.$$.fragment, local);
    			transition_out(sveltypicker1.$$.fragment, local);
    			transition_out(sveltypicker2.$$.fragment, local);
    			transition_out(sveltypicker3.$$.fragment, local);
    			transition_out(sveltypicker4.$$.fragment, local);
    			transition_out(sveltypicker5.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div15);
    			destroy_component(sveltypicker0);
    			destroy_component(sveltypicker1);
    			destroy_component(sveltypicker2);
    			destroy_component(sveltypicker3);
    			destroy_component(sveltypicker4);
    			if (detaching) detach(t17);
    			if (detaching) detach(div21);
    			destroy_component(sveltypicker5);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let myProp = null;
    	let modalProp = null;

    	onMount(() => {
    		const requestURL = location.href === "http://localhost:5000/"
    		? "http://localhost:8000/README.md"
    		: "https://raw.githubusercontent.com/mskocik/simple-datepicker/master/README.md";

    		fetch(requestURL).then(resp => resp.text()).then(textResponse => {
    			document.getElementById("readme").innerHTML = marked.parse(textResponse);
    		});
    	});

    	function sveltypicker0_value_binding(value) {
    		myProp = value;
    		$$invalidate(0, myProp);
    	}

    	function sveltypicker5_value_binding(value) {
    		modalProp = value;
    		$$invalidate(1, modalProp);
    	}

    	const input_handler = () => document.querySelector("[data-dismiss]").click();

    	return [
    		myProp,
    		modalProp,
    		sveltypicker0_value_binding,
    		sveltypicker5_value_binding,
    		input_handler
    	];
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

}());
