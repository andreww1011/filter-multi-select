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
import $ from 'jquery';
import FilterMultiSelect from './FilterMultiSelect';

// define the plugin function on the jQuery extension point.
($.fn as any).filterMultiSelect = function (this: JQuery, args: Args): any {
    let target = this;
    // merge the global options with the per-call options.
    args = $.extend({}, ($.fn as any).filterMultiSelect.args, args);

    // factory defaults
    if (typeof args.placeholderText === 'undefined') args.placeholderText = 'nothing selected';
    if (typeof args.filterText === 'undefined') args.filterText = 'Filter';
    if (typeof args.selectAllText === 'undefined') args.selectAllText = 'Select All';
    if (typeof args.caseSensitive === 'undefined') args.caseSensitive = false;
    if (typeof args.allowEnablingAndDisabling === 'undefined') args.allowEnablingAndDisabling = true;
    if (typeof args.items === 'undefined') args.items = new Array();

    let filterMultiSelect = new FilterMultiSelect(target, args);
  
    const fms = $(filterMultiSelect.getRootElement());
    target.replaceWith(fms);
    
    var methods = {
        hasOption: function(value: string):boolean {
            return filterMultiSelect.hasOption(value);
        },
        selectOption: function(value: string):void {
            filterMultiSelect.selectOption(value);
        },
        deselectOption: function(value: string):void {
            filterMultiSelect.deselectOption(value);
        },
        isOptionSelected: function(value: string):boolean {
            return filterMultiSelect.isOptionSelected(value);
        },
        enableOption: function(value: string):void {
            filterMultiSelect.enableOption(value);
        },
        disableOption: function(value: string):void {
            filterMultiSelect.disableOption(value);
        },
        isOptionDisabled: function(value: string):boolean {
            return filterMultiSelect.isOptionDisabled(value);
        },
        enable: function():void {
            filterMultiSelect.enable();
        },
        disable: function():void {
            filterMultiSelect.disable();
        },
        selectAll: function():void {
            filterMultiSelect.selectAll();
        },
        deselectAll: function():void {
            filterMultiSelect.deselectAll();
        },
        getSelectedOptionsAsJson: function(includeDisabled = true):string {
            return filterMultiSelect.getSelectedOptionsAsJson(includeDisabled);
        }
    };

    // store applied element
    ($.fn as any).filterMultiSelect.applied.push(methods);

    return methods;
};

// activate plugin by targeting selector
$(function () {
    // factory defaults
    let selector: string = typeof ($.fn as any).filterMultiSelect.selector === 'undefined' ? 'select.filter-multi-select' : ($.fn as any).filterMultiSelect.selector;
    // target
    let s: JQuery<HTMLElement> = $(selector);
    s.each((i,e) => {
        ($(e) as any).filterMultiSelect();
    });
});

// store collection of applied elements
($.fn as any).filterMultiSelect.applied = new Array();

// define the plugin's global default selector.
($.fn as any).filterMultiSelect.selector = undefined;

// define the plugin's global default options.
($.fn as any).filterMultiSelect.args = {};