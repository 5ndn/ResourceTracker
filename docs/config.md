# Configuring 

Below goes over each of the properties found in the `src/js/config-example.js` file. To configure the app to pull from your own Google Sheets, you'll need to copy and paste the example, renaming it to be `config.js`

### Author Name - `author`

The author name property can be anything you like. A company name, a user's name, etc.

### Spreadsheet ID - `spreadsheetId`

![][spreadsheet-id]

The spreadsheetId can be found in the url when editing your spreadsheet. If you open the sheet from Google Apps, the url should be `https://docs.google.com/spreadsheets/d/ID_HERE/edit` with "ID_HERE" being the spreadsheet's ID.

### Sheet ID - `sheetId`

![][sheet-id]

The sheetId is the name of the first tab of the sheet. If you are using our example spreadsheet file, you can leave this property's value as "Scheduler".

### Client ID - `CLIENT_ID`

Point your browser to  `https://console.developers.google.com` and create a new project for the resource tracker.

![][clientid-1]

After creating the project, navigate to the Library tab and click on "Sheets API" under the Google Apps API column

![][clientid-2]

After navigating to the Google Sheets API Dashboard, find the "Enable" button and click to enable access.

![][clientid-3]

After the API has been enabled, navigate to the "Credentials" tab in the sidebar, and choose "OAuth consent screen". Choose your email address from the dropdown if it's not selected already and fill in the "Product name shown to users". The other fields are optional, so you can click save with the previous two filled out.

![][clientid-4]

After saving the OAuth consent screen settings, back on the Credentials tab, choose "OAuth client ID" from the "Create credentials" dropdown.

![][clientid-5]

Choose "Web application" from the Application type list and give your client ID a name. Add any and all URIs you plan to host the application at under Authorized JavaScript origins. In our example, we simply used "localhost". After adding all Authorized origins, click Create.

![][clientid-6]

After successfully creating the ID, you should be presented with a modal that displays your client ID and a client secret. The client ID from the first field is what you need for the `spreadsheetId` property in the configuration.

![][clientid-7]

### Number Of Users - `numberOfUsers`

This property takes a number value that controls the number of people you wish to show. "10" is our rough max suggestion.

### isAuth - `isAuth`

This property can be ignored and should be kept as `false`. The value will be changed upon authorizing with Google.

[spreadsheet-id]: ./imgs/spreadsheet-id.png
[sheet-id]: ./imgs/sheet-id.png
[clientid-1]: ./imgs/client-id-1.png
[clientid-2]: ./imgs/client-id-2.png
[clientid-3]: ./imgs/client-id-3.png
[clientid-4]: ./imgs/client-id-4.png
[clientid-5]: ./imgs/client-id-5.png
[clientid-6]: ./imgs/client-id-6.png
[clientid-7]: ./imgs/client-id-7.png