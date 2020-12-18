import $ from 'jquery';
import FilterMultiSelect from './FilterMultiSelect';
import Option from './Option';

// define the plugin function on the jQuery extension point.
// ($.fn as any).filterMultiSelect = function (this: JQuery, args: Args): JQuery<HTMLElement> {
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
    filterMultiSelect.initialize();
  
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
    return methods;
};

// define the plugin's global default options.
($.fn as any).filterMultiSelect.args = {};