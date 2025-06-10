/**
 * jDocumentary Fullscreen Module
 * Plugin pour la gestion des images en plein écran
 * Basé sur Supersized - Fullscreen Background jQuery Plugin
 */

$.fn.jFullscreen = function(config) {
    var self = this;
    self.addClass("jdocumentary-fullscreen");
    
    this.width = 0;
    this.height = 0;
    
    this.setConfig = function(options) {
        options = $.extend({}, $.fn.jFullscreen.defaults, options);
        
        this.im = $("<img/>")
            .attr("src", options.img)
            .bind("load", function() {
                var image = $(this);
                if ("onLoad" in options) {
                    options.onLoad(image);
                }
                
                self.find("*").remove();
                self.append(image);
                
                setTimeout(function() {
                    self.width = self.im.get(0).width;
                    self.height = self.im.get(0).height;
                    if ("onReady" in options) {
                        options.onReady($(this));
                    }
                }, 10);
                
                options.screen.addLoadedResource(options.img);
                
                if (options.protect) {
                    $(this).bind("contextmenu", function() {
                        return false;
                    });
                    $(this).bind("mousedown", function() {
                        return false;
                    });
                }
            })
            .bind("error", function(event) {
                if ("onError" in options) {
                    options.onError(event);
                }
            })
            .bind("resizer", function() {
                var originalWidth = self.im.get(0).width;
                var originalHeight = self.im.get(0).height;
                var windowWidth = $(window).width();
                var windowHeight = $(window).height();
                var ratio = (originalHeight / originalWidth).toFixed(2);
                var windowRatio = (windowHeight / windowWidth).toFixed(2);
                
                var thisSlide = $(this);
                
                if (ratio > windowRatio) {
                    thisSlide.height('100%');
                } else {
                    thisSlide.width('100%');
                }
                
                // Calcul des dimensions finales
                var finalWidth = $(this).width() > 0 ? $(this).width() : originalWidth;
                var finalHeight = $(this).height() > 0 ? $(this).height() : originalHeight;
                
                // Alignement horizontal
                switch (options.horizontal_align) {
                    case "left":
                        $(this).css("left", 0);
                        break;
                    case "right":
                        $(this).css("left", windowWidth - finalWidth);
                        break;
                    case "center":
                        $(this).css("left", (windowWidth - finalWidth) / 2);
                        break;
                    default:
                        alert("jDocumentary error: horizontal position '" + options.horizontal_align + "' unsupported");
                }
                
                // Alignement vertical
                switch (options.vertical_align) {
                    case "top":
                        $(this).css("top", 0);
                        break;
                    case "bottom":
                        $(this).css("top", windowHeight - finalHeight);
                        break;
                    case "center":
                        $(this).css("top", (windowHeight - finalHeight) / 2);
                        break;
                    default:
                        alert("jDocumentary error: vertical position '" + options.vertical_align + "' unsupported");
                }
            });
        
        if (options.screen.isResourceLoaded(options.img)) {
            this.im.trigger("load");
        }
    };
    
    this.setConfig(config);
    return this;
};

// Paramètres par défaut pour le plugin fullscreen
$.fn.jFullscreen.defaults = {
    min_width: 100,
    min_height: 100,
    fit_portrait: true,
    fit_landscape: true,
    horizontal_align: "center",
    vertical_align: "center",
    protect: true
};