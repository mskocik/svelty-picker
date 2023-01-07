v4.0
====

- [breaking] `format` and `formatType` now controls only visual representation of selected date time. Value format defaults to `yyyy-mm-dd` 
- [breaking] removed `positionFn` property
- [breaking] method to register component as custom element has changed from `registerElement` to `registerSveltyPicker`. Also arguments has changed
- [feat] add `valueFormat` and `valueFormatType` properties to separately control real value and visuals (property `format`)