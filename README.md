# GamepadGenericAdapter
Here is a JS Gamepad generic adapter, using native JS Gamepad API, and putting an abstraction layer on it.

## Test pages
In this repository, you will find several testing pages, logging informations into the console. The javascript code into these pages, is given as using examples :

### NativeApiTestPage.html
This page will help you in testing the native API translation of your buttons. Depending on the controller's model you are using, the *Buttons* array of the *Gamepad* object, provided by the API, won't look asame : the buttons won't be in the same order.
This testing page will help you, if you want to create specific Adapters, forcing a default mapping, for each existing controller model.

### buttonsMappingTestPage.html
This page will show you this adapter's behavior. When the controller connection is detected, a configuration dialog shows up, allowing you to tell the generic adapter, which controller button you want to map for each action. The actions log the corresponding message into the console.

### jostickXyRatesTestPage.html
This page will show you this adapter's axes translation to X, Y rates for each analog control (joysticks and/or accelerometer).

### JoystickAnglesAndIntensitiesTestPage.html
This page will show you this adapter's axes translation to angles and intensity, for each analog control (joysticks and/or accelerometer).

## Technically, how does it work ?
First of all, it's not perfect (sorry for that) : I'm using a webcomponent of mine for the dialog box, and the HTML template used to show it is hardcoded as "tpl_gamepad_config.html". This can be quickly and easily fixed, however.

### An abstraction layer
The *GamepadGenericAdapter* class provides an user-friendly action oriented abstraction layer.
The *constructor* creates a controls array, to store a set of action entries, defined by :
* a name
* a function to execute
* the index of the chosen button, in the *Gamepad.buttons* array, provided by the API

The *addControlEntry* method allows you to add a new unmapped action : only the name and the function to execute can be set.

The *setControlMapping* method allows you to map a button to an existing action. So, you will need to call *addControlEntry* before you set your mapping.

The *applyControlsMapping* method checks the actual buttons states, in order to fire pressed buttons mapped actions, and updates the object's carried joysticks states informations.

The static *getConnectedGamepad* method returns the first Gamepad found, into the gamepads list in *navigator.getGamepads()* (this feature will evolve in the future, to allow using more than one Gamepad at once).

The methods which name start with a double underscore, are reserved for the class's internal use.

### An embeded UI
As you probably noticed, there is no way to know in advance, which gamepad model will be plugged, and which button in the *Gamepad.buttons* array corresponds to a given actual button of the gamepad. So, to fix this issue, I chose to provide an embeded UI, that shows up when a gamepad gets connected. This UI can then be invoked at anytime to allow the user changing his configuration, simply calling the *show* method.

A hook on dialog colse, as a parameter you can pass, provides code execution while the UI is closing. Indeed, you will probably want to set the game in pause mode, just before the configuration dialog shows up, and to disable the pause mode when the dialog closes.
