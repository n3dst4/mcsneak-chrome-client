$("#add-domain").on("click", function(ev){
    chrome.tabs.query({
            currentWindow: true,
            active: true
        },
        function(tabs) {
            if (tabs.length === 0) return;
            var tab = tabs[0];
            var host = URL(tab.url).host();
            chrome.extension.sendRequest({sneakDomain: host});
        }
    );                
});
