

class User {
    
    loggedin() {
        return (!!this.data || false)
    }
    
    id() {
        return parseInt(this.data.user_id) * 8412
    }
    
    constructor() {
        this.data = localStorage.getObj('user');
        if(this.loggedin())
            GG.screen.trigger("show-main");
        else
            GG.screen.trigger("show-login");
    }
    
    login() {
        
        let username = $("#username").val();
        let password = $("#password").val();
        let t = this;
        
        $.get(GG.api+"login", {u:username, p:password}, function(d) {
            
            if(d.success == true) {
                localStorage.setObj('user', d);
                USER.data = localStorage.getObj('user');
                GG.screen.trigger("show-main");
                GG.screen.trigger("list-all");
                GG.screen.trigger("list-autoload");
            } else {
                GG.screen.trigger("error-login");
            }
            
        }, 'json');
    }
    
    logout() {
        delete localStorage.user;
        this.data = null;
        GG.screen.trigger("show-login");
    }
    
}

class SessionProject {
    
    constructor(project) {
        this.project = project;
    }
    
    load(id){
        $.get(GG.api+"getproject", {
            uname:USER.data.username, 
            uid:USER.id(), 
            token:"MCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwk", 
            project_id:id
        }, function(d) {
            
            console.log(unserialize(d));
            
        });
    }
    
    save(){
        
    }
    
}



class Search {
    
    constructor() {
        this.close();
    }
    
    generate_list(d) {
        if(d.length > 0) {
            for(var i in d) {
                let view = new View("views/listrow.html").setPlace("search .list").setData(d[i]);
                GG.views.push(view);
                view.setEvents(function(){
                    $("#"+view.id).find(".entity-list-item").on("click", function(){
                        GG.setEditedProject(d[i]);
                        /*
                        GG.view_search.hide();
                        GG.view_list.hide();
                        GG.view_project.show();    
                        */
                    });
                }).render();
            }
        } else {
            //null_rows();
        }
    }
    
    search() {
        
        let t = this;
        
        this.clearview();
        $.get(GG.api+"list", {uname:USER.data.username, uid:USER.id(), token:"MCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwk", s:$(".search-form input").val()}, function(d) {
            
                t.generate_list(d);
                
                GG.view_search.show();
                GG.view_list.hide();
                GG.view_project.hide();
                
        }, 'json');
    }
    
    close() {
        GG.view_search.hide();
        GG.view_list.show();
        GG.view_project.show();
    }
    
    clearview() {
        GG.view_search.find('.list').html("");
    }
    
}
    

class Projects {
    
    constructor() {
        this.page = 1;
        this.loading = false;
        this.type = "all";
        this.data = new HashMap();
        
        if(USER.loggedin()) {
            this.list();
            this.auto_load();
        }
        
        this.subviews = [];

    }
    
     
    
    clear() {
        this.subviews = [];
        $("main .list").html("");
    }
    
    getView(id) {
        for(var i in PROJECTS.subviews){
            if(PROJECTS.subviews[i].getID() == id)
                return PROJECTS.subviews[i]
        }
        return null;
    }
    
    generate_list(d) {
        if(d.length > 0) {
            for(var i in d) {
                let view = new View("views/listrow.html").setPlace("projects .list").setData(d[i]);
                
                this.data.set(view.id, d[i]);
                
                //GG.views.push(view);
                PROJECTS.subviews.push(view);
                
                view.setEvents(function(){
                    view.view.find(".content-text-primary").on("click", function(){
                        let data =  PROJECTS.data.get(view.id);
                        GG.setEditedProject(data);
                        GG.view_search.hide();
                        GG.view_list.hide();
                        GG.view_project.show();    
                    });
                }).render();
            }
        } else {
            //null_rows();
        }
    }
    
    listall() {
        PROJECTS.type='all';
        this.clear();
        this.list();
    }
    
    listquote() {
        PROJECTS.type='quote';
        this.clear();
        this.list();
    }
    
    listrequest() {
        PROJECTS.type='request';
        this.clear();
        this.list();
    }
    
    listorder() {
        PROJECTS.type='order';
        this.clear();
        this.list();
    }
    
    listresorder() {
        PROJECTS.type='resorder';
        this.clear();
        this.list();
    }
    
    
    list() {
        let t = this;
        GG.loading = true;
        $.get(GG.api+"list", {uname:USER.data.username, uid:USER.id(), token:"MCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwk", page:t.page, slug:t.type}, function(d) {
            t.generate_list(d);
            t.page++;
            GG.loading = false;
        }, 'json');
    }
    
    auto_load() {
        var t = this;
        $(window).one("scroll", function (e) { //unbinds itself every time it fires
        	if ($(window).scrollTop() >= $(document).height() - $(window).height() - 350 && !GG.loading) {
        	    GG.loading = true;
            	PROJECTS.list();
        	} 
        	setTimeout(PROJECTS.auto_load, 50); //rebinds itself after 200ms
    	});
    }
    
    
}

class Events {
    constructor() {
        
        GG.screen.on("show-main", function(){
            GG.view_login.hide();
            GG.view_main.fadeOut().removeClass("hidden").fadeIn();
        })
        
        GG.screen.on("show-login", function(){
            GG.view_main.hide();
            GG.view_login.fadeOut().removeClass("hidden").fadeIn();
        })
        
        GG.screen.on("error-login", function(){
            $(util.interpolate("simple", modals.simple_one_btn, {title:"Belépés", message:"Hibás belépési adatok...", yes:"Rendben"})).modal("show");
        })
    
        GG.view_login.find(".login-form").submit(function(e){
            e.preventDefault();
            USER.login();
            return;
        })
        
        GG.view_main.find(".logout").click(function(e){
            e.preventDefault();
            USER.logout();
        })
        
        GG.view_main.find(".search-form input").on("keyup", function(e){
            e.preventDefault();
            SEARCH.search();
            return;
        });
        
        $(document).on("click", "a", function(e){
            e.preventDefault();
            ROUTER.dispatch($(this).attr("href"));
        });
    
        $(document).on("click", ".entity-list-item", function(e){
            e.preventDefault();
            ($(this).hasClass('active')) ? $(this).removeClass('active') : $(this).addClass('active')
        });
    
        
    
        GG.screen.on("list-autoload", function(){
            PROJECTS.auto_load();
        });
    
        GG.screen.on("list-all", function(){
            
            PROJECTS.listall();
            GG.view_search.hide();
            GG.view_list.show();
            GG.view_project.hide();    
            
        })    
        
        GG.screen.on("list-quote", function(){
            GG.view_search.hide();
            GG.view_list.show();
            GG.view_project.hide();    
        })    
        
    }
}


class View {
    constructor(name) {
        this.name = name;
        this.rendered = false;
        this.id = util.unique();
        this.view = $("#"+this.id);
        this.suspended = false;
        return this;
    }
  
    getID(){
        return this.id;
    }
  
    setData(data) {
        this.data = data;
        return this;
    }
    
    setView(view) {
        this.view = view;
        return this;
    }
    
    setPlace(place) {
        this.place = place;
        return this;
    }
    
    setEvents(f) {
        this.events=f;
        return this;
    }
    
    hide() {
        if(this.suspended) return;
        let h = this.view.get(0).getBoundingClientRect().height;
        this.view.css("height", h+"px")
        this.saved = this.view.find('.entity-list-item').detach();
        this.suspended = true;
    }
    
    show() {
        if(!this.suspended) return;
        this.view.css("height", "auto");
        this.view.append(this.saved);
        this.suspended = false;
    }
    
    autoDOM() {
        let t = this;
        
        var last_known_scroll_position = 0;
        var ticking = false;
        
        var visible = function(){
	        let rec = $("#"+t.id).get(0).getBoundingClientRect();
            if(((rec.top) >= 0 && (rec.top) < window.outerHeight) || ((rec.bottom-300) > 0 && (rec.bottom-300) <= window.outerHeight)) {
                t.show();
    		} else {
    		    t.hide();
    		}
        };

        window.addEventListener('scroll', function(e) {
            last_known_scroll_position = window.scrollY;
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    visible();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }
    
    
    render(callback) {
        let t = this;
        
        util.render("views/listrow.html", this.data, function(tmpl){  
            t.rendered = true;
            t.tmpl = tmpl;
            
            if($("#"+t.id).length > 0) {
                $("#"+t.id).html(t.tmpl);
            } else {
                $(t.place).append('<view id="'+t.id+'">' + t.tmpl + '</view>');
            }
            
            t.view = $("#"+t.id);
            
            t.autoDOM();
        
            if(typeof t.events === "function") t.events();
            if(typeof callback === "function") callback();    
            
        });
        
        return this;
    }
    
    
    
    
}

class Core {
    constructor() {
        this.version = "0.1.1";
        this.api = "https://genesisgo.co/api/";
        this.error = "";
        this.message = "";
        this.screen = $("body");
        this.view_login = $("login");
        this.view_main = $("main");
        this.view_search = $("search");
        this.view_list = $("projects");
        this.view_project = $("sessionproject");
        this.view_sidebar = $("sidebar");
        this.views = [];
    }
    
    setEditedProject(p) {
        localStorage.setObj("editproject", p);
        
        console.log(p);
        window.SESSIONPROJECT = new SessionProject(null);
        window.SESSIONPROJECT.load(p.project_id);
    }
    
    closeEditedProject() {
        delete localStorage.editproject;
        delete localStorage.sessionproject;
        window.SESSIONPROJECT = null;
    }
    
    saveEditedProject() {
        window.SESSIONPROJECT.save();
    }
    
}

class Router {
    
    constructor() {
        this.r = {
            '/': "show-main",
            '/list-all': "show-all",
            '/list-quotes': "show-quotes",
            '/editor': "show-editor",
            '/login': "show-login"
        }
    }
    
    dispatch(url) {
        if(this.r[url]) {
           // GG.screen.trigger(this.r[url]);
        }
    }
    
}


;;(function($){
    $(function(){
        window.GG = new Core();
        window.EVENTS = new Events();
        window.USER = new User();
        window.PROJECTS = new Projects();
        window.SEARCH = new Search();
        window.SESSIONPROJECT = null;
        if(localStorage.getObj("sessionproject")) {
            window.SESSIONPROJECT = new SessionProject(localStorage.getObj("sessionproject"));
        }
        
        window.ROUTER = new Router();
        window.ROUTER.dispatch(location.pathname);
        
    });
})(jQuery, window);

