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
import FilterMultiSelect from './FilterMultiSelect';
// define the plugin function on the jQuery extension point.
$.fn.filterMultiSelect = function (args) {
    var target = this;
    // merge the global options with the per-call options.
    args = $.extend({}, $.fn.filterMultiSelect.args, args);
    // factory defaults
    if (typeof args.placeholderText === 'undefined')
        args.placeholderText = 'nothing selected';
    if (typeof args.filterText === 'undefined')
        args.filterText = 'Filter';
    if (typeof args.selectAllText === 'undefined')
        args.selectAllText = 'Select All';
    if (typeof args.labelText === 'undefined')
        args.labelText = '';
    if (typeof args.selectionLimit === 'undefined')
        args.selectionLimit = 0;
    if (typeof args.caseSensitive === 'undefined')
        args.caseSensitive = false;
    if (typeof args.allowEnablingAndDisabling === 'undefined')
        args.allowEnablingAndDisabling = true;
    if (typeof args.items === 'undefined')
        args.items = new Array();
    var filterMultiSelect = new FilterMultiSelect(target, args);
    var fms = $(filterMultiSelect.getRootElement());
    target.replaceWith(fms);
    var methods = {
        hasOption: function (value) {
            return filterMultiSelect.hasOption(value);
        },
        selectOption: function (value) {
            filterMultiSelect.selectOption(value);
        },
        deselectOption: function (value) {
            filterMultiSelect.deselectOption(value);
        },
        isOptionSelected: function (value) {
            return filterMultiSelect.isOptionSelected(value);
        },
        enableOption: function (value) {
            filterMultiSelect.enableOption(value);
        },
        disableOption: function (value) {
            filterMultiSelect.disableOption(value);
        },
        isOptionDisabled: function (value) {
            return filterMultiSelect.isOptionDisabled(value);
        },
        enable: function () {
            filterMultiSelect.enable();
        },
        disable: function () {
            filterMultiSelect.disable();
        },
        selectAll: function () {
            filterMultiSelect.selectAll();
        },
        deselectAll: function () {
            filterMultiSelect.deselectAll();
        },
        getSelectedOptionsAsJson: function (includeDisabled) {
            if (includeDisabled === void 0) { includeDisabled = true; }
            return filterMultiSelect.getSelectedOptionsAsJson(includeDisabled);
        }
    };
    // store applied element
    $.fn.filterMultiSelect.applied.push(methods);
    return methods;
};
// activate plugin by targeting selector
$(function () {
    // factory defaults
    var selector = typeof $.fn.filterMultiSelect.selector === 'undefined' ? 'select.filter-multi-select' : $.fn.filterMultiSelect.selector;
    // target
    var s = $(selector);
    s.each(function (i, e) {
        $(e).filterMultiSelect();
    });
});
// store collection of applied elements
$.fn.filterMultiSelect.applied = new Array();
// define the plugin's global default selector.
$.fn.filterMultiSelect.selector = undefined;
// define the plugin's global default options.
$.fn.filterMultiSelect.args = {};
//# sourceMappingURL=filter-multi-select.js.map