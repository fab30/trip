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
            .css({
                'position': 'absolute',
                'top': '0',
                'left': '0',
                'visibility': 'hidden' // Masquer pendant le chargement
            })
            .bind("load", function() {
                var image = $(this);
                
                // Attendre que l'image soit complètement chargée
                setTimeout(function() {
                    if ("onLoad" in options) {
                        options.onLoad(image);
                    }
                    
                    self.find("*").remove();
                    self.append(image);
                    
                    // Obtenir les dimensions naturelles de l'image
                    self.width = image[0].naturalWidth || image[0].width;
                    self.height = image[0].naturalHeight || image[0].height;
                    
                    console.log('🖼️ Image chargée:', self.width + 'x' + self.height);
                    
                    // Afficher l'image
                    image.css('visibility', 'visible');
                    
                    // Premier redimensionnement
                    image.trigger("resizer");
                    
                    // Redimensionnement après un court délai pour être sûr
                    setTimeout(function() {
                        image.trigger("resizer");
                        if ("onReady" in options) {
                            options.onReady(image);
                        }
                    }, 100);
                    
                }, 50); // Petit délai pour s'assurer que l'image est dans le DOM
                
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
                console.error('❌ Erreur chargement image:', options.img);
                if ("onError" in options) {
                    options.onError(event);
                }
            })
            .bind("resizer", function() {
                var originalWidth = self.width || self.im[0].naturalWidth || self.im[0].width;
                var originalHeight = self.height || self.im[0].naturalHeight || self.im[0].height;
                var windowWidth = $(window).width();
                var windowHeight = $(window).height();
                
                // Vérifier que nous avons des dimensions valides
                if (!originalWidth || !originalHeight) {
                    console.warn('⚠️ Dimensions image non disponibles, retry...');
                    setTimeout(function() {
                        $(self.im).trigger("resizer");
                    }, 100);
                    return;
                }
                
                var ratio = originalHeight / originalWidth;
                var windowRatio = windowHeight / windowWidth;
                
                var thisSlide = $(this);
                
                // Réinitialiser les dimensions
                thisSlide.css({
                    'width': 'auto',
                    'height': 'auto',
                    'max-width': 'none',
                    'max-height': 'none'
                });
                
                // Logique de redimensionnement améliorée
                if (ratio > windowRatio) {
                    // Image plus haute que large par rapport à la fenêtre
                    thisSlide.css({
                        'height': windowHeight + 'px',
                        'width': 'auto'
                    });
                } else {
                    // Image plus large que haute par rapport à la fenêtre
                    thisSlide.css({
                        'width': windowWidth + 'px',
                        'height': 'auto'
                    });
                }
                
                // Attendre que le CSS soit appliqué avant de calculer la position
                setTimeout(function() {
                    // Calcul des dimensions finales après redimensionnement CSS
                    var finalWidth = thisSlide.width();
                    var finalHeight = thisSlide.height();
                    
                    // Alignement horizontal
                    switch (options.horizontal_align) {
                        case "left":
                            thisSlide.css("left", 0);
                            break;
                        case "right":
                            thisSlide.css("left", windowWidth - finalWidth);
                            break;
                        case "center":
                            thisSlide.css("left", (windowWidth - finalWidth) / 2);
                            break;
                        default:
                            thisSlide.css("left", (windowWidth - finalWidth) / 2);
                    }
                    
                    // Alignement vertical
                    switch (options.vertical_align) {
                        case "top":
                            thisSlide.css("top", 0);
                            break;
                        case "bottom":
                            thisSlide.css("top", windowHeight - finalHeight);
                            break;
                        case "center":
                            thisSlide.css("top", (windowHeight - finalHeight) / 2);
                            break;
                        default:
                            thisSlide.css("top", (windowHeight - finalHeight) / 2);
                    }
                    
                    console.log('📐 Image repositionnée:', finalWidth + 'x' + finalHeight, 
                              'à la position:', thisSlide.css('left') + ',' + thisSlide.css('top'));
                }, 10);
            });
        
        // Démarrer le chargement
        if (options.screen.isResourceLoaded(options.img)) {
            console.log('🔄 Image déjà en cache, trigger load');
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