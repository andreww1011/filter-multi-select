import $ from 'jquery';
import FilterMultiSelect from './FilterMultiSelect';
$.fn.filterMultiSelect = function (args) {
    var target = this;
    args = $.extend({}, $.fn.filterMultiSelect.args, args);
    if (typeof args.placeholderText === 'undefined')
        args.placeholderText = 'nothing selected';
    if (typeof args.filterText === 'undefined')
        args.filterText = 'Filter';
    if (typeof args.selectAllText === 'undefined')
        args.selectAllText = 'Select All';
    if (typeof args.caseSensitive === 'undefined')
        args.caseSensitive = false;
    if (typeof args.allowEnablingAndDisabling === 'undefined')
        args.allowEnablingAndDisabling = true;
    if (typeof args.items === 'undefined')
        args.items = new Array();
    var filterMultiSelect = new FilterMultiSelect(target, args);
    filterMultiSelect.initialize();
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
    return methods;
};
$.fn.filterMultiSelect.args = {};
//# sourceMappingURL=filter-multi-select.js.map