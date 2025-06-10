/**
 * jDocumentary Layer Module
 * Gestion des couches individuelles dans les pages
 */

$.fn.jLayer = function(layerData, page, layerIndex) {
    var self = this;
    this.data = layerData;
    this.page = page;
    this.readyRequired = 0;
    this.readyCount = 0;
    this.displayed = false;
    this.allreadyLoaded = false;
    
    // Configuration de base de la couche
    this.addClass("jdocumentary-layer");
    this.attr("layerid", page.name() + "." + layerIndex)
        .attr("layername", "name" in layerData ? layerData.name : "layer" + Math.round(Math.random() * 100000))
        .attr("pagename", page.name());
    
    // Classes CSS
    if ("name" in layerData) {
        this.addClass("page" + ucfirst(page.name()) + "_layer" + ucfirst(layerData.name));
    }
    this.addClass("page" + ucfirst(page.name()) + "_layer")
        .addClass("page" + ucfirst(page.name()) + "_layer" + layerIndex);
    
    this.css("z-index", 2 + layerIndex);
    
    if ("content" in layerData && layerData.content) {
        this.addClass("jdocumentary-content");
    }
    
    if ("preloadPictures" in layerData) {
        this.addClass("jdocumentary-contentpreload");
    }
    
    if ("tagClass" in layerData) {
        this.addClass(layerData.tagClass);
    }
    
    if ("style" in layerData) {
        this.attr("style", this.attr("style") + ";" + layerData.style);
    }
    
    // Méthodes de la couche
    this.name = function() {
        return this.attr("layername");
    };
    
    this.initContent = function() {
        this.readyRequired = 0;
        if ("html" in this.data) {
            var element = $("<div>").html(this.data.html);
            this.readyRequired = element.find("img").length;
        } else if ("preloadPictures" in this.data) {
            this.readyRequired = this.data.preloadPictures.length;
        }
        
        if (this.readyRequired <= 0) {
            this.readyRequired = 1;
        }
        return this;
    };
    
    this.nextReady = function() {
        this.readyCount++;
        if (this.readyCount > this.readyRequired) {
            throw "Bug#001| In Layer " + $(this).attr("layerid") + ": " + this.readyRequired + " element(s) to load, " + this.readyCount + " are ready (too many).";
        }
        
        if ("preloadPictures" in layerData) {
            if (this.readyCount == this.readyRequired) {
                this.animate({
                    width: "+100%"
                }, 200, "linear", function() {
                    self.layerReady();
                });
            } else {
                this.animate({
                    width: "+" + Math.round(this.readyCount / this.readyRequired * 100) + "%"
                }, 100, "linear");
            }
        } else {
            if (this.readyCount == this.readyRequired) {
                this.layerReady();
            }
        }
        return this;
    };
    
    this.layerReady = function() {
        this.allreadyLoaded = true;
        this.readyCount = 0;
        self.trigger("layerContentReady");
    };
    
    this.setContent = function(content) {
        this.find("*").remove();
        
        // Configuration des dimensions
        if ("width" in content) this.css("width", content.width);
        if ("height" in content) this.css("height", content.height);
        if ("minWidth" in content) this.css("min-width", content.minWidth);
        if ("minHeight" in content) this.css("min-height", content.minHeight);
        if ("maxWidth" in content) this.css("max-width", content.maxWidth);
        if ("maxHeight" in content) this.css("max-height", content.maxHeight);
        
        // Configuration de l'alignement et des marges
        if (!("background" in layerData)) {
            if ("halign" in content) {
                this.bind("resize", function() {
                    self.halign();
                });
            }
            if ("valign" in content) {
                this.bind("resize", function() {
                    self.valign();
                });
            }
            if ("marginTop" in layerData) this.css("marginTop", layerData.marginTop);
            if ("marginRight" in layerData) this.css("marginRight", layerData.marginRight);
            if ("marginBottom" in layerData) this.css("marginBottom", layerData.marginBottom);
            if ("marginLeft" in layerData) this.css("marginLeft", layerData.marginLeft);
        }
        
        // Gestion du contenu HTML
        if ("html" in content) {
            this._setHtmlContent(content);
        } else if ("background" in content) {
            this._setBackgroundContent(content);
        } else if ("youtube" in content) {
            this._setYouTubeContent(content);
        } else if ("map" in content) {
            this._setMapContent(content);
        } else if ("preloadPictures" in content) {
            this._setPreloadContent(content);
        } else {
            this.nextReady();
        }
        
        return this;
    };
    
    this._setHtmlContent = function(content) {
        this.html(content.html);
        if (!this.allreadyLoaded) {
            var images = this.find("img");
            if (images.length == 0) {
                self.nextReady();
            } else {
                images.each(function() {
                    if (self.page.screen.isResourceLoaded($(this).attr("src"))) {
                        self.nextReady();
                        return;
                    }
                    $(this).load(function() {
                        self.page.screen.addLoadedResource($(this).attr("src"));
                        self.nextReady();
                    }).error(function() {
                        alert("[jDocumentary Error]\nUnable to load image file: " + $(this).attr("src"));
                        self.nextReady();
                    });
                });
            }
        } else {
            this.readyRequired = 1;
            self.nextReady();
        }
    };
    
    this._setBackgroundContent = function(content) {
        var fit = "fit" in content ? content.fit : "both";
        var config = {
            img: content.background,
            vertical_align: "valign" in content ? content.valign : "top",
            horizontal_align: "halign" in content ? content.halign : "left",
            fit_portrait: (fit == "portrait" || fit == "both"),
            fit_landscape: (fit == "landscape" || fit == "both")
        };
        
        this.bind("resize", function() {
            if (self.im && self.im.length > 0) {
                self.im.trigger("resizer");
            }
        });
        
        config.screen = page.screen;
        config.onReady = function() {
            // Forcer un redimensionnement après chargement pour la page intro
            if (page.name() === 'intro' || page.name() === 'root') {
                setTimeout(function() {
                    console.log('🔄 Force resize pour page:', page.name());
                    $(window).trigger('resize');
                }, 300);
            }
            self.nextReady();
        };
        config.onError = function() {
            alert("[jDocumentary Error]\nUnable to load image file: " + config.img);
            self.nextReady();
        };
        
        if (this.setConfig) {
            this.setConfig(config);
        } else {
            this.jFullscreen(config);
        }
    };
    
    this._setYouTubeContent = function(content) {
        this.addClass("jdocumentary-youtubevideo");
        var videoLoop = "videoLoop" in this.data ? (this.data.videoLoop ? "1" : "0") : "0";
        var videoControls = "videoControls" in this.data ? (this.data.videoControls ? "1" : "0") : "0";
        var playerId = "ytplayer" + Math.round(Math.random() * 10000);
        var videoId = this.data.youtube;
        var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        var height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        
        $("<iframe>")
            .attr("id", playerId)
            .attr("type", "text/html")
            .attr("width", width - 20)
            .attr("height", height - 20)
            .attr("frameborder", 0)
            .attr("src", "https://www.youtube.com/embed/" + videoId + "?enablejsapi=1&autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0")
            .appendTo(this);
        
        self.nextReady();
    };
    
    this._setMapContent = function(content) {
        this.addClass("jdocumentary-googlemap");
        var place = content.map.split(' ');
        var markers = "markers" in this.data ? this.data.markers : [];
        var zoom = "zoom" in this.data ? this.data.zoom : 10;
        var polyline = "flightPlanCoordinates" in this.data;
        var flightPlanCoordinates = "flightPlanCoordinates" in this.data ? this.data.flightPlanCoordinates : [];
        
        $("<div>").attr("id", "map").appendTo(this);
        
        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: zoom,
            center: new google.maps.LatLng(place[0], place[1]),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });
        
        // Ajout du polyline si nécessaire
        if (polyline) {
            var flightPath = new google.maps.Polyline({
                path: flightPlanCoordinates,
                geodesic: true,
                strokeColor: '#FF0000',
                strokeOpacity: 1.0,
                strokeWeight: 2
            });
            flightPath.setMap(map);
        }
        
        // Ajout des marqueurs
        markers.forEach(function(coords, index) {
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(coords[1], coords[2]),
                map: map
            });
            
            marker._infowindow = new google.maps.InfoWindow({content: coords[0]});
            var onEnter = (coords.length == 5) ? coords[4] : false;
            var showWindow = (coords.length == 5) ? coords[3] : false;
            
            google.maps.event.addListener(marker, 'click', function() {
                this._infowindow.open(map, this);
            });
            
            if (onEnter) {
                google.maps.event.addListener(marker, 'mouseover', function() {
                    this._infowindow.setZIndex(1000);
                    this._infowindow.open(map, this);
                });
                google.maps.event.addListener(marker, 'mouseout', function() {
                    this._infowindow.setZIndex(0);
                    this._infowindow.close();
                });
            }
            
            if (showWindow) {
                google.maps.event.trigger(marker, 'click');
            }
        });
        
        self.nextReady();
    };
    
    this._setPreloadContent = function(content) {
        this.width(0);
        for (var i = 0, len = content.preloadPictures.length; i < len; i++) {
            var src = content.preloadPictures[i];
            if (self.page.screen.isResourceLoaded(src)) {
                self.nextReady();
                continue;
            }
            $("<img />").attr("src", src).bind("load", function() {
                self.page.screen.addLoadedResource($(this).attr("src"));
                self.nextReady();
            }).bind("error", function(event) {
                alert("[jDocumentary Error]\nUnable to load image file: " + $(this).attr("src"));
                self.nextReady();
            });
        }
    };
    
    // Affichage de la couche
    this.layerDisplay = function() {
        if (this.displayed) {
            return this;
        }
        this.displayed = true;
        
        var effect = "appearEffect" in layerData ? layerData.appearEffect : "none";
        var delay = "appearDelay" in layerData ? layerData.appearDelay : 1500;
        var onAppear = "onAppear" in layerData ? layerData.onAppear : null;
        
        switch (effect) {
            case "fade":
                this.fadeTo(0, 0);
                this.css("visibility", "visible");
                if (onAppear) {
                    this.fadeTo(delay, 1, function() {
                        onAppear(self, page, page.screen);
                    });
                } else {
                    this.fadeTo(delay, 1);
                }
                break;
            case "slide":
                if (onAppear) {
                    this.show(delay, function() {
                        onAppear(self, page, page.screen);
                    });
                } else {
                    this.show(delay);
                }
                break;
            default:
                $(this).css("visibility", "visible");
                if (onAppear != null) {
                    onAppear(this, page, page.screen);
                }
        }
        
        if ("effect" in layerData) {
            if (layerData.effect == "typing") {
                this.jTypeWriter().startWriting();
            }
        }
        
        this.trigger("layerAppear");
        
        // Gestion spéciale pour les images de fond
        if (layerData.background != undefined) {
            // Masquer les messages de préchargement
            $.each(this.page.layers, function (index, layer) {
                if (layer.data.preloadPictures != undefined) {
                    layer.fadeTo(500, 0);
                }
                if (layer.data.tagClass == "jdocumentary-preloadmsg") {  
                    layer.fadeTo(500, 0);
                }
            });
            
            // Ajouter l'événement de clic
            var layerSelf = this;
            $(this).on("click", function() {
                // Masquer tout le texte, seul l'arrière-plan est visible
                $.each(layerSelf.page.layers, function (index, layer) {
                    if (layer.data.background == undefined) {
                        layer.toggle(1000);
                    }
                });
            });
        }
        
        return this;
    };
    
    // Événement de déchargement
    this.bind("unload", function() {
        this.displayed = false;
        if ("effect" in layerData) {
            if (layerData.effect == "typing") {
                if (this.stopWriting) {
                    this.stopWriting();
                }
            }
        }
    });
    
    // Alignement vertical
    this.valign = function() {
        switch (this.data.valign) {
            case "top":
                this.removeClass("jdocumentary-position-bottom").addClass("jdocumentary-position-top");
                break;
            case "center":
                this.css("top", "50%");
                this.css("marginTop", -1 * this.height() / 2 - page.screen.commands.height());
                break;
            case "bottom":
                this.removeClass("jdocumentary-position-top").addClass("jdocumentary-position-bottom");
                break;
        }
        return this;
    };
    
    // Alignement horizontal
    this.halign = function() {
        switch (this.data.halign) {
            case "left":
                this.removeClass("jdocumentary-position-right").addClass("jdocumentary-position-left");
                break;
            case "center":
                this.css("left", "50%");
                this.css("marginLeft", -1 * this.width() / 2);
                break;
            case "right":
                this.removeClass("jdocumentary-position-left").addClass("jdocumentary-position-right");
                break;
        }
        return this;
    };
    
    return this;
};

// Types de contenu
$.fn.jLayer.CONTENT_TYPE = {
    html: "html",
    video: "video",
    map: "map",
    background: "background"
};