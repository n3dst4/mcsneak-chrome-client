        // uncomment to preload
        
        //"rockpapershotgun.com": true,
        //"www.rockpapershotgun.com": true,
        //"storify.com": true,
        //"twitter.com": true
        //"si0.twimg.com": true
        
var domainsJSON = localStorage.getItem("domains"),
    forbiddenStatus = 403,
    forbiddenStatusRe = /^HTTP\/[0-9.]+ 403/,
    sneakSuffix = ".mcsneak.jit.su";

var DomainModel = Backbone.Model.extend({
    initialize: function () {},
    whitelist: function (domain) {
        this.removeFromList("black", domain);
        this.addToList("white", domain);
    },
    blacklist: function (domain) {
        this.removeFromList("white", domain);
        this.addToList("black", domain);
    },
    addToList: function (listName, domain) {
        list = _(this.get(listName));
        if ( ! list.contains(domain)) {
            var idx = list.sortedIndex(domain);
            list.splice(idx, 0, domain);
        }
        this.set(listName, list);
        this.trigger(listName + "list", domain);
    },
    removeFromList: function (listName, domain) {    
        this.set(listName, _(this.get(listName)).without(domain));
        this.trigger("un" + listName + "list", domain);
    },
    isWhitelisted: function (domain) {
        return this.isOnList("white", domain);
    },
    isBlacklisted: function (domain) {
        return this.isOnList("black", domain);
    },
    isOnList: function (list, domain) {
        return _(this.get(list)).contains(domain);
    },
});

domains = new DomainModel(
    domainsJSON? JSON.parse(domainsJSON) : {white: [], black: []});


// event handler fired before requests go out
// fired synchronously so opportunity to redirect if host name is known-bad
chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        var url = URL(details.url),
            host = url.host();
        if (domains.isWhitelisted(host)) {
            url.host(host + sneakSuffix);
            return {redirectUrl: url.toString()};
        }
    },
    // filters
    {
        urls: ["<all_urls>"]
    },
     // extraInfoSpec
    ["blocking"] // make it synchronous
);


// event handler fired when request headers received
// if we get a Denied response even when sneakng, stop trying to sneak
chrome.webRequest.onHeadersReceived.addListener(
    function (details) {
        var host = URL(details.url).host();
        if (forbiddenStatusRe.test(details.statusLine)) {
            console.log(details.url + " was forbidden");
            if (host.slice(host.length - sneakSuffix.length) === sneakSuffix) {
                host = host.slice(0, host.length - sneaksuffix);
                domains.blacklist(host);
            }
            else {
                console.log(host + " added to damaged list");
                domains.whitelist(host);
                chrome.tabs.get(details.tabId, function(tab){
                    if (tab.url === details.url) {
                        chrome.tabs.reload(tab.id);
                    }
                });
            }
        }
    },
    // filters
    {
        urls: ["<all_urls>"]
    }
);




chrome.webRequest.onErrorOccurred.addListener(
    function(details){
        //debugger;
    },
    // filters
    {
        urls: ["<all_urls>"]
    }
);




// handle incoming request from popup
chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
        if (request.sneakDomain) {
            domains.whitelist(request.sneakDomain);
            chrome.tabs.reload();
        }
    }
);
























