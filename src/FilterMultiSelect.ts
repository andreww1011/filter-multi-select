/*! 
 *  Multiple select dropdown with filter jQuery plugin.
 *  Copyright (C) 2022  Andrew Wagner  github.com/andreww1011
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
    initialize(): void {}
    select(): void {}
    deselect(): void {}
    enable(): void {}
    disable(): void {}
    isSelected(): boolean {return false;}
    isDisabled(): boolean {return true;}
    getListItem(): HTMLElement {return document.createElement('div');}
    getSelectedItemBadge(): HTMLElement {return document.createElement('div');}
    getLabel(): string {return 'NULL_OPTION'}
    getValue(): string {return 'NULL_OPTION'}
    show(): void {}
    hide(): void {}
    isHidden(): boolean {return true;}
    focus(): void {}
    activate(): void {}
    deactivate(): void {}
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
    activate(): void;
    deactivate(): void;
}

interface SelectAllOption extends Option {
    markSelectAll(): void;
    markSelectPartial(): void;
    markSelectAllNotDisabled(): void;
    markDeselect(): void;
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
        protected active: boolean;
        protected disabled: boolean;
        private initiallyChecked: boolean;
    
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
            this.initiallyChecked = checked;
            this.checkbox.checked = false;
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
            this.disabled = disabled;
            this.active = true;
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
            if (this.initiallyChecked) {
                this.selectNoDisabledCheck();
            }
            if (this.disabled) {
                this.setDisabledViewState();
            }
            this.fms.update();
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
            this.fms.update();
        }

        private selectNoDisabledCheck(): void {
            if (!this.fms.canSelect() || !this.isActive()) return;
            this.checkbox.checked = true;
            this.fms.queueOption(this);
            this.fms.dispatchSelectedEvent(this);
        }
    
        public deselect(): void {
            if (this.isDisabled()) return;
            this.checkbox.checked = false;
            this.fms.unqueueOption(this);
            this.fms.dispatchDeselectedEvent(this);
            this.fms.update();
        }
    
        public enable(): void {
            this.disabled = false;
            this.setEnabledViewState();
            this.fms.update();
        }

        private setEnabledViewState(): void {
            this.checkbox.disabled = false;
            this.selectedItemBadge.classList.remove('disabled');
        }
    
        public disable(): void {
            this.disabled = true;
            this.setDisabledViewState();
            this.fms.update();
        }

        private setDisabledViewState(): void {
            this.checkbox.disabled = true;
            this.selectedItemBadge.classList.add('disabled');
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

        isActive(): boolean {
            return this.active;
        }

        public activate(): void {
            this.active = true;
            if (!this.disabled) {
                this.setEnabledViewState();
            }
        }

        public deactivate(): void {
            this.active = false;
            this.setDisabledViewState();
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

    private static UnrestrictedSelectAllOption = class extends FilterMultiSelect.SingleOption implements SelectAllOption {
        constructor(fms: FilterMultiSelect, name: string, label: string) {
            super(fms,-1,name,label,'',false,false); //magic number
            this.checkbox.indeterminate = false;
        }

        public markSelectAll(): void {
            this.checkbox.checked = true;
            this.checkbox.indeterminate = false;
        }

        public markSelectPartial(): void {
            this.checkbox.checked = false;
            this.checkbox.indeterminate = true;
        }

        public markSelectAllNotDisabled(): void {
            this.checkbox.checked = true;
            this.checkbox.indeterminate = true;
        }

        public markDeselect(): void {
            this.checkbox.checked = false;
            this.checkbox.indeterminate = false;
        }

        public select(): void {
            if (this.isDisabled()) return;
            this.fms.options.filter((o) => !o.isSelected())
                .forEach((o) => o.select());
            this.fms.update();
        }
    
        public deselect(): void {
            if (this.isDisabled()) return;
            this.fms.options.filter((o) => o.isSelected())
                .forEach((o) => o.deselect());
            this.fms.update();
        }

        public enable(): void {
            this.disabled = false;
            this.checkbox.disabled = false;
        }
    
        public disable(): void {
            this.disabled = true;
            this.checkbox.disabled = true;
        }
    }

    private static RestrictedSelectAllOption = class implements SelectAllOption {
        private usao: SelectAllOption;
        
        constructor(fms: FilterMultiSelect, name: string, label: string) {
            this.usao = new FilterMultiSelect.UnrestrictedSelectAllOption(fms,name,label);
        }
        
        initialize(): void {this.usao.initialize();}
        select(): void {}
        deselect(): void {this.usao.deselect();}
        enable(): void {}
        disable(): void {}
        isSelected(): boolean {return false;}
        isDisabled(): boolean {return true;}
        getListItem(): HTMLElement {return document.createElement('div');}
        getSelectedItemBadge(): HTMLElement {return document.createElement('div');}
        getLabel(): string {return 'RESTRICTED_SELECT_ALL_OPTION'}
        getValue(): string {return 'RESTRICTED_SELECT_ALL_OPTION'}
        show(): void {}
        hide(): void {}
        isHidden(): boolean {return true;}
        focus(): void {}
        markSelectAll(): void {}
        markSelectPartial(): void {}
        markSelectAllNotDisabled(): void {}
        markDeselect(): void {}
        activate(): void {}
        deactivate(): void {}
    }

    public static EventType = {
        SELECTED: "optionselected",
        DESELECTED: "optiondeselected",
    } as const;

    private static createEvent(e: string, n: string, v: string, l: string): CustomEvent {
        const event = new CustomEvent(e, {
            detail: {
                name: n,
                value: v,
                label: l
            },
            bubbles: true,
            cancelable: true,
            composed: false,
        });
        return event;
    }

    private options: Array<Option>;
    private selectAllOption: SelectAllOption;
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
    private itemFocus: number;
    private name: string;
    private label: HTMLSpanElement;
    private maxNumSelectedItems: number;
    private numSelectedItems: number;
    private selectionCounter: HTMLSpanElement;

    constructor (selectTarget: JQuery<HTMLElement>, args: Args) {        
        let t = selectTarget.get(0);
        if (!(t instanceof HTMLSelectElement)) {
            throw new Error("JQuery target must be a select element.");
        }
        let select: HTMLSelectElement = t;
        let name: string = select.name;
        if (!name) {
            throw new Error("Select element must have a name attribute.");
        }
        this.name = name;
        let array: Array<HTMLOptionElement> = selectTarget.find('option').toArray();
        this.options = FilterMultiSelect.createOptions(this, name, array, args.items);

        // restrict selection
        this.numSelectedItems = 0;
        this.maxNumSelectedItems =  !select.multiple ? 1 : 
                                    args.selectionLimit > 0 ? args.selectionLimit :
                                    parseInt(select.getAttribute('multiple')) > 0 ? parseInt(select.getAttribute('multiple')) :
                                    0; //magic number 
        const numOptions: number = this.options.length;
        const restrictSelection: boolean = this.maxNumSelectedItems > 0 && this.maxNumSelectedItems < numOptions;
        this.maxNumSelectedItems = restrictSelection ? this.maxNumSelectedItems : numOptions + 1;  //magic number
        this.selectAllOption = restrictSelection ? 
                new FilterMultiSelect.RestrictedSelectAllOption(this, name, args.selectAllText) : 
                new FilterMultiSelect.UnrestrictedSelectAllOption(this, name, args.selectAllText);

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

        // label
        this.label = document.createElement('span');
        this.label.textContent = args.labelText;
        let customLabel: boolean = args.labelText.length != 0;
        if (!customLabel) {
            this.label.hidden = true;
        }

        // selection counter
        this.selectionCounter = document.createElement('span');
        this.selectionCounter.hidden = !restrictSelection;

        // viewbar
        this.viewBar = document.createElement('div');
        this.viewBar.append(this.label, this.selectionCounter, this.placeholder, this.selectedItems);

        this.div = document.createElement('div');
        this.div.id = select.id;
        this.div.append(this.viewBar, this.dropDown);

        this.caseSensitive = args.caseSensitive;
        this.disabled = select.disabled;
        this.allowEnablingAndDisabling = args.allowEnablingAndDisabling;
        this.filterText = '';
        this.showing = new Array<number>();
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
        this.label.className = 'col-form-label mr-2 text-dark';
        this.selectionCounter.className = 'mr-2';

        this.div.className = 'filter-multi-select dropdown';
        if (this.maxNumSelectedItems > 1) {
            let v: string = this.maxNumSelectedItems >= this.options.length ? "" : this.maxNumSelectedItems.toString();
            this.div.setAttribute('multiple',v);
        } else {
            this.div.setAttribute('single',"");
        }

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
        if (this.caseSensitive) {
            this.options.forEach((o: Option, i: number) => {
                if (o.getLabel().indexOf(text) !== -1) { //magic number
                    o.show();
                    showing.push(i);
                } else {
                    o.hide();
                }
            });
        } else {
            this.options.forEach((o: Option, i: number) => {
                if (o.getLabel().toLowerCase().indexOf(text.toLowerCase()) !== -1 ) { //magic number 
                    o.show();
                    showing.push(i);
                } else {
                    o.hide();
                }
            });
        }
        this.filterText = text;
        this.showing = showing;
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
        if (this.itemFocus >= this.options.length - 1) return; 
        let i = this.itemFocus;
        do {
            i++;
        } while ((i == -1 && (this.selectAllOption.isDisabled() || this.selectAllOption.isHidden())) || //magic number
            (i >= 0 && i < this.options.length && (this.options[i].isDisabled() || this.options[i].isHidden())));
        this.itemFocus = i > this.options.length - 1 ? this.itemFocus : i;
        if (DEBUG) {
            console.log("item focus: "+ this.itemFocus);
        }
    }

    private decrementItemFocus(): void {
        if (this.itemFocus <= -2) return; //magic number
        let i = this.itemFocus;
        do {
            i--;
            
        } while ((i == -1 && (this.selectAllOption.isDisabled() || this.selectAllOption.isHidden())) ||
            (i >= 0 && (this.options[i].isDisabled() || this.options[i].isHidden())) &&
            i > -2); //magic number
        this.itemFocus = i; 
        if (DEBUG) {
            console.log("item focus: "+ this.itemFocus);
        }
    }

    private focusItem(): void {
        if (this.itemFocus === -2) {
            this.refocusFilter();
        } else if (this.itemFocus === -1) {
            this.selectAllOption.focus();
        } else {
            this.options[this.itemFocus].focus();
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
        this.numSelectedItems++;
        $(this.selectedItems).append(option.getSelectedItemBadge());
    }

    private unqueueOption(option: Option): void {
        if (this.options.indexOf(option) == -1) return;
        this.numSelectedItems--;
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
        if (!this.canSelect()) {
            this.options
                .filter((o) => !o.isSelected())
                .forEach((o) => o.deactivate());
        } else {
            this.options
                .filter((o) => !o.isSelected())
                .forEach((o) => o.activate());
        }
        this.updateSelectionCounter();
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
        if (this.isDisabled()) return;
        this.getOption(value).select();
    }

    public deselectOption(value: string): void {
        if (this.isDisabled()) return;
        this.getOption(value).deselect();
    }

    public isOptionSelected(value: string): boolean {
        return this.getOption(value).isSelected();
    }

    public enableOption(value: string): void {
        if (!this.isEnablingAndDisablingPermitted()) return;
        this.getOption(value).enable();
    }

    public disableOption(value: string): void {
        if (!this.isEnablingAndDisablingPermitted()) return;
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
        if (this.isDisabled()) return;
        this.selectAllOption.select();
    }

    public deselectAll(): void {
        if (this.isDisabled()) return;
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

    private dispatchSelectedEvent(option: Option): void {
        this.dispatchEvent(
            FilterMultiSelect.EventType.SELECTED,
            option.getValue(),
            option.getLabel());
    }

    private dispatchDeselectedEvent(option: Option): void {
        this.dispatchEvent(
            FilterMultiSelect.EventType.DESELECTED,
            option.getValue(),
            option.getLabel());
    }

    private dispatchEvent(eventType: string, value: string, label: string): void {
        let event: CustomEvent = FilterMultiSelect.createEvent(eventType, this.getName(), value, label);
        this.viewBar.dispatchEvent(event);
    }

    private canSelect(): boolean {
        return this.numSelectedItems < this.maxNumSelectedItems;
    }

    private updateSelectionCounter(): void {
        this.selectionCounter.textContent = this.numSelectedItems + "/" + this.maxNumSelectedItems;
    }
}