/**
 * Created by shxy on 2018/1/18.
 */
;(function ( $, window, document, undefined ) {

    var pluginName = "defaultPluginName",
        defaults = {
            propertyName: "value"
        };

    function Plugin ( element, options ) {
        this.element = element;
        this.settings = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    $.extend(Plugin.prototype, {
        init: function () {

            this.yourOtherFunction( this.settings.propertyName );
        },
        yourOtherFunction: function ( text ) {
            // some logic
            $( this.element ).text( text );
        }
    });

    $.fn[ pluginName ] = function ( options ) {
        this.each(function() {
            if ( !$.data( this, "plugin_" + pluginName ) ) {
                $.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
            }
        });

        // 方便链式调用
        return this;
    };

})( jQuery, window, document );