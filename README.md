# kebab-admin

Event Organizer Details Page:
Objective: Provide a dedicated page for each event organizer to manage their events.

Features:
When an admin selects an event organizer from the table, redirect to a new page specific to that organizer.

The page includes:
A form to create new events with fields:
Event Name
Date (calendar picker)
Time (separate start and end time pickers)
Location (interactive map view for selecting a location)
Address (auto-filled based on map selection or manually entered)

A table listing all events created by the organizer with columns: Event Name, Date, Time, Location, Address, Actions (View/Edit/Delete).

Steps:
Create a route to load the event organizer details page when an organizer is selected.
Design the page with a form for event creation and a table for event listing.
Integrate a map API (e.g., Google Maps) for location selection, auto-populating the address field.
Validate event form inputs (e.g., ensure date and time are future-dated, location is selected).
Store event data in the database, linked to the specific organizer.
Display events in the table with action buttons (View/Edit/Delete).

3. Event Details Page - Stall Management
Objective: Allow event organizers to manage stalls for a specific event.

Features:
When an event is selected from the event table, redirect to an event details page.

The page includes:
A form to create new stalls with fields:
Stall Name
Cuisine (dropdown or text input)
Profile Photo (file upload)
Timings (for each day from Monday to Sunday):
Start Date and Time (must be within the event’s date and time range)
End Date and Time (must be within the event’s date and time range)

A table listing all stalls for the event with columns: Stall Name, Cuisine, Timings, Profile Photo, Actions (View/Edit/Delete).


Steps:
Create a route to load the event details page when an event is selected.
Design the page with a form for stall creation and a table for stall listing.
Implement file upload functionality for profile photos, storing them in a designated storage system.
Validate stall timings to ensure they fall within the event’s date and time range.
Store stall data in the database, linked to the specific event.
Display stalls in the table with action buttons (View/Edit/Delete).

4. Support for Frequent Events - Stall Search and Reuse

Objective: Streamline stall creation for frequent events by allowing organizers to reuse existing stalls.

Features:
On the event details page, add a "Search Stalls" option above the stall creation form.
Display a search bar to find previously created stalls (search by Stall Name or Cuisine).
Show search results in a selectable list with details: Stall Name, Cuisine, Profile Photo.
Allow the organizer to select a stall from the search results to add it to the current event.

After adding, allow editing of the stall’s details (e.g., update timings or cuisine) to fit the new event.
Ensure the reused stall’s timings are validated to fall within the event’s date and time range.

Steps:
Add a search bar to the event details page for querying existing stalls.
Implement a backend search function to retrieve stalls from the database based on search criteria.
Display search results in a list with selectable entries, showing key stall details.
On selection, copy the stall’s data to the current event, prompting the organizer to edit details if needed.
Validate and save the reused stall’s data, ensuring timings align with the event’s schedule.
Update the stall table to reflect the newly added stall.

5. Example Scenario
Scenario:
A (Event Organizer): Created in the admin dashboard.
B (Event): Created by Organizer A with details (e.g., "Food Fest," 2025-05-01, 10 AM-6 PM, selected location).
C (Stall): Created in Event B (e.g., "Taco Stand," Mexican cuisine, open Monday-Sunday within event hours).
Multiple stalls can be added to Event B, either by creating new ones or reusing existing stalls via search.

Frequent Events:
For recurring events at the same location, Organizer A can search for previously created stalls (e.g., "Taco Stand") and add them to a new event, editing timings or other details as needed.

6. Additional Considerations

Database Structure:
Store event organizers, events, and stalls in separate tables with appropriate relationships:
Event Organizers: ID, Name, Contact
Events: ID, Organizer ID, Name, Date, Time, Location, Address
Stalls: ID, Event ID, Name, Cuisine, Profile Photo URL, Timings (stored as JSON or separate table for each day)
Use foreign keys to link events to organizers and stalls to events.

User Experience:
Ensure forms are user-friendly with clear labels and error messages for invalid inputs.
Use responsive design for accessibility on desktop and mobile devices.
Provide confirmation prompts for destructive actions (e.g., deleting an organizer, event, or stall).

Performance:
Optimize search functionality for stalls to handle large datasets efficiently.
Cache map API responses to reduce load times for location selection.