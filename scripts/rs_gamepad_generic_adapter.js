class GamepadGenericAdapter {
	constructor() { this.controls = []; }

	addControlEntry(name, fnAction) {
		this.controls.push({
			name: name,
			execute: fnAction,
			buttonIndex: undefined
		});
	}

	setControlMapping(controlIndex, buttonIndex) {
		this.controls[controlIndex].buttonIndex = buttonIndex;
	}

	applyControlsMapping() {
		let gamepad = GamepadGenericAdapter.getConnectedGamepad();
		this.__updateJoysticksStates(gamepad);
		for (let control of this.controls) {
			if (control.buttonIndex && gamepad.buttons[control.buttonIndex].pressed)
				control.execute();
		}
	}

	static getConnectedGamepad() {
		let gamepads = navigator.getGamepads();
		for (let gamepad of gamepads)
			if (gamepad != null)
				return gamepad;
	}

	__updateJoysticksStates(gamepad) {
		this.leftJoystickX = gamepad.axes[0]; // négatif=>gauche; positif=>droite
		this.leftJoystickY = gamepad.axes[1]; // négatif=>haut; positif=>bas
		this.rightJoystickX = gamepad.axes[2];
		this.rightJoystickY = gamepad.axes[3];
		if (gamepad.axes.length > 4) {
			this.gyroX = gamepad.axes[4];
			this.gyroY = gamepad.axes[5];
		}
		this.__upadteJoystickAnglesAndIntensityRates();
	}

	__upadteJoystickAnglesAndIntensityRates() {
		this.leftJoystickAngle = this.__getAngleFromXyRates(this.leftJoystickX, this.leftJoystickY);
		this.leftJoystickIntensity = this.__getIntensityFromXyRates(this.leftJoystickX, this.leftJoystickY);

		this.rightJoystickAngle = this.__getAngleFromXyRates(this.rightJoystickX, this.rightJoystickY);
		this.rightJoystickIntensity = this.__getIntensityFromXyRates(this.rightJoystickX, this.rightJoystickY);

		if (this.gyroX != undefined && this.gyroY != undefined) {
			this.gyroAngle = this.__getAngleFromXyRates(this.gyroX, this.gyroY);
			this.gyroIntensity = this.__getIntensityFromXyRates(this.gyroX, this.gyroY);
		}
	}

	__getAngleFromXyRates(x_rate, y_rate) { return (Math.atan2(y_rate, x_rate) * 180) / Math.PI; }

	__getIntensityFromXyRates(x_rate, y_rate) {
		return Math.abs(x_rate) > Math.abs(y_rate) 
				? Math.abs(x_rate) 
				: Math.abs(y_rate);
		}
}

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