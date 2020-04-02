# The Admin Interface
KalkulierbaR allows you to create example proof assignments and customize the available calculi as an admin user.

## Setup
When you start the KalkulierbaR backend, the server will attempt to create a configuration file named `kbar-state.json` in the current directory. This file contains the admin key and all stored examples.  

To set your own admin key, find the `key` property in the config file and change it to whatever you like. Please note that while the key will not be transmitted at any time, the key is stored in plaintext on the server. So maybe don't use your gmail password. The default key is `WildFlowers/UncomfortableMoons`.  

As any admin-action performed will update the config file, it is best to shut the server down before making manual changes to the file. You will have to restart the server for the changes to take effect, anyway.

## Using the Admin Interface

Once you have your key, you can log in using the settings dialog in the frontend. Once authenticated, toggles for each calculus will appear on the home page, allowing you to change calculus visibility. Additionally, a button labeled 'Add Example' will appear on the formula input pages, allowing you to create a publicly viewable example from the currently entered formula and parameters.  

If you have trouble signing in, make sure that the frontend is pointing to the correct backend server.