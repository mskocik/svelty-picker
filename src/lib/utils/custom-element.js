// @ts-nocheck

const OPTION_LIST = [
  'value', 'name', 'placeholder', 'start-date', 'end-date', 'disabled', 'input-classes',
  'mode', 'format', 'format-type', 'display-format', 'display-format-type', 'week-start', 'today-btn', 'clear-btn', 'autoclose', 'required'
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

let _component;
let _config;

class PickerElement extends HTMLElement {
  constructor() {
    super();
    this.picker = null;
    this.valueElement = null;
    this.displayElement = null;

    const simpleProps = [
      'value',
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
      },
      'displayFormat': {
        get() {
          return this.getAttribute('display-format');
        },
        set(val) {
          val && this.setAttribute('display-format', val);
          !val && this.removeAttribute('display-format');
        }
      },
      'displayFormatType': {
        get() {
          return this.getAttribute('display-format-type');
        },
        set(val) {
          val && ['standard', 'php'].includes(val) && this.setAttribute('display-format-type', val);
          !val && this.removeAttribute('display-format-type');
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
            return !hasProp ? _config[formatted] : notFalse;
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
    const input = this.querySelector('input[type="text"]');
    input && input.focus();
  }

  static get observedAttributes() {
    return OPTION_LIST;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (this.picker && oldValue !== newValue) {
      this.picker.$set({ [formatProp(name)]: formatValue(name, newValue) });
    }
  }

  connectedCallback() {
    setTimeout(() => this.init());
  }

  init() {
    if (this.picker) return;
    const props = {};
    for (const attr of OPTION_LIST) {
      if (this.hasAttribute(attr)) {
        props[formatProp(attr)] = formatValue(attr, this.getAttribute(attr));
      }
    }
    // resolve existing elements
    this.valueElement = this.querySelector('input[type="hidden"]');
    this.displayElement = this.querySelector('input[type="text"]');
    if (this.valueElement) props.ce_valueElement = this.valueElement;
    if (this.displayElement) props.ce_displayElement = this.displayElement;

    this.picker = new _component({
      target: this,
      props: props
    });
    this.picker.$on('input', e => {
      this.setAttribute('value', e.detail || '');
      this.dispatchEvent(new Event('input'));
    });
    this.picker.$on('blur', e => {
      this.dispatchEvent(new Event('blur'));
    });
    // bind from/to
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
  }

  disconnectedCallback() {
    this.picker && this.picker.$destroy();
  }
}

/**
 * Define custom element
 *
 * @param {string} name name of custom element
 * @param {object} component `SveltyPicker` component
 * @param {config} globalConfig globally available config
 */
export function registerSveltyPicker(name, component, globalConfig) {
  _component = component;
  _config = globalConfig;
  window.customElements.define(name, PickerElement);
}
