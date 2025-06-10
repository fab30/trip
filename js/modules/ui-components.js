/**
 * jDocumentary UI Components Module
 * Composants d'interface utilisateur (boutons, commandes, navigation, etc.)
 */

// Affichage des commandes
$.fn.jDocumentary.displayCommands = function(screen) {
    var commands = $("<div>").appendTo(this);
    this.commands = commands;
    
    commands.addClass("jdocumentary-persistant")
        .addClass("jdocumentary-commands")
        .attr("id", "jdocumentary-commands")
        .attr("role", "navigation")
        .attr("unselectable", "on")
        .css("MozUserSelect", "none")
        .append($("<a>")
            .html("&nbsp;")
            .attr("title", $.fn.jDocumentary.LANG.wait)
            .attr("id", "jdocumentary-command-wait")
            .addClass("jdocumentary-command-wait")
            .hide()
        );
    
    if ("commandsPosition" in this.opts && this.opts.commandsPosition != null) {
        commands.addClass("jdocumentary-position-" + this.opts.commandsPosition);
    }
    
    // Bouton Home
    commands.append($("<a>")
        .html("&nbsp;")
        .attr("title", $.fn.jDocumentary.LANG.homeButton)
        .attr("id", "jdocumentary-command-home")
        .click(function() {
            screen.play(screen.opts.homeButtonGo);
        })
    );
    
    // Bouton About
    commands.append($("<a>")
        .html("&nbsp;")
        .attr("title", $.fn.jDocumentary.LANG.aboutButton)
        .attr("id", "jdocumentary-command-about")
        .click(function() {
            screen.displayAbout(false, screen);
        })
    );
    
    // Contrôles audio
    commands.append($("<a>")
        .html("&nbsp;")
        .attr("title", $.fn.jDocumentary.LANG.volumePlusButton)
        .attr("id", "jdocumentary-command-volume-plus")
        .addClass("jdocumentary-command-music")
        .addClass("jdocumentary-command-volume-plus")
        .click(function() {
            screen.getSoundManager().volumePlus();
        })
    );
    
    commands.append($("<a>")
        .html("&nbsp;")
        .attr("title", $.fn.jDocumentary.LANG.volumeMinusButton)
        .attr("id", "jdocumentary-command-volume-minus")
        .addClass("jdocumentary-command-music")
        .addClass("jdocumentary-command-volume-minus")
        .click(function() {
            screen.getSoundManager().volumeMinus();
        })
    );
    
    commands.append($("<a>")
        .html("&nbsp;")
        .attr("title", $.fn.jDocumentary.LANG.nextButton)
        .attr("id", "jdocumentary-command-next")
        .addClass("jdocumentary-command-music")
        .addClass("jdocumentary-command-next")
        .click(function() {
            screen.getSoundManager().next();
        })
    );
    
    commands.append($("<a>")
        .html("&nbsp;")
        .attr("title", $.fn.jDocumentary.LANG.previousButton)
        .attr("id", "jdocumentary-command-previous")
        .addClass("jdocumentary-command-music")
        .addClass("jdocumentary-command-previous")
        .click(function() {
            screen.getSoundManager().previous();
        })
    );
    
    commands.append($("<a>")
        .html("&nbsp;")
        .attr("title", $.fn.jDocumentary.LANG.stopButton)
        .attr("id", "jdocumentary-command-stop")
        .addClass("jdocumentary-command-music")
        .addClass("jdocumentary-command-stop")
        .click(function() {
            screen.getSoundManager().stop();
        })
    );
    
    commands.append($("<a>")
        .html("&nbsp;")
        .attr("title", $.fn.jDocumentary.LANG.muteButton)
        .attr("id", "jdocumentary-command-mute")
        .addClass("jdocumentary-command-music")
        .addClass("jdocumentary-command-mute")
        .click(function() {
            screen.getSoundManager().toggleMute();
            $(this).toggleClass("jdocumentary-command-unmute");
        })
    );
    
    commands.append($("<a>")
        .html("&nbsp;")
        .attr("title", $.fn.jDocumentary.LANG.playButton)
        .attr("id", "jdocumentary-command-play")
        .addClass("jdocumentary-command-music")
        .addClass("jdocumentary-command-play")
        .click(function() {
            screen.getSoundManager().togglePlay();
            $(this).toggleClass("jdocumentary-command-pause");
        })
    );
    
    commands.append($("<a>")
        .html("&nbsp;")
        .attr("title", $.fn.jDocumentary.LANG.musicButton)
        .attr("id", "jdocumentary-command-music")
        .addClass("jdocumentary-command-music")
        .addClass("jdocumentary-command-music-control")
    );
};

// Affichage de la boîte de dialogue "À propos"
$.fn.jDocumentary.displayAbout = function(param, screen) {
    this.find("div.jdocumentary-dialog-about").remove();
    this.displayOverlay();
    
    var dialog = $("<div>")
        .appendTo(this)
        .addClass("jdocumentary-dialog-about")
        .append("<h1>&laquo; " + this.opts.scenario.title + " &raquo;</h1>")
        .append("<blockquote>" + $.fn.jDocumentary.LANG.by + this.opts.scenario.author + "</blockquote>");
    
    dialog.append("<p>" + this.opts.scenario.description + "</p>");
    dialog.append($("<a>")
        .html($.fn.jDocumentary.LANG.close)
        .click(function() {
            screen.removeOverlay();
            $(this).parent().remove();
        })
    );
};

// Affichage de l'overlay
$.fn.jDocumentary.displayOverlay = function() {
    this.removeOverlay();
    this.append('<div id="jdocumentary-overlay"></div>');
    return this;
};

// Suppression de l'overlay
$.fn.jDocumentary.removeOverlay = function() {
    this.find("#jdocumentary-overlay").remove();
    return this;
};

// Affichage des boutons gauche/droite
$.fn.jDocumentary.displayRightLeftButtons = function(page, screen, container, autoNav) {
    if ("left" in page.data()) {
        $("<a>")
            .attr("id", "jdocumentary-leftnav")
            .attr("unselectable", "on")
            .css("MozUserSelect", "none")
            .html("")
            .click(function() {
                screen.play(page.data().left);
            })
            .prependTo(container);
    } else if (autoNav) {
        $("<a>")
            .attr("id", "jdocumentary-leftnav")
            .attr("unselectable", "on")
            .css("MozUserSelect", "none")
            .html("")
            .click(function() {
                screen.play(screen.previousPage().data().name);
            })
            .prependTo(container);
    }
    
    if ("right" in page.data()) {
        $("<a>")
            .attr("id", "jdocumentary-rightnav")
            .attr("unselectable", "on")
            .css("MozUserSelect", "none")
            .html("")
            .click(function() {
                screen.play(page.data().right);
            })
            .prependTo(container);
    } else if (autoNav) {
        $("<a>")
            .attr("id", "jdocumentary-rightnav")
            .attr("unselectable", "on")
            .css("MozUserSelect", "none")
            .html("")
            .click(function() {
                screen.play(screen.nextPage().data().name);
            })
            .prependTo(container);
    }
};

// Affichage du navigateur
$.fn.jDocumentary.displayNavigator = function(screen) {
    this.navigator = null;
    
    if (this.opts.scenario.navigation != null) {
        this.navigator = $("<div>")
            .addClass("jdocumentary-persistant")
            .addClass("jdocumentary-navigation")
            .attr("role", "navigation");
        
        for (var i = 0, len = this.opts.scenario.navigation.length; i < len; i++) {
            var pageName = this.opts.scenario.navigation[i];
            var title = pageName;
            var page = this.page(pageName);
            
            if (page != null && "title" in page.data()) {
                title = page.data().title;
            }
            
            $("<a>")
                .addClass("jdocumentary-navigation-item")
                .addClass("jdocumentary-navigation-item-" + i)
                .attr("go", pageName)
                .append(title)
                .click(function() {
                    screen.play($(this).attr("go"));
                })
                .appendTo(this.navigator);
        }
        
        this.append(this.navigator);
        
        // Animation du navigateur
        this.find(".jdocumentary-commands").mouseenter(function() {
            if (!screen.navigator.attr("bottom")) {
                screen.navigator.attr("bottom", parseInt(screen.navigator.css("bottom")));
                screen.navigator.attr("height", parseInt(screen.navigator.css("height")));
            }
            var newBottom = parseInt(screen.navigator.attr("bottom")) + parseInt(screen.navigator.attr("height"));
            screen.navigator.animate({
                bottom: newBottom + "px"
            });
        });
        
        this.navigator.mouseleave(function() {
            $(this).animate({
                bottom: $(this).attr("bottom") + "px"
            });
        });
        
        this.bind("pagechange", function() {
            if (!$.browser.msie) {
                screen.navigator.trigger("mouseleave");
            }
        });
    }
};

// Affichage des boutons de pages
$.fn.jDocumentary.displayPagesButtons = function(page, screen, container) {
    if ("buttons" in page.data()) {
        var ul = $("<ul>")
            .addClass("jdocumentary-buttons")
            .addClass("jdocumentary-position-" + ("buttonsPosition" in page.data() ? page.data().buttonsPosition : "bottomright"))
            .fadeTo(0, 0);
        
        var buttons = page.data().buttons;
        
        for (var i = 0; i < buttons.length; i++) {
            var button = buttons[i];
            if (!button) {
                continue;
            }
            
            // Conditions d'affichage des boutons
            if ("ifNotSeenPage" in button) {
                if (this.seen(button.ifNotSeenPage)) {
                    continue;
                }
            }
            if ("ifSeenPage" in button) {
                if (!this.seen(button.ifSeenPage)) {
                    continue;
                }
            }
            if ("isPrevPageIs" in button) {
                if (this.previous == null || this.previous.data().name != button.isPrevPageIs) {
                    continue;
                }
            }
            if ("isPrevPageIsNot" in button) {
                if (this.previous != null && this.previous.data().name == button.isPrevPageIsNot) {
                    continue;
                }
            }
            
            // Bouton label
            if ("label" in button) {
                ul.append($("<li>")
                    .addClass("jdocumentary-button-label")
                    .html(button.label)
                );
                continue;
            }
            
            // Bouton avec lien externe
            var anchor;
            if ("trips" in button) {
                anchor = $("<a>")
                    .attr("href", "../../index.html")
                    .attr("target", "_self")
                    .html("title" in button ? button.title : $.fn.jDocumentary.LANG.button + " " + (i + 1));
            } else {
                anchor = $("<a>")
                    .attr("play", button.go)
                    .attr("unselectable", "on")
                    .css("MozUserSelect", "none")
                    .click(function() {
                        screen.play($(this).attr("play"));
                    })
                    .html("title" in button ? button.title : $.fn.jDocumentary.LANG.button + " " + (i + 1));
            }
            
            ul.append($("<li>")
                .addClass("jdocumentary-button")
                .append(anchor)
            );
        }
        
        container.append(ul);
        ul.fadeTo(3000, 1);
    }
};