        // uncomment to preload
        
        //"rockpapershotgun.com": true,
        //"www.rockpapershotgun.com": true,
        //"storify.com": true,
        //"twitter.com": true
        //"si0.twimg.com": true

var damagedDomains = localStorage.getItem("damagedDomains"),
    hopelessDomains = localStorage.getItem("hopelessDomains"),
    forbiddenStatus = 403,
    forbiddenStatusRe = /^HTTP\/[0-9.]+ 403/,
    sneakSuffix = ".mcsneak.jit.su";


// View model
window.viewModel = {
    damagedDomains: ko.observableArray(
        damagedDomains? JSON.parse(damagedDomains) : []),
    
    hopelessDomains: ko.observableArray(
        hopelessDomains? JSON.parse(hopelessDomains) : []),

    addDamagedDomain: function (domain) {
        if (this.damagedDomains.indexOf(domain) === -1) {
            this.damagedDomains.push(domain);
        }
        this._syncStorage();
    },
    
    addHopelessDomain: function (domain) {
        if (this.hopelessDomains.indexOf(domain) === -1) {
            this.hopelessDomains.push(domain);
        }
        this._syncStorage();
    },
    
    removeDamagedDomain: function (domain) {
        this.damagedDomains.remove(domain);
        this._syncStorage();
    },
    
    removeHopelessDomain: function (domain) {
        this.hopelessDomains.remove(domain);
        this._syncStorage();
    },
    
    isDamaged: function (domain) {
        return this.damagedDomains.indexOf(domain) !== -1;
    },
    
    isHopeless: function (domain) {
        return this.hopelessDomains.indexOf(domain) !== -1;
    },
    
    _syncStorage: function () {
        localStorage.setItem("damagedDomains", JSON.stringify(this.damagedDomains()));
        localStorage.setItem("hopelessDomains", JSON.stringify(this.hopelessDomains()));
    }
};




// event handler fired before requests go out
// fired synchronously so opportunity to redirect if host name is known-bad
chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        var url = URL(details.url),
            host = url.host();
        if (viewModel.isDamaged(host) && !viewModel.isHopeless(host)) {
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
                viewModel.addHopelessDomain(host);
            }
            else {
                console.log(host + " added to damaged list");
                viewModel.addDamagedDomain(host);
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
            viewModel.addDamagedDomain(request.sneakDomain);
            chrome.tabs.reload();
        }
    }
);