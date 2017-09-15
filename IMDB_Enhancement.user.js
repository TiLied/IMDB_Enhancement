// ==UserScript==
// @name        IMDB Enhancement
// @namespace   https://greasyfork.org/users/102866
// @description IMDB Enhancement adds features
// @include     http://www.imdb.com/*
// @require     https://code.jquery.com/jquery-3.2.1.min.js
// @author      TiLied
// @version     0.0.07
// @grant       GM_listValues
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_deleteValue
// @grant       GM_xmlhttpRequest
// ==/UserScript==

var whatPage = 0;

const oneSecond = 1000,
	oneDay = oneSecond * 60 * 60 * 24,
	oneWeek = oneDay * 7,
	oneMonth = oneWeek * 4;

//prefs
var options = {},
	cache = {},
	debug,
	additionalRatings,
	age,
	genre,
	version,
	versionCache,
	connections;

Main();

//Start
//Function main
function Main()
{
	console.log("IMDB Enhancement v" + GM_info.script.version + " Initialized");
	//Place CSS in head
	SetCSS();
	//Set settings or create
	SetSettings();
	//Check on what page we are and switch. Currently only on pin page
	SwitchPage();
	//Place UI Options
	SetOption();
	console.log("Page number: " + whatPage);	//Enum plz :c
}
//Function main
//End

//Start
//Functions GM_VALUE
function SetSettings()
{
	try
	{
		//DeleteValues("all");
		//THIS IS ABOUT OPTIONS
		if (HasValue("imdbe_options", JSON.stringify(options)))
		{
			options = JSON.parse(GM_getValue("imdbe_options"));
			SetOptionsObj();
		}

		//THIS IS ABOUT CACHE
		if (HasValue("imdbe_cache", JSON.stringify(cache)))
		{
			cache = JSON.parse(GM_getValue("imdbe_cache"));
			SetCacheObj();
		}

		//Console log prefs with value
		console.log("*prefs:");
		console.log("*-----*");
		var vals = [];

		//Find out that var in for block is not local... Seriously js?
		for (let i = 0; i < GM_listValues().length; i++)
		{
			vals[i] = GM_listValues()[i];
		}
		for (let i = 0; i < vals.length; i++)
		{
			console.log("*" + vals[i] + ":" + GM_getValue(vals[i]));
		}
		console.log("*-----*");
		if (debug)
		{
			console.log(options);
			console.log(cache);
		}
	}catch(e){console.log(e); }
}

//Check if value exists or not.  optValue = Optional
function HasValue(nameVal, optValue)
{
	var vals = [];
	for (let i = 0; i < GM_listValues().length; i++)
	{
		vals[i] = GM_listValues()[i];
	}

	if (vals.length === 0)
	{
		if (optValue !== undefined)
		{
			GM_setValue(nameVal, optValue);
			return true;
		} else
		{
			return false;
		}
	}

	if (typeof nameVal !== "string")
	{
		return alert("name of value: '" + nameVal + "' are not string");
	}

	for (let i = 0; i < vals.length; i++)
	{
		if (vals[i] === nameVal)
		{
			return true;
		}
	}

	if (optValue !== undefined)
	{
		GM_setValue(nameVal, optValue);
		return true;
	} else
	{
		return false;
	}
}

//Delete Values
function DeleteValues(nameVal)
{
	var vals = [];
	for (let i = 0; i < GM_listValues().length; i++)
	{
		vals[i] = GM_listValues()[i];
	}

	if (vals.length === 0 || typeof nameVal !== "string")
	{
		return;
	}

	switch (nameVal)
	{
		case "all":
			for (let i = 0; i < vals.length; i++)
			{
				if (vals[i] !== "adm")
				{
					GM_deleteValue(vals[i]);
				}
			}
			break;
		case "old":
			for (let i = 0; i < vals.length; i++)
			{
				if (vals[i] === "debug" || vals[i] === "debugA")
				{
					GM_deleteValue(vals[i]);
				}
			}
			break;
		default:
			for (let i = 0; i < vals.length; i++)
			{
				if (vals[i] === nameVal)
				{
					GM_deleteValue(nameVal);
				}
			}
			break;
	}
}

//Update gm value what:"cache","options"
function UpdateGM(what)
{
	var gmVal;

	switch (what)
	{
		case "cache":
			gmVal = JSON.stringify(cache);
			GM_setValue("imdbe_cache", gmVal);
			break;
		case "options":
			gmVal = JSON.stringify(options);
			GM_setValue("imdbe_options", gmVal);
			break;
		default:
			alert("fun:UpdateGM(" + what + "). default switch");
			break;
	}
}
//Functions GM_VALUE
//End

//Start
//Functions create object option and cache
function SetOptionsObj()
{
	//Debug option
	if (options.debug === undefined)
	{
		options.debug = false;
		debug = options.debug;
	} else
	{
		debug = options.debug;
	}

	//Version
	if (options.version === undefined)
	{
		options.version = GM_info.script.version;
		version = options.version;
	} else
	{
		version = options.version;
		if (version !== GM_info.script.version)
		{
			options.version = GM_info.script.version;
			version = options.version;
		}
	}

	//additionalRatings option
	if (options.additionalRatings === undefined)
	{
		options.additionalRatings =
			{
				on: true,
				kinopoisk: false,
				rottenTomatoes: false
			};
		additionalRatings = options.additionalRatings;
	} else
	{
		if (options.additionalRatings["kinopoisk"] === undefined) { options.additionalRatings[kinopoisk] = false; }
		if (options.additionalRatings["rottenTomatoes"] === undefined) { options.additionalRatings[rottenTomatoes] = false; }
		additionalRatings = options.additionalRatings;
	}

	//age option
	if (options.age === undefined)
	{
		options.age = false;
		age = options.age;
	} else
	{
		age = options.age;
	}

	//genre option
	if (options.genre === undefined)
	{
		options.genre = true;
		genre = options.genre;
	} else
	{
		genre = options.genre;
	}

	//connections option
	if (options.connections === undefined)
	{
		options.connections = true;
		connections = options.connections;
	} else
	{
		connections = options.connections;
	}
}

function SetCacheObj()
{
	var v = String(version).split('.');
	v = v.slice(0, 2);
	var ver = v[0] + "." + v[1];

	//Version
	if (cache.versionCache === undefined)
	{
		cache.versionCache = ver;
		versionCache = cache.versionCache;
	} else
	{
		versionCache = cache.versionCache;
		if (versionCache !== ver)
		{
			cache.versionCache = ver;
			versionCache = cache.versionCache;
			for (var prop in cache)
			{
				if (prop !== "versionCache")
				{
					delete cache[prop];
				}
			}
			DeleteValues("imdbe_cache");
		}
	}
}
//Functions create object option and cache
//End

//Start
//Functions Get on what page are we and switch
function SwitchPage()
{
	switch (GetPage(document.URL))
	{
		case 1:
		case 2:
			break;
		case 3:
			AddCache("movie", document.URL);
			SetUpForMovie();
			//xmlIMDB("connections", document.URL);
			//xmlIMDB("xml", document.URL);
			//xmlIMDB(); //DELETE THIS
			break;
		case 4:
			AddCache("connects", document.URL);
			//GetConnects(); DELETE THIS
			break;
		case 5:
			//xmlIMDB(); DELETE THIS
			SetUpForPeople();
			break;
		case 6:
		case 10:
			break;
		default:
			break;
	}
}

//On what page are we?
function GetPage(url)
{
	/*
	1-front page
	2-search page
	3-movie/TV page
	4-connections
	5-people(Actor,Actress, etc.) page
	10-
	*/
	try
	{
		if (document.location.pathname === "/")
		{
			whatPage = 1;
		} else if (url.match(/http:\/\/www\.imdb\.com\/find/i))
		{
			whatPage = 2;
		} else if (url.match(/http:\/\/www\.imdb\.com\/title/i) && !url.match(/(movieconnections)|(tt_trv_(cnn|snd|trv|qu|gf|cc)|tt(cnn|snd|trv|qu|gf|cc))/i))
		{
			whatPage = 3;
		} else if (url.match(/http:\/\/www\.imdb\.com\/title/i) && url.match(/(movieconnections)|(tt_trv_cnn|ttcnn)/i))
		{
			whatPage = 4;
		} else if (url.match(/http:\/\/www\.imdb\.com\/name/i))
		{
			whatPage = 5;
		} else
		{
			whatPage = 10;
		}
	} catch (e) { console.og(e); }
	return whatPage;
}
//Functions Get on what page are we and switch
//End

//-------------------------
//SET UP STUFF BELOW
//-------------------------

//Start
//Function check option on this people page
function SetUpForPeople()
{
	if (age)
	{
		GetAge();
	}

	if (genre)
	{
		GetGenre();
	}
}
//Function check option on this people page
//End

//Start
//Function check option on this movie page
function SetUpForMovie()
{
	if (connections)
	{
		ShowConnections(document.URL);
	}
}
//Function check option on this movie page
//End

//-------------------------
//CORE STUFF BELOW
//-------------------------

//Start
//Function Add to Cache movie/and anything
//what: movie,rating,connects
//doc: optional for xml
function AddCache(what, url, doc)
{
	var id = url.match(/\/(tt\d+)\//)[1];
	
	switch (what) 
	{
		case "movie":
			if (cache[id] === undefined)
			{
				cache[id] =
					{
						fullUrl: url.match(/http:\/\/www\.imdb\.com\/title\/(tt\d+)\//),
						dateId: Date.now(),
						name: GetName(),
						imdbYear: GetYear(),
						directors: GetDirectors(),
						writers: GetWriters(),
						stars: GetStars(),
						ratings: {},
						//Props with Uppercase below
						connects: {},
						genres: GetGenresP(),
						custom: ""
					};
				UpdateGM("cache");
			} else
			{
				if ((cache[id]["dateId"] + oneMonth) <= Date.now())
				{
					cache[id] =
						{
							fullUrl: url.match(/http:\/\/www\.imdb\.com\/title\/(tt\d+)\//),
							dateId: Date.now(),
							name: GetName(),
							imdbYear: GetYear(),
							directors: GetDirectors(),
							writers: GetWriters(),
							stars: GetStars(),
							ratings: {},
							//Props with Uppercase below
							connects: {},
							genres: GetGenresP(),
							custom: ""
						};
					UpdateGM("cache");
				}
			}
			break;
		case "movieXML":
			if (cache[id] === undefined)
			{
				cache[id] =
					{
						fullUrl: url.match(/http:\/\/www\.imdb\.com\/title\/(tt\d+)\//),
						dateId: Date.now(),
						name: GetName(),
						imdbYear: GetYear(),
						directors: GetDirectors(),
						writers: GetWriters(),
						stars: GetStars(),
						ratings: {},
						//Props with Uppercase below
						connects: {},
						genres: GetGenresP(),
						custom: ""
					};
				UpdateGM("cache");
			} else
			{
				if ((cache[id]["dateId"] + oneMonth) <= Date.now())
				{
					cache[id] =
						{
							fullUrl: url.match(/http:\/\/www\.imdb\.com\/title\/(tt\d+)\//),
							dateId: Date.now(),
							name: GetName(),
							imdbYear: GetYear(),
							directors: GetDirectors(),
							writers: GetWriters(),
							stars: GetStars(),
							ratings: {},
							//Props with Uppercase below
							connects: {},
							genres: GetGenresP(),
							custom: ""
						};
					UpdateGM("cache");
				}
			}
			break;
		case "connects":
			if (cache[id] === undefined)
			{
				//NEED THINK ABOUT, REQUEST IFRAME AND ADD MOVIE AND AFTER CONNECTIONS TODO
				xmlIMDB("movie", document.URL);
				AddCache("connects", document.URL);
			} else
			{
				if ((cache[id]["dateId"] + oneMonth) <= Date.now())
				{
					//UPDATE???? TODO					
				} else
				{
					if ($.isEmptyObject(cache[id]["connects"]))
					{
						cache[id].connects = GetConnects("page");
						UpdateGM("cache");
					}
				}
			}
			break;
		case "connectsXML":
			if (cache[id] === undefined)
			{
				//NEED THINK ABOUT, REQUEST IFRAME AND ADD MOVIE AND AFTER CONNECTIONS TODO
				//xmlIMDB("movie", document.URL);
				//AddCache("connects", document.URL);
				//
				//CANT BE TRUE?????????????????????????????????????
				//
			} else
			{
				if ((cache[id]["dateId"] + oneMonth) <= Date.now())
				{
					//UPDATE???? TODO					
				} else
				{
					if ($.isEmptyObject(cache[id]["connects"]))
					{
						cache[id].connects = GetConnects("xml", doc);
						UpdateGM("cache");
					}
				}
			}
			break;
		default:
			alert("fun:AddCache(" + what + "," + url + "). default switch");
			break;
	}
}
//Function Add to Cache movie/and anything
//End

//Start
//Function get connections on connections page
//what:Where are we get connections on page or xml. doc:optional for xml
function GetConnects(what, doc)
{
	var c = {},
		x = 0,
		y = 0,
		keys = [],
		hrefs = $(".jumpto > a"),
		n = [],
		parent = $("div.list").find('*'),
		divs = [];

	switch (what) 
	{ 
		case "page":
			try
			{
				for (let i = 0; i <= parent.length; i++)
				{
					if ($(parent[i]).prop("name"))
					{
						n[x] = i;
						x++;
					}

					if (i === parent.length)
					{
						n[x] = i;
						x++;
					}

				}

				for (let i = 0; i < hrefs.length; i++)
				{
					keys[i] = $(hrefs[i]).attr("href").slice(1, $(hrefs[i]).attr("href").length);
					c[i] =
						{
							name: $.trim($("#" + keys[i]).next().text())
						};
				}
				//console.log($("#" + keys[0]).next().text());
				//console.log($("#" + keys[0]).next().next().is("div"));
				//console.log(parent);
				console.log(n);
				for (let x = 0; x < n.length; x++)
				{
					for (let i = n[x]; i < n[x + 1]; i++)
					{
						//console.log($(parent[i]));
						//console.log($(parent[i]).is("div"));
						if ($(parent[i]).is("div"))
						{
							divs[y] = $(parent[i]);
							console.log(c[0]);
							c[x][y] =
								{
									nameMovie: $(divs[y]).contents()[0].innerHTML,
									id: $($(divs[y]).contents()[0]).attr("href").match(/\/(tt\d+)/)[1],
									year: $.trim($(divs[y]).contents()[1].nodeValue),
									text: ($(divs[y]).contents()[3] === undefined ? "" : $(divs[y]).contents()[3].nodeValue)
								};
							y++;
						}
					}
					y = 0;
					divs = [];
				}
				//console.log(divs);
				//console.log(finalObj);
				console.log(c);
				return c;
			} catch (e) { console.log(e); }
			break;
		case "xml":
			try
			{
				hrefs = $(doc).contents().find(".jumpto > a");
				parent = $(doc).contents().find("div.list").find('*');

				for (let i = 0; i <= parent.length; i++)
				{
					if ($(parent[i]).prop("name"))
					{
						n[x] = i;
						x++;
					}

					if (i === parent.length)
					{
						n[x] = i;
						x++;
					}

				}

				for (let i = 0; i < hrefs.length; i++)
				{
					keys[i] = $(hrefs[i]).attr("href").slice(1, $(hrefs[i]).attr("href").length);
					c[i] =
						{
						name: $.trim($(doc).contents().find("#" + keys[i]).next().text())
						};
				}
				//console.log($("#" + keys[0]).next().text());
				//console.log($("#" + keys[0]).next().next().is("div"));
				//console.log(parent);
				//console.log(c);
				for (let x = 0; x < n.length; x++)
				{
					for (let i = n[x]; i < n[x + 1]; i++)
					{
						//console.log($(parent[i]));
						//console.log($(parent[i]).is("div"));
						if ($(parent[i]).is("div"))
						{
							divs[y] = $(parent[i]);
							c[x][y] =
								{
									nameMovie: $(divs[y]).contents()[0].innerHTML,
									id: $($(divs[y]).contents()[0]).attr("href").match(/\/(tt\d+)/)[1],
									year: $.trim($(divs[y]).contents()[1].nodeValue),
									text: ($(divs[y]).contents()[3] === undefined ? "" : $(divs[y]).contents()[3].nodeValue)
								};
							y++;
						}
					}
					y = 0;
					divs = [];
				}
				//console.log(divs);
				//console.log(finalObj);
				console.log(c);
				return c;
			} catch (e) { console.log(e); }
			break;
		default:
			alert("fun:GetConnects(" + what + "," + doc + "). default switch");
			break;
	}
}
//Function get connections on connections page
//End

//Start
//Function get age on people page
function GetAge()
{
	birthDate = $("time[itemprop='birthDate']");

	var born = new Date();
	var age;

	//If true change it
	if (birthDate && birthDate.attr('datetime'))
	{
		date = birthDate.attr('datetime').split('-');
		born.setFullYear(date[0]);
		born.setMonth(date[1] - 1);
		born.setDate(date[2]);

		age = new Date() - born.getTime();
		age = age / (1000 * 60 * 60 * 24 * 365.242199);

		var years = Math.floor(age);
		var months = Math.floor((age - years) * 12);

		ShowAge(birthDate, years, months);
	}
}
//Function get age on people page
//End

//Start
//Function get name movie
function GetName()
{
	if (debug)
	{
		console.log($(".titleBar"));
		console.log($("h1[itemprop='name']"));
		console.log($("h1[itemprop='name']").contents()[0].nodeValue);
		console.log($(".originalTitle"));
	}
	if ($(".originalTitle").length !== 0)
	{
		return $.trim($(".originalTitle").contents()[0].nodeValue);
	} else
	{
		return $.trim($("h1[itemprop='name']").contents()[0].nodeValue);
	}
}
//Function get name movie
//End

//Start
//Function get year movie
function GetYear()
{
	try
	{
		if (debug)
		{
			console.log($(".titleBar"));
			console.log($("h1[itemprop='name']"));
			//console.log($("h1[itemprop='name']").contents()[1].childNodes[1].innerHTML);
		}
		return ($("h1[itemprop='name']").contents()[1] === undefined ? "-" : $.trim($("h1[itemprop='name']").contents()[1].childNodes[1].innerHTML));
	} catch (e) { console.log(e); }
}
//Function get year movie
//End

//Start
//Function get genres on movie page
function GetGenresP()
{
	var genres = {},
		g = $("span[itemprop='genre']");

	for (let i = 0; i < g.length; i++)
	{
		genres[$.trim(g[i].innerHTML)] = "http://www.imdb.com/genre/" + $.trim(g[i].innerHTML);
	}

	return genres;
}
//Function get genres on movie page
//End

//Start
//Function get directors movie
function GetDirectors()
{
	try
	{
		var d = [],
			s = $(".credit_summary_item > .inline");
		//console.log(s.contents());
		for (let i = 0; i < s.length; i++)
		{
			if (s.contents()[i].nodeValue.indexOf("Director") !== -1)
			{
				//console.log(s.contents()[i]);
				//console.log($.trim($(s.contents()[i].parentNode.parentNode.children).filter("span").text()));
				var spa = $(s.contents()[i].parentNode.parentNode.children).filter("span");
				if (spa.length > 1)
				{
					for (let i = 0; i < spa.length; i++)
					{
						var str = $.trim($(spa[i]).text());
						str = str.replace(/,|\|/g, '');
						if (str !== "")
						{
							d[i] = str;
						}
					}
				} else
				{
					d[0] = $.trim(spa.text());
				}
			}
		}
		return d;
	} catch (e) { console.log(e); }
}
//Function get directors movie
//End


//Start
//Function get writes movie
function GetWriters()
{
	var w = [],
		s = $(".credit_summary_item > .inline");
	//console.log(s.contents());
	for (let i = 0; i < s.length; i++)
	{
		if (s.contents()[i].nodeValue.indexOf("Writer") !== -1)
		{
			//console.log(s.contents()[i]);
			//console.log($.trim($(s.contents()[i].parentNode.parentNode.children).filter("span").text()));
			var spa = $(s.contents()[i].parentNode.parentNode.children).filter("span");
			if (spa.length > 1)
			{
				for (let i = 0; i < spa.length; i++)
				{
					var str = $.trim($(spa[i]).text());
					str = str.replace(/,|\|/g, '');
					if (str !== "")
					{
						w[i] = str;
					}
				}
			} else
			{
				w[0] = $.trim(spa.text());
			}
		}
	}
	return w;
}
//Function get writes movie
//End

//Start
//Function get stars movie
function GetStars()
{
	var st = [],
		s = $(".credit_summary_item > .inline");
	//console.log(s.contents());
	for (let i = 0; i < s.length; i++)
	{
		if (s.contents()[i].nodeValue.indexOf("Star") !== -1)
		{
			//console.log(s.contents()[i]);
			//console.log($.trim($(s.contents()[i].parentNode.parentNode.children).filter("span").text()));
			var spa = $(s.contents()[i].parentNode.parentNode.children).filter("span");
			if (spa.length > 1)
			{
				for (let i = 0; i < spa.length; i++)
				{
					var str = $.trim($(spa[i]).text());
					str = str.replace(/,|\|/g, '');
					if (str !== "")
					{
						st[i] = str;
					}
				}
			} else
			{
				st[0] = $.trim(spa.text());
			}
		}
	}
	return st;
}
//Function get stars movie
//End


//-------------------------
//XMLHTTPREQUESTS/IFRAME BELOW
//-------------------------

//Start
//Function CheckIframeLoaded
function CheckIframeLoaded()
{
	//$('#imdbe_iframeIMDB').load(function ()
	//{
		//$(this).show();
	//	console.log("0I am loaded");
	//});
	//$(function ()
	//{
	//	$('#imdbe_iframeIMDB').ready(function ()
	//	{
	//		console.log("I am loaded");
	//	});
	//});
	// Get a handle to the iframe element
	//var iframe = document.getElementById("imdbe_iframeIMDB");
	//var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;


	// Check if loading is complete
	//if (iframeDoc.readyState === 'complete')
	//{
	//	alert("I am loaded");
	//	return;
	//}
	
	// If we are here, it is not loaded. Set things up so we check   the status again in 100 milliseconds
	//window.setTimeout('CheckIframeLoaded();', 1000);
	//window.setInterval(function () { CheckIframeLoaded(); }, 100);
}
//Function CheckIframeLoaded
//End

//Start
//Function xml/iframe on imdb
function xmlIMDB(what, url)
{
	var id = url.match(/\/(tt\d+)\//)[1];

	switch (what)
	{
		case "connections":
			GM_xmlhttpRequest({
				method: "GET",
				url: "http://www.imdb.com/title/" + id + "/movieconnections",
				headers: { "User-agent": navigator.userAgent, "Accept": "document" },
				onload: function (response)
				{
					console.log(response);
					var parser = new DOMParser();
					var doc = parser.parseFromString(response.responseText, "text/html");
					AddCache("connectsXML", document.URL, doc);
					ShowConnections(url);
				},
				onerror: function (e)
				{
					console.error(e);
				}
			});
			/*
			$("<iframe>", {
				src: "http://www.imdb.com/title/" + id + "/movieconnections",
				referrerpolicy: "no-referrer",
				id: "imdbe_iframeIMDB",
				frameborder: 0,
				width: 1000
			}).insertAfter('#footer');
			//CheckIframeLoaded();
			setTimeout(function ()
			{
				document.querySelector("#imdbe_iframeIMDB").remove();
			}, 5000);
			*/
			break;
		case "movie":
			/*
			$("<iframe>", {
				src: "http://www.imdb.com/title/" + id,
				referrerpolicy: "no-referrer",
				id: "imdbe_iframeIMDB",
				frameborder: 0,
				width: 1000
			}).insertAfter('#footer');
			//CheckIframeLoaded();
			setTimeout(function ()
			{
				document.querySelector("#imdbe_iframeIMDB").remove();
			}, 5000);
			*/
			break;
		case "xml":
			GM_xmlhttpRequest({
				method: "GET",
				//url: "https://www.reddit.com/r/movies/comments/6yakju/rami_malek_as_freddie_mercury_in_bohemian_rhapsody/",
				url: "http://www.imdb.com/title/tt0409799/movieconnections",
				//url: "http://www.imdb.com/name/nm2093747/?ref_=tt_cl_t12",
				headers: { "User-agent": navigator.userAgent, "Accept": "document" },
				onload: function (response)
				{
					//.replace(/[\s\S]*?(<div id="connections_content" class="header">)/ig, '')
					//console.log($.trim(StripNewLines(response.responseText)));
					console.log(response);
					//document.getElementById('footer').insertAdjacentHTML('afterend', $.trim(StripNewLines(response.responseText)));
					//$('<iframe>', {
					//	srcdoc: $.trim(StripNewLines(response.responseText)),
					//	//src: 'http://www.imdb.com/name/nm1653263/',
					//	referrerpolicy: "no-referrer",
					//	id: 'imdbe_iframe',
					//	frameborder: 0,
					//	width: 1000
					//}).insertAfter('#footer');
					parser = new DOMParser();
					doc = parser.parseFromString(response.responseText, "text/html");
					// returns a HTMLDocument, which also is a Document.
					console.log($(doc).contents().find(".jumpto > a"));
				},
				onerror: function (response)
				{
					//.replace(/[\s\S]*?(<div id="connections_content" class="header">)/ig, '')
					console.log(response);
					//document.getElementById('footer').insertAdjacentHTML('afterend', StripNewLines(response.responseText));
				}
			});
			break;
	}
	/*
	GM_xmlhttpRequest({
		method: "GET",
		url: "https://www.reddit.com/r/movies/comments/6yakju/rami_malek_as_freddie_mercury_in_bohemian_rhapsody/",
		//url: "http://www.imdb.com/title/tt0409799/movieconnections",
		//url: "http://www.imdb.com/name/nm2093747/?ref_=tt_cl_t12",
		onload: function (response)
		{
			//.replace(/[\s\S]*?(<div id="connections_content" class="header">)/ig, '')
			console.log($.trim(StripNewLines(response.responseText)));
			//document.getElementById('footer').insertAdjacentHTML('afterend', $.trim(StripNewLines(response.responseText)));
			$('<iframe>', {
				srcdoc: $.trim(StripNewLines(response.responseText)),
				//src: 'http://www.imdb.com/name/nm1653263/',
				referrerpolicy: "no-referrer",
				id: 'imdbe_iframe',
				frameborder: 0,
				width: 1000
			}).insertAfter('#footer');
			setTimeout(function () { console.log($("#imdbe_iframe").contents().find(".thing"));},5000);
		},
		onerror: function (response)
		{
			//.replace(/[\s\S]*?(<div id="connections_content" class="header">)/ig, '')
			console.log(response);
			//document.getElementById('footer').insertAdjacentHTML('afterend', StripNewLines(response.responseText));
		}
	});
	//console.log($("#imdbe_iframe").contents());
	*/
}
//Function xml on imdb
//End

//-------------------------
//UI AND VISUAL STAFF BELOW
//-------------------------

//Start
//Function show age on people page
function ShowAge(birthDate, years, months)
{
	var container = " <span>(Age: " + years + " year" + (years === 1 ? '' : 's') + ", " + months + " month" + (months === 1 ? '' : 's') + ")</span>";

	if (!debug && GM_getValue("adm") && (document.URL.match(/http:\/\/www\.imdb\.com\/name\/nm1782299/i) || document.URL.match(/http:\/\/www\.imdb\.com\/name\/nm0914612/i)))
	{
		var c = "<span>(Always 18)</span>";
		$(c).insertAfter(birthDate)
			.mouseover(function ()
			{
				$(this).text("(Age: " + years + " year" + (years === 1 ? '' : 's') + ", " + months + " month" + (months === 1 ? '' : 's') + ")");
			})
			.mouseout(function ()
			{
				$(this).text("(Always 18)");
			});
	} else
	{
		$(container).insertAfter(birthDate);
	}
}
//Function show age on people page
//End

//Start
//Function show genre on people page
function ShowGenre()
{
	
}
//Function show genre on people page
//End

//Start
//Function show genre on people page
function ShowConnections(url)
{
	var id = url.match(/\/(tt\d+)\//)[1];
	var contentH = "";
	var contents = "";

	const begHead = "<div class='head'>\
		<span id='hide-actress' class='hide-link' style='display: none;'> Hide & nbsp; <img src='http://ia.media-imdb.com/images/G/01/imdb/images/icons/hide-1061525577._CB522736167_.png' class='absmiddle' alt='Hide' width='18' height='16'></span>\
		<span id='show-actress' class='show-link' style='display: inline;'>Show&nbsp;<img src='http://ia.media-imdb.com/images/G/01/imdb/images/icons/show-582987296._CB522736544_.png' class='absmiddle' alt='Show' width='18' height='16'></span>";
	const endHead = "</div>";

	const begContent = "<div class='filmo-category-section' style='display:block;'>";
	const endContent = "</div>";

	const begContentRowOdd = "<div class='filmo-row odd' id='self-tt1001361'>";
	const endContentRowOdd = "</div>";

	const begContentRowEven = "<div class='filmo-row even' id='self-tt1001361'>";
	const endContentRowEven = "</div>";

	if ($.isEmptyObject(cache[id]["connects"]))
	{
		xmlIMDB("connections", document.URL);
		return;
	}

	for (let i = 0; i < Object.keys(cache[id]["connects"]).length; i++)
	{
		contents = "";
		//console.log(Object.keys(cache[id]["connects"]).length);
		//SORT TODO FOLOWS FIRST AND FOLLOING BY SECCONG, AND MAkE SETTINGS BY SHOWING SPIN OFF OR NOT
		for (let x = 0; x < (Object.keys(cache[id]["connects"][i]).length - 1); x++)
		{
			if (x % 2)
			{
				contents += begContentRowEven + "<span class='year_column'>&nbsp;" + cache[id]["connects"][i][x]["year"] + "</span>"
					+ "<b><a href='http://www.imdb.com/title/" + cache[id]["connects"][i][x]["id"] + "'>" + cache[id]["connects"][i][x]["nameMovie"] + "</a></b>"
					+ "<br>" + cache[id]["connects"][i][x]["text"] + endContentRowEven;
			} else
			{
				contents += begContentRowOdd + "<span class='year_column'>&nbsp;" + cache[id]["connects"][i][x]["year"] + "</span>"
					+ "<b><a href='http://www.imdb.com/title/" + cache[id]["connects"][i][x]["id"] + "'>" + cache[id]["connects"][i][x]["nameMovie"] + "</a></b>"
					+ "<br>" + cache[id]["connects"][i][x]["text"] + endContentRowOdd;
			}
		}
		contentH += begHead + "<a name='actress'>" + cache[id]["connects"][i]["name"] + "</a> (" + (Object.keys(cache[id]["connects"][i]).length - 1) + ")" + endHead + begContent + contents + endContent;
	}
	console.log(contentH);

	const divConnections = $("<div id=imdbe_divconnections class=article></div>").html("<div> \
	<span class='rightcornerlink'> \
	<a href='http://www.imdb.com/title/" + id + "/movieconnections'>Learn more</a> \
	</span>\
	<div class=name><h1 class='h2'>Connections</h1></div>\
	<div id='filmography'>" + contentH + "</div >\
  ");

	if ($("#titleRecs").length === 0)
	{
		$("#titleCast").before(divConnections);
	} else
	{
		$("#titleRecs").before(divConnections);
	}

	for (let i = 0; i < Object.keys(cache[id]["connects"]).length; i++)
	{
		//console.log(((cache[id]["connects"][i]["name"] !== "Follows") | (cache[id]["connects"][i]["name"] !== "Followed by") ? "yes" : "no"));
		if (cache[id]["connects"][i]["name"] !== "Follows")
		{
			if (cache[id]["connects"][i]["name"] !== "Followed by")
			{
				$("#imdbe_divconnections").find(".head:eq(" + i + ")").next(".filmo-category-section").toggle();
				//console.log($("#imdbe_divconnections").find(".head:eq(" + i + ")"));
			}
		}
	}

	console.log(cache[id]["connects"]);

	if (Object.keys(cache[id]["connects"]).length > 0 || cache[id]["connects"] === undefined)
	{
		//$("#filmography").append($("<div class=article></div>").html("Connections"));
	} else
	{
		console.log($("#filmography"));
		$("#filmography").append($("<div class=article></div>").html("No Connections"));
	}
}
//Function show genre on people page
//End

//Start
//Function place css
function SetCSS()
{
	$("head").append($("<!--Start of IMDB Enhancement v" + GM_info.script.version + " CSS-->"));

	/*Settings Filled icon by Icons8 */
	/* Customizes Settings Filled icon */
	$("head").append($("<style type=text/css></style>").text(".icons8-Settings-Filled { \
		background: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjAiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgNTAgNTAiIGZpbGw9IiNmYWxzZSIgPjxnIGlkPSJzdXJmYWNlMSI+PHBhdGggc3R5bGU9IiAiIGQ9Ik0gNTAgMjguNzkyOTY5IEwgNTAgMjEuMTA1NDY5IEwgNDIuNjU2MjUgMTkuOTA2MjUgQyA0Mi4yNzM0MzggMTguNTc4MTI1IDQxLjc0NjA5NCAxNy4zMDQ2ODggNDEuMDgyMDMxIDE2LjEwMTU2MyBMIDQ1LjM1OTM3NSAxMC4wMDM5MDYgTCAzOS45MjE4NzUgNC41NzAzMTMgTCAzMy45MDIzNDQgOC44OTg0MzggQyAzMi42ODc1IDguMjIyNjU2IDMxLjQwMjM0NCA3LjY4NzUgMzAuMDcwMzEzIDcuMzA0Njg4IEwgMjguNzg5MDYzIC0wLjAwMzkwNjI1IEwgMjEuMTAxNTYzIC0wLjAwMzkwNjI1IEwgMTkuOTE0MDYzIDcuMjgxMjUgQyAxOC41NzAzMTMgNy42NjAxNTYgMTcuMjg1MTU2IDguMTg3NSAxNi4wNzgxMjUgOC44NTU0NjkgTCAxMC4wNzAzMTMgNC41NjY0MDYgTCA0LjYzNjcxOSAxMCBMIDguODU5Mzc1IDE2LjAzOTA2MyBDIDguMTc5Njg4IDE3LjI2MTcxOSA3LjY0MDYyNSAxOC41NTQ2ODggNy4yNTM5MDYgMTkuODk4NDM4IEwgMCAyMS4xMDU0NjkgTCAwIDI4Ljc5Mjk2OSBMIDcuMjQyMTg4IDMwLjA3NDIxOSBDIDcuNjI4OTA2IDMxLjQyMTg3NSA4LjE2NDA2MyAzMi43MTQ4NDQgOC44NDc2NTYgMzMuOTM3NSBMIDQuNTY2NDA2IDM5LjkyMTg3NSBMIDEwIDQ1LjM2MzI4MSBMIDE2LjA0Njg3NSA0MS4xMjg5MDYgQyAxNy4yNjU2MjUgNDEuODAwNzgxIDE4LjU1NDY4OCA0Mi4zMzIwMzEgMTkuODkwNjI1IDQyLjcxNDg0NCBMIDIxLjEwNTQ2OSA1MC4wMDM5MDYgTCAyOC43ODkwNjMgNTAuMDAzOTA2IEwgMzAuMDg1OTM4IDQyLjY5NTMxMyBDIDMxLjQyNTc4MSA0Mi4zMDQ2ODggMzIuNzA3MDMxIDQxLjc2OTUzMSAzMy45MTQwNjMgNDEuMDkzNzUgTCA0MCA0NS4zNjMyODEgTCA0NS40Mzc1IDM5LjkyMTg3NSBMIDQxLjA4OTg0NCAzMy44ODY3MTkgQyA0MS43NTc4MTMgMzIuNjc5Njg4IDQyLjI4MTI1IDMxLjQwNjI1IDQyLjY2MDE1NiAzMC4wODIwMzEgWiBNIDI1IDMyIEMgMjEuMTQwNjI1IDMyIDE4IDI4Ljg1OTM3NSAxOCAyNSBDIDE4IDIxLjE0MDYyNSAyMS4xNDA2MjUgMTggMjUgMTggQyAyOC44NTkzNzUgMTggMzIgMjEuMTQwNjI1IDMyIDI1IEMgMzIgMjguODU5Mzc1IDI4Ljg1OTM3NSAzMiAyNSAzMiBaICI+PC9wYXRoPjwvZz48L3N2Zz4=') 50% 50% no-repeat;\
		background-size: 100%;\
		width: 40px;\
		height: 40px;\
	}"));

	/* Customizes all icons at once */
	$("head").append($("<style type=text/css></style>").text(".icon { \
		display: inline-block; \
	}"));

	$("head").append($("<style type=text/css></style>").text("#imdbe_setbutton { \
		position: absolute;\
		cursor: pointer;\
	}"));

	$("head").append($("<style type=text/css></style>").text("#imdbe_settings { \
		position: fixed;\
		cursor: pointer;\
		z-index: 500;\
		background: #eee;\
	}"));

	$("head").append($("<!--End of IMDB Enhancement v" + GM_info.script.version + " CSS-->"));
}
//Function place css
//End

//Start
//Function place option button and html option
function SetOption()
{
	const settingsDiv = $("<div id=imdbe_settings></div>").html("<div class=spaser><div class=sidecontentbox> \
  <div class=name><h1 class='h1'>Options of IMDB Enhancement " + GM_info.script.version + "</h1></div>\
	<ul class=content><li> \
	<form> \
	<br> \
	<p>Bluring option:</p>\
		<input type=radio name=title id=btr_showTitle >Show brackets</input><br> \
		<input type=radio name=title id=btr_hideTitle >Hide brackets</input><br><br> \
		<input type=checkbox name=age id=imdbe_age >Show age</input><br> \
		<input type=checkbox name=genre id=imdbe_genre >Show genre</input><br><br> \
		<input type=checkbox name=connections id=imdbe_connections >Show connections</input><br><br> \
		<input type=checkbox name=debug id=imdbe_debug >Debug</input><br> \
	</form>\
	<br> \
	<button id=imdbe_clear>Clear cache</button>\
	<button id=imdbe_hide>Save and Close</button></li></ul></div></div> \
  ");

	$("#wrapper").prepend($("<div id=imdbe_setbutton></div>").html("<div class='icon icons8-Settings-Filled'></div>"));
	$("#wrapper").prepend(settingsDiv);
	$("#imdbe_settings").hide();
	UIValues();
	SetEvents();
}
//Function place option button and html option
//End

//Start
//Function set UI values of settengs/options
function UIValues()
{
	$("#imdbe_age").prop("checked", age);
	$("#imdbe_genre").prop("checked", genre);
	$("#imdbe_connections").prop("checked", connections);
	$("#imdbe_debug").prop("checked", debug);
}
//Function set events
//End

//Start
//Function set events
function SetEvents()
{
	$("#imdbe_setbutton").click(function ()
	{
		$("#imdbe_settings").toggle(1000);
	});

	$("#imdbe_hide").click(function ()
	{
		UpdateGM("options");
		$("#imdbe_settings").toggle(1000);
	});

	$("#imdbe_clear").click(function ()
	{
		DeleteValues("imdbe_cache");
	});

	$("#imdbe_debug").change(function ()
	{
		options.debug = $(this).prop("checked");
		debug = $(this).prop("checked");
	});

	$("#imdbe_age").change(function ()
	{
		options.age = $(this).prop("checked");
	});

	$("#imdbe_connections").change(function ()
	{
		options.connections = $(this).prop("checked");
	});

	$("#imdbe_genre").change(function ()
	{
		options.genre = $(this).prop("checked");
	});

	setTimeout(function ()
	{
		$("#imdbe_divconnections").find(".head").click(function ()
		{
			$(this).next(".filmo-category-section").toggle(500);
		});
	}, oneSecond * 2);
	//console.log($("#imdbe_divconnections").find(".head"));
}
//Function set events
//End

//-------------------------
//TOOLS STAFF BELOW
//-------------------------

//Start
//Function StripNewLines
function StripNewLines(string)
{
	return string.replace(/(^[\r\n]*|[\r\n]+)[\s\t]*[\r\n]+/gi, '\n');
}
//Function StripNewLines
//End

// ------------
//  TODO
// ------------

/* TODO STARTS
	1)UI for options, almost done in 0.0.04
	2)Add ratings
	 2.1)Kinopoisk
	 2.2)Rotten
	 2.3)r/movies
	3)Add genres
	 3.1)on search(compact) too
	4)Change a bit Menu
	5)Dark theme?
	6)Connections to movies, almost done in 0.0.05		//DONE 0.0.07
	 6/1)Option show spinoff or not
	7)Cache functionality, almost done in 0.0.03
	8)Hide Elements
	 8.0)Maybe make option to hide only on not rated movies(To escape spoilers) or there different way to find, did user whatched movie or not ***RESEARCH NEEDED***
	 8.1)FAQ
	 8.2)Did You Know?
	 8.3)Recently Viewed
	9)Show months of movies on peaple page... maybe
	 9.1)On search too... maybe
*/