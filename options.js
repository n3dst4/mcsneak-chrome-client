var parentWindow = chrome.extension.getBackgroundPage();
var parentViewModel = parentWindow.viewModel;
var initialWWWRe = /^www\d*\./i;

var model = chrome.extension.getBackgroundPage().model;
var filterDelay = 300;
var filterString = "";

function compareWithoutWWW(a, b) {
    a = a.replace(initialWWWRe, '');
    b = b.replace(initialWWWRe, '');
    return (a == b) ? 0 :
        (a < b)? -1 : 1;
}


var ListView = Backbone.View.extend({
    tagName:  "ul",
    events: {
        "click.remover": "removeClicked"
    },
    initialize: function () {
        this.model.on("change", this.render, this);
    },
    render: function () {
        var list = this.model.getFilteredList(this.options.listName, filterString);
        var html
        if (list.length === 0) {
            html = '<div class=empty-message>Nothing here</div>';
        }
        else {
            html = _(list).chain().map(function(item){
                return [
                    '<li>',
                        '<a href="#" class="remover" data-hostname="', item ,'">',
                            '<i class="icon-remove-sign"></i>',
                            '<span class="label">(Remove)</span>',
                        '</a>',
                        '<span>', item,'</span>',
                    '</li>'
                ];
            }).flatten().value().join('');
        }
        this.$el.html(html);
        return this;
    },
    removeClicked: function (event) {
        var hostname = $(event.target).closest("a").attr("data-hostname");
        this.model.removeFromList(this.options.listName, hostname);
    }
});


$(function(){
    var filterField = $("#filtering-form input");
    
    var job = null;
    
    var fuse = null;
    
    filterField.on("change mouseup keyup", function () {
        if (fuse) clearTimeout(fuse);
        fuse = setTimeout(function(){
            console.log("fuse");
            filterString = filterField.val();
            model.trigger("change");
        }, filterDelay);
    });
    
    $("#filtering-form .clear").on("click", function () {
        filterString = "";
        filterField.val("");
        model.trigger("change");
    });
    
    new ListView({model: model, listName: "white"}).render().$el.appendTo("#whitelist");
    
    new ListView({model: model, listname: "black"}).render().$el.appendTo("#blacklist");
    
});



































