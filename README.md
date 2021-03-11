# filter-multi-select
<p>Multiple select dropdown with filter jQuery plugin.</p>

<p><a href="https://jsfiddle.net/andreww1011/v29oxr8z/">JSFiddle</a></p>

<p>Improve the useability of HTML <code>&ltselect&gt</code> elements:
<ul>
  <li>options are displayed in a dropdown list.</li>
  <li>selected options are marked with a checkbox in the list and a badge at the top.</li>
  <li>easily select all or none.</li>
  <li>type to filter long lists of options.</li>
  <li>use the up/down arrow keys to focus an option and spacebar/enter to select.</li>
  <li>tab cycle to open/close dropdown.</li>
</ul>
</p>
<p>Uses Bootstrap classes for styling.  Easily modify CSS to match your theme.</p>
<p align="center">
    <img src="./screenshot2.png" width="401" title="screenshot2"/>
    <img src="./screenshot3.png" width="401" title="screenshot3"/>
</p>

# Usage
<p>
  <ol>
    <li>Load jQuery, Bootstrap, and the plugin bundle in your HTML code.
    <pre><code>&ltscript src="https://code.jquery.com/jquery-3.2.1.slim.min.js"&gt&lt/script&gt
&ltlink rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"/&gt
...
&ltlink rel="stylesheet" href="filter_multi_select.css"/&gt
&ltscript src="filter-multi-select-bundle.min.js"&gt&lt/script&gt</code></pre></li>
    <li>Define a <code>&ltselect&gt</code> element with <i>name</i> and <i>multiple</i> attributes in your HTML code.  Supported optional attributes: <i>disabled</i> - disables the dropdown.</li>  
    <li>Define <code>&ltoption&gt</code>'s with unique <i>value</i> attributes.  Supported optional attributes: <i>label</i> - alternate dropdown display text; <i>selected</i> - pre-select this option; <i>disabled</i> - disable this option.
    <pre><code>&ltform&gt
  ...
  &ltselect multiple id="pets" name="pets"&gt
    &ltoption value="0"&gtDoge&lt/option&gt
    &ltoption value="1" selected&gtKeyboard Cat&lt/option&gt
    &ltoption value="2" label="Badger" disabled&gtBadger Badger Badger&lt/option&gt
    ...</code></pre></li>
    <li>Use jQuery to target the <code>&ltselect&gt</code> and apply the plugin.  The HTML is replaced by the plugin in the DOM.
    <pre><code>&ltscript&gt
  $(function () {
    $('#pets').filterMultiSelect();
  });
&lt/script&gt</code></pre></li>
    <li>Or append the class <code>filter-multi-select</code> to the select element and have it be targeted automatically.
    <pre><code>&ltselect <b>class="filter-multi-select"</b> multiple id="pets" name="pets"&gt</code></pre></li>
  </ol>
  <p align="center">
    <img src="./screenshot.png" width="489" title="screenshot">
  </p>
</p>

# Options
<p>The following indexed parameters can be passed to <code>filterMultiSelect()</code> at construction.
  <ul>
    <li><code>placeholderText</code> - text to show as a placeholder when no items are selected.  <i>default="nothing selected"</i></li>
    <li><code>filterText</code> - text to show in filter when empty.  <i>default="Filter"</i></li>
    <li><code>selectAllText</code> - label for the select all dropdown item.  <i>default="Select All"</i></li>
    <li><code>caseSensitive</code> - whether filtering is case-sensitive.  <i>default=false</i></li>
    <li><code>allowEnablingAndDisabling</code> - whether programmatically toggling disabled is permitted.  <i>default=true</i></li>
    <li><code>items</code> - array of additional items to append to options in dropdown.  Each array entry should have the form: <br />
      <pre><code>[label:string, value:string, selected?=false, disabled?=false]</code></pre></li>
  </ul>
</p>

# API
<p>The following methods are exposed on the plugin:
  <ul>
    <li><code>hasOption(value:string)</code> - returns true if this dropdown has an option with the specified <i>value</i> attribute, otherwise false.</li>
    <li><code>selectOption(value:string)</code> - selects the option with the specified <i>value</i> attribute, otherwise does nothing if it does not exist or if it is disabled.</li>
    <li><code>deselectOption(value:string)</code> - deselects the option with the specified <i>value</i> attribute, otherwise does nothing if it does not exist or if it is disabled.</li>
    <li><code>isOptionSelected(value:string)</code> - returns true if the option with the specified <i>value</i> attribute exists and is selected, otherwise false.</li>
    <li><code>enableOption(value:string)</code> - enables the option with the specified <i>value</i> attribute, otherwise does nothing if it does not exist or if enabling is not permitted.</li>
    <li><code>disableOption(value:string)</code> - disables the option with the specified <i>value</i> attribute, otherwise does nothing if it does not exist or if disabling is not permitted.</li>
    <li><code>isOptionDisabled(value:string)</code> - returns true if the option with the specified <i>value</i> attribute exists and is disabled, otherwise false.</li>
    <li><code>enable()</code> - enables this dropdown, otherwise does nothing if enabling is not permitted.</li>
    <li><code>disable()</code> - disables this dropdown, otherwise does nothing if disabling is not permitted.</li>
    <li><code>selectAll()</code> - selects all non-disabled options.</li>
    <li><code>deselectAll()</code> - deselects all non-disabled options.</li>
    <li><code>getSelectedOptionsAsJson(includeDisabled=true)</code> - returns a JSON string of the selected options' values.</li>
  </ul>
</p>
<p>The following global fields are exposed on the jQuery extension point:
  <ul>
    <li><code>$.fn.filterMultiSelect.selector</code> - the selector string used to automatically target and apply the plugin. <i> default = "select.filter-multi-select"</i></li>
    <li><code>$.fn.filterMultiSelect.applied</code> - a collection of all element groups applied by the plugin.</li>
  </ul>
</p>
