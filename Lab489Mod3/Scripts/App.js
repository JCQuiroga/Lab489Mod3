var context;
var web;
var user;
var currentItem;
var hostweburl;
var appweburl;
var title;

$(document).ready(function () {
    appweburl = GetAppSiteUrl();
    hostweburl = GetHostSiteUrl();
    var scriptbase = hostweburl + "/_layouts/15/";
    $.getScript(scriptbase + "SP.RequestExecutor.js");
    var clientContext = new SP.ClientContext.get_current();
    var parentCtx = new SP.AppContextSite(clientContext, hostweburl);
    var web = parentCtx.get_web();
    clientContext.load(web);
    var listId = GetListId();
    list = web.get_lists().getById(listId);
    clientContext.load(list);
    var itemId = GetItemId();
    currentItem = list.getItemById(itemId);
    clientContext.load(currentItem);
    clientContext.executeQueryAsync(onListLoadSucceeded, onRequestFailed);
});

function onListLoadSucceeded() {
    title = currentItem.get_fieldValues().Name;
    getSearchResults(title);
}

function onRequestFailed(sender, args) {
    alert('Error:' + args.get_message());
}

function DoSearch() {
    var query = $('#txtSearch').val();
    getSearchResults(query);
}

function getSearchResults(queryText) {
    $('#search-title').text('Search results for [' + queryText + ']');
    var searchUrl = appweburl + "/_api/search/query?querytext='" + queryText + "'&trimduplicates=false";
    var executor = new SP.RequestExecutor(appweburl);
    executor.executeAsync(
    {
        url: searchUrl,
        method: "GET",
        headers: { "Accept": "application/json; odata=verbose" },
        success: onGetSearchResultsSuccess,
        error: onGetSearchResultsFail
    });
}

function onGetSearchResultsSuccess(data) {
    var jsonObject = JSON.parse(data.body);
    var results = jsonObject.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results;
    if (results.length == 0) {
        $('#search-results').text('No items were found');
    }
    else {
        var searchResultsHtml = '';
        $.each(results, function (index, result) {
            searchResultsHtml += "<a target='_blank' href='" + result.Cells.results[6].Value + "'>" + result.Cells.results[6].Value + "</a><br/>";
        });
        $("#search-results").html(searchResultsHtml);
    }
}

function onGetSearchResultsFail(data, errorCode, errorMessage) {
    $('#search-results').text('An error occurred during search - ' + errorMessage);
}

function getQueryStringParameter(paramToRetrieve) {
    var params =
    document.URL.split("?")[1].split("&");
    var strParams = "";

    for (var i = 0; i < params.length; i = i + 1) {
        var singleParam = params[i].split("=");
        if (singleParam[0] == paramToRetrieve)
            return singleParam[1];
    }
}

function GetListId() {
    return decodeURIComponent(getQueryStringParameter("ListID"));
}

function GetHostSiteUrl() {
    return decodeURIComponent(getQueryStringParameter("SPHostUrl"));
}

function GetAppSiteUrl() {
    return decodeURIComponent(getQueryStringParameter("SPAppWebUrl"));
}

function GetItemId() {
    return getQueryStringParameter("ItemID");
}