v4.0
====

- [feat] add `valueFormat` and `valueFormatType` properties to separately control real value and visuals (property `format`)
- [breaking] `format` and `formatType` now controls only visual representation of selected date time. Value format defaults to `yyyy-mm-dd` 
- [breaking] removed `positionFn` property
- [breaking] removed `clearToggle` property (now this functionality - ability to clear the value is controlled by `required` property)
- [breaking] method to register component as custom element has changed from `registerElement` to `registerSveltyPicker`. Also arguments has changed