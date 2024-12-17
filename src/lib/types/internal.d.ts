export type UpdateProp = {
    type: 'date' | 'datetime' | 'hour' | 'minute',
    date: Date,
    isKeyboard: boolean,
    dateIndex?: number
}

export type DateChange = {
    value: string|string[]|null,
    dateValue: Date|Date[]|null,
    displayValue: string,
    valueFormat: string,
    displayFormat: string | null,
    event: 'date'|'hour'|'minute'|'datetime'
}
