/**
 * Couche d'abstraction permettant d'interfacer des contrôles à l'API native Gamepad.
 * Référence une liste de contrôles. Chacun d'entre eux se caractérise par :
 *    - un nom destiné à l'affichage pour configuration de la manette
 *    - une fonction rattachée, exécutant l'action correspondante
 *    - l'indice du bouton de manette rattaché, dans la liste fournie par l'API
 *
 * @class      GamepadGenericAdapter
 */
class GamepadGenericAdapter {
	constructor() { this.controls = []; }

	addControlEntry(name, fnAction, isAuto) {
		this.controls.push(new GamepadControl(name, fnAction, isAuto));
	}

	setControlMapping(controlIndex, buttonIndex) {
		this.controls[controlIndex].buttonIndex = buttonIndex;
	}

	applyControlsMapping() {
		let gamepad = GamepadGenericAdapter.getConnectedGamepad();
		this.__updateJoysticksStates(gamepad);
		for (let control of this.controls)
			control.applyContext(gamepad);
	}

	static getConnectedGamepad() {
		let gamepads = navigator.getGamepads();
		for (let gamepad of gamepads)
			if (gamepad != null)
				return gamepad;
	}

	__updateJoysticksStates(gamepad) {
		this.leftJoystick = new GamepadJoystick(gamepad.axes[0], gamepad.axes[1]);
		this.rightJoystick = new GamepadJoystick(gamepad.axes[2], gamepad.axes[3]);
		if (gamepad.axes.length > 4)
			this.accelerometer = new GamepadJoystick(gamepad.axes[4], gamepad.axes[5]);
	}
}

/**
 * Représente un contrôle de Gamepad, géré par GamepadGenericAdapter.
 *
 * @class      GamepadControl
 */
class GamepadControl {
	constructor(name, fnAction, isAuto) {
		this.name = name;
		this.execute = fnAction;
		this.isAuto = isAuto;
		this.executeFired = false;
		this.buttonIndex = undefined;
	}

	applyContext(gamepad) {
		if (this.__isButtonPressed(gamepad)) {
			if (this.__isExecutionPossible()) {
				this.execute();
				this.executeFired = true;
			}
		} else this.executeFired = false;
	}

	__isButtonPressed(gamepad) {
		return this.buttonIndex && gamepad.buttons[this.buttonIndex].pressed;
	}

	__isExecutionPossible() {
		return !this.executeFired || this.isAuto;
	}
}

/**
 * Représente un joystick de Gamepad, géré par GamepadGenericAdapter.
 *
 * @class      GamepadJoystick
 */
class GamepadJoystick {
	constructor(x_rate, y_rate) {
		this.x = x_rate;
		this.y = y_rate;
		this.__computeAngleAndIntensity();
	}

	__computeAngleAndIntensity() {
		this.angle = (Math.atan2(this.y, this.x) * 180) / Math.PI;
		this.intensity 	= Math.abs(this.x) > Math.abs(this.y) 
						? Math.abs(this.x) 
						: Math.abs(this.y);
	}
}

/**
 * Génère et gère l'UI permettant le mapping de GamepadGenericAdapter
 * Le constructeur de la classe attend une instance de GamepadGenericAdapter en paramètre
 *
 * @class      GamepadConfigUI
 */
class GamepadConfigUI {
	constructor(game_controls_mapper, fnOnUiClose) {
		this.controls_mapper = game_controls_mapper;
		this.show(fnOnUiClose);
	}

	show(fnOnClose) {
		let popup = new RS_Dialog("gamepad_config", "Configuration de la manette", [], [], [], false, 
								  "tpl_gamepad_config.html", ()=> {
			let container = popup.querySelector("#controls-gui-container");
			for (let i=0; i<this.controls_mapper.controls.length; i++) {
				container.appendChild(this.__getConfigInterfaceItem(i));
			}
			popup.querySelector("#btn_close").addEventListener("click", ()=> { popup.closeModal() });
			document.body.appendChild(popup);
		});
	}

	__getConfigInterfaceItem(control_index) {
		let control_mapping_item = this.controls_mapper.controls[control_index]
		let config_interface_item = this.__getItemContainer();
		config_interface_item.appendChild(this.__getItemNameDiv(control_mapping_item.name));
		let button_mapped = this.__getItemMapDiv(control_mapping_item.buttonIndex);
		config_interface_item.appendChild(button_mapped);
		config_interface_item.addEventListener("click", ()=> { this.__itemClicked(button_mapped, control_index); });
		return config_interface_item;
	}

	__getItemContainer() {
		let config_interface_item = document.createElement("DIV");
		config_interface_item.classList.add("control-item-container");
		return config_interface_item;
	}

	__getItemNameDiv(name) {
		let control_name = document.createElement("DIV");
		control_name.classList.add("control-name");
		control_name.innerHTML = name;
		return control_name;
	}

	__getItemMapDiv(buttonIndex) {
		let button_mapped = document.createElement("DIV");
		button_mapped.classList.add("button-mapped");
		button_mapped.innerHTML = buttonIndex 
								? "Bouton " + buttonIndex 
								: "-";
		return button_mapped;
	}

	__itemClicked(button_mapped, control_index) {
		button_mapped.innerHTML = "Appuyez sur un bouton";
		this.__captureButtonPressed((button_index)=> {
			this.controls_mapper.setControlMapping(control_index, button_index);
			button_mapped.innerHTML = "Bouton " + button_index;
		});
	}

	__captureButtonPressed(fnThen) {
		let interval_id = setInterval(()=> {
			let gamepad = GamepadGenericAdapter.getConnectedGamepad();
			for (let i=0; i<gamepad.buttons.length; i++) {
				if (gamepad.buttons[i].pressed) {
					clearInterval(interval_id);
					fnThen(i);
				}
			}
		}, 35);
	}
}