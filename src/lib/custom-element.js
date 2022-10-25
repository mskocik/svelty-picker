// @ts-nocheck
import SveltyPicker, { config } from "./components/SveltyPicker.svelte";

const OPTION_LIST = [
  'value', 'name', 'placeholder', 'start-date', 'end-date', 'disabled', 'input-classes',
  'mode', 'format', 'format-type', 'week-start', 'today-btn', 'clear-btn', 'autoclose', 'required'
];

function formatValue(name, value) {
  switch (name) {
    case 'value':
      return value || '';
    case 'required':
    case 'disabled':
    case 'today-btn':
    case 'clear-btn':
    case 'autoclose':
      return value !== null && value !== 'false';
    case 'weekStart':
      return parseInt(value);
  }
  return value;
}

function formatProp(name) {
  if (name.includes('-')) return name.split('-').reduce((res, w, i) => {
    if (i) w = w[0].toUpperCase() + w.substr(1);
    return res+w;
  }, '');
  return name;
}

class PickerElement extends HTMLInputElement {
  constructor() {
    super();
    this.picker = null;

    const simpleProps = [
      // 'value',
      'name', 'placeholder', 'mode', 'format'
    ].reduce((res, name) => {
      res[name] = {
        get() {
          return formatValue(name, this.getAttribute(name))
        },
        set(val) {
          this.setAttribute(name, val)
        }
      }
      return res;
    }, {});
    const baseProps = {
      'form': {
        get() {
          return this.closest('form');
        }
      },
      'weekStart': {
        get() {
          return this.getAttribute('week-start');
        },
        set(val) {
          this.setAttribute('week-start', val);
        }
      },
      'startDate': {
        get() {
          return this.getAttribute('start-date');
        },
        set(val) {
          if (val) this.setAttribute('start-date', val);
          !val && this.removeAttribute('start-date');
        }
      },
      'endDate': {
        get() {
          return this.getAttribute('end-date');
        },
        set(val) {
          val && this.setAttribute('end-date', val);
          !val && this.removeAttribute('end-date');
        }
      },
      'inputClasses': {
        get() {
          return this.getAttribute('input-classes')
        },
        set(val) {
          val && this.setAttribute('input-classes', val)
          !val && this.removeAttribute('input-classes');
        }
      },
      'formatType': {
        get() {
          return this.getAttribute('format-type');
        },
        set(val) {
          val && ['standard', 'php'].includes(val) && this.setAttribute('format-type', val);
          !val && this.removeAttribute('format-type');
        }
      }
    }
    const boolProps = ['required', 'disabled', 'today-btn', 'clear-btn','autoclose']
      .reduce((res, propName) => {
        const formatted = formatProp(propName);
        res[formatted] = {
          get() {
            const hasProp = this.hasAttribute(propName);
            const notFalse = hasProp ? this.getAttribute(propName) !== 'false' : true;
            return !hasProp ? config[formatted] : notFalse;
          },
          set(value) {
            if (!value) {
              if (this.hasAttribute(propName)) {
                this.removeAttribute(propName);
              } else {
                // set directly to false, when config default is true
                this.picker.$set({ [formatted]: value });
              }
            } else {
              this.setAttribute(propName, value = true ? '' : value);
            }
          }
        }
        return res;
      }, {});
    Object.defineProperties(this, Object.assign({}, simpleProps, baseProps, boolProps));
  }

  focus() {
    if (this.disabled) return;
    const input = this.querySelector('input');
    input && input.focus();
  }

  static get observedAttributes() {
    return OPTION_LIST;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (this.picker && oldValue !== newValue) {
      this.picker.$set({ [formatProp(name)]: formatValue(name, newValue) });
      if (name === 'value') this.value = newValue;
    }
  } 

  connectedCallback() {
    if (this.picker) return;
    let props = {
      inputElement: this,
      value: this.value
    };
    for (const attr of OPTION_LIST) {
      if (this.hasAttribute(attr)) {
        props[formatProp(attr)] = formatValue(attr, this.getAttribute(attr));
      }
    }
    this.picker = new SveltyPicker({
      target: this.parentElement,
      props: props
    });
    this.picker.$on('input', e => {
      this.setAttribute('value', e.target.value);
      this.dispatchEvent(new Event('input'));
    });
    this.picker.$on('blur', e => {
      this.dispatchEvent(new Event('blur'));
    });

    // bind from/to
    setTimeout(() => {
      if (this.hasAttribute('from')) {
        const el = document.getElementById(this.getAttribute('from'));
        el.oninput = e => {
          this.picker.$set({ startDate: el.value });
        }
      }
      if (this.hasAttribute('to')) {
        const el = document.getElementById(this.getAttribute('to'));
        el.oninput = e => {
          this.picker.$set({ endDate: el.value });
        }
      }
    });
  }

  disconnectedCallback() {
    this.picker && this.picker.$destroy();
  }
}

/**
 * Define custom element
 * 
 * @param {string} name name of custom element
 */
export function registerElement(name) {
  window.customElements.define(name, PickerElement, { extends: 'input' });
}