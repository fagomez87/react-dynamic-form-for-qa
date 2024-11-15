# Instructions
## Overview:
You will enhance an existing dynamic form component based on a schema. The form should render titles and descriptions for each field, apply field restrictions, and provide explicit error messages. Additionally, you need to handle field visibility conditions by performing a topological sort of the schema.
### Stage 1: Adding Titles and Descriptions
**Schema Update:**
<ol>
    <li>Modify the schema to optionally include *title* and *description* properties for each field.
    </li>
</ol>

**Render Titles and Descriptions:**
<ol>
    <li>Update the form component to render the title and description for each field, if they exist in the schema.</li>
</ol>

### Stage 2: Adding Field Restrictions

**Schema Restrictions:**
<ol>
<li>Extend the schema to support restrictions for different field types. Specifically:
<ol>

**String Fields:**
<ol>
    <li><strong>MinLength:</strong> Specify the minimum number of characters allowed.
    </li>
    <li><strong>MaxLength:</strong> Specify the maximum number of characters allowed.
    </li>
</ol>
<strong>Number Fields:</strong>
    <ul>
        <li><strong>MinValue:</strong> Specify the minimum value allowed.
        </li>
        <li><strong>MaxValue:</strong> Specify the maximum value allowed.
        </li>
    </ol>
<strong>Implement Restrictions:</strong>
	<ol>
		<li>Update the form component to enforce these restrictions only when the Submit button is pressed.</li>
	</ol>
</ol>

### Stage 3: Explicit Error Messages</h4>

<strong>Error Messaging:</strong>
    <ol>
		<li>Implement logic to display explicit error messages when validation conditions are not met. The messages should clearly state what the error is and what the user inputted incorrectly.</li>
	</ol>
<strong>Examples:</strong>
	<ol>
		<li>If a field has a *minLength* of 100 characters and the user enters 50 characters, the error message should say: "Error: The minimum length is 100 characters. You entered 50 characters."</li>
		<li>For an email field, if the input is not a valid email, the message should specify that the input is invalid.</li>
	</ol>

### Stage 4: Topological Sorting of the Schema <ins>(optional but nice to have)</ins>
<ol>
	<li><strong>Topological Sort:</strong></li>
		<p>Implement a topological sort of the schema to ensure fields are ordered correctly based on their visibility conditions. This will ensure that a field is only rendered if all fields it depends on have been processed.</p>
	<li><strong>Detect Broken Links:</strong></li>
		<p>Check for any broken links where a field's visibility condition depends on a field that does not exist. For example, if a field <code>email</code> depends on a field <code>name</code> that is missing, this should be detected.</p>
	<li><strong>Error Handling for Broken Links:</strong></li>
		<p>If any broken links are found, provide a clear error message indicating that the schema cannot be rendered due to missing dependencies.</p>
</ol>