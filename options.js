var parentWindow = chrome.extension.getBackgroundPage();
var parentViewModel = parentWindow.viewModel;
var initialWWWRe = /^www\d*\./i;

var viewModel = {
    init: function() {
        viewModel.damagedDomains(parentViewModel.damagedDomains());
        viewModel.hopelessDomains(parentViewModel.hopelessDomains());
        viewModel.sortDamagedDomains();
        viewModel.sortHopelessDomains();
    },
    
    damagedDomains: ko.observableArray(),

    hopelessDomains: ko.observableArray(),
    
    addDamagedDomain: function (domain) {
        if (viewModel.damagedDomains.indexOf(domain) === -1) {
            viewModel.damagedDomains.push(domain);
            viewModel.sortDamagedDomains();
        }
        parentViewModel.addDamagedDomain(domain);
    },
    
    addHopelessDomain: function (domain) {
        if (viewModel.hopelessDomains.indexOf(domain) === -1) {
            viewModel.hopelessDomains.push(domain);
            viewModel.sortHopelessDomains();
        }
        parentViewModel.addHopelessDomain(domain);
    },
    
    removeDamagedDomain: function (domain) {
        viewModel.damagedDomains.remove(domain);
        parentViewModel.removeDamagedDomain(domain);
    },
    
    removeHopelessDomain: function (domain) {
        viewModel.hopelessDomains.remove(domain);
        parentViewModel.removeHopelessDomain(domain);
    },
    
    isDamaged: function (domain) {
        return viewModel.damagedDomains.indexOf(domain) !== -1;
    },
    
    isHopeless: function (domain) {
        return viewModel.hopelessDomains.indexOf(domain) !== -1;
    },
    
    sortDamagedDomains: function() {
        viewModel.damagedDomains.sort(compareWithoutWWW);
    },
    
    sortHopelessDomains: function() {
        viewModel.damagedDomains.sort(compareWithoutWWW);
    }
    
};

viewModel.init();


function compareWithoutWWW(a, b) {
    a = a.replace(initialWWWRe, '');
    b = b.replace(initialWWWRe, '');
    return (a == b) ? 0 :
        (a < b)? -1 : 1;
}

$(function(){
    $("#damaged-domains-list").attr("data-bind", "foreach: damagedDomains");
    ko.applyBindings(viewModel);
    
    $("#adding-form").on("click", function() {
        addDamagedDomain($('#new-input').val())
    });
    
    
});