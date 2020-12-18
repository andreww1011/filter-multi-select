import FilterMultiSelect from "./FilterMultiSelect";

export default interface Option {
    initialize(): void;
    select(): void;
    deselect(): void;
    enable(): void;
    disable(): void;
    isSelected(): boolean;
    isDisabled(): boolean;
    getListItem(): HTMLElement;
    getSelectedItemBadge(): HTMLElement;
    getLabel(): string;
    getValue(): string;
    show(): void;
    hide(): void;
    isHidden(): boolean;
    focus(): void;
}
