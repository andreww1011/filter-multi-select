# filter-multi-select
<p>Multiple select dropdown with filter JQuery plugin.</p>

<p>Improve useability of HTML <code>&ltselect&gt</code> tags:
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

# Usage
<p>
  <ol>
    <li>Define a <code>&ltselect&gt</code> block with <i>name</i> and <i>multiple</i> attributes in your HTML code.  Supported optional attributes: <i>disabled</i> - disables the dropdown.</li>  
    <li>Define <code>&ltoption&gt</code>'s with unique <i>value</i> attributes.  Supported optional attributes: <i>label</i> - alternate dropdown display text; <i>selected</i> - pre-select this option; <i>disabled</i> - disable this option.</li>
    <pre><code>&ltform&gt
  ...
  &ltselect id="pets" name="pets" multiple&gt
    &ltoption value="0"&gtDoge&lt/option&gt
    &ltoption value="1" selected&gtKeyboard Cat&lt/option&gt
    &ltoption value="2" disabled&gtBadger Badger Badger&lt/option&gt
    ...</code></pre>
    <li>Use JQuery to target the <code>&ltselect&gt</code> and apply the plugin.</li>
    <pre><code>&ltscript&gt
  $(function () {
    $('#pets').filterMultiSelect();
  });
&lt/script&gt</code></pre>
  </ol>
</p>

# Options
<p>The following indexed parameters can be passed to <code>filterMultiSelect()</code> at construction.
  <ul>
    <li><code>placeholderText</code> - text to show as a placeholder when no items are selected.  <i>default="nothing selected"</i></li>
    <li><code>filterText</code> - text to show in filter when empty.  <i>default="Filter"</i></li>
    <li><code>selectAllText</code> - label for the select all dropdown item.  <i>default="Select All"</i></li>
    <li><code>caseSensitive</code> - whether filter text is case-sensitive.  <i>default=false</i></li>
    <li><code>allowEnablingAndDisabling</code> - whether programmatically toggling disabled is permitted.  <i>default=true</i></li>
    <li><code>items</code> - array of additional items to append to options in dropdown.  Each array entry should have the form: <br />
      <pre><code>[label:string, value:string, selected?=false, disabled?=false]</code></pre></li>
  </ul>
</p>

# Methods
<p>The following methods are exposed on the plugin:
  <ul>
    <li><code>hasOption(value:string></code> - returns true if this dropdown has an option with the specified <i>value</i> attribute, otherwise false.</li>
    <li><code>selectOption(value:string)</code> - selects the option with the specified <i>value</i> attribute, or does nothing if it does not exist.</li>
    <li><code>deselectOption(value:string)</code> - deselects the option with the specified <i>value</i> attribute, or does nothing if it does not exist.</li>
    <li><code>isOptionSelected</code> - returns true if the option with the specified <i>value</i> attribute is selected, otherwise false or if it does not exist.</li>
    <li><code<</li>
    <li></li>
    <li></li>
  </ul>
</p>
  
