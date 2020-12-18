interface Args {
    placeholderText: string,
    filterText: string,
    selectAllText: string,
    caseSensitive: boolean,
    allowEnablingAndDisabling: boolean,
    items: Array<[label: string, value: string, selected?: boolean, disabled?: boolean]>,
}

