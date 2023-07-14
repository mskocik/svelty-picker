v4.0
====

- [feat] add `displayFormat` and `displayFormatType` properties to separately control visuals representation and real value (properties `format`, `formatType`)
- [feat] timepicker - trigger `change` event only on click, not on mousemove
- [breaking] removed `positionFn` property
- [breaking] removed `clearToggle` property (now this functionality - ability to clear the value is controlled by `required` property)
- [breaking] method to register component as custom element has changed from `registerElement` to `registerSveltyPicker`. Also arguments has changed

- [fix] keyboard navigation when `minuteIncrement` is not 1 (#72)
- [fix] set hour only on mouse release (#58)
- [fix] prevent dispatching `change` event repeatedly (#57)