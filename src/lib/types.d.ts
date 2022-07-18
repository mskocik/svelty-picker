declare global {
    export type i18nType = {
        days: string[],
        daysShort: string[],
        daysMin: string[],
        months: string[],
        monthsShort: string[],
        meridiem: string[],
        suffix: string[],
        todayBtn: string,
        clearBtn: string,
        timeView: string,
        backToDate: string
    }

    export type datasetType = {
        grid: any[][],
        days: Date[][],
        months: string[][],
        years: number[][],
        selectionMark: number,
        todayMark: number,
        prevTo: number,
        nextFrom: number
    }

    interface TimeClickEvent extends MouseEvent {
        type: string,
        target: {
            tagName: string,
            dataset: {
                value: string
            }
        },
        meridianSwitch?: boolean
    }

    export type GridPosition = {
        x: number,
        y: number
    }
}

export default {}

