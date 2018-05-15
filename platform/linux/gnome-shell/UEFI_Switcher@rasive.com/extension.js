
const St = imports.gi.St;
const Main = imports.ui.main;
const Extension = imports.misc.extensionUtils.getCurrentExtension();

const UEFIIndicator = Extension.imports.indicator.UEFIIndicator;
const Utils = Extension.imports.Utils;

let indicator;

function init() {
    Utils.log("Main", "initialized");
}

function enable() {
    if(typeof indicator == 'undefined') {
        indicator = new UEFIIndicator();    
    }

    Main.panel.addToStatusArea(indicator.name, indicator, "right");

    Utils.log("Main", "enable() was called");
}

function disable() {
    Utils.log("Main", "disable() was called");
}
