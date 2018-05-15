
const St = imports.gi.St;
const Main = imports.ui.main;
const Extension = imports.misc.extensionUtils.getCurrentExtension();

const UEFIIndicator = Extension.imports.indicator.UEFIIndicator;
const CustomButton = Extension.imports.button.CustomButton;
const Utils = Extension.imports.utils;

let settings;
let indicator;

function init() {
    Utils.log("Main", "initialized");
}

function enable() {

    if(typeof indicator == 'undefined') {
        indicator = new UEFIIndicator();    
    }

    Main.panel.addToStatusArea(indicator.name, indicator, "right");
    
    changeSpacing();

    Utils.log("Main", "enable() was called");
}

function disable() {
    Utils.log("Main", "disable() was called");
}

function changeSpacing() {
    indicator.set_spacing(1);
}
