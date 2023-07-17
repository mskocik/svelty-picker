v4.0
====

- [feat] add `displayFormat` and `displayFormatType` properties to separately control visuals representation and real value (properties `format`, `formatType`)
- [feat] timepicker - trigger `change` event only on click, not on mousemove
- [feat] date-range picker - can be enabled by setting `isRange` property
- [feat] slot[name="action-row"] added
- [feat] add prop `disabledDatesFn` to disable dates. `{function(Date): boolean}`
- [breaking] removed `positionFn` property
- [breaking] removed `clearToggle` property (now this functionality - ability to clear the value is controlled by `required` property)
- [breaking] method to register component as custom element has changed from `registerElement` to `registerSveltyPicker`. Also arguments has changed
- [breaking] completely rewritten event system due collisions with date-range picker, meaning `change` event is dispatched when expected based on `mode`
- [breaking] removed `getLastPickerPhase` accessor due to rewritten event system
- [breaking] removed `getLastPickerPhase` accessor due to rewritten event system

- [fix] keyboard navigation when `minuteIncrement` is not 1 (#72)
- [fix] set hour only on mouse release (#58)
- [fix] prevent dispatching `change` event repeatedly (#57)