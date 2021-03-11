/*! 
 *  Multiple select dropdown with filter jQuery plugin.
 *  Copyright (C) 2020  Andrew Wagner  github.com/andreww1011
 *
 *  This library is free software; you can redistribute it and/or
 *  modify it under the terms of the GNU Lesser General Public
 *  License as published by the Free Software Foundation; either
 *  version 2.1 of the License, or (at your option) any later version.
 * 
 *  This library is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 *  Lesser General Public License for more details.
 * 
 *  You should have received a copy of the GNU Lesser General Public
 *  License along with this library; if not, write to the Free Software
 *  Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301
 *  USA
 */
import $, { map } from 'jquery';

const NULL_OPTION = new class implements Option {
    public initialize(): void {}
    public select(): void {}
    public deselect(): void {}
    public enable(): void {}
    public disable(): void {}
    public isSelected(): boolean {return false;}
    public isDisabled(): boolean {return false;}
    public getListItem(): HTMLElement {return document.createElement('div');}
    public getSelectedItemBadge(): HTMLElement {return document.createElement('div');}
    public getLabel(): string {return 'NULL_OPTION'}
    public getValue(): string {return 'NULL_OPTION'}
    public show(): void {}
    public hide(): void {}
    public isHidden(): boolean {return false;}
    public focus(): void {}
}  

interface Option {
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

const DEBUG = false;

export default class FilterMultiSelect {

    private static SingleOption = class implements Option {
        protected div: HTMLDivElement;
        protected checkbox: HTMLInputElement;
        protected labelFor: HTMLLabelElement;
        protected closeButton: HTMLButtonElement;
        protected selectedItemBadge: HTMLSpanElement;
        protected fms: FilterMultiSelect;
    
        constructor(fms: FilterMultiSelect, row: number, name:string, label: string, value: string, checked: boolean, disabled: boolean) {
            this.fms = fms;
            this.div = document.createElement('div');
            this.checkbox = document.createElement('input');
            this.checkbox.type = 'checkbox';
            let id: string = name + '-' + row.toString();
            let nchbx: string = id + '-chbx';
            this.checkbox.id = nchbx;
            this.checkbox.name = name;
            this.checkbox.value = value;
            this.checkbox.checked = checked;
            this.checkbox.disabled = disabled;
            this.labelFor = document.createElement('label');
            this.labelFor.htmlFor = nchbx;
            this.labelFor.textContent = label;
            this.div.append(this.checkbox, this.labelFor);
            this.closeButton = document.createElement('button');
            this.closeButton.type = 'button';
            this.closeButton.innerHTML = '&times;';
            this.selectedItemBadge = document.createElement('span');
            this.selectedItemBadge.setAttribute('data-id',id);
            this.selectedItemBadge.textContent = label;
            this.selectedItemBadge.append(this.closeButton);
        }
    
        private log(m: string, e: Event):void {
            if (DEBUG) {
                console.log(e.timeStamp + " - " + m + ":" + e.type + ":" + e.target)
            }
        }
    
        public initialize(): void {
            this.div.className = 'dropdown-item custom-control';
            this.checkbox.className = 'custom-control-input custom-checkbox';
            this.labelFor.className = 'custom-control-label';
            this.selectedItemBadge.className = 'item';
            if (this.isSelected()) {
                this.selectNoDisabledCheck();
            }
            if (this.isDisabled()) {
                this.disableNoPermissionCheck();
            }
            this.checkbox.addEventListener('change', (e: Event) => {
                e.stopPropagation();
                if (this.isDisabled() || this.fms.isDisabled()) {
                    e.preventDefault();
                    return;
                }
                if (DEBUG) {
                    this.log('checkbox',e);
                }
                
                if (this.isSelected()) {
                    this.select();
                } else {
                    this.deselect();
                }
                let numShown = this.fms.showing.length;
                if (numShown === 1) {
                    this.fms.clearFilterAndRefocus();
                }
            }, true);
            this.checkbox.addEventListener('keyup', (e: KeyboardEvent) => {
                if (DEBUG) {
                    this.log('checkbox',e);
                }
                switch (e.key) {
                    case "Enter":
                        e.stopPropagation();
                        this.checkbox.dispatchEvent(new MouseEvent('click'));
                        break;
                    default:
                        break;
                }
            }, true)
            this.closeButton.addEventListener('click', (e: Event) => {
                e.stopPropagation();
                if (this.isDisabled() || this.fms.isDisabled()) return;
                if (DEBUG) {
                    this.log('closeButton',e);
                }
                this.deselect();
                if (!this.fms.isClosed()) {
                    this.fms.refocusFilter();
                }
            }, true);
            this.checkbox.tabIndex = -1;
            this.closeButton.tabIndex = -1;
        }
    
        public select(): void {
            if (this.isDisabled()) return;
            this.selectNoDisabledCheck();
        }

        private selectNoDisabledCheck(): void {
            this.checkbox.checked = true;
            this.fms.queueOption(this);
            this.fms.update();
        }
    
        public deselect(): void {
            if (this.isDisabled()) return;
            this.checkbox.checked = false;
            this.fms.unqueueOption(this);
            this.fms.update();
        }
    
        public enable(): void {
            if (!this.fms.isEnablingAndDisablingPermitted()) return;
            this.checkbox.disabled = false;
            this.selectedItemBadge.classList.remove('disabled');
            this.fms.update();
        }
    
        public disable(): void {
            if (!this.fms.isEnablingAndDisablingPermitted()) return;
            this.disableNoPermissionCheck();
        }

        private disableNoPermissionCheck(): void {
            this.checkbox.disabled = true;
            this.selectedItemBadge.classList.add('disabled');
            this.fms.update();
        }
    
        public isSelected(): boolean {
            return this.checkbox.checked;
        }
    
        public isDisabled(): boolean {
            return this.checkbox.disabled;
        }
    
        public getListItem(): HTMLElement {
            return this.div;
        }
    
        public getSelectedItemBadge(): HTMLElement {
            return this.selectedItemBadge;
        }
    
        public getLabel(): string {
            return this.labelFor.textContent;
        }
    
        public getValue(): string {
            return this.checkbox.value;
        }
    
        public show(): void {
            this.div.hidden = false;
        }
    
        public hide(): void {
            this.div.hidden = true;
        }
    
        public isHidden(): boolean {
            return this.div.hidden;
        }

        public focus(): void {
            this.labelFor.focus();
        }
    }

    private static createOptions(fms: FilterMultiSelect, name: string, htmlOptions: Array<HTMLOptionElement>, jsOptions: Array<[label:string, value:string, selected?:boolean, disabled?:boolean]>): Array<Option> {
        let htmloptions =  htmlOptions.map((o, i) => {
            FilterMultiSelect.checkValue(o.value, o.label);
            return new FilterMultiSelect.SingleOption(fms, i, name, o.label, o.value, o.defaultSelected, o.disabled);
        });
        let j = htmlOptions.length;
        let jsoptions = jsOptions.map((o, i) => {
            let label: string = o[0];
            let value: string = o[1];
            let selected: boolean = o[2];
            let disabled: boolean = o[3];
            FilterMultiSelect.checkValue(value, label);
            return new FilterMultiSelect.SingleOption(fms, j+i, name, label, value, selected, disabled);

        });
        let opts = htmloptions.concat(jsoptions);
        let counts: any = {};
        opts.forEach((o) => {
            let v: string = o.getValue();
            if (counts[v] === undefined) {
                counts[v] = 1;
            } else {
                throw new Error("Duplicate value: " + o.getValue() + " (" + o.getLabel() + ")");
            }
        });
        return opts;
    }

    private static checkValue(value:string, label:string):void {
        if (value === "") {
            throw new Error("Option " + label + " does not have an associated value.");
        }
    }

    private static createSelectAllOption(fms: FilterMultiSelect, name: string, label: string) {
        return new class extends FilterMultiSelect.SingleOption {
            constructor() {
                super(fms,-1,name,label,'',false,false); //magic number
                this.checkbox.indeterminate = false;
            }

            markSelectAll(): void {
                this.checkbox.checked = true;
                this.checkbox.indeterminate = false;
            }

            markSelectPartial(): void {
                this.checkbox.checked = false;
                this.checkbox.indeterminate = true;
            }

            markSelectAllNotDisabled(): void {
                this.checkbox.checked = true;
                this.checkbox.indeterminate = true;
            }

            markDeselect(): void {
                this.checkbox.checked = false;
                this.checkbox.indeterminate = false;
            }

            public select(): void {
                if (this.isDisabled()) return;
                this.fms.options.filter((o) => !o.isSelected())
                    .forEach((o) => o.select());
            }
        
            public deselect(): void {
                if (this.isDisabled()) return;
                this.fms.options.filter((o) => o.isSelected())
                    .forEach((o) => o.deselect());
            }

            public enable(): void {
                this.checkbox.disabled = false;
            }
        
            public disable(): void {
                this.checkbox.disabled = true;
            }
        } ();
    }

    private options: Array<Option>;
    private selectAllOption;
    private div: HTMLDivElement;
    private viewBar: HTMLDivElement;
    private placeholder: HTMLSpanElement;
    private selectedItems: HTMLSpanElement;
    private dropDown: HTMLDivElement;
    private filter: HTMLDivElement;
    private filterInput: HTMLInputElement;
    private clearButton: HTMLButtonElement;
    private items: HTMLDivElement;
    private caseSensitive: boolean;
    private disabled: boolean;
    private allowEnablingAndDisabling: boolean;
    private filterText: string;
    private showing: Array<number>;
    private focusable: Array<number>;
    private itemFocus: number;
    private name: string;

    constructor (selectTarget: JQuery<HTMLElement>, args: Args) {
        let t = selectTarget.get(0);
        if (!(t instanceof HTMLSelectElement)) {
            throw new Error("JQuery target must be a select element.");
        }
        let select: HTMLSelectElement = t;
        let multiple: boolean = select.multiple;
        if (!multiple) {
            throw new Error("Select element must have the \"multiple\" attribute.")
        }
        let name: string = select.name;
        if (!name) {
            throw new Error("Select element must have a name attribute.");
        }
        this.name = name;
        let array: Array<HTMLOptionElement> = selectTarget.find('option').toArray();
        this.options = FilterMultiSelect.createOptions(this, name, array, args.items);
        this.selectAllOption = FilterMultiSelect.createSelectAllOption(this, name, args.selectAllText);

        // filter box
        this.filterInput = document.createElement('input');
        this.filterInput.type = 'text';
        this.filterInput.placeholder = args.filterText;
        this.clearButton = document.createElement('button');
        this.clearButton.type = 'button';
        this.clearButton.innerHTML = '&times;';
        this.filter = document.createElement('div');
        this.filter.append(this.filterInput, this.clearButton);
        
        // items
        this.items = document.createElement('div');
        this.items.append(this.selectAllOption.getListItem());
        this.options.forEach((o: Option) => this.items.append(o.getListItem()));

        // dropdown list
        this.dropDown = document.createElement('div');
        this.dropDown.append(this.filter, this.items);

        // placeholder
        this.placeholder = document.createElement('span');
        this.placeholder.textContent = args.placeholderText;
        this.selectedItems = document.createElement('span');
        
        // viewbar
        this.viewBar = document.createElement('div');
        this.viewBar.append(this.placeholder, this.selectedItems);

        this.div = document.createElement('div');
        this.div.id = select.id;
        this.div.append(this.viewBar, this.dropDown);

        this.caseSensitive = args.caseSensitive;
        this.disabled = select.disabled;
        this.allowEnablingAndDisabling = args.allowEnablingAndDisabling;
        this.filterText = '';
        this.showing = new Array<number>();
        this.focusable = new Array<number>();
        this.itemFocus = -2; //magic number

        this.initialize();
    }

    private initialize(): void {
        this.options.forEach(o => o.initialize());
        this.selectAllOption.initialize();
        
        this.filterInput.className = 'form-control';
        this.clearButton.tabIndex = -1;

        this.filter.className = 'filter dropdown-item'
        this.items.className = 'items dropdown-item';
        this.dropDown.className = 'dropdown-menu';

        this.placeholder.className = 'placeholder';
        this.selectedItems.className = 'selected-items';
        this.viewBar.className = 'viewbar form-control dropdown-toggle';

        this.div.className = 'filter-multi-select dropdown';

        if (this.isDisabled()) {
            this.disableNoPermissionCheck();
        }

        this.attachDropdownListeners();
        this.attachViewbarListeners();
        this.closeDropdown();
    }

    private log(m: string, e: Event):void {
        if (DEBUG) {
            console.log(e.timeStamp + " - " + m + ":" + e.type + ":" + e.target);
        }
    }

    private attachDropdownListeners(): void {
        this.filterInput.addEventListener('keyup',(e: KeyboardEvent) => {
            if (DEBUG) {
                this.log('filterInput',e);
            }
            e.stopImmediatePropagation();
            this.updateDropdownList();
            let numShown = this.showing.length;
            switch(e.key) {
                case "Enter":
                    if (numShown === 1) {
                        let o: Option = this.options[this.showing[0]]; //magic number
                        if (!o.isDisabled()) {
                            if (o.isSelected()) {
                                o.deselect();
                            } else {
                                o.select();
                            }
                            this.clearFilterAndRefocus();
                        }
                    }
                    break;
                case "Escape":
                    if (this.filterText.length > 0) {
                        this.clearFilterAndRefocus();
                    } else {
                        this.closeDropdown();
                    }
                    break;
                default:
                    break;
            }   
        }, true);
        this.clearButton.addEventListener('click', (e: MouseEvent) => {
            if (DEBUG) {
                this.log('clearButton',e);
            }
            e.stopImmediatePropagation();
            let text = this.filterInput.value;
            if (text.length > 0) {
                this.clearFilterAndRefocus();
            } else {
                this.closeDropdown();
            }
        }, true);
    }

    private updateDropdownList(): void {
        let text = this.filterInput.value;
        if (text.length > 0) {
            this.selectAllOption.hide();
        } else {
            this.selectAllOption.show();
        }
        let showing = new Array<number>();
        let focusable = new Array<number>();
        if (this.caseSensitive) {
            this.options.forEach((o: Option, i: number) => {
                if (o.getLabel().indexOf(text) !== -1) { //magic number
                    o.show();
                    showing.push(i);
                    if (!o.isDisabled()) {
                        focusable.push(i);
                    }
                } else {
                    o.hide();
                }
            });
        } else {
            this.options.forEach((o: Option, i: number) => {
                if (o.getLabel().toLowerCase().indexOf(text.toLowerCase()) !== -1 ) { //magic number 
                    o.show();
                    showing.push(i);
                    if (!o.isDisabled()) {
                        focusable.push(i);
                    }
                } else {
                    o.hide();
                }
            });
        }
        this.filterText = text;
        this.showing = showing;
        this.focusable = focusable;
    }

    private clearFilterAndRefocus(): void {
        if (DEBUG) {
            console.log('clear filter');
        }
        this.filterInput.value = '';
        this.updateDropdownList();
        this.refocusFilter();
    }

    private refocusFilter() {
        if (DEBUG) {
            console.log('refocus filter');
        }
        this.filterInput.focus();
        this.itemFocus = -2; //magic number
    }

    private attachViewbarListeners(): void {
        this.viewBar.addEventListener('click',(e) => {
            if (DEBUG) {
                this.log('viewBar',e);
            }
            if (this.isClosed()) {
                this.openDropdown();
            } else {
                this.closeDropdown();
            }
        });
    }

    public isClosed(): boolean {
        return !this.dropDown.classList.contains('show');
    }

    private setTabIndex(): void {
        if (this.isDisabled()) {
            this.div.tabIndex = -1;
        } else {
            if (this.isClosed()) {
                this.div.tabIndex = 0;
            } else {
                this.div.tabIndex = -1;
            }
        }
    }

    private closeDropdown(): void {
        if (DEBUG) {
            console.log('close');
        }
        document.removeEventListener('keydown', this.documentKeydownListener, true);
        document.removeEventListener('click', this.documentClickListener, true);
        this.dropDown.classList.remove('show');
        setTimeout(() => {
            this.setTabIndex();    
        }, 100); //magic number
        this.div.addEventListener('mousedown', this.fmsMousedownListener, true);
        this.div.addEventListener('focus', this.fmsFocusListener);
    }

    private documentKeydownListener = (e: KeyboardEvent) => {
        if (DEBUG) {
            this.log('document',e);
            console.log(e.key);
        }
        switch(e.key) {
            case "Tab":
                e.stopPropagation();
                this.closeDropdown();
                break;
            case "ArrowUp":
                e.stopPropagation();
                e.preventDefault();
                if (DEBUG) {
                    console.log("up");
                }
                this.decrementItemFocus();
                this.focusItem();
                break;
            case "ArrowDown":
                e.stopPropagation();
                e.preventDefault();
                if (DEBUG) {
                    console.log("down");
                }
                this.incrementItemFocus();
                this.focusItem();
                break;
            case "Enter":
            case "Spacebar":
            case " ":
                //swallow to allow checkbox change to work
                break;
            default:
                //send key to filter
                this.refocusFilter();
                break;
        }
    };

    private incrementItemFocus(): void {
        if (this.itemFocus >= this.focusable.length - 1 || this.focusable.length == 0) return;
        this.itemFocus++;
        if (this.itemFocus == -1 && this.selectAllOption.isHidden()) { //magic number
            this.itemFocus++;
        }
    }

    private decrementItemFocus(): void {
        if (this.itemFocus <= -2) return; //magic number
        this.itemFocus--;
        if (this.itemFocus == -1 && this.selectAllOption.isHidden()) { //magic number
            this.itemFocus--;
        }
    }

    private focusItem(): void {
        if (this.itemFocus === -2) {
            this.refocusFilter();
        } else if (this.itemFocus === -1) {
            this.selectAllOption.focus();
        } else {
            this.options[this.focusable[this.itemFocus]].focus();
        }
    }

    private documentClickListener = (e: MouseEvent) => {
        if (DEBUG) {
            this.log('document',e);
        }
        if (this.div !== e.target && !this.div.contains(<Node>e.target)) {
            this.closeDropdown();
        }
    };

    private fmsFocusListener: EventListener = (e: FocusEvent) => {
        if (DEBUG) {
            this.log('div',e);
        }
        e.stopPropagation();
        e.preventDefault();
        this.viewBar.dispatchEvent(new MouseEvent('click'));
    };

    private fmsMousedownListener: EventListener = (e: MouseEvent) => {
        if (DEBUG) {
            this.log('div',e);
        }
        e.stopPropagation();
        e.preventDefault();
    }

    private openDropdown() {
        if (this.disabled) return;
        if (DEBUG) {
            console.log('open');
        }
        this.div.removeEventListener('mousedown', this.fmsMousedownListener, true);
        this.div.removeEventListener('focus', this.fmsFocusListener);
        this.dropDown.classList.add('show');
        this.setTabIndex();
        this.clearFilterAndRefocus();
        document.addEventListener('keydown', this.documentKeydownListener, true);
        document.addEventListener('click', this.documentClickListener, true);
    }

    private queueOption(option: Option): void {
        if (this.options.indexOf(option) == -1) return;
        $(this.selectedItems).append(option.getSelectedItemBadge());
    }

    private unqueueOption(option: Option): void {
        if (this.options.indexOf(option) == -1) return;
        $(this.selectedItems).children('[data-id="' + option.getSelectedItemBadge().getAttribute('data-id') + '"]').remove();
    }

    private update(): void {
        if (this.areAllSelected()) {
            this.selectAllOption.markSelectAll();
            this.placeholder.hidden = true;
        } else if (this.areSomeSelected()) {
            if (this.areOnlyDeselectedAlsoDisabled()) {
                this.selectAllOption.markSelectAllNotDisabled();
                this.placeholder.hidden = true;
            } else {
                this.selectAllOption.markSelectPartial();
                this.placeholder.hidden = true;
            }
        } else {
            this.selectAllOption.markDeselect();
            this.placeholder.hidden = false;
        }
        if (this.areAllDisabled()) {
            this.selectAllOption.disable();
        } else {
            this.selectAllOption.enable();
        }
    }

    private areAllSelected(): boolean {
        return this.options
                .map((o) => o.isSelected())
                .reduce((acc,cur) => acc && cur, true);
    }

    private areSomeSelected(): boolean {
        return this.options
                .map((o) => o.isSelected())
                .reduce((acc,cur) => acc || cur, false);
    }

    private areOnlyDeselectedAlsoDisabled(): boolean {
        return this.options
                .filter((o) => !o.isSelected())
                .map((o) => o.isDisabled())
                .reduce((acc,cur) => acc && cur, true);
    }

    private areAllDisabled(): boolean {
        return this.options
                .map((o) => o.isDisabled())
                .reduce((acc,cur) => acc && cur, true);
    }

    private isEnablingAndDisablingPermitted(): boolean {
        return this.allowEnablingAndDisabling;
    }

    public getRootElement(): HTMLElement {
        return this.div;
    }

    public hasOption(value: string): boolean {
        return this.getOption(value) !== NULL_OPTION;
    }

    private getOption(value: string): Option {
        for (const o of this.options) {
            if (o.getValue() == value) {
                return o;
            }
        }
        return NULL_OPTION;
    }

    public selectOption(value: string): void {
        this.getOption(value).select();
    }

    public deselectOption(value: string): void {
        this.getOption(value).deselect();
    }

    public isOptionSelected(value: string): boolean {
        return this.getOption(value).isSelected();
    }

    public enableOption(value: string): void {
        this.getOption(value).enable();
    }

    public disableOption(value: string): void {
        this.getOption(value).disable();
    }

    public isOptionDisabled(value: string): boolean {
        return this.getOption(value).isDisabled();
    }

    public disable(): void {
        if (!this.isEnablingAndDisablingPermitted()) return;
        this.disableNoPermissionCheck();
    }

    private disableNoPermissionCheck(): void {
        this.options.forEach((o) => this.setBadgeDisabled(o));
        this.disabled = true;
        this.div.classList.add('disabled');
        this.viewBar.classList.remove('dropdown-toggle');
        this.closeDropdown();
    }

    private setBadgeDisabled(o: Option):void {
        o.getSelectedItemBadge().classList.add('disabled');
    }

    public enable(): void {
        if (!this.isEnablingAndDisablingPermitted()) return;
        this.options.forEach((o) => {
            if (!o.isDisabled()) {
                this.setBadgeEnabled(o);
            }
        });
        this.disabled = false;
        this.div.classList.remove('disabled');
        this.setTabIndex(); 
        this.viewBar.classList.add('dropdown-toggle');
    }

    private setBadgeEnabled(o: Option):void {
        o.getSelectedItemBadge().classList.remove('disabled');
    }

    public isDisabled(): boolean {
        return this.disabled;
    }

    public selectAll(): void {
        this.selectAllOption.select();
    }

    public deselectAll(): void {
        this.selectAllOption.deselect();
    }

    private getSelectedOptions(includeDisabled = true): Array<Option> {
        let a = this.options;
        if (!includeDisabled) {
            if (this.isDisabled()) {
                return new Array();
            }
            a = a.filter((o) => !o.isDisabled());
        }
        a = a.filter((o) => o.isSelected());
        return a;
    }

    public getSelectedOptionsAsJson(includeDisabled = true): string {
        const data: any = {};
        let a: Array<string> = this.getSelectedOptions(includeDisabled).map((o) => o.getValue());
        data[this.getName()] = a;
        let c = JSON.stringify(data, null, "  ");
        if (DEBUG) {
            console.log(c);
        }
        return c;
    }

    public getName(): string {
        return this.name;
    }
}