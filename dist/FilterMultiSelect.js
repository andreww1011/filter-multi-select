var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
import $ from 'jquery';
var NULL_OPTION = new /** @class */ (function () {
    function class_1() {
    }
    class_1.prototype.initialize = function () { };
    class_1.prototype.select = function () { };
    class_1.prototype.deselect = function () { };
    class_1.prototype.enable = function () { };
    class_1.prototype.disable = function () { };
    class_1.prototype.isSelected = function () { return false; };
    class_1.prototype.isDisabled = function () { return true; };
    class_1.prototype.getListItem = function () { return document.createElement('div'); };
    class_1.prototype.getSelectedItemBadge = function () { return document.createElement('div'); };
    class_1.prototype.getLabel = function () { return 'NULL_OPTION'; };
    class_1.prototype.getValue = function () { return 'NULL_OPTION'; };
    class_1.prototype.show = function () { };
    class_1.prototype.hide = function () { };
    class_1.prototype.isHidden = function () { return true; };
    class_1.prototype.focus = function () { };
    class_1.prototype.activate = function () { };
    class_1.prototype.deactivate = function () { };
    return class_1;
}());
var DEBUG = false;
var FilterMultiSelect = /** @class */ (function () {
    function FilterMultiSelect(selectTarget, args) {
        var _this = this;
        this.documentKeydownListener = function (e) {
            if (DEBUG) {
                _this.log('document', e);
                console.log(e.key);
            }
            switch (e.key) {
                case "Tab":
                    e.stopPropagation();
                    _this.closeDropdown();
                    break;
                case "ArrowUp":
                    e.stopPropagation();
                    e.preventDefault();
                    if (DEBUG) {
                        console.log("up");
                    }
                    _this.decrementItemFocus();
                    _this.focusItem();
                    break;
                case "ArrowDown":
                    e.stopPropagation();
                    e.preventDefault();
                    if (DEBUG) {
                        console.log("down");
                    }
                    _this.incrementItemFocus();
                    _this.focusItem();
                    break;
                case "Enter":
                case "Spacebar":
                case " ":
                    //swallow to allow checkbox change to work
                    break;
                default:
                    //send key to filter
                    _this.refocusFilter();
                    break;
            }
        };
        this.documentClickListener = function (e) {
            if (DEBUG) {
                _this.log('document', e);
            }
            if (_this.div !== e.target && !_this.div.contains(e.target)) {
                _this.closeDropdown();
            }
        };
        this.fmsFocusListener = function (e) {
            if (DEBUG) {
                _this.log('div', e);
            }
            e.stopPropagation();
            e.preventDefault();
            _this.viewBar.dispatchEvent(new MouseEvent('click'));
        };
        this.fmsMousedownListener = function (e) {
            if (DEBUG) {
                _this.log('div', e);
            }
            e.stopPropagation();
            e.preventDefault();
        };
        var t = selectTarget.get(0);
        if (!(t instanceof HTMLSelectElement)) {
            throw new Error("JQuery target must be a select element.");
        }
        var select = t;
        var name = select.name;
        if (!name) {
            throw new Error("Select element must have a name attribute.");
        }
        this.name = name;
        var array = selectTarget.find('option').toArray();
        this.options = FilterMultiSelect.createOptions(this, name, array, args.items);
        // restrict selection
        this.numSelectedItems = 0;
        this.maxNumSelectedItems = !select.multiple ? 1 :
            args.selectionLimit > 0 ? args.selectionLimit :
                parseInt(select.getAttribute('multiple')) > 0 ? parseInt(select.getAttribute('multiple')) :
                    0; //magic number 
        var numOptions = this.options.length;
        var restrictSelection = this.maxNumSelectedItems > 0 && this.maxNumSelectedItems < numOptions;
        this.maxNumSelectedItems = restrictSelection ? this.maxNumSelectedItems : numOptions + 1; //magic number
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
        this.options.forEach(function (o) { return _this.items.append(o.getListItem()); });
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
        var customLabel = args.labelText.length != 0;
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
        this.showing = new Array();
        this.itemFocus = -2; //magic number
        this.initialize();
    }
    FilterMultiSelect.createOptions = function (fms, name, htmlOptions, jsOptions) {
        var htmloptions = htmlOptions.map(function (o, i) {
            FilterMultiSelect.checkValue(o.value, o.label);
            return new FilterMultiSelect.SingleOption(fms, i, name, o.label, o.value, o.defaultSelected, o.disabled);
        });
        var j = htmlOptions.length;
        var jsoptions = jsOptions.map(function (o, i) {
            var label = o[0];
            var value = o[1];
            var selected = o[2];
            var disabled = o[3];
            FilterMultiSelect.checkValue(value, label);
            return new FilterMultiSelect.SingleOption(fms, j + i, name, label, value, selected, disabled);
        });
        var opts = htmloptions.concat(jsoptions);
        var counts = {};
        opts.forEach(function (o) {
            var v = o.getValue();
            if (counts[v] === undefined) {
                counts[v] = 1;
            }
            else {
                throw new Error("Duplicate value: " + o.getValue() + " (" + o.getLabel() + ")");
            }
        });
        return opts;
    };
    FilterMultiSelect.checkValue = function (value, label) {
        if (value === "") {
            throw new Error("Option " + label + " does not have an associated value.");
        }
    };
    FilterMultiSelect.createEvent = function (e, n, v, l) {
        var event = new CustomEvent(e, {
            detail: {
                name: n,
                value: v,
                label: l
            },
            bubbles: true,
            cancelable: true,
            composed: false
        });
        return event;
    };
    FilterMultiSelect.prototype.initialize = function () {
        this.options.forEach(function (o) { return o.initialize(); });
        this.selectAllOption.initialize();
        this.filterInput.className = 'form-control';
        this.clearButton.tabIndex = -1;
        this.filter.className = 'filter dropdown-item';
        this.items.className = 'items dropdown-item';
        this.dropDown.className = 'dropdown-menu';
        this.placeholder.className = 'placeholder';
        this.selectedItems.className = 'selected-items';
        this.viewBar.className = 'viewbar form-control dropdown-toggle';
        this.label.className = 'col-form-label mr-2 text-dark';
        this.selectionCounter.className = 'mr-2';
        this.div.className = 'filter-multi-select dropdown';
        if (this.maxNumSelectedItems > 1) {
            var v = this.maxNumSelectedItems >= this.options.length ? "" : this.maxNumSelectedItems.toString();
            this.div.setAttribute('multiple', v);
        }
        else {
            this.div.setAttribute('single', "");
        }
        if (this.isDisabled()) {
            this.disableNoPermissionCheck();
        }
        this.attachDropdownListeners();
        this.attachViewbarListeners();
        this.closeDropdown();
    };
    FilterMultiSelect.prototype.log = function (m, e) {
        if (DEBUG) {
            console.log(e.timeStamp + " - " + m + ":" + e.type + ":" + e.target);
        }
    };
    FilterMultiSelect.prototype.attachDropdownListeners = function () {
        var _this = this;
        this.filterInput.addEventListener('keyup', function (e) {
            if (DEBUG) {
                _this.log('filterInput', e);
            }
            e.stopImmediatePropagation();
            _this.updateDropdownList();
            var numShown = _this.showing.length;
            switch (e.key) {
                case "Enter":
                    if (numShown === 1) {
                        var o = _this.options[_this.showing[0]]; //magic number
                        if (!o.isDisabled()) {
                            if (o.isSelected()) {
                                o.deselect();
                            }
                            else {
                                o.select();
                            }
                            _this.clearFilterAndRefocus();
                        }
                    }
                    break;
                case "Escape":
                    if (_this.filterText.length > 0) {
                        _this.clearFilterAndRefocus();
                    }
                    else {
                        _this.closeDropdown();
                    }
                    break;
                default:
                    break;
            }
        }, true);
        this.clearButton.addEventListener('click', function (e) {
            if (DEBUG) {
                _this.log('clearButton', e);
            }
            e.stopImmediatePropagation();
            var text = _this.filterInput.value;
            if (text.length > 0) {
                _this.clearFilterAndRefocus();
            }
            else {
                _this.closeDropdown();
            }
        }, true);
    };
    FilterMultiSelect.prototype.updateDropdownList = function () {
        var text = this.filterInput.value;
        if (text.length > 0) {
            this.selectAllOption.hide();
        }
        else {
            this.selectAllOption.show();
        }
        var showing = new Array();
        if (this.caseSensitive) {
            this.options.forEach(function (o, i) {
                if (o.getLabel().indexOf(text) !== -1) { //magic number
                    o.show();
                    showing.push(i);
                }
                else {
                    o.hide();
                }
            });
        }
        else {
            this.options.forEach(function (o, i) {
                if (o.getLabel().toLowerCase().indexOf(text.toLowerCase()) !== -1) { //magic number 
                    o.show();
                    showing.push(i);
                }
                else {
                    o.hide();
                }
            });
        }
        this.filterText = text;
        this.showing = showing;
    };
    FilterMultiSelect.prototype.clearFilterAndRefocus = function () {
        if (DEBUG) {
            console.log('clear filter');
        }
        this.filterInput.value = '';
        this.updateDropdownList();
        this.refocusFilter();
    };
    FilterMultiSelect.prototype.refocusFilter = function () {
        if (DEBUG) {
            console.log('refocus filter');
        }
        this.filterInput.focus();
        this.itemFocus = -2; //magic number
    };
    FilterMultiSelect.prototype.attachViewbarListeners = function () {
        var _this = this;
        this.viewBar.addEventListener('click', function (e) {
            if (DEBUG) {
                _this.log('viewBar', e);
            }
            if (_this.isClosed()) {
                _this.openDropdown();
            }
            else {
                _this.closeDropdown();
            }
        });
    };
    FilterMultiSelect.prototype.isClosed = function () {
        return !this.dropDown.classList.contains('show');
    };
    FilterMultiSelect.prototype.setTabIndex = function () {
        if (this.isDisabled()) {
            this.div.tabIndex = -1;
        }
        else {
            if (this.isClosed()) {
                this.div.tabIndex = 0;
            }
            else {
                this.div.tabIndex = -1;
            }
        }
    };
    FilterMultiSelect.prototype.closeDropdown = function () {
        var _this = this;
        if (DEBUG) {
            console.log('close');
        }
        document.removeEventListener('keydown', this.documentKeydownListener, true);
        document.removeEventListener('click', this.documentClickListener, true);
        this.dropDown.classList.remove('show');
        setTimeout(function () {
            _this.setTabIndex();
        }, 100); //magic number
        this.div.addEventListener('mousedown', this.fmsMousedownListener, true);
        this.div.addEventListener('focus', this.fmsFocusListener);
    };
    FilterMultiSelect.prototype.incrementItemFocus = function () {
        if (this.itemFocus >= this.options.length - 1)
            return;
        var i = this.itemFocus;
        do {
            i++;
        } while ((i == -1 && (this.selectAllOption.isDisabled() || this.selectAllOption.isHidden())) || //magic number
            (i >= 0 && i < this.options.length && (this.options[i].isDisabled() || this.options[i].isHidden())));
        this.itemFocus = i > this.options.length - 1 ? this.itemFocus : i;
        if (DEBUG) {
            console.log("item focus: " + this.itemFocus);
        }
    };
    FilterMultiSelect.prototype.decrementItemFocus = function () {
        if (this.itemFocus <= -2)
            return; //magic number
        var i = this.itemFocus;
        do {
            i--;
        } while ((i == -1 && (this.selectAllOption.isDisabled() || this.selectAllOption.isHidden())) ||
            (i >= 0 && (this.options[i].isDisabled() || this.options[i].isHidden())) &&
                i > -2); //magic number
        this.itemFocus = i;
        if (DEBUG) {
            console.log("item focus: " + this.itemFocus);
        }
    };
    FilterMultiSelect.prototype.focusItem = function () {
        if (this.itemFocus === -2) {
            this.refocusFilter();
        }
        else if (this.itemFocus === -1) {
            this.selectAllOption.focus();
        }
        else {
            this.options[this.itemFocus].focus();
        }
    };
    FilterMultiSelect.prototype.openDropdown = function () {
        if (this.disabled)
            return;
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
    };
    FilterMultiSelect.prototype.queueOption = function (option) {
        if (this.options.indexOf(option) == -1)
            return;
        this.numSelectedItems++;
        $(this.selectedItems).append(option.getSelectedItemBadge());
    };
    FilterMultiSelect.prototype.unqueueOption = function (option) {
        if (this.options.indexOf(option) == -1)
            return;
        this.numSelectedItems--;
        $(this.selectedItems).children('[data-id="' + option.getSelectedItemBadge().getAttribute('data-id') + '"]').remove();
    };
    FilterMultiSelect.prototype.update = function () {
        if (this.areAllSelected()) {
            this.selectAllOption.markSelectAll();
            this.placeholder.hidden = true;
        }
        else if (this.areSomeSelected()) {
            if (this.areOnlyDeselectedAlsoDisabled()) {
                this.selectAllOption.markSelectAllNotDisabled();
                this.placeholder.hidden = true;
            }
            else {
                this.selectAllOption.markSelectPartial();
                this.placeholder.hidden = true;
            }
        }
        else {
            this.selectAllOption.markDeselect();
            this.placeholder.hidden = false;
        }
        if (this.areAllDisabled()) {
            this.selectAllOption.disable();
        }
        else {
            this.selectAllOption.enable();
        }
        if (!this.canSelect()) {
            this.options
                .filter(function (o) { return !o.isSelected(); })
                .forEach(function (o) { return o.deactivate(); });
        }
        else {
            this.options
                .filter(function (o) { return !o.isSelected(); })
                .forEach(function (o) { return o.activate(); });
        }
        this.updateSelectionCounter();
    };
    FilterMultiSelect.prototype.areAllSelected = function () {
        return this.options
            .map(function (o) { return o.isSelected(); })
            .reduce(function (acc, cur) { return acc && cur; }, true);
    };
    FilterMultiSelect.prototype.areSomeSelected = function () {
        return this.options
            .map(function (o) { return o.isSelected(); })
            .reduce(function (acc, cur) { return acc || cur; }, false);
    };
    FilterMultiSelect.prototype.areOnlyDeselectedAlsoDisabled = function () {
        return this.options
            .filter(function (o) { return !o.isSelected(); })
            .map(function (o) { return o.isDisabled(); })
            .reduce(function (acc, cur) { return acc && cur; }, true);
    };
    FilterMultiSelect.prototype.areAllDisabled = function () {
        return this.options
            .map(function (o) { return o.isDisabled(); })
            .reduce(function (acc, cur) { return acc && cur; }, true);
    };
    FilterMultiSelect.prototype.isEnablingAndDisablingPermitted = function () {
        return this.allowEnablingAndDisabling;
    };
    FilterMultiSelect.prototype.getRootElement = function () {
        return this.div;
    };
    FilterMultiSelect.prototype.hasOption = function (value) {
        return this.getOption(value) !== NULL_OPTION;
    };
    FilterMultiSelect.prototype.getOption = function (value) {
        for (var _i = 0, _a = this.options; _i < _a.length; _i++) {
            var o = _a[_i];
            if (o.getValue() == value) {
                return o;
            }
        }
        return NULL_OPTION;
    };
    FilterMultiSelect.prototype.selectOption = function (value) {
        if (this.isDisabled())
            return;
        this.getOption(value).select();
    };
    FilterMultiSelect.prototype.deselectOption = function (value) {
        if (this.isDisabled())
            return;
        this.getOption(value).deselect();
    };
    FilterMultiSelect.prototype.isOptionSelected = function (value) {
        return this.getOption(value).isSelected();
    };
    FilterMultiSelect.prototype.enableOption = function (value) {
        if (!this.isEnablingAndDisablingPermitted())
            return;
        this.getOption(value).enable();
    };
    FilterMultiSelect.prototype.disableOption = function (value) {
        if (!this.isEnablingAndDisablingPermitted())
            return;
        this.getOption(value).disable();
    };
    FilterMultiSelect.prototype.isOptionDisabled = function (value) {
        return this.getOption(value).isDisabled();
    };
    FilterMultiSelect.prototype.disable = function () {
        if (!this.isEnablingAndDisablingPermitted())
            return;
        this.disableNoPermissionCheck();
    };
    FilterMultiSelect.prototype.disableNoPermissionCheck = function () {
        var _this = this;
        this.options.forEach(function (o) { return _this.setBadgeDisabled(o); });
        this.disabled = true;
        this.div.classList.add('disabled');
        this.viewBar.classList.remove('dropdown-toggle');
        this.closeDropdown();
    };
    FilterMultiSelect.prototype.setBadgeDisabled = function (o) {
        o.getSelectedItemBadge().classList.add('disabled');
    };
    FilterMultiSelect.prototype.enable = function () {
        var _this = this;
        if (!this.isEnablingAndDisablingPermitted())
            return;
        this.options.forEach(function (o) {
            if (!o.isDisabled()) {
                _this.setBadgeEnabled(o);
            }
        });
        this.disabled = false;
        this.div.classList.remove('disabled');
        this.setTabIndex();
        this.viewBar.classList.add('dropdown-toggle');
    };
    FilterMultiSelect.prototype.setBadgeEnabled = function (o) {
        o.getSelectedItemBadge().classList.remove('disabled');
    };
    FilterMultiSelect.prototype.isDisabled = function () {
        return this.disabled;
    };
    FilterMultiSelect.prototype.selectAll = function () {
        if (this.isDisabled())
            return;
        this.selectAllOption.select();
    };
    FilterMultiSelect.prototype.deselectAll = function () {
        if (this.isDisabled())
            return;
        this.selectAllOption.deselect();
    };
    FilterMultiSelect.prototype.getSelectedOptions = function (includeDisabled) {
        if (includeDisabled === void 0) { includeDisabled = true; }
        var a = this.options;
        if (!includeDisabled) {
            if (this.isDisabled()) {
                return new Array();
            }
            a = a.filter(function (o) { return !o.isDisabled(); });
        }
        a = a.filter(function (o) { return o.isSelected(); });
        return a;
    };
    FilterMultiSelect.prototype.getSelectedOptionsAsJson = function (includeDisabled) {
        if (includeDisabled === void 0) { includeDisabled = true; }
        var data = {};
        var a = this.getSelectedOptions(includeDisabled).map(function (o) { return o.getValue(); });
        data[this.getName()] = a;
        var c = JSON.stringify(data, null, "  ");
        if (DEBUG) {
            console.log(c);
        }
        return c;
    };
    FilterMultiSelect.prototype.getName = function () {
        return this.name;
    };
    FilterMultiSelect.prototype.dispatchSelectedEvent = function (option) {
        this.dispatchEvent(FilterMultiSelect.EventType.SELECTED, option.getValue(), option.getLabel());
    };
    FilterMultiSelect.prototype.dispatchDeselectedEvent = function (option) {
        this.dispatchEvent(FilterMultiSelect.EventType.DESELECTED, option.getValue(), option.getLabel());
    };
    FilterMultiSelect.prototype.dispatchEvent = function (eventType, value, label) {
        var event = FilterMultiSelect.createEvent(eventType, this.getName(), value, label);
        this.viewBar.dispatchEvent(event);
    };
    FilterMultiSelect.prototype.canSelect = function () {
        return this.numSelectedItems < this.maxNumSelectedItems;
    };
    FilterMultiSelect.prototype.updateSelectionCounter = function () {
        this.selectionCounter.textContent = this.numSelectedItems + "/" + this.maxNumSelectedItems;
    };
    FilterMultiSelect.SingleOption = /** @class */ (function () {
        function class_2(fms, row, name, label, value, checked, disabled) {
            this.fms = fms;
            this.div = document.createElement('div');
            this.checkbox = document.createElement('input');
            this.checkbox.type = 'checkbox';
            var id = name + '-' + row.toString();
            var nchbx = id + '-chbx';
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
            this.selectedItemBadge.setAttribute('data-id', id);
            this.selectedItemBadge.textContent = label;
            this.selectedItemBadge.append(this.closeButton);
            this.disabled = disabled;
            this.active = true;
        }
        class_2.prototype.log = function (m, e) {
            if (DEBUG) {
                console.log(e.timeStamp + " - " + m + ":" + e.type + ":" + e.target);
            }
        };
        class_2.prototype.initialize = function () {
            var _this = this;
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
            this.checkbox.addEventListener('change', function (e) {
                e.stopPropagation();
                if (_this.isDisabled() || _this.fms.isDisabled()) {
                    e.preventDefault();
                    return;
                }
                if (DEBUG) {
                    _this.log('checkbox', e);
                }
                if (_this.isSelected()) {
                    _this.select();
                }
                else {
                    _this.deselect();
                }
                var numShown = _this.fms.showing.length;
                if (numShown === 1) {
                    _this.fms.clearFilterAndRefocus();
                }
            }, true);
            this.checkbox.addEventListener('keyup', function (e) {
                if (DEBUG) {
                    _this.log('checkbox', e);
                }
                switch (e.key) {
                    case "Enter":
                        e.stopPropagation();
                        _this.checkbox.dispatchEvent(new MouseEvent('click'));
                        break;
                    default:
                        break;
                }
            }, true);
            this.closeButton.addEventListener('click', function (e) {
                e.stopPropagation();
                if (_this.isDisabled() || _this.fms.isDisabled())
                    return;
                if (DEBUG) {
                    _this.log('closeButton', e);
                }
                _this.deselect();
                if (!_this.fms.isClosed()) {
                    _this.fms.refocusFilter();
                }
            }, true);
            this.checkbox.tabIndex = -1;
            this.closeButton.tabIndex = -1;
        };
        class_2.prototype.select = function () {
            if (this.isDisabled())
                return;
            this.selectNoDisabledCheck();
            this.fms.update();
        };
        class_2.prototype.selectNoDisabledCheck = function () {
            if (!this.fms.canSelect() || !this.isActive())
                return;
            this.checkbox.checked = true;
            this.fms.queueOption(this);
            this.fms.dispatchSelectedEvent(this);
        };
        class_2.prototype.deselect = function () {
            if (this.isDisabled())
                return;
            this.checkbox.checked = false;
            this.fms.unqueueOption(this);
            this.fms.dispatchDeselectedEvent(this);
            this.fms.update();
        };
        class_2.prototype.enable = function () {
            this.disabled = false;
            this.setEnabledViewState();
            this.fms.update();
        };
        class_2.prototype.setEnabledViewState = function () {
            this.checkbox.disabled = false;
            this.selectedItemBadge.classList.remove('disabled');
        };
        class_2.prototype.disable = function () {
            this.disabled = true;
            this.setDisabledViewState();
            this.fms.update();
        };
        class_2.prototype.setDisabledViewState = function () {
            this.checkbox.disabled = true;
            this.selectedItemBadge.classList.add('disabled');
        };
        class_2.prototype.isSelected = function () {
            return this.checkbox.checked;
        };
        class_2.prototype.isDisabled = function () {
            return this.checkbox.disabled;
        };
        class_2.prototype.getListItem = function () {
            return this.div;
        };
        class_2.prototype.getSelectedItemBadge = function () {
            return this.selectedItemBadge;
        };
        class_2.prototype.getLabel = function () {
            return this.labelFor.textContent;
        };
        class_2.prototype.getValue = function () {
            return this.checkbox.value;
        };
        class_2.prototype.show = function () {
            this.div.hidden = false;
        };
        class_2.prototype.hide = function () {
            this.div.hidden = true;
        };
        class_2.prototype.isHidden = function () {
            return this.div.hidden;
        };
        class_2.prototype.focus = function () {
            this.labelFor.focus();
        };
        class_2.prototype.isActive = function () {
            return this.active;
        };
        class_2.prototype.activate = function () {
            this.active = true;
            if (!this.disabled) {
                this.setEnabledViewState();
            }
        };
        class_2.prototype.deactivate = function () {
            this.active = false;
            this.setDisabledViewState();
        };
        return class_2;
    }());
    FilterMultiSelect.UnrestrictedSelectAllOption = /** @class */ (function (_super) {
        __extends(class_3, _super);
        function class_3(fms, name, label) {
            var _this = _super.call(this, fms, -1, name, label, '', false, false) || this;
            _this.checkbox.indeterminate = false;
            return _this;
        }
        class_3.prototype.markSelectAll = function () {
            this.checkbox.checked = true;
            this.checkbox.indeterminate = false;
        };
        class_3.prototype.markSelectPartial = function () {
            this.checkbox.checked = false;
            this.checkbox.indeterminate = true;
        };
        class_3.prototype.markSelectAllNotDisabled = function () {
            this.checkbox.checked = true;
            this.checkbox.indeterminate = true;
        };
        class_3.prototype.markDeselect = function () {
            this.checkbox.checked = false;
            this.checkbox.indeterminate = false;
        };
        class_3.prototype.select = function () {
            if (this.isDisabled())
                return;
            this.fms.options.filter(function (o) { return !o.isSelected(); })
                .forEach(function (o) { return o.select(); });
            this.fms.update();
        };
        class_3.prototype.deselect = function () {
            if (this.isDisabled())
                return;
            this.fms.options.filter(function (o) { return o.isSelected(); })
                .forEach(function (o) { return o.deselect(); });
            this.fms.update();
        };
        class_3.prototype.enable = function () {
            this.disabled = false;
            this.checkbox.disabled = false;
        };
        class_3.prototype.disable = function () {
            this.disabled = true;
            this.checkbox.disabled = true;
        };
        return class_3;
    }(FilterMultiSelect.SingleOption));
    FilterMultiSelect.RestrictedSelectAllOption = /** @class */ (function () {
        function class_4(fms, name, label) {
            this.usao = new FilterMultiSelect.UnrestrictedSelectAllOption(fms, name, label);
        }
        class_4.prototype.initialize = function () { this.usao.initialize(); };
        class_4.prototype.select = function () { };
        class_4.prototype.deselect = function () { this.usao.deselect(); };
        class_4.prototype.enable = function () { };
        class_4.prototype.disable = function () { };
        class_4.prototype.isSelected = function () { return false; };
        class_4.prototype.isDisabled = function () { return true; };
        class_4.prototype.getListItem = function () { return document.createElement('div'); };
        class_4.prototype.getSelectedItemBadge = function () { return document.createElement('div'); };
        class_4.prototype.getLabel = function () { return 'RESTRICTED_SELECT_ALL_OPTION'; };
        class_4.prototype.getValue = function () { return 'RESTRICTED_SELECT_ALL_OPTION'; };
        class_4.prototype.show = function () { };
        class_4.prototype.hide = function () { };
        class_4.prototype.isHidden = function () { return true; };
        class_4.prototype.focus = function () { };
        class_4.prototype.markSelectAll = function () { };
        class_4.prototype.markSelectPartial = function () { };
        class_4.prototype.markSelectAllNotDisabled = function () { };
        class_4.prototype.markDeselect = function () { };
        class_4.prototype.activate = function () { };
        class_4.prototype.deactivate = function () { };
        return class_4;
    }());
    FilterMultiSelect.EventType = {
        SELECTED: "optionselected",
        DESELECTED: "optiondeselected"
    };
    return FilterMultiSelect;
}());
export default FilterMultiSelect;
//# sourceMappingURL=FilterMultiSelect.js.map