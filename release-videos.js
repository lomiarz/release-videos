(function() {

    var quality = {
        ipla: '384p',
        player: 'Standard',
        tvp: '820000',
        vod: '360'
    };

    function getRemoteObject(url) {
        var f = new XMLHttpRequest();
        f.open('GET', url, false);
        f.send();
        return JSON.parse(f.responseText);
    };

    function ipla() {
        var regexp = /ipla:\/\/playvod-1\|([A-Fa-f0-9]+)/;
        var match =  document.body.innerHTML.match(regexp);
        try {
            var videoId = match[1];
            var url = 'http://getmedia.redefine.pl/vods/get_vod/?cpid=1&ua=mipla/23&media_id=' + videoId;
            var object = getRemoteObject(url);
            console.log(object.vod.copies);
            var copy = object.vod.copies.find(function(copy) { return copy.quality_p == quality.ipla } );
            console.log(JSON.stringify(copy));
            document.location.href = copy.url;
        } catch (e) {
            console.error("Can't find movie identifier :( => " + e);
        }
    }

    function player() {
        var splittedUrl = document.location.href.split(/[.,]/);
        var identifier = splittedUrl[splittedUrl.length - 2];
        var url = '/api/?platform=ConnectedTV&terminal=Panasonic&format=json&authKey=064fda5ab26dc1dd936f5c6e84b7d3c2&v=3.1&m=getItem&id=';
        var obj = getRemoteObject(url + identifier);

        try {
            var h = obj.item.videos.main.video_content[1].url
            console.log("Player done");
        } catch (e) {
            console.error("Can't find movie identifier :(");
        };
        document.location.href = h;
    }

    function vod() {
        var i = document.body.innerHTML.substr(document.body.innerHTML.indexOf('id=' + atob('Ig==') + 'mvp:') + 8, 100);
        i = i.substr(0, i.indexOf(atob('Ig==')));

        try {
            var url = 'https://player-api.dreamlab.pl/?body[method]=get_asset_detail&body[params][ID_Publikacji]=';
            var response = getRemoteObject(url + i);
            var video = response.result[0].formats.wideo.mp4.find(function(video) { return video.vertical_resolution == quality.vod });
            document.location.href = video.url;
        } catch (error) {
            console.error(error);
        }
    }

    function tvp() {
        var regexpArray = [/data-video-id=(\d+)/, /data-videoid=(\d+)/, /\/player\/video?id=(d+)/, /\/player\/video\/(\d+)/,
            /'video_id=(\d+)/, /object_id:(\d+)/, /amp;object_id=(\d+)/, /object_id=(\d+)/];
        var result = regexpArray.find(function(e) { return document.body.innerHTML.match(e) != null });
        var identifier = null;

        if (result) {
            identifier = document.body.innerHTML.match(result)[1];
        } else {
            identifier = document.location.href.split(/[,?/=-]/).slice(-1).pop().replace(/\D/g, '');
        }

        if (identifier) {
            var response = getRemoteObject('https://www.tvp.pl/shared/cdn/tokenizer_v2.php?object_id=' + identifier);
            var url = response.formats.find(function(format) { return (format.totalBitrate = quality.tvp && format.adaptive == false) }).url;
            document.location.href = url;
        } else {
            console.error("Can't find movie identifier :(");
        }
    }

    if (document.location.href.indexOf('www.ipla.tv/') > 0) {
        ipla();
    } else if (document.location.href.indexOf('://player.pl/') > 0) {
        player();
    } else if (document.location.href.match(/:\/\/bajki.onet.pl\/|:\/\/vod.pl\//)) {
        vod();
    } else if (document.location.href.indexOf("vod.tvp.pl")) {
        tvp();
    } else {
        console.log("Unsupported page :-(");
    }
})();