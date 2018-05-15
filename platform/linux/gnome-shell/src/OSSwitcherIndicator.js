const Lang = imports.Lang;
const Extension = imports.misc.extensionUtils.getCurrentExtension();
const CustomButton = Extension.imports.indicators.button.CustomButton;

var OSSwitcherIndicator = Lang.Class({
    Name: 'OSSwitcherIndicator',
    Extends: CustomButton,

    _init: function() {
        this.parent('OSSwitcherIndicator');

        this.menu.actor.add_style_class_name('aggregate-menu');
    }
});