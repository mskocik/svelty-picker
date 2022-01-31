import type {Settings} from '$lib/types'
import { en } from './i18n';

const settings: Settings = {
  theme: 'sdt-calendar-colors',
  mode: 'auto',
  format: 'yyyy-mm-dd',
  formatType: 'standard',
  weekStart: 1,
  visible: false,
  inputClasses: null,
  todayBtnClasses: 'sdt-action-btn sdt-today-btn',
  clearBtnClasses: 'sdt-action-btn sdt-clear-btn',
  todayBtn: true,
  clearBtn: true,
  autoclose: true,
  i18n: en,
};

export default settings