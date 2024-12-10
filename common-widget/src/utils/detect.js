//Browser Detection

/*var userAgent = 'navigator' in window && 'userAgent' in navigator && navigator.userAgent.toLowerCase() || '';
var vendor = 'navigator' in window && 'vendor' in navigator && navigator.vendor.toLowerCase() || '';
var appVersion = 'navigator' in window && 'appVersion' in navigator && navigator.appVersion.toLowerCase() || '';
*/
const detect = {
    browser: function() {
        var userAgent = 'navigator' in window && 'userAgent' in navigator && navigator.userAgent.toLowerCase() || '';
        var match = /(opr|ubrowser|ucbrowser|ucweb|edge|iemobile)[ \/]([\w.]+)/.exec( userAgent ) ||
            /(chrome|firefox)[ \/]([\w.]+)/.exec( userAgent ) ||
            /(^Opera\/)(?:.*version|)[ \/]([\w.]+)/.exec( userAgent ) ||
            /(msie) ([\w.]+)/.exec( userAgent ) ||
            /(safari)[ \/]([\w.]+)/.exec( userAgent ) ||
            userAgent.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( userAgent ) ||
            [];
        
        switch (match[1]) {
            case 'ucweb': //For UCBrowser
                match[1] = 'ucbrowser';
                break;
            case 'opr': //For Opera
                match[1] = 'opera';
                break;
        }
         
        // For ie>= 11
        if ("ActiveXObject" in window) match[1] = 'msie';
        return {
            browser: match[ 1 ] || "",
            version: match[ 2 ] || "0"
        };
    },
    /*isChrome: function() {
        return /chrome|chromium/i.test(userAgent) && /google inc/.test(vendor) && !detect.isOpera();
    },
    isFirefox: function() {
        return /firefox/i.test(userAgent);
    },
    isEdge: function() {
        return /edge/i.test(userAgent);
    },
    isIE: function(version) { // parameter is optional
        if(!version) {
            return /msie/i.test(userAgent) || "ActiveXObject" in window;
        }
        if(version >= 11) {
            return "ActiveXObject" in window;
        }
        return new RegExp('msie ' + version).test(userAgent);
    },
    isOpera: function() {
        return /^opera\//.test(userAgent) || // Opera 12 and older versions
            /\x20opr\//.test(userAgent); // Opera 15+
    },
    isSafari: function() {
        return /safari/i.test(userAgent) && /apple computer/i.test(vendor);
    },
    isUCBrowser: function() {
        return  /uc.*browser|ucweb/i.test(userAgent);
    },
    isIos: function() {
        return detect.isIphone() || detect.isIpad() || detect.isIpod();
    },*/

    userAgent: "",
    init: function(ua){
        this.userAgent = ua;
    },

    isIphone: function() {
        return /iphone/i.test(this.userAgent) && !detect.isWindows();
    },
    isIpad: function() {
        return /ipad/i.test(this.userAgent) && !detect.isWindows();
    },
    isIpod: function() {
        return /ipod/i.test(this.userAgent) && !detect.isWindows();
    },
    isAndroid: function() {
        return /android/i.test(this.userAgent) && !detect.isWindows();
    },
    isAndroidPhone: function() {
        return detect.isAndroid() && /mobile/i.test(this.userAgent);
    },
    isAndroidTablet: function() {
        return /android/i.test(this.userAgent) && !/mobile/i.test(this.userAgent);
    },
    isBlackberry: function() {
        return /blackberry/i.test(this.userAgent) || /BB10/i.test(this.userAgent);
    },
    isDesktop: function() {
        return !detect.isMobile() && !detect.isTablet();
    },
    /*isLinux: function() {
        return /linux/i.test(appVersion);
    },
    isMac: function() {
        return /mac/i.test(appVersion);
    },*/
    isWindows: function() {
        return /win/i.test(this.userAgent);
    },
    isWindowsPhone: function() {
        return detect.isWindows() && /phone/i.test(this.userAgent);
    },
    isWindowsTablet: function() {
        return detect.isWindows() && !detect.isWindowsPhone() && /touch/i.test(this.userAgent);
    },
    isMobile: function(ua) {
       
        if (this.userAgent !== undefined && this.userAgent !== '' && ua == undefined) {
            ua = this.userAgent;
        }
        
        if (ua === undefined && typeof window !== 'undefined') {
            ua = 'navigator' in window && 'userAgent' in navigator && navigator.userAgent.toLowerCase() || '';
        }

        this.userAgent = ua;
        let returnvar =  detect.isIphone() || detect.isIpod() || detect.isAndroidPhone() || detect.isBlackberry() || detect.isWindowsPhone();
        return returnvar;
    },
    isTablet: function() {
        return detect.isIpad() || detect.isAndroidTablet() || detect.isWindowsTablet();
    },

    isBot: function(ua) {
        var botPattern = "(googlebot\/|Googlebot-Mobile|Googlebot-Image|Google favicon|Mediapartners-Google|bingbot|slurp|java|wget|curl|Commons-HttpClient|Python-urllib|libwww|httpunit|nutch|phpcrawl|msnbot|jyxobot|FAST-WebCrawler|FAST Enterprise Crawler|biglotron|teoma|convera|seekbot|gigablast|exabot|ngbot|ia_archiver|GingerCrawler|webmon |httrack|webcrawler|grub.org|UsineNouvelleCrawler|antibot|netresearchserver|speedy|fluffy|bibnum.bnf|findlink|msrbot|panscient|yacybot|AISearchBot|IOI|ips-agent|tagoobot|MJ12bot|dotbot|woriobot|yanga|buzzbot|mlbot|yandexbot|purebot|Linguee Bot|Voyager|CyberPatrol|voilabot|baiduspider|citeseerxbot|spbot|twengabot|postrank|turnitinbot|scribdbot|page2rss|sitebot|linkdex|Adidxbot|blekkobot|ezooms|dotbot|Mail.RU_Bot|discobot|heritrix|findthatfile|europarchive.org|NerdByNature.Bot|sistrix crawler|ahrefsbot|Aboundex|domaincrawler|wbsearchbot|summify|ccbot|edisterbot|seznambot|ec2linkfinder|gslfbot|aihitbot|intelium_bot|facebookexternalhit|yeti|RetrevoPageAnalyzer|lb-spider|sogou|lssbot|careerbot|wotbox|wocbot|ichiro|DuckDuckBot|lssrocketcrawler|drupact|webcompanycrawler|acoonbot|openindexspider|gnam gnam spider|web-archive-net.com.bot|backlinkcrawler|coccoc|integromedb|content crawler spider|toplistbot|seokicks-robot|it2media-domain-crawler|ip-web-crawler.com|siteexplorer.info|elisabot|proximic|changedetection|blexbot|arabot|WeSEE:Search|niki-bot|CrystalSemanticsBot|rogerbot|360Spider|psbot|InterfaxScanBot|Lipperhey SEO Service|CC Metadata Scaper|g00g1e.net|GrapeshotCrawler|urlappendbot|brainobot|fr-crawler|binlar|SimpleCrawler|Livelapbot|Twitterbot|cXensebot|smtbot|bnf.fr_bot|A6-Indexer|ADmantX|Facebot|Twitterbot|OrangeBot|memorybot|AdvBot|MegaIndex|SemanticScholarBot|ltx71|nerdybot|xovibot|BUbiNG|Qwantify|archive.org_bot|Applebot|TweetmemeBot|crawler4j|findxbot|SemrushBot|yoozBot|lipperhey|y!j-asr|Domain Re-Animator Bot|AddThis|Google Page Speed Insights)";
        var re = new RegExp(botPattern, 'i');
        this.userAgent = ua;
        
        if (re.test(ua)) {
            return true;
        } 

        return false;
    },

    isWebpSupportFrmServer: function(headers) {
        
        // Remove  webp for server migration            
        return false;

        if (headers && headers['accept']) {
            //console.log(headers['accept']);

            var re = new RegExp('image/webp', 'i');
            if (re.test(headers['accept'])) {
                return true;
            }
            
            //Google Page Insight
            var re = new RegExp('Google Page Speed Insights', 'i');
            if (re.test(headers['user-agent'])) {
                return true;
            }

            return false;

        }
        return false;
    }
    /*isOnline: function() {
        return navigator.onLine;
    },
    isTouchDevice: function() {
        return 'ontouchstart' in window ||'DocumentTouch' in window && document instanceof DocumentTouch;
    }*/
};

export default detect;