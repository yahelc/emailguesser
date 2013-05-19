function ggl(term) {
    return "https://www.google.com/search?q=" + encodeURIComponent(term) + "&hl=en&safe=off&tbo=1&output=search&source=lnt&tbs=li:1";
}

$(function() {
    $("#clear").click(function() {
        $("input:text").each(function() {
            $(this).val('');
        });
        $("#results table tbody").html("");
        location.hash = "";
        return false;
    });

    $("form").submit(function(e) {
        e.preventDefault();
        location.hash = jQuery("form").serialize();
        if (isCommonDomain()) {
            $("#domainwarning").fadeIn();
        }
        else {
            $("#domainwarning").hide();
        }
        $("#results tbody").html("");
        $("#results tbody").html(generateTableMarkup(algorithm($("#first").val(), $("#middle").val(), $("#last").val(), $("#domain").val())));
        $("#results").slideDown();
        doSearch();
    });
    if (location.hash.length > 1) {
        location.hash.replace(/[#&]+([^=&]+)=([^&]*)/gi,
        function(m, k, v) {
            $("#" + k).val(v);
        });
        $("form").submit();
    }


});


var doSearch = function() {
    var last = $("tr:last td:first").text();
    $("tbody tr").each(function(){
        var cells = $("td", this);
        if (cells.length < 2 || !~cells.eq(0).text().indexOf("@")) {
            return;
        }
        var email = cells.eq(0).text();
        var freq = cells.eq(1);
        (function(email) {
            $.ajax({
                url: "https://api.datamarket.azure.com/Bing/Search/v1/Composite?Sources=%27web%27&Query=%27" + encodeURIComponent(email) + "%27&$format=json",
                headers: {
                    Authorization: "Basic eWFoZWxjQGdtYWlsLmNvbTpyM1BMaG1nVTBVMDZkcG9xQ2xUbTJEOG1CemZXR2JZZmZzVkZBR1Q5OTFRPQ=="
                },
                success: function(data) {
                    try {
                        freq.html('<a target="_blank" href="' + ggl(email) + '">' + data.d.results[0].WebTotal + "</a>");
                        if (email === last){
                            $('#results table')
                            .unbind('appendCache applyWidgetId applyWidgets sorton update updateCell')
                            .removeClass('tablesorter')
                            .find('thead th')
                            .unbind('click mousedown')
                            .removeClass('header headerSortDown headerSortUp');
                            $("table").tablesorter({
                                sortList: [[1, 1]]
                            });
                        }
                    }
                    catch(f) {}
                }

            });
        } (email));

});
};
function algorithm($first, $middle, $last, $domain) {
    var $emails1 = [];
    var $fi = $first.substr(0, 1);
    var $mi = $middle.substr(0, 1);
    var $li = $last.substr(0, 1);
    if ($middle) {
        $emails1.push($first + "|" + $middle + "|" + $last, $first + "|" + $last + "|" + $middle, $last + "|" + $middle + "|" + $first, $last + "|" + $first + "|" + $middle, $middle + "|" + $first + "|" + $last, $middle + "|" + $last + "|" + $first, $first + "|" + $middle, $last + "|" + $middle, $middle + "|" + $last, $middle + "|" + $first, $middle);
    }
    $emails1.push($first + "|" + $last, $last + "|" + $first, $first, $last);

    var $emails2 = [];

    for (var $counter = 0; $counter < $emails1.length; $counter++)
    {
        for (var $nestedcounter = 0; $nestedcounter <= 8; $nestedcounter++)
        {
            var $newItem = $emails1[$counter];
            if ($nestedcounter % 2 === 0)
            $newItem = $newItem.replace($first, $fi);
            if (($nestedcounter / 2) % 2 === 0)
            $newItem = $newItem.replace($middle, $mi);
            if (($nestedcounter / 4) % 2 === 0)
            $newItem = $newItem.replace($last, $li);
            if (!~$.inArray($newItem, $emails2))
            $emails2.push($newItem);
        }
    }

   var $emails3 = [];

    for (var $counter = 0; $counter < $emails2.length; $counter++)
    {
        var $email = $emails2[$counter];
		var $email_raw  = $email.replace("|","").split("").sort().join("");
		var $initials = [$fi,$mi,$li].sort().join("");
		var $initials_simple = [$fi,$li].sort().join("");
		
		if(!~jQuery.inArray($email_raw, $initials) && !~jQuery.inArray($email_raw, $initials_simple) && $email_raw.length>2 ){
			$emails3.push($email.replace(/\|/g, ""), $email.replace(/\|/g, "."),  $email.replace(/\|/g, "_"));
		}
    }
    var $finishedemails = [];

    for (var $counter = 0; $counter < ($emails3.length); $counter++)
    {
        var email = $emails3[$counter] + "@" + $domain;
        if (!~jQuery.inArray(email, $finishedemails)){
	        $finishedemails.push(email);
		}
    }
    return $finishedemails;
}

function isCommonDomain(domain) {
    return~$.inArray($("#domain").val(), ["yahoo.com",
    "hotmail.com",
    "aol.com",
    "gmail.com",
    "msn.com",
    "comcast.net",
    "hotmail.co.uk",
    "sbcglobal.net",
    "yahoo.co.uk",
    "yahoo.co.in",
    "bellsouth.net",
    "verizon.net",
    "earthlink.net",
    "cox.net",
    "rediffmail.com",
    "yahoo.ca",
    "btinternet.com",
    "charter.net",
    "shaw.ca",
    "ntlworld.com"]);
}

function generateTableMarkup(emails) {
    var html = "";
    $.each(emails,
    function(i, email) {
        html += "<tr><td><a target='_blank' href='" + ggl(email) + "'>" + email + "</a></td><td></td></tr>";
    });
    return html;
}