if (typeof jQuery == "undefined") {
    alert("Error: you must import the jQuery file before jDocumentary")
}
$.fn.jDocumentary = function(b) {
    if ($.fn.jDocumentary.INSTANCE != null) {
        return $.fn.jDocumentary.INSTANCE
    }
    $.fn.jDocumentary.INSTANCE = this;
    window["$$"] = this;
    if (b.scenario == null) {
        alert("[jDocumentary error]\nDont forget to link the scenario file");
        return null
    }
    if (this.length !== 1 || this[0] !== document.body) {
        console.error("[jDocumentary error] jDocumentary must be used on <body> only.");
        return null;
    }
    this.currentState = null;
    this.state = function(f) {
        if (f) {
            this.currentState = f
        } else {
            return this.currentState
        }
    };
    this.state($.fn.jDocumentary.STATE.init);
    var c = this;
    this.opts = {};
    this.opts = $.extend({}, $.fn.jDocumentary.DEFAULTS, b);
    this.sce = new jScenario(b.scenario.pages, this);
    this.playlist = [];
    $.each(b.scenario.playlist, function (index, value) {
        c.playlist.push({mp3: value});
    });
    // force to preload all images
    $.each(b.scenario.pages, function (index, page) {
        havePreload = false;
        haveTagClass = false;
        imgToLoad = undefined;
        $.each(page.layers, function (index, layer) {
            if (layer.preloadPictures != undefined){
                havePreload = true;
            }
            if (layer.tagClass == "jdocumentary-preloadmsg"){  
                haveTagClass = true;
            }
            if (layer.background != undefined){
                imgToLoad = layer.background;
            }
        });
        if (!havePreload && imgToLoad != undefined) {
            var l = {
                    "preloadPictures": [imgToLoad],
                    "visible": true
                };
            page.layers.push(l);
        }
        if (!haveTagClass && imgToLoad != undefined) {
            var l = {
                "html": "Chargement...",
                "visible": true,
                "tagClass": "jdocumentary-preloadmsg"
            };
            page.layers.push(l);
        }
    });
    if (window.location.protocol == "file:") {
        var d = window.location.protocol + "//" + window.location.hostname + window.location.pathname;
        while (d.substr(d.length - 1, 1) != "/") {
            d = d.substr(0, d.length - 1)
        }
    } else {
        var d = window.location.protocol + "//" + window.location.hostname + window.location.pathname
    }
    if (this.opts.globalPath != null) {
        d = this.opts.globalPath
    } else {
        this.opts.globalPath = d
    }
    this.player = new jPlayer(this);
    this.page = function(f) {
        return this.sce.find(f)
    };
    this.currentPage = function() {
        return this.player.current
    };
    this.nextPage = function() {
        return this.sce.next(this.player.current);
    };
    this.firstPage = function() {
        return this.sce.first();
    };
    this.previousPage = function() {
        return this.sce.previous(this.player.current);
    };
    this.seen = function(f) {
        return this.player.seen(f)
    };
    this.play = function(f) {
        location.hash = "#" + f;
        return this
    };
    document.title = this.opts.scenario.title;
    this.attr("id", "jdocumentary-screen");
    this.attr("role", "main");
    this.displayCommands = $.fn.jDocumentary.displayCommands;
    this.displayAbout = $.fn.jDocumentary.displayAbout;
    this.displayOverlay = $.fn.jDocumentary.displayOverlay;
    this.removeOverlay = $.fn.jDocumentary.removeOverlay;
    this.displayNavigator = $.fn.jDocumentary.displayNavigator;
    this.start = function() {
        if (this.state() != $.fn.jDocumentary.STATE.init) {
            throw "jDocumentary Exception: multiple jDocumentary.start() calls"
        }
        this.state($.fn.jDocumentary.STATE.starting);
        this.currentScreenSize = $(window).width() + "x" + $(window).height();
        $("#jdocumentary-screen > *:not(.jdocumentary-persistant)").remove();
        $(window).bind("resize", function() {
            c.resize()
        });
        $(document).keydown(function(h) {
            switch (h.keyCode) {
                case 40:
                case 39:
                    if ("right" in c.currentPage().data()) {
                        c.play(c.currentPage().data().right)
                    } else if (c.opts.enableAutoNav) {
                        c.play(c.nextPage().data().name)
                    }
                    break;
                case 38:
                case 37:
                    if ("left" in c.currentPage().data()) {
                        c.play(c.currentPage().data().left)
                    } else if (c.opts.enableAutoNav) {
                        c.play(c.previousPage().data().name)
                    }
                    break
            }
        });
        $(window).bind("hashchange", function(h) {
            if (location.hash == "") {
                c.player.play("root", true)
            } else {
                c.player.play(location.hash.substr(1), true)
            }
            return false
        });
        if ("analyticsTracker" in this.opts && this.opts.analyticsTracker != null) {
            window._gaq = window._gaq || [];
            window._gaq.push(["_setAccount", "" + this.opts.analyticsTracker], ["_trackPageview"]);
            this.bind("pagechanged", function(h, k) {
                window._gaq.push(["_trackEvent", c.opts.analyticsEventName, "PageChange", "" + k.name()])
            });
            var g = document.createElement("script");
            g.type = "text/javascript";
            g.async = true;
            g.src = ("https:" == document.location.protocol ? "https://ssl" : "http://www") + ".google-analytics.com/ga.js";
            var f = document.getElementsByTagName("script")[0];
            f.parentNode.insertBefore(g, f)
        }
        this.displayCommands(this);
        this.displayNavigator(this);
        this.state($.fn.jDocumentary.STATE.ready);
        this.soundMgr.init();
        this.soundMgr.setPlaylist(this.playlist);
        $(window).trigger("hashchange")
    };
    this.resize = function() {
        var f = $(window).width() + "x" + $(window).height();
        if (f == this.currentScreenSize) {
            return
        }
        this.currentScreenSize = $(window).width() + "x" + $(window).height();
        if (this.player.current != null) {
            this.player.current.resize()
        }
        return
    };
    this.loaded = [];
    this.isResourceLoaded = function(f) {
        for (p in this.loaded) {
            if (this.loaded[p] === f) {
                return true
            }
        }
        return false
    };
    this.addLoadedResource = function(f) {
        if (!this.isResourceLoaded(f)) {
            this.loaded.push(f)
        }
        return this
    };
    var e = $("<div>").addClass("jdocumentary-persistant").addClass("jdocumentary-soundplayer").appendTo(this);
    this.soundMgr = new jSoundManager();
    this.getSoundManager = function() {
        return this.soundMgr
    };
    if (window.addEventListener) {
        window.addEventListener("message", function(f) {
            switch (f.data) {
                case "start":
                    if (c.started) {
                        f.source.postMessage("ERROR start: Allready started", f.origin);
                        return
                    }
                    f.source.postMessage("OK start", f.origin);
                    c.start();
                    break
            }
        }, false)
    }
    if (location.hash == "#embedded") {
        this.addClass("jdocumentary-embedded");
        $("body > *:not(.jdocumentary-persistant)").remove();
        this.displayOverlay();
        this.append($("<a>").attr("href", "javascript:;").addClass("jdocumentary-start").click(function() {
            c.removeOverlay();
            location.hash = "#root";
            c.start()
        }))
    } else {
        this.start()
    }
    return this
};
$.fn.jDocumentary.INSTANCE = null;
$.fn.jDocumentary.DEFAULTS = {
    scenario: null,
    globalPath: null,
    commandsPosition: null,
    homeButtonGo: "root",
    navigation: null,
    analyticsTracker: null,
    analyticsEventName: "jDocumentary",
    enableAutoNav: true
};
$.fn.jDocumentary.LANG = {
    button: "Button ",
    close: "Close",
    musicButton: " Music control ",
    playButton: " Play/Pause ",
    muteButton: " Mute/UnMute ",
    previousButton: " Previous ",
    nextButton: " Next ",
    stopButton: " Stop ",
    volumeMinusButton: " Volume - ",
    volumePlusButton: " Volume + ",
    homeButton: " Home ",
    wait: "Please wait...",
    by: "A documentary by "
};
$.fn.jDocumentary.STATE = {
    init: "init",
    starting: "starting",
    pagechange: "pagechange",
    ready: "ready"
};

function ucfirst(b) {
    if (b.length > 0) {
        return b[0].toUpperCase() + b.substring(1)
    } else {
        return b
    }
}
$.fn.jDocumentary.displayCommands = function(b) {
    var c = $("<div>").appendTo(this);
    this.commands = c;
    c.addClass("jdocumentary-persistant").addClass("jdocumentary-commands").attr("id", "jdocumentary-commands").attr("role", "navigation").attr("unselectable", "on").css("MozUserSelect", "none").append($("<a>").html("&nbsp;").attr("title", $.fn.jDocumentary.LANG.wait).attr("id", "jdocumentary-command-wait").addClass("jdocumentary-command-wait").hide());
    if ("commandsPosition" in this.opts && this.opts.commandsPosition != null) {
        c.addClass("jdocumentary-position-" + this.opts.commandsPosition)
    }
    c.append($("<a>").html("&nbsp;").attr("title", $.fn.jDocumentary.LANG.homeButton).attr("id", "jdocumentary-command-home").click(function() {
        b.play(b.opts.homeButtonGo)
    }));
    c.append($("<a>").html("&nbsp;").attr("title", $.fn.jDocumentary.LANG.aboutButton).attr("id", "jdocumentary-command-about").click(function() {
        b.displayAbout(false, b)
    }));
    c.append($("<a>").html("&nbsp;").attr("title", $.fn.jDocumentary.LANG.volumePlusButton).attr("id", "jdocumentary-command-volume-plus").addClass("jdocumentary-command-music").addClass("jdocumentary-command-volume-plus").click(function() {
        b.getSoundManager().volumePlus();
    }));
    c.append($("<a>").html("&nbsp;").attr("title", $.fn.jDocumentary.LANG.volumeMinusButton).attr("id", "jdocumentary-command-volume-minus").addClass("jdocumentary-command-music").addClass("jdocumentary-command-volume-minus").click(function() {
        b.getSoundManager().volumeMinus();
    }));
    c.append($("<a>").html("&nbsp;").attr("title", $.fn.jDocumentary.LANG.nextButton).attr("id", "jdocumentary-command-next").addClass("jdocumentary-command-music").addClass("jdocumentary-command-next").click(function() {
        b.getSoundManager().next();
    }));
    c.append($("<a>").html("&nbsp;").attr("title", $.fn.jDocumentary.LANG.previousButton).attr("id", "jdocumentary-command-previous").addClass("jdocumentary-command-music").addClass("jdocumentary-command-previous").click(function() {
        b.getSoundManager().previous();
    }));
    c.append($("<a>").html("&nbsp;").attr("title", $.fn.jDocumentary.LANG.stopButton).attr("id", "jdocumentary-command-stop").addClass("jdocumentary-command-music").addClass("jdocumentary-command-stop").click(function() {
        b.getSoundManager().stop();
    }));
    c.append($("<a>").html("&nbsp;").attr("title", $.fn.jDocumentary.LANG.muteButton).attr("id", "jdocumentary-command-mute").addClass("jdocumentary-command-music").addClass("jdocumentary-command-mute").click(function() {
        b.getSoundManager().toggleMute();
        $(this).toggleClass("jdocumentary-command-unmute")
    }));
    c.append($("<a>").html("&nbsp;").attr("title", $.fn.jDocumentary.LANG.playButton).attr("id", "jdocumentary-command-play").addClass("jdocumentary-command-music").addClass("jdocumentary-command-play").click(function() {
        b.getSoundManager().togglePlay();
        $(this).toggleClass("jdocumentary-command-pause")
    }));
    c.append($("<a>").html("&nbsp;").attr("title", $.fn.jDocumentary.LANG.musicButton).attr("id", "jdocumentary-command-music").addClass("jdocumentary-command-music").addClass("jdocumentary-command-music-control"));
};
$.fn.jDocumentary.displayAbout = function(c, b) {
    this.find("div.jdocumentary-dialog-about").remove();
    this.displayOverlay();
    var d = $("<div>").appendTo(this).addClass("jdocumentary-dialog-about").append("<h1>&laquo; " + this.opts.scenario.title + " &raquo;</h1>").append("<blockquote>" + $.fn.jDocumentary.LANG.by + this.opts.scenario.author + "</blockquote>");
    d.append("<p>" + this.opts.scenario.description + "</p>")
    d.append($("<a>").html($.fn.jDocumentary.LANG.close).click(function() {
        b.removeOverlay();
        $(this).parent().remove()
    }))
};
$.fn.jDocumentary.displayOverlay = function() {
    this.removeOverlay();
    this.append('<div id="jdocumentary-overlay"></div>');
    return this
};
$.fn.jDocumentary.removeOverlay = function() {
    this.find("#jdocumentary-overlay").remove();
    return this
};
$.fn.jDocumentary.displayRightLeftButtons = function(d, c, b, a) {
    if ("left" in d.data()) {
        $("<a>").attr("id", "jdocumentary-leftnav").attr("unselectable", "on").css("MozUserSelect", "none").html("").click(function() {
            c.play(d.data().left)
        }).prependTo(b)
    } else if (a) {
        $("<a>").attr("id", "jdocumentary-leftnav").attr("unselectable", "on").css("MozUserSelect", "none").html("").click(function() {
            c.play(c.previousPage().data().name)
        }).prependTo(b)
    }
    if ("right" in d.data()) {
        $("<a>").attr("id", "jdocumentary-rightnav").attr("unselectable", "on").css("MozUserSelect", "none").html("").click(function() {
            c.play(d.data().right)
        }).prependTo(b)
    } else if (a) {
        $("<a>").attr("id", "jdocumentary-rightnav").attr("unselectable", "on").css("MozUserSelect", "none").html("").click(function() {
            c.play(c.nextPage().data().name)
        }).prependTo(b)
    }
};
$.fn.jDocumentary.displayNavigator = function(b) {
    this.navigator = null;
    if (this.opts.scenario.navigation != null) {
        this.navigator = $("<div>").addClass("jdocumentary-persistant").addClass("jdocumentary-navigation").attr("role", "navigation");
        for (var e = 0, d = this.opts.scenario.navigation.length; e < d; e++) {
            var g = this.opts.scenario.navigation[e];
            var c = g;
            var f = this.page(g);
            if (f != null && "title" in f.data()) {
                c = f.data().title
            }
            $("<a>").addClass("jdocumentary-navigation-item").addClass("jdocumentary-navigation-item-" + e).attr("go", g).append(c).click(function() {
                b.play($(this).attr("go"))
            }).appendTo(this.navigator)
        }
        this.append(this.navigator);
        this.find(".jdocumentary-commands").mouseenter(function() {
            if (!b.navigator.attr("bottom")) {
                b.navigator.attr("bottom", parseInt(b.navigator.css("bottom")));
                b.navigator.attr("height", parseInt(b.navigator.css("height")))
            }
            var h = parseInt(b.navigator.attr("bottom")) + parseInt(b.navigator.attr("height"));
            b.navigator.animate({
                bottom: h + "px"
            })
        });
        this.navigator.mouseleave(function() {
            $(this).animate({
                bottom: $(this).attr("bottom") + "px"
            })
        });
        this.bind("pagechange", function() {
            if (!$.browser.msie) {
                b.navigator.trigger("mouseleave")
            }
        })
    }
};
$.fn.jDocumentary.displayPagesButtons = function(e, c, b) {
    if ("buttons" in e.data()) {
        ul = $("<ul>").addClass("jdocumentary-buttons").addClass("jdocumentary-position-" + ("buttonsPosition" in e.data() ? e.data().buttonsPosition : "bottomright")).fadeTo(0, 0);
        buttons = e.data().buttons;
        for (var d = 0; d < buttons.length; d++) {
            bt = buttons[d];
            if (!bt) {
                continue
            }
            if ("ifNotSeenPage" in bt) {
                if (this.seen(bt.ifNotSeenPage)) {
                    continue
                }
            }
            if ("ifSeenPage" in bt) {
                if (!this.seen(bt.ifSeenPage)) {
                    continue
                }
            }
            if ("isPrevPageIs" in bt) {
                if (this.previous == null || this.previous.data().name != bt) {
                    continue
                }
            }
            if ("isPrevPageIsNot" in bt) {
                if (this.previous != null && this.previous.data().name == bt) {
                    continue
                }
            }
            if ("label" in bt) {
                ul.append($("<li>").addClass("jdocumentary-button-label").html(bt.label));
                continue
            }
            if ("trips" in bt) {
                a = $("<a>").attr("href", "../../index.html").attr("target", "_self").html("title" in bt ? bt.title : $.fn.jDocumentary.lang.button + " " + (d + 1));
            } else {
                a = $("<a>").attr("play", bt.go).attr("unselectable", "on").css("MozUserSelect", "none").click(function() {
                    c.play($(this).attr("play"))
                }).html("title" in bt ? bt.title : $.fn.jDocumentary.lang.button + " " + (d + 1));
            }
            ul.append($("<li>").addClass("jdocumentary-button").append(a))
        }
        b.append(ul);
        ul.fadeTo(3000, 1)
    }
};
jPlayer = function(b) {
    var c = this;
    this.previous = null;
    this.current = null;
    this.pages = [];
    this.currentIndex = 0;
    this.seenPages = [];
    this.seen = function(d) {
        for (var e = 0; e < this.seenPages.length; e++) {
            if (this.seenPages[e] == d) {
                return true
            }
        }
        return false
    };
    this.previous = function() {
        return this.previous;
    };
    this.displayPagesButtons = $.fn.jDocumentary.displayPagesButtons;
    this.displayRightLeftButtons = $.fn.jDocumentary.displayRightLeftButtons;
    this.play = function(d) {
        var e = b.page(d);
        if (e == null) {
            alert("[jDocumentary Error]\nPage not found: " + d);
            return
        }
        if (this.current != null && d == this.current.name()) {
            return
        }
        b.state($.fn.jDocumentary.STATE.pagechange);
        b.trigger("pagechange", e);
        $("#jdocumentary-command-wait").show();
        this.previous = this.current;
        this.current = e;
        if (this.previous != null) {
            this.previous.div.detach();
            this.previous.trigger("unload");
            b.trigger("pageunload", this.previous);
            if ("onUnload" in this.previous.data()) {
                this.previous.data().onUnload(b, this.previous, e)
            }
        }
        e.one("contentloaderror", function() {
            alert("Erreur lors du chargement de la page")
        });
        e.one("contentloaded", function() {
            if (c.current.name() != this.name()) {
                return
            }
            this.show()

        });
        e.one("ready", function() {
            if (c.current.name() != this.name()) {
                return
            }
            c.seenPages.push(this.name());
            b.state($.fn.jDocumentary.STATE.ready);
            $("#jdocumentary-command-wait").hide();
            b.trigger("pagechanged", e);
            e.trigger("start");
            if ("onStart" in this.data()) {
                e.data().onStart(b, this)
            }
        });
        b.prepend(e.div);
        if ("onLoad" in e.data()) {
            e.data().onLoad(b, this.previous, e)
        }
        e.load();
        if ("title" in e.data()) {
            document.title = e.data().title
        }
        this.displayPagesButtons(e, b, e.div);
        this.displayRightLeftButtons(e, b, e.div, b.opts.enableAutoNav);
       
        return
    };
    return this
};
$.fn.jLayer = function(e, d, b) {
    var c = this;
    this.data = e;
    this.page = d;
    this.readyRequired = 0;
    this.readyCount = 0;
    this.displayed = false;
    this.allreadyLoaded = false;
    this.addClass("jdocumentary-layer");
    this.attr("layerid", d.name() + "." + b).attr("layername", "name" in e ? e.name : "layer" + Math.round(Math.random() * 100000)).attr("pagename", d.name());
    if ("name" in e) {
        this.addClass("page" + ucfirst(d.name()) + "_layer" + ucfirst(e.name))
    }
    this.addClass("page" + ucfirst(d.name()) + "_layer").addClass("page" + ucfirst(d.name()) + "_layer" + b);
    this.css("z-index", 2 + b);
    if ("content" in e && e.content) {
        this.addClass("jdocumentary-content")
    }
    if ("preloadPictures" in e) {
        this.addClass("jdocumentary-contentpreload");
    }
    if ("tagClass" in e) {
        this.addClass(e.tagClass)
    }
    if ("style" in e) {
        this.attr("style", this.attr("style") + ";" + e.style)
    }
    this.name = function() {
        return this.attr("layername")
    };
    this.initContent = function() {
        this.readyRequired = 0;
        if ("html" in this.data) {
            element = $("<div>").html(this.data.html)
            this.readyRequired = element.find("img").length
        } else {
            if ("preloadPictures" in this.data) {
                this.readyRequired = this.data.preloadPictures.length
            }
        }
        if (this.readyRequired <= 0) {
            this.readyRequired = 1
        }
        return this
    };
    this.nextReady = function() {
        this.readyCount++;
        if (this.readyCount > this.readyRequired) {
            throw "Bug#001| In Layer " + $(this).attr("layerid") + ": " + this.readyRequired + " element(s) to load, " + this.readyCount + " are ready (too many)."
        }
        if ("preloadPictures" in e) {
            if (this.readyCount == this.readyRequired) {
                this.animate({
                    width: "+100%"
                }, 200, "linear", function() {
                    c.layerReady()
                })
            } else {
                this.animate({
                    width: "+" + Math.round(this.readyCount / this.readyRequired * 100) + "%"
                }, 100, "linear")
            }
        } else {
            if (this.readyCount == this.readyRequired) {
                this.layerReady()
            }
        }
        return this
    };
    this.layerReady = function() {
        this.allreadyLoaded = true;
        this.readyCount = 0;
        c.trigger("layerContentReady")
    };
    this.setContent = function(q) {
        this.find("*").remove();
        if ("width" in q) {
            this.css("width", q.width)
        }
        if ("height" in q) {
            this.css("height", q.height)
        }
        if ("minWidth" in q) {
            this.css("min-width", q.minWidth)
        }
        if ("minHeight" in q) {
            this.css("min-height", q.minHeight)
        }
        if ("maxWidth" in q) {
            this.css("max-width", q.maxWidth)
        }
        if ("maxHeight" in q) {
            this.css("max-height", q.maxHeight)
        }
        if (!("background" in e)) {
            if ("halign" in q) {
                this.bind("resize", function() {
                    c.halign()
                })
            }
            if ("valign" in q) {
                this.bind("resize", function() {
                    c.valign()
                })
            }
            if ("marginTop" in e) {
                this.css("marginTop", e.marginTop)
            }
            if ("marginRight" in e) {
                this.css("marginRight", e.marginRight)
            }
            if ("marginBottom" in e) {
                this.css("marginBottom", e.marginBottom)
            }
            if ("marginLeft" in e) {
                this.css("marginLeft", e.marginLeft)
            }
        }
        if ("html" in q) {
            this.html(q.html);
            if (!this.allreadyLoaded) {
                var o = this.find("img");
                if (o.length == 0) {
                    c.nextReady()
                } else {
                    o.each(function() {
                        if (c.page.screen.isResourceLoaded($(this).attr("src"))) {
                            c.nextReady();
                            return
                        }
                        $(this).load(function() {
                            c.page.screen.addLoadedResource($(this).attr("src"));
                            c.nextReady()
                        }).error(function() {
                            alert("[jDocumentary Error]\nUnable to load image file: " + $(this).attr("src"));
                            c.nextReady()
                        })
                    })
                }
            } else {
                this.readyRequired = 1;
                c.nextReady()
            }
        } else {
            if ("background" in q) {
                var n = "fit" in q ? q.fit : "both";
                var k = {
                    img: q.background,
                    vertical_align: "valign" in q ? q.valign : "top",
                    horizontal_align: "halign" in q ? q.halign : "left",
                    fit_portrait: (n == "portrait" || n == "both"),
                    fit_landscape: (n == "landscape" || n == "both")
                };
                this.bind("resize", function() {
                    c.im.trigger("resizer")
                });
                k.screen = d.screen;
                k.onReady = function() {
                    c.nextReady()
                };
                k.onError = function() {
                    alert("[jDocumentary Error]\nUnable to load image file: " + k.img);
                    c.nextReady()
                };
                if (this.setConfig) {
                    this.setConfig(k)
                } else {
                    this.jFullscreen(k)
                }
            } else {
                if ("youtube" in q) {
                    this.addClass("jdocumentary-youtubevideo");
                    var f = "videoLoop" in this.data ? (this.data.videoLoop ? "1" : "0") : "0";
                    var g = "videoControls" in this.data ? (this.data.videoControls ? "1" : "0") : "0";
                    playerid = "ytplayer" + Math.round(Math.random() * 10000);
                    var vid = this.data.youtube;
                    var width = window.innerWidth
                    || document.documentElement.clientWidth
                    || document.body.clientWidth;
                    var height = window.innerHeight
                    || document.documentElement.clientHeight
                    || document.body.clientHeight;
                    $("<iframe>").attr("id", playerid).attr("type", "text/html").attr("width", width-20).attr("height", height-20).attr("frameborder", 0).attr("src", "https://www.youtube.com/embed/"+vid+"?enablejsapi=1&autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0").appendTo(this);
                    c.nextReady()
                } else if ("map" in q){
					this.addClass("jdocumentary-googlemap");
                    var place = q.map.split(' ');
                    var markers = "markers" in this.data ? this.data.markers : [];
                    var zoom = "zoom" in this.data ? this.data.zoom : 10;
                    var polyline = "flightPlanCoordinates" in this.data;
					/* forme que doit avoir flightPlanCoordinates : [
                        {lat: 37.772, lng: -122.214},
                        {lat: 21.291, lng: -157.821},
                        {lat: -18.142, lng: 178.431},
                        {lat: -27.467, lng: 153.027}
                    ];*/
                    var flightPlanCoordinates = "flightPlanCoordinates" in this.data ? this.data.flightPlanCoordinates : [];
                    $("<div>").attr("id", "map").appendTo(this);
                    var map = new google.maps.Map(document.getElementById('map'), {
                        zoom: zoom,
                        center: new google.maps.LatLng(place[0], place[1]),
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                    });
                    var marker, i;
                    if (polyline){
                        var flightPath = new google.maps.Polyline({
                            path: flightPlanCoordinates,
                            geodesic: true,
                            strokeColor: '#FF0000',
                            strokeOpacity: 1.0,
                            strokeWeight: 2
                        });
                        flightPath.setMap(map);
                    } 
                    markers.forEach( function( coords, index ) {
                        marker = new google.maps.Marker({
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
							google.maps.event.trigger(marker,'click');
						} 
                    });
                    c.nextReady();
                } else {
                    if ("preloadPictures" in q) {
                        this.width(0);
                        for (var h = q.preloadPictures.length, m = 0; m < h; m++) {
                            src = q.preloadPictures[m];
                            if (c.page.screen.isResourceLoaded(src)) {
                                c.nextReady();
                                continue
                            }
                            $("<img />").attr("src", src).bind("load", function() {
                                c.page.screen.addLoadedResource($(this).attr("src"));
                                c.nextReady()
                            }).bind("error", function(r) {
                                alert("[jDocumentary Error]\nUnable to load image file: " + $(this).attr("src"));
                                c.nextReady()
                            })
                        }
                    } else {
                        this.nextReady()
                    }
                }
            }
        }
        return this
    };
    this.layerDisplay = function() {
        if (this.displayed) {
            return this
        }
        this.displayed = true;
        var f = "appearEffect" in e ? e.appearEffect : "none";
        var h = "appearDelay" in e ? e.appearDelay : 1500;
        var g = "onAppear" in e ? e.onAppear : null;
        switch (f) {
            case "fade":
                this.fadeTo(0, 0);
                this.css("visibility", "visible");
                if (g) {
                    this.fadeTo(h, 1, function() {
                        g(c, d, d.screen)
                    })
                } else {
                    this.fadeTo(h, 1)
                }
                break;
            case "slide":
                if (g) {
                    this.show(h, function() {
                        g(c, d, d.screen)
                    })
                } else {
                    this.show(h)
                }
                break;
            default:
                $(this).css("visibility", "visible");
                if (g != null) {
                    g(this, d, d.screen)
                }
        }
        if ("effect" in e) {
            f = "none";
            if (e.effect == "typing") {
                this.jTypeWriter().startWriting()
            }
        }
        this.trigger("layerAppear");
        if (e.background != undefined){
            // hide preload msg
            $.each(this.page.layers, function (index, value) {
                if (value.data.preloadPictures != undefined){
                    value.fadeTo(500, 0);
                }
                if (value.data.tagClass == "jdocumentary-preloadmsg"){  
                    value.fadeTo(500, 0);
                }
            });
            // add click event
            var _this = this;
            $( this ).on( "click", function() {
                // hide all text, only the background is visible
                $.each(_this.page.layers, function (index, value) {
                    if (value.data.background == undefined){
                        value.toggle(1000);
                    }
                });
              });
        }
        return this
    };
    this.bind("unload", function() {
        this.displayed = false;
        if ("effect" in e) {
            if (e.effect == "typing") {
                if (this.stopWriting) {
                    this.stopWriting()
                }
            }
        }
    });
    this.valign = function() {
        switch (this.data.valign) {
            case "top":
                this.removeClass("jdocumentary-position-bottom").addClass("jdocumentary-position-top");
                break;
            case "center":
                this.css("top", "50%");
                this.css("marginTop", -1 * this.height() / 2 - d.screen.commands.height());
                break;
            case "bottom":
                this.removeClass("jdocumentary-position-top").addClass("jdocumentary-position-bottom");
                break
        }
        return this
    };
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
                break
        }
        return this
    };
    return this
};
$.fn.jLayer.CONTENT_TYPE = {
    html: "html",
    video: "video",
    map: "map",
    background: "background"
};
var youTubePlayerStateChange = {};
var youTubePlayerError = {};
onYouTubePlayerReady = function(b) {
    var e = document.getElementById(b);
    var c = $.fn.jDocumentary.INSTANCE;
    var d = $(e).parent();
    var f = c.page(d.attr("pagename"));
    d = f.layer(d.attr("layername"));
    d.ytPlayer = e;
    youTubePlayerStateChange[b] = function(g) {
        if (g == 0) {
            if ("onVideoEnded" in d.data) {
                b.getSoundManager().unMute();
                d.data.onVideoEnded(d, f, c)
            }
        }
    };
    youTubePlayerError[b] = function(g) {
        if ("onVideoError" in d.data) {
            d.data.onVideoError(d, f, c, g)
        }
    };
    if (!$.browser.msie) {
        e.addEventListener("onStateChange", "youTubePlayerStateChange." + b);
        e.addEventListener("onError", "youTubePlayerError." + b)
    }
    e.cueVideoById(d.data.youtube, 0, "small");
    e.playVideo();
    e.setVolume(c.getSoundManager().volume);
    if (c.getSoundManager().isMuted) {
        e.mute()
    }
    if ("onVideoStarted" in d.data) {
        b.getSoundManager().mute();
        d.data.onVideoStarted(d, f, c)
    }
};
jScenario = function(scenarioPages, screen) {
    this.pages = [];
    for (var i = 0; i < scenarioPages.length; i++) {
        var page = scenarioPages[i];
        if (!page) {
            continue
        }
        //page, screen
        this.pages.push(new jPage(page, screen))
    }
    this.first = function() {
        if (this.pages.length>0){
            return this.pages[0]
        }
        return null
    };
    this.find = function(g) {
        for (var i = 0; i < this.pages.length; i++) {
            if (this.pages[i].name() == g) {
                return this.pages[i]
            }
        }
        return null
    };
    this.next = function(currentJPage) {
        for (var i = 0; i < this.pages.length; i++) {
            if (this.pages[i].name() == currentJPage.name()) {
                if ((i + 1) < this.pages.length) {
                    return this.pages[i + 1];
                } else {
                    return this.pages[0];
                }
            }
        }
        return null
    };
    this.previous = function(g) {
        for (var h = 0; h < this.pages.length; h++) {
            if (this.pages[h].name() == g.name()) {
                if ((h - 1) > 0) {
                    return this.pages[h - 1];
                } else {
                    return this.pages[this.pages.length - 1];
                }
            }
        }
        return null
    };
    return this
};

function jPage(page, screen) {
    if (!("name" in page)) {
        alert("[jDocumentary Error]\nMissing page name");
        throw "Missing page name"
    }
    if (page.name == "embedded") {
        alert("[jDocumentary Error]\nInvalid page name: embedded");
        throw "Invalid page name: embedded"
    }
    var d = new RegExp("^[\\w-]+$", "i");
    if (!d.test(page.name)) {
        alert("[jDocumentary Error]\nInvalid page name: " + page.name + "\n(only alphanum, dash and underscore are allowed)");
        throw "Invalid page name: " + page.name
    }
    var _this = this;
    this.screen = screen;
    this.contentsAllreadyLoaded = false;
    this.currentScreenSize = null;
    this.layerReadyCount = 0;
    this.div = $("<div>").addClass("jdocumentary-page").attr("pagename", page.name);
    this.name = function() {
        return page.name
    };
    this.data = function() {
        return page
    };
    this.listeners = [];
    this.one = function(f, g) {
        return this.bind(f, g, true)
    };
    this.bind = function(g, h, f) {
        if (jQuery.type(g) != "string") {
            return this
        }
        if (jQuery.type(h) != "function") {
            return this
        }
        this.listeners.push({
            event: g,
            callback: h,
            one: f === true
        });
        return this
    };
    this.trigger = function(k, m) {
        for (var h = 0, g = this.listeners.length; h < g; h++) {
            var f = this.listeners[h];
            if (!f) {
                continue
            }
            if (f.event == k || f.event == "*") {
                this.thread = f.callback;
                this.thread(k, m);
                if (f.one) {
                    this.listeners.splice(h, 1)
                }
            }
        }
        this.thread = null;
        return this
    };
    this.unbind = function(k, m) {
        if (k && m) {
            for (var h = 0, g = this.listeners.length; h < g; h++) {
                var f = this.listeners[h];
                if (!f) {
                    continue
                }
                if ((f.event == k || k == "*") && f.callback == m) {
                    this.listeners.splice(h, 1)
                }
            }
        } else {
            if (k) {
                for (var h = 0, g = this.listeners.length; h < g; h++) {
                    var f = this.listeners[h];
                    if (!f) {
                        continue
                    }
                    if (f.event == k || k == "*") {
                        this.listeners.splice(h, 1)
                    }
                }
            } else {
                this.listeners = []
            }
        }
        return this
    };
    this.layers = [];
    this.layer = function(g) {
        for (var f = this.layers.length, h = 0; h < f; h++) {
            if (this.layers[h].name() == g) {
                return this.layers[h]
            }
        }
        return null
    };
    this.bind("resize", function() {
        for (var f = this.layers.length, g = 0; g < f; g++) {
            _this.layers[g].trigger("resize")
        }
    });
    this.bind("unload", function() {
        for (var f = this.layers.length, g = 0; g < f; g++) {
            this.layers[g].trigger("unload")
        }
    });
    this.load = function() {
        this.trigger("load");

        
        if (this.contentsAllreadyLoaded || page.layers.length == 0) {
            this.trigger("contentloaded");
            if (screen.currentPage() == screen.firstPage()){
                screen.play(screen.nextPage().name());
            }
            return
        }
        s = page.layers.length;
        if (this.layers.length < 1) {
            for (i = 0; i < s; i++) {
                l = page.layers[i];
                if (!l) {
                    continue
                }
                layer = $("<div>").jLayer(l, this, i);
                this.layers.push(layer)
            }
        }
        this.layerReadyCount = 0;
        for (i = 0; i < s; i++) {
            this.layers[i].trigger("load").initContent()
        }
        for (i = 0; i < s; i++) {
            this.div.append(this.layers[i])
        }
        for (i = 0; i < s; i++) {
            this.layers[i].one("layerContentReady", function() {
                _this.layerReadyCount++;
                if (_this.layerReadyCount > _this.layers.length) {
                    throw "Bug#002| In Page " + _this.name() + ": " + _this.layers.length + " layers(s) to init, " + _this.layerReadyCount + " are ready (too many)."
                }
                if (_this.layerReadyCount == _this.layers.length) {
                    _this.contentsAllreadyLoaded = true;
                    _this.trigger("contentloaded");
                    if (screen.currentPage() == screen.firstPage()){
                        screen.play(screen.nextPage().name());
                    }
                }
            })
        }
        for (i = 0; i < s; i++) {
            layer = this.layers[i];
            if ("visible" in layer.data) {
                if (layer.data.visible) {
                    layer.setContent(layer.data)
                } else {
                    layer.hide().setContent(layer.data)
                }
            } else {
                layer.css("visibility", "hidden").setContent(layer.data)
            }
        }
    };
    this.show = function() {
        this.resize();
        for (i = 0, j = this.layers.length; i < j; i++) {
            layer = this.layers[i];
            if ("visible" in layer.data && !layer.data.visible) {} else {
                layer.layerDisplay()
            }
        }
        this.trigger("ready")
    };
    this.resize = function() {
        var f = $(window).width() + "x" + $(window).height();
        if (f == this.currentScreenSize) {
            return false
        }
        this.currentScreenSize = $(window).width() + "x" + $(window).height();
        for (i = 0, j = this.layers.length; i < j; i++) {
            this.layers[i].trigger("resize")
        }
        return this
    };
    return this
}
/*!
 * jDocumentary Fullscreen plugin
 *
 * Based on
 *   Supersized - Fullscreen Background jQuery Plugin
 *   Version 3.1.3 Core
 *   By Sam Dunn / One Mighty Roar (www.onemightyroar.com)
 *   Released under MIT License / GPL License
 */
$.fn.jFullscreen = function(c) {
    var b = this;
    b.addClass("jdocumentary-fullscreen");
    this.width = 0;
    this.height = 0;
    this.setConfig = function(d) {
        d = $.extend({}, $.fn.jFullscreen.defaults, d);
        this.im = $("<img/>").attr("src", d.img).bind("load", function() {
            var e = $(this);
            if ("onLoad" in d) {
                d.onLoad(e)
            }
            b.find("*").remove();
            b.append(e);
            setTimeout(function() {
                b.width = b.im.get(0).width;
                b.height = b.im.get(0).height;
                if ("onReady" in d) {
                    d.onReady($(this))
                }
            }, 10);
            d.screen.addLoadedResource(d.img);
            if (d.protect) {
                $(this).bind("contextmenu", function() {
                    return false
                });
                $(this).bind("mousedown", function() {
                    return false
                })
            }
        }).bind("error", function(f) {
            if ("onError" in d) {
                d.onError(f)
            }
        }).bind("resizer", function() {
            var h = b.im.get(0).width;
            var e = b.im.get(0).height;
            var f = $(window).width();
            var m = $(window).height();
            var g = (e / h).toFixed(2);
            var g2 = (m / f).toFixed(2);

            thisSlide = $(this);
            if (g > g2) {
                thisSlide.height('100%');
            } else {
                thisSlide.width('100%');
            }
            /*
                        if ((m <= d.min_height) && (f <= d.min_width)) {
                            if ((m / f) > g) {
                                d.fit_landscape && g <= 1 ? k(true) : n(true)
                                } else {
                                d.fit_portrait && g > 1 ? n(true) : k(true)
                                }
                        } else {
                            if (f <= d.min_width) {
                                if ((m / f) > g) {
                                    d.fit_landscape && g <= 1 ? k(true) : n()
                                    } else {
                                    d.fit_portrait && g > 1 ? n() : k(true)
                                    }
                            } else {
                                if (m <= d.min_height) {
                                    if ((m / f) > g) {
                                        d.fit_landscape && g <= 1 ? k() : n(true)
                                        } else {
                                        d.fit_portrait && g > 1 ? n(true) : k()
                                        }
                                } else {
                                    if ((m / f) > g) {
                                        d.fit_landscape && g <= 1 ? k() : n()
                                        } else {
                                        d.fit_portrait && g > 1 ? n() : k()
                                        }
                                }
                            }
                        }
            */
            function k(o) {
                if (o) {
                    if (h < f || h < d.min_width) {
                        if (h * g >= d.min_height) {
                            thisSlide.width(d.min_width);
                            thisSlide.height(h * g)
                        } else {
                            n()
                        }
                    }
                } else {
                    if (d.min_height >= m && !d.fit_landscape) {
                        if (f * g >= d.min_height || (f * g >= d.min_height && g <= 1)) {
                            thisSlide.width(f);
                            thisSlide.height(f * g)
                        } else {
                            if (g > 1) {
                                thisSlide.height(d.min_height);
                                thisSlide.width(h / g)
                            } else {
                                if (h < f) {
                                    thisSlide.width(f);
                                    thisSlide.height(h * g)
                                }
                            }
                        }
                    } else {
                        thisSlide.width(f);
                        thisSlide.height(f * g)
                    }
                }
            }

            function n(o) {
                if (o) {
                    if (h < m) {
                        if (h / g >= d.min_width) {
                            thisSlide.height(d.min_height);
                            thisSlide.width(h / g)
                        } else {
                            k(true)
                        }
                    }
                } else {
                    if (d.min_width >= f) {
                        if (m / g >= d.min_width || g > 1) {
                            thisSlide.height(m);
                            thisSlide.width(m / g)
                        } else {
                            if (g <= 1) {
                                thisSlide.width(d.min_width);
                                thisSlide.height(h * g)
                            }
                        }
                    } else {
                        thisSlide.height(m);
                        thisSlide.width(m / g)
                    }
                }
            }
            if ($(this).width() > 0) {
                h = $(this).width()
            }
            if ($(this).height() > 0) {
                e = $(this).height()
            }
            switch (d.horizontal_align) {
                case "left":
                    $(this).css("left", 0);
                    break;
                case "right":
                    $(this).css("left", f - h);
                    break;
                case "center":
                    $(this).css("left", (f - h) / 2);
                    break;
                default:
                    alert("jDocumentary error: horizontal position '" + d.horizontal_center + "' unspported")
            }
            switch (d.vertical_align) {
                case "top":
                    $(this).css("top", 0);
                    break;
                case "bottom":
                    $(this).css("top", m - e);
                    break;
                case "center":
                    $(this).css("top", (m - e) / 2);
                    break;
                default:
                    alert("jDocumentary error: vertical position '" + d.horizontal_center + "' unspported")
            }
        });
        if (d.screen.isResourceLoaded(d.img)) {
            this.im.trigger("load")
        }
    };
    this.setConfig(c);
    return this
};
$.fn.jFullscreen.defaults = {
    min_width: 100,
    min_height: 100,
    fit_portrait: true,
    fit_landscape: true,
    horizontal_align: "center",
    vertical_align: "center",
    protect: true
}

jSoundManager = function() {
    var b = this;
    this.myPlaylist = null;
    this.player = null;
    this.onReady = null;
    this.currentVolume = 0.3;
	this.mute = false;
	this.play = false;
    this.isReady = function() {
        return this.myPlaylist != null
    };

    this.init = function() {
        this.myPlaylist = new jPlayerPlaylist({
            jPlayer: "#mp3Reader",
            cssSelectorAncestor: "#jukebox"
        }, [], {
            playlistOptions: {
                enableRemoveControls: false
            },
            swfPath: "jplayer/jplayer",
            volume: this.currentVolume,
            supplied: "mp3"
        });
        this.player = $("#mp3Reader");
        this.restoreOnReady()
    };

    this.restoreOnReady = function() {
        if (this.isReady()) {
            if (this.onReady != null) {
                this.togglePlay();
                this.changeVolume();
                this.onReady = null
            }
        }
    };

    this.setPlaylist = function(list) {
        this.myPlaylist.setPlaylist(list);
    };

    this.toggleMute = function() {
        this.player.jPlayer("mute", !this.mute);
        this.mute = !this.mute;
    };

    this.changeVolume = function() {
        this.player.jPlayer("volume", this.currentVolume);
    };

    this.volumeMinus = function() {
        if (this.currentVolume > 0) {
            this.currentVolume = this.currentVolume - 0.1;
            this.player.jPlayer("volume", this.currentVolume);
        }
    };

    this.volumePlus = function() {
        if (this.currentVolume < 1) {
            this.currentVolume = this.currentVolume + 0.1;
            this.player.jPlayer("volume", this.currentVolume);
        }
    };

    this.volumeMax = function() {
        this.currentVolume = 1;
        this.player.jPlayer("volume", this.currentVolume);
    };

    this.previous = function() {
        this.myPlaylist.previous();
        this.play = true;
    };

    this.togglePlay = function() {
        if (!this.play) {
            this.myPlaylist.play();
        } else {
            this.myPlaylist.pause();
        }
        this.play = !this.play;
    };

    this.stop = function() {
        this.player.jPlayer("stop");
        this.play = false;
    };

    this.next = function() {
        this.myPlaylist.next();
        this.play = true;
    };
    return this
};