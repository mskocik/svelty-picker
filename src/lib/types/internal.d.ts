export type UpdateProp = {
    type: 'date' | 'datetime' | 'hour' | 'minute',
    date: Date,
    isKeyboard: boolean,
    dateIndex?: number
}
