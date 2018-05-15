const Lang = imports.Lang;
const Extension = imports.misc.extensionUtils.getCurrentExtension();
const CustomButton = Extension.imports.indicators.button.CustomButton;

var SwitcherIndicator = Lang.Class({
    Name: 'SwitcherIndicator',
    Extends: CustomButton,

    _init: function() {
        this.parent('SwitcherIndicator');

        this.menu.actor.add_style_class_name('aggregate-menu');
    }
});