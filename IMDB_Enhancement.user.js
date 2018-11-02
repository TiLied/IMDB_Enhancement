// ==UserScript==
// @name        IMDB Enhancement
// @namespace   https://greasyfork.org/users/102866
// @description IMDB Enhancement adds features
// @include     https://www.imdb.com/*
// @require     https://code.jquery.com/jquery-3.3.1.min.js
// @author      TiLied
// @version     0.2.00
// @grant       GM_listValues
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_deleteValue
// @grant       GM_xmlhttpRequest
// @require     https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @grant       GM.listValues
// @grant       GM.getValue
// @grant       GM.setValue
// @grant       GM.deleteValue
// @grant       GM.xmlHttpRequest
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
	connections,
	trailer,
	hide,
	popupM,
	popupP;

var GetContent = GetContentF(),
	metaObj,
	timeoutID;

/**
* ENUM, BECAUSE WHY NOT ¯\_(ツ)_/¯
* SEE FUNCTION GetPage()
*/
var Page;
(function (Page)
{
	Page[Page["ErrorNothing"] = 0] = "ErrorNothing";
	Page[Page["front"] = 1] = "front";
	Page[Page["search"] = 2] = "search";
	Page[Page["movie"] = 3] = "movie";
	Page[Page["connections"] = 4] = "connections";
	Page[Page["people"] = 5] = "people";
	Page[Page["ErrorNothing1"] = 6] = "ErrorNothing1";
	Page[Page["ErrorNothing2"] = 7] = "ErrorNothing2";
	Page[Page["ErrorNothing3"] = 8] = "ErrorNothing3";
	Page[Page["ErrorNothing4"] = 9] = "ErrorNothing4";
	Page[Page["anythingElse"] = 10] = "anythingElse";
})(Page || (Page = {}));

//Start
//Function main
void function Main()
{
	console.log("IMDB Enhancement v" + GM.info.script.version + " initialization");
	//Place CSS in head
	SetCSS();
	//Set settings or create
	SetSettings(function ()
	{
		//Check on what page we are and switch.
		SwitchPage();
		//Place UI Options
		SetOption();
		console.log("Page number: " + whatPage + "/" + Page[whatPage] + " page");
	});
	
}();
//Function main
//End

//Start
//Functions GM_VALUE
async function SetSettings(callBack)
{
	try
	{
		//DeleteValues("all");
		//if (debug && await GM.getValue("adm"))
		//	DeleteValues("imdbe_cache");
		//THIS IS ABOUT OPTIONS
		if (await HasValue("imdbe_options", JSON.stringify(options)))
		{
			options = JSON.parse(await GM.getValue("imdbe_options"));
			SetOptionsObj();
		}

		//THIS IS ABOUT CACHE
		if (await HasValue("imdbe_cache", JSON.stringify(cache)))
		{
			cache = JSON.parse(await GM.getValue("imdbe_cache"));
			SetCacheObj();
		}

		//Console log prefs with value
		console.log("*prefs:");
		console.log("*-----*");
		var vals = await GM.listValues();

		//Find out that var in for block is not local... Seriously js?
		for (let i = 0; i < vals.length; i++)
		{
			console.log("*" + vals[i] + ":" + await GM.getValue(vals[i]));
		}
		console.log("*-----*");
		if (debug)
		{
			console.log(options);
			console.log(cache);
		}

		callBack();
	} catch (e) { console.log(e); }
}

//Check if value exists or not.  optValue = Optional
async function HasValue(nameVal, optValue)
{
	var vals = await GM.listValues();

	if (vals.length === 0)
	{
		if (optValue !== undefined)
		{
			GM.setValue(nameVal, optValue);
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
		GM.setValue(nameVal, optValue);
		return true;
	} else
	{
		return false;
	}
}

//Delete Values
async function DeleteValues(nameVal)
{
	var vals = await GM.listValues();

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
					GM.deleteValue(vals[i]);
				}
			}
			break;
		case "old":
			for (let i = 0; i < vals.length; i++)
			{
				if (vals[i] === "debug" || vals[i] === "debugA")
				{
					GM.deleteValue(vals[i]);
				}
			}
			break;
		default:
			for (let i = 0; i < vals.length; i++)
			{
				if (vals[i] === nameVal)
				{
					GM.deleteValue(nameVal);
				}
			}
			break;
	}
}

///Update gm value what:"cache","options"
function UpdateGM(what)
{
	var gmVal;

	switch (what)
	{
		case "cache":
			gmVal = JSON.stringify(cache);
			GM.setValue("imdbe_cache", gmVal);
			break;
		case "options":
			gmVal = JSON.stringify(options);
			GM.setValue("imdbe_options", gmVal);
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
	try
	{
		//Debug option
		if (typeof options.debug === "undefined")
		{
			options.debug = false;
			debug = options.debug;
		} else
		{
			debug = options.debug;
		}

		//Version
		if (typeof options.version === "undefined")
		{
			options.version = GM.info.script.version;
			version = options.version;
		} else
		{
			version = options.version;
			if (version !== GM.info.script.version)
			{
				options.version = GM.info.script.version;
				version = options.version;
			}
		}

		//additionalRatings option
		if (typeof options.additionalRatings === "undefined")
		{
			options.additionalRatings =
				{
					on: true,
					kinopoisk: false,
					rottenTomatoes: false,
					rMovies: false,
					tmdb: false
				};
			additionalRatings = options.additionalRatings;
		} else
		{
			if (typeof options.additionalRatings["kinopoisk"] === "undefined") { options.additionalRatings["kinopoisk"] = false; }
			if (typeof options.additionalRatings["rottenTomatoes"] === "undefined") { options.additionalRatings["rottenTomatoes"] = false; }
			if (typeof options.additionalRatings["rMovies"] === "undefined") { options.additionalRatings["rMovies"] = false; }
			if (typeof options.additionalRatings["tmdb"] === "undefined") { options.additionalRatings["tmdb"] = false; }
			additionalRatings = options.additionalRatings;
		}

		//hide option
		if (typeof options.hide === "undefined")
		{
			options.hide =
				{
					on: true,
					faq: true,
					dyk: true,
					userRev: false,
					recVie: false
				};
			hide = options.hide;
		} else
		{
			if (typeof options.hide["faq"] === "undefined") { options.hide["faq"] = true; }
			if (typeof options.hide["dyk"] === "undefined") { options.hide["dyk"] = true; }
			if (typeof options.hide["userRev"] === "undefined") { options.hide["userRev"] = false; }
			if (typeof options.hide["recVie"] === "undefined") { options.hide["recVie"] = false; }
			hide = options.hide;
		}

		//age option
		if (typeof options.age === "undefined")
		{
			options.age = false;
			age = options.age;
		} else
		{
			age = options.age;
		}

		//genre option
		if (typeof options.genre === "undefined")
		{
			options.genre = false;
			genre = options.genre;
		} else
		{
			genre = options.genre;
		}

		//connections option
		if (typeof options.connections === "undefined")
		{
			options.connections = true;
			connections = options.connections;
		} else
		{
			connections = options.connections;
		}

		//trailer option
		if (typeof options.trailer === "undefined")
		{
			options.trailer = true;
			trailer = options.trailer;
		} else
		{
			trailer = options.trailer;
		}

		//popup for movies option
		if (typeof options.popupM === "undefined")
		{
			options.popupM = false;
			popupM = options.popupM;
		} else
		{
			popupM = options.popupM;
		}

		//popup for people option
		if (typeof options.popupP === "undefined")
		{
			options.popupP = false;
			popupP = options.popupP;
		} else
		{
			popupP = options.popupP;
		}
	} catch (e) { console.error(e); }
}

function SetCacheObj()
{
	try
	{
		var v = String(version).split('.');
		v = v.slice(0, 2);
		var ver = v[0] + "." + v[1];

		//Version
		if (typeof cache.versionCache === "undefined")
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
	} catch (e) { console.error(e); }
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
			SetUpForFront();
			break;
		case 2:
			SetUpForSearch();
			break;
		case 3:
			AddCache("movie", document.URL);
			SetUpForMovie();
			break;
		case 4:
			AddCache("connects", document.URL);
			SetUpForConnects();
			break;
		case 5:
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
	10-anything else
	*/
	try
	{
		if (document.location.pathname === "/")
		{
			whatPage = 1;
		} else if (url.match(/https:\/\/www\.imdb\.com\/find/i))
		{
			whatPage = 2;
		} else if (url.match(/https:\/\/www\.imdb\.com\/title/i) && !url.match(/(movieconnections)|(tt_trv_(cnn|snd|trv|qu|gf|cc)|tt(cnn|snd|trv|qu|gf|cc))/i))
		{
			whatPage = 3;
		} else if (url.match(/https:\/\/www\.imdb\.com\/title/i) && url.match(/(movieconnections)|(tt_trv_cnn|ttcnn)/i))
		{
			whatPage = 4;
		} else if (url.match(/https:\/\/www\.imdb\.com\/name/i))
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
//Function check option on this Front page
function SetUpForFront()
{
	if (popupM)
	{
		SetEvents("popupM");
	}
}
//Function check option on this Front page
//End

//Start
//Function check option on this Search page
function SetUpForSearch()
{
	if (popupM)
	{
		SetEvents("popupM");
	}
}
//Function check option on this Search page
//End

//Start
//Function check option on this people page
function SetUpForPeople()
{
	if (age)
	{
		GetContent.age();
	}

	if (genre)
	{
		GetContent.genre();
		//event detecting click
		SetEvents("clickFilm");
	}

	if (popupM)
	{
		SetEvents("popupM");
	}
}
//Function check option on this people page
//End



//Start
//Function check option on this Connects page
function SetUpForConnects()
{
	if (popupM)
	{
		SetEvents("popupM");
	}
}
//Function check option on this Connects page
//End

//Start
//Function check option on this movie page
function SetUpForMovie()
{
	if (connections)
	{
		ShowConnections(document.URL);
	}

	if (trailer)
	{
		ShowYoutubeUrl(document.URL);
	}

	if (additionalRatings["on"])
	{
		if (additionalRatings["kinopoisk"])
		{
			ShowRatings(document.URL, "kinopoisk");
		}

		if (additionalRatings["rottenTomatoes"])
		{
			ShowRatings(document.URL, "rottenTomatoes");
		}

		if (additionalRatings["rMovies"])
		{
			ShowRatings(document.URL, "rMovies");
		}

		if (additionalRatings["tmdb"])
		{
			ShowRatings(document.URL, "tmdb");
		}
	}

	if (hide["on"])
	{
		//TODO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	}

	if (popupM)
	{
		SetEvents("popupM");
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
async function AddCache(what, url, doc)
{

	var id = url.match(/\/(tt\d+)\//)[1];

	function ChacheObj(id, what, url, doc)
	{
		//console.log(doc);
		console.log(metaObj);
		if (typeof doc === "undefined")
		{
			cache[id] =
				{
					fullUrl: url.match(/https:\/\/www\.imdb\.com\/title\/(tt\d+)\//),
					dateId: Date.now(),
					name: GetContent.name("page"),
					imdbYear: GetContent.year("page"),
					directors: GetContent.directors("page"),
					writers: GetContent.writers("page"),
					stars: GetContent.stars("page"),
					ratings: {},
					connects: {},
					image: GetContent.image("page"),
					//Props with Uppercase below
					genres: GetContent.genresP("page"),
					summary: GetContent.summary("page"),
					custom: ""
				};
		} else
		{
			cache[id] =
				{
					fullUrl: ["https://www.imdb.com/title/" + id, id],
					dateId: Date.now(),
					name: GetContent.name("xml", doc.body),
					imdbYear: GetContent.year("xml", doc.body),
					directors: GetContent.directors("xml", doc.body),
					writers: GetContent.writers("xml", doc.body),
					stars: GetContent.stars("xml", doc.body),
					ratings: {},
					connects: {},
					image: GetContent.image("xml", doc.body),
					//Props with Uppercase below
					genres: GetContent.genresP("xml", doc.body),
					summary: GetContent.summary("xml", doc.body),
					custom: ""
				};
		}
	}


	switch (what) 
	{
		case "movie":
			if (typeof metaObj === "undefined")
				metaObj = JSON.parse($("head > script[type='application/ld+json']").text());
			if (typeof cache[id] === "undefined")
			{
				ChacheObj(id, what, url, doc);
				UpdateGM("cache");
			} else
			{
				if ((cache[id]["dateId"] + oneMonth) <= Date.now())
				{
					ChacheObj(id, what, url, doc);
					UpdateGM("cache");
				}
			}
			break;
		case "movieXML":
			if (debug)
			{
				//console.log(doc.head);
				//console.log($(doc.head).contents());
				//console.log($(doc.head).find("script[type='application/ld+json']"));
			}

			metaObj = JSON.parse($(doc.head).find("script[type='application/ld+json']").text());

			if (typeof cache[id] === "undefined")
			{
				ChacheObj(id, what, url, doc);
				UpdateGM("cache");
			} else
			{
				if ((cache[id]["dateId"] + oneMonth) <= Date.now())
				{
					ChacheObj(id, what, url, doc);
					UpdateGM("cache");
				}
			}
			break;
		case "connects":
			if (typeof cache[id] === "undefined")
			{
				//NEED THINK ABOUT, REQUEST IFRAME AND ADD MOVIE AND AFTER CONNECTIONS TODO
				// TODO!!!!!!!!!!!!!!!!!!!!!!
				xmlIMDB("movie", document.URL);
				//AddCache("connects", document.URL);
			} else
			{
				if ((cache[id]["dateId"] + oneMonth) <= Date.now())
				{
					//UPDATE???? TODO					
				} else
				{
					if ($.isEmptyObject(cache[id]["connects"]))
					{
						cache[id].connects = GetContent.connects("page");
						UpdateGM("cache");
					}
				}
			}
			break;
		case "connectsXML":
			//if (typeof metaObj === "undefined")
			//	metaObj = JSON.parse($(doc.head).find("script[type='application/ld+json']").text());
			if (typeof cache[id] === "undefined")
			{
				//NEED THINK ABOUT, REQUEST IFRAME AND ADD MOVIE AND AFTER CONNECTIONS TODO
				//xmlIMDB("movie", document.URL);
				//AddCache("connects", document.URL);
				//
				//CANT BE TRUE?????????????????????????????????????
				//
				console.log("IMPOSIBLE ERROR!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
			} else
			{
				if ((cache[id]["dateId"] + oneMonth) <= Date.now())
				{
					//UPDATE???? TODO					
				} else
				{
					if ($.isEmptyObject(cache[id]["connects"]))
					{
						cache[id].connects = GetContent.connects("xml", doc);
						UpdateGM("cache");
					}
				}
			}
			break;
		case "kinopoisk":
			if (typeof cache[id] === "undefined")
			{
				//
				//CANT BE TRUE?????????????????????????????????????
				//
				console.log("IMPOSIBLE ERROR!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
			} else
			{
				if ($.isEmptyObject(cache[id]["ratings"]))
				{
					GetContent.ratings("kinopoisk", doc, id).then(obj => cache[id].ratings["kinopoisk"] = obj);
					UpdateGM("cache");				
				} else
				{
					if ($.isEmptyObject(cache[id]["ratings"]["kinopoisk"]))
					{
						GetContent.ratings("kinopoisk", doc, id).then(obj => cache[id].ratings["kinopoisk"] = obj);
						UpdateGM("cache");	
					}
				}
			}
			break;
		case "rottenTomatoes":
			if (typeof cache[id] === "undefined")
			{
				//
				//CANT BE TRUE?????????????????????????????????????
				//
				console.log("IMPOSIBLE ERROR!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
			} else
			{
				if ($.isEmptyObject(cache[id]["ratings"]))
				{
					await GetContent.ratings("rottenTomatoes", doc, id).then(obj => cache[id].ratings["rottenTomatoes"] = obj);
					UpdateGM("cache");
				} else
				{
					if ($.isEmptyObject(cache[id]["ratings"]["rottenTomatoes"]))
					{
						await GetContent.ratings("rottenTomatoes", doc, id).then(obj => cache[id].ratings["rottenTomatoes"] = obj);
						UpdateGM("cache");
					}
				}
			}
			break;
		case "tmdb":
			if (typeof cache[id] === "undefined")
			{
				//
				//CANT BE TRUE?????????????????????????????????????
				//
				console.log("IMPOSIBLE ERROR!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
			} else
			{
				if ($.isEmptyObject(cache[id]["ratings"]))
				{
					GetContent.ratings("tmdb", doc, id).then(obj => cache[id].ratings["tmdb"] = obj);
					UpdateGM("cache");
				} else
				{
					if ($.isEmptyObject(cache[id]["ratings"]["tmdb"]))
					{
						GetContent.ratings("tmdb", doc, id).then(obj => cache[id].ratings["tmdb"] = obj);
						UpdateGM("cache");
					}
				}
			}
			break;
		case "rMovies":
			if (typeof cache[id] === "undefined")
			{
				//
				//CANT BE TRUE?????????????????????????????????????
				//
				console.log("IMPOSIBLE ERROR!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
			} else
			{
				if ($.isEmptyObject(cache[id]["ratings"]))
				{
					await GetContent.ratings("rMovies", doc, id).then(obj => cache[id].ratings["rMovies"] = obj);
					UpdateGM("cache");
				} else
				{
					if ($.isEmptyObject(cache[id]["ratings"]["rMovies"]))
					{
						await GetContent.ratings("rMovies", doc, id).then(obj => cache[id].ratings["rMovies"] = obj);
						UpdateGM("cache");
					}
				}
			}
			break;
		default:
			alert("fun:AddCache(" + what + "," + url + "," + doc + "). default switch");
			break;
	}
}
//Function Add to Cache movie/and anything
//End

//Start
//Function get Content
//BURN OUT thats why F!
function GetContentF()
{
	//Start
	//Function get connections on connections page
	//what:Where are we get connections on page or xml. doc:optional for xml
	function Connects(what, doc)
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
					//console.log(hrefs);
					if (hrefs.length !== 0)
					{
						for (let i = 0; i < hrefs.length; i++)
						{
							keys[i] = $(hrefs[i]).attr("href").slice(1, $(hrefs[i]).attr("href").length);
							console.log(keys[i]);
							c[i] =
								{
									name: $.trim($("#" + keys[i]).next().text())
								};
						}
					} else
					{
						c[0] =
							{
								name: $.trim($(".li_group").text())
							};
					}
					//console.log($("#" + keys[0]).next().text());
					//console.log($("#" + keys[0]).next().next().is("div"));
					//console.log(c);
					//console.log(parent);
					//console.log(n);
					//console.log(n.length);
					for (x = 0; x < n.length; x++)
					{
						for (let i = n[x]; i < n[x + 1]; i++)
						{
							console.log($(parent[i]));
							console.log($(parent[i]).is("div"));
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
					if (hrefs.length !== 0)
					{
						for (let i = 0; i < hrefs.length; i++)
						{
							keys[i] = $(hrefs[i]).attr("href").slice(1, $(hrefs[i]).attr("href").length);
							c[i] =
								{
									name: $.trim($(doc).contents().find("#" + keys[i]).next().text())
								};
						}
					} else
					{
						c[0] =
							{
								name: $.trim($(doc).contents().find(".li_group").text())
							};
					}
					//console.log($("#" + keys[0]).next().text());
					//console.log($("#" + keys[0]).next().next().is("div"));
					//console.log(parent);
					//console.log(c);
					for (x = 0; x < n.length; x++)
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
				alert("fun:GetContent(what, doc).Connects(" + what + "," + doc + "). default switch");
				break;
		}
	}
	//Function get connections on connections page
	//End

	//Start
	//Function get age on people page
	function Age()
	{
		birthDate = $("#name-born-info > time");
		deathDate = $("#name-death-info > time");
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
			if (deathDate.length === 0)
				ShowAge(birthDate, years, months);
		}
	}
	//Function get age on people page
	//End

	//Start
	//Function get name movie
	//what:Where are we get connections on page or xml. doc:optional for xml
	function Name(what, doc)
	{
		switch (what)
		{
			case "page":
				/*
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
				*/
				return metaObj.name;
			case "xml":
				/*
				if ($(doc).contents().find(".originalTitle").length !== 0)
				{
					return $.trim($(doc).contents().find(".originalTitle").contents()[0].nodeValue);
				} else
				{
					return $.trim($(doc).contents().find("h1[itemprop='name']").contents()[0].nodeValue);
				}
				*/
				return metaObj.name;
			default:
				alert("fun:GetContent(what).name(" + what + "," + doc + "). default switch");
				break;
		}
	}
	//Function get name movie
	//End

	//Start
	//Function get year movie
	//what:Where are we get connections on page or xml. doc:optional for xml
	function Year(what, doc)
	{
		switch (what)
		{
			case "page":
				try
				{
					if (debug)
					{
						//console.log($(".titleBar"));
						//console.log($("h1[itemprop='name']"));
						//console.log(document.title.replace(/^(.+) \((\D*)([0-9]{4})(.*)$/gi, '$3'));
						//console.log($("h1[itemprop='name']").contents()[1].childNodes[1].innerHTML);
						console.log(metaObj.datePublished);
					}
					//return encodeURIComponent(document.title.replace(/^(.+) \((\D*)([0-9]{4})(.*)$/gi, '$3'));
					let moonLanding = new Date(metaObj.datePublished);
					return moonLanding.getFullYear();
				} catch (e) { console.log(e); }
				break;
			case "xml":
				try
				{
					//return ($(doc).contents().find("h1[itemprop='name']").contents()[1] === undefined ? "-" : $.trim($(doc).contents().find("h1[itemprop='name']").contents()[1].childNodes[1].innerHTML));
					if (typeof metaObj.datePublished === "undefined")
						return "-";
					else
					{
						let moonLanding = new Date(metaObj.datePublished);
						return moonLanding.getFullYear();
					}
				} catch (e) { console.log(e); }
				break;
			default:
				alert("fun:GetContent(what).year(" + what + "," + doc + "). default switch");
				break;
		}
	}
	//Function get year movie
	//End

	//Start
	//Function get genres on movie page
	//what:Where are we get connections on page or xml. doc:optional for xml
	function GenresP(what, doc)
	{
		var genres = {},
			g;

		switch (what) 
		{
			case "page":
				/*g = $("span[itemprop='genre']");

				for (let i = 0; i < g.length; i++)
				{
					genres[$.trim(g[i].innerHTML)] = "https://www.imdb.com/genre/" + $.trim(g[i].innerHTML);
				}

				return genres;
				*/
				g = metaObj.genre;

				if (typeof g === "string")
					genres[g] = "https://www.imdb.com/genre/" + g;
				else
				{
					for (let i = 0; i < g.length; i++)
					{
						genres[g[i]] = "https://www.imdb.com/genre/" + g[i];
					}
				}
				return genres;
			case "xml":
				/*
				g = $(doc).contents().find("span[itemprop='genre']");
				if (debug)
					console.log(g);
				for (let i = 0; i < g.length; i++)
				{
					genres[$.trim(g[i].innerHTML)] = "https://www.imdb.com/genre/" + $.trim(g[i].innerHTML);
				}
				*/
				g = metaObj.genre;

				if (typeof g === "string")
					genres[g] = "https://www.imdb.com/genre/" + g;
				else
				{
					for (let i = 0; i < g.length; i++)
					{
						genres[g[i]] = "https://www.imdb.com/genre/" + g[i];
					}
				}
				return genres;
			default:
				alert("fun:GetContent(what).genresP(" + what + "," + doc + "). default switch");
				break;
		}
	}
	//Function get genres on movie page
	//End

	//Start
	//Function get directors movie
	//what:Where are we get connections on page or xml. doc:optional for xml
	function Directors(what, doc)
	{
		var d = [],
			s,
			spa,
			str;

		switch (what)
		{
			case "page":
				try
				{
					/*
					s = $(".credit_summary_item > .inline");
					//console.log(s.contents());
					for (let i = 0; i < s.length; i++)
					{
						if (s.contents()[i].nodeValue.indexOf("Director") !== -1)
						{
							//console.log(s.contents()[i]);
							//console.log($.trim($(s.contents()[i].parentNode.parentNode.children).filter("span").text()));
							spa = $(s.contents()[i].parentNode.parentNode.children).filter("span");
							if (spa.length > 1)
							{
								for (let i = 0; i < spa.length; i++)
								{
									str = $.trim($(spa[i]).text());
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
					*/
					if (typeof metaObj["director"] === "undefined")
						return d[0] = "-";
					if (metaObj["director"].length > 1)
					{
						for (let i = 0; i < metaObj["director"].length; i++)
						{
							d[i] = metaObj["director"][i]["name"];
						}
					} else
					{
						d[0] = metaObj["director"]["name"];
					}
					return d;
				} catch (e) { console.log(e); }
				break;
			case "xml":
				try
				{
					/*
					s = $(doc).contents().find(".credit_summary_item > .inline");
					//console.log(s.contents());
					for (let i = 0; i < s.length; i++)
					{
						if (s.contents()[i].nodeValue.indexOf("Director") !== -1)
						{
							//console.log(s.contents()[i]);
							//console.log($.trim($(s.contents()[i].parentNode.parentNode.children).filter("span").text()));
							spa = $(s.contents()[i].parentNode.parentNode.children).filter("span");
							if (spa.length > 1)
							{
								for (let i = 0; i < spa.length; i++)
								{
									str = $.trim($(spa[i]).text());
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
					*/
					if (typeof metaObj["director"] === "undefined")
						return d[0] = "-";
					if (metaObj["director"].length > 1)
					{
						for (let i = 0; i < metaObj["director"].length; i++)
						{
							d[i] = metaObj["director"][i]["name"];
						}
					} else
					{
						d[0] = metaObj["director"]["name"];
					}
					return d;
				} catch (e) { console.log(e); }
				break;
			default:
				alert("fun:GetContent(what).directors(" + what + "," + doc + "). default switch");
				break;
		}
	}
	//Function get directors movie
	//End

	//Start
	//Function get writes movie
	//what:Where are we get connections on page or xml. doc:optional for xml
	function Writers(what, doc)
	{
		var w = [],
			s,
			spa,
			str;

		switch (what)
		{
			case "page":
				/*
				s = $(".credit_summary_item > .inline");

				for (let i = 0; i < s.length; i++)
				{
					if (s.contents()[i].nodeValue.indexOf("Writer") !== -1)
					{
						//console.log(s.contents()[i]);
						//console.log($.trim($(s.contents()[i].parentNode.parentNode.children).filter("span").text()));
						spa = $(s.contents()[i].parentNode.parentNode.children).filter("span");
						if (spa.length > 1)
						{
							for (let i = 0; i < spa.length; i++)
							{
								str = $.trim($(spa[i]).text());
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
				*/
				if (typeof metaObj["creator"] === "undefined")
					return w[0] = "-";
				if (metaObj["creator"].length > 1)
				{
					for (let i = 0; i < metaObj["creator"].length; i++)
					{
						if (metaObj["creator"][i]["@type"] === "Person")
							w[i] = metaObj["creator"][i]["name"];
					}
				} else
				{
					w[0] = metaObj["creator"]["name"];
				}
				return w;
			case "xml":
				/*
				s = $(doc).contents().find(".credit_summary_item > .inline");

				for (let i = 0; i < s.length; i++)
				{
					if (s.contents()[i].nodeValue.indexOf("Writer") !== -1)
					{
						//console.log(s.contents()[i]);
						//console.log($.trim($(s.contents()[i].parentNode.parentNode.children).filter("span").text()));
						spa = $(s.contents()[i].parentNode.parentNode.children).filter("span");
						if (spa.length > 1)
						{
							for (let i = 0; i < spa.length; i++)
							{
								str = $.trim($(spa[i]).text());
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
				*/
				if (typeof metaObj["creator"] === "undefined")
					return w[0] = "-";
				if (metaObj["creator"].length > 1)
				{
					for (let i = 0; i < metaObj["creator"].length; i++)
					{
						if (metaObj["creator"][i]["@type"] === "Person")
							w[i] = metaObj["creator"][i]["name"];
					}
				} else
				{
					w[0] = metaObj["creator"]["name"];
				}
				return w;
			default:
				alert("fun:GetWriters(" + what + "," + doc + "). default switch");
				break;
		}
	}
	//Function get writes movie
	//End

	//Start
	//Function get stars movie
	//what:Where are we get connections on page or xml. doc:optional for xml
	function Stars(what, doc)
	{
		var st = [],
			s,
			spa,
			str;

		switch (what)
		{
			case "page":
				/*
				s = $(".credit_summary_item > .inline");

				for (let i = 0; i < s.length; i++)
				{
					if (s.contents()[i].nodeValue.indexOf("Star") !== -1)
					{
						//console.log(s.contents()[i]);
						//console.log($.trim($(s.contents()[i].parentNode.parentNode.children).filter("span").text()));
						spa = $(s.contents()[i].parentNode.parentNode.children).filter("span");
						if (spa.length > 1)
						{
							for (let i = 0; i < spa.length; i++)
							{
								str = $.trim($(spa[i]).text());
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
				*/
				if (typeof metaObj["actor"] === "undefined")
					return st[0] = "-";
				if (metaObj["actor"].length > 1)
				{
					for (let i = 0; i < metaObj["actor"].length; i++)
					{
							st[i] = metaObj["actor"][i]["name"];
					}
				} else
				{
					st[0] = metaObj["actor"]["name"];
				}
				return st;
			case "xml":
				/*
				s = $(doc).contents().find(".credit_summary_item > .inline");

				for (let i = 0; i < s.length; i++)
				{
					if (s.contents()[i].nodeValue.indexOf("Star") !== -1)
					{
						//console.log(s.contents()[i]);
						//console.log($.trim($(s.contents()[i].parentNode.parentNode.children).filter("span").text()));
						spa = $(s.contents()[i].parentNode.parentNode.children).filter("span");
						if (spa.length > 1)
						{
							for (let i = 0; i < spa.length; i++)
							{
								str = $.trim($(spa[i]).text());
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
				*/
				if (typeof metaObj["actor"] === "undefined")
					return st[0] = "-";
				if (metaObj["actor"].length > 1)
				{
					for (let i = 0; i < metaObj["actor"].length; i++)
					{
						st[i] = metaObj["actor"][i]["name"];
					}
				} else
				{
					st[0] = metaObj["actor"]["name"];
				}
				return st;
			default:
				alert("fun:GetContent(what).stars(" + what + "," + doc + "). default switch");
				break;
		}
	}
	//Function get stars movie
	//End

	//Start
	//Function get genre from cache
	async function Genre()
	{
		try
		{
			var id,
				rows = $("div.filmo-category-section").not("div[style='display:none;']").find("div.filmo-row b > a");
			if (debug)
			{
				console.log(rows);
				//console.log($("div.filmo-row"));
				//console.log($("div.filmo-row[style!='display:none;']"));
				//console.log($("div.filmo-row").not("div[style='display:none;']"));

			}
			for (let i = 0; i < rows.length; i++)
			{
				//console.log(rows[i].attr("href"));
				id = $(rows[i]).attr("href").match(/\/(tt\d+)\//)[1];
				//console.log(id);
				if (typeof cache[id] === "undefined")
				{
					//console.log(id);
					await xmlIMDB("movie", "/" + id + "/");
					ShowGenre(id, rows[i]);
				} else
				{
					//console.log(id);
					ShowGenre(id, rows[i]);
					//console.log("Yes");
				}
			}
			//console.log(rows);
		} catch (e) { console.error(e); }
	}
	//Function get genre from cache
	//End

	//Start
	//Function get summary from cache
	function Summary(what, doc)
	{
		try
		{
			var s;

			switch (what)
			{
				case "page":
					s = $(".summary_text").text();
					if (debug) console.log(s);
					return StripNewLines($.trim(s));
				case "xml":
					//return s = StripNewLines($.trim($(doc).contents().find(".summary_text").text()));
					if (typeof metaObj["description"] === "undefined")
						return "-";
					return metaObj["description"];
				default:
					alert("fun:GetContent(what).Summary(" + what + "," + doc + "). default switch");
					break;
			}
		} catch (e) { console.error(e); }
	}
	//Function get summary from cache
	//End

	//Start
	//Function get ratings from sites
	async function Ratings(what, doc, id)
	{
		try
		{
			var obj = {},
				url,
				el,
				score,
				names,
				d = doc,
				div;
			//
			//TODO NEED CHECK FOR EXIST ELEMENTS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
			//
			switch (what)
			{
				case "kinopoisk":
					el = $(doc).contents().find("div.most_wanted");
					if (typeof el === "undefined")
					{
						return obj = {
							url: "https://www.kinopoisk.ru/index.php?level=7&from=forma&result=adv&m_act[from]=forma&m_act[what]=content&m_act[find]=" + cache[id]["name"] + "&m_act[year]=" + cache[id]["imdbYear"],
							score: "N/A"
						};
					}

					obj.url = "https://www.kinopoisk.ru" + $(el).contents().find("p.name a").attr("data-url");
					obj.score = parseInt($(el).contents().find("div.rating").text().split(".").join(""));
					if (debug)
					{
						console.log(doc);
						console.log(el);
						console.log(obj);
					}
					return obj;
				case "rottenTomatoes":
					url = $(d.body).contents().find("p.title > a").attr("href");

					if (typeof url !== "undefined")
					{
						d = await xmlIMDB("xml", "/" + id + "/", url);
						//AddCache("rMovies", document.URL, doc);
					} else
					{
						url = $(d.body).contents().find("a[href^='https://www.rottentomatoes.com/']").attr("href");

						if (typeof url === "undefined")
						{
							return obj = {
								url: "https://www.rottentomatoes.com/search/?search=" + cache[id]["name"],
								score: "N/A"
							};
						}
					}

					url = $(d.body).contents().find("a[href^='https://www.rottentomatoes.com/']").attr("href");
					console.log(url);
					if (typeof url === "undefined")
					{
						return obj = {
							url: "https://www.rottentomatoes.com/search/?search=" + cache[id]["name"],
							score: "N/A"
						};
					}

					d = await xmlIMDB("xml", "/" + id + "/", url);

					el = JSON.parse($(d.head).find("script[type='application/ld+json']").text());

					if (typeof el === "undefined")
					{
						return obj = {
							url: "https://www.rottentomatoes.com/search/?search=" + cache[id]["name"],
							score: "N/A"
						};
					}

					obj.url = url;
					obj.score = el["aggregateRating"]["ratingValue"];

					if (debug)
					{
						console.log(doc);
						console.log(el);
						console.log(obj);
					}
					return obj;
				case "tmdb":
					el = $(doc).contents().find("div.item")[0];
					if (typeof el === "undefined")
					{
						return obj = {
							url: "https://www.themoviedb.org/search?query=" + cache[id]["name"] + " y:" + cache[id]["imdbYear"],
							score: "N/A"
						};
					}
					obj.url = "https://www.themoviedb.org" + $(el).contents().find("div a").attr("href");
					obj.score = parseInt($(el).contents().find("div.user_score_chart").attr("data-percent"));
					if (obj.score === 0.0)
						obj.score = "tbd";
					if (debug)
					{
						console.log(doc);
						console.log(el);
						console.log(obj);
					}
					return obj;
				case "rMovies":
					url = $(d.body).contents().find("p.title > a").attr("href");

					if (typeof url !== "undefined")
					{
						d = await xmlIMDB("xml", "/" + id + "/", url);
						//AddCache("rottenTomatoes", document.URL, doc);
					} else
					{
						url = $(d.body).contents().find("a[href^='https://youpoll.me/']:odd").attr("href");

						if (typeof url === "undefined")
						{
							return obj = {
								url: "https://www.reddit.com/r/movies/search?q=" + cache[id]["name"] + "&restrict_sr=on&sort=relevance&t=all",
								score: "N/A"
							};
						}
					}

					obj.url = url;

					url = $(d.body).contents().find("a[href^='https://youpoll.me/']:odd").attr("href");

					if (typeof url === "undefined")
					{
						return obj = {
							url: "https://www.reddit.com/r/movies/search?q=" + cache[id]["name"] + "&restrict_sr=on&sort=relevance&t=all",
							score: "N/A"
						};
					}

					d = await xmlIMDB("xml", "/" + id + "/", url);

					el = $(d.body).find("span.rating-mean-value").text().split(".").join("");

					if (typeof el === "undefined")
					{
						return obj = {
							url: "https://www.reddit.com/r/movies/search?q=" + cache[id]["name"] + "&restrict_sr=on&sort=relevance&t=all",
							score: "N/A"
						};
					}

					obj.score = parseInt(el.slice(0, 2));

					if (debug)
					{
						console.log(doc);
						console.log(el);
						console.log(obj);
					}
					return obj;
				case "xml":
					return s = StripNewLines($.trim($(doc).contents().find(".summary_text").text()));
				default:
					alert("fun:GetContent(what).Ratings(" + what + "," + doc + "). default switch");
					break;
			}
		} catch (e) { console.error(e); }
	}
	//Function get ratings from sites
	//End


	//Start
	//Function get Poster of movie
	function Image(what, doc)
	{
		try
		{
			var i;

			switch (what)
			{
				case "page":
					if (typeof metaObj.image === "undefined")
						return "-";
					return metaObj.image;
				case "xml":
					if (typeof metaObj.image === "undefined")
						return "-";
					return metaObj.image;
				default:
					alert("fun:GetContent(what).Image(" + what + "," + doc + "). default switch");
					break;
			}
		} catch (e) { console.error(e); }
	}
	//Function get Poster of movie
	//End

	return {
		connects: Connects,
		age: Age,
		name: Name,
		year: Year,
		genresP: GenresP,
		directors: Directors,
		writers: Writers,
		stars: Stars,
		genre: Genre,
		summary: Summary,
		ratings: Ratings,
		image: Image
	};
}
//Function get Content
//End

//-------------------------
//XMLHTTPREQUESTS BELOW
//-------------------------

//Start
//Function xml/iframe on imdb
function xmlIMDB(what, url, urlxml)
{
	var id = url.match(/\/(tt\d+)\//)[1],
		parser = new DOMParser(),
		doc;
	//console.log(id);
	switch (what)
	{
		case "connections":
			return new Promise(function (resolve, reject)
			{
				GM.xmlHttpRequest({
					method: "GET",
					url: "https://www.imdb.com/title/" + id + "/movieconnections",
					//headers: { "User-agent": navigator.userAgent, "Accept": "document" },
					timeout: oneSecond * 5,
					onload: function (response)
					{
						if (debug) console.log(response);
						doc = parser.parseFromString(response.responseText, "text/html");
						AddCache("connectsXML", document.URL, doc.body);
						resolve(ShowConnections(url));
					},
					onerror: function (e)
					{
						reject(console.error(e));
					}
				});
			});
		case "movie":
			return new Promise(function (resolve, reject)
			{
				GM.xmlHttpRequest({
					method: "GET",
					url: "https://www.imdb.com/title/" + id,
					//headers: { "User-agent": navigator.userAgent, "Accept": "document" },
					timeout: oneSecond * 5,
					onload: function (response)
					{
						if (debug) console.log(response);
						doc = parser.parseFromString(response.responseText, "text/html");
						//console.log(doc);
						resolve(AddCache("movieXML", "/" + id + "/", doc));
					},
					onerror: function (e)
					{
						reject(console.error(e));
					}
				});
			});
		case "kinopoisk":
			return new Promise(function (resolve, reject)
			{
				GM.xmlHttpRequest({
					method: "GET",
					url: "https://www.kinopoisk.ru/index.php?level=7&from=forma&result=adv&m_act[from]=forma&m_act[what]=content&m_act[find]=" + cache[id]["name"] + "&m_act[year]=" + cache[id]["imdbYear"],
					//headers: { "User-agent": navigator.userAgent, "Accept": "document" },
					timeout: oneSecond * 5,
					onload: function (response)
					{
						if (debug) console.log(response);
						doc = parser.parseFromString(response.responseText, "text/html");
						resolve(AddCache("kinopoisk", "/" + id + "/", doc.body));
						//resolve(ShowRatings(document.URL, "kinopoisk"));
					},
					onerror: function (e)
					{
						reject(console.error(e));
					}
				});
			});
		case "rottenTomatoes":
			return new Promise(function (resolve, reject)
			{
				GM.xmlHttpRequest({
					method: "GET",
					url: "https://i.reddit.com/r/discussionarchive/search?q=" + cache[id]["name"] + "&restrict_sr=on&sort=relevance&t=all",
					headers: { "User-agent": "Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19", "Accept": "document" },
					timeout: oneSecond * 5,
					onload: function (response)
					{
						if (debug) console.log(response);
						doc = parser.parseFromString(response.responseText, "text/html");
						resolve(AddCache("rottenTomatoes", "/" + id + "/", doc));
						//resolve(ShowRatings(document.URL, "rottenTomatoes"));
					},
					onerror: function (e)
					{
						reject(console.error(e));
					}
				});
			});
		case "tmdb":
			return new Promise(function (resolve, reject)
			{
				GM.xmlHttpRequest({
					method: "GET",
					url: "https://www.themoviedb.org/search?query=" + cache[id]["name"] + " y:" + cache[id]["imdbYear"],
					//headers: { "User-agent": navigator.userAgent, "Accept": "document" },
					timeout: oneSecond * 5,
					onload: function (response)
					{
						if (debug) console.log(response);
						doc = parser.parseFromString(response.responseText, "text/html");
						resolve(AddCache("tmdb", "/" + id + "/", doc.body));
						//resolve(ShowRatings(document.URL, "tmdb"));
					},
					onerror: function (e)
					{
						reject(console.error(e));
					}
				});
			});
		case "rMovies":
			return new Promise(function (resolve, reject)
			{
				GM.xmlHttpRequest({
					method: "GET",
					url: "https://i.reddit.com/r/discussionarchive/search?q=" + cache[id]["name"] + "&restrict_sr=on&sort=relevance&t=all",
					headers: { "User-agent": "Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19", "Accept": "document" },
					timeout: oneSecond * 5,
					onload: function (response)
					{
						if (debug) console.log(response);
						doc = parser.parseFromString(response.responseText, "text/html");
						resolve(AddCache("rMovies", "/" + id + "/", doc));
						//resolve(ShowRatings(document.URL, "rMovies"));
					},
					onerror: function (e)
					{
						reject(console.error(e));
					}
				});
			});
		case "xml":
			return new Promise(function (resolve, reject)
			{
				GM.xmlHttpRequest({
					method: "GET",
					url: urlxml,
					//headers: { "User-agent": navigator.userAgent, "Accept": "document" },
					timeout: oneSecond * 5,
					onload: function (response)
					{
						if (debug) console.log(response);
						doc = parser.parseFromString(response.responseText, "text/html");
						//AddCache("tmdb", "/" + id + "/", doc.body);
						console.log(doc);
						resolve(doc);
					},
					onerror: function (e)
					{
						reject(console.error(e));
					}
				});
			});
	}
}
//Function xml on imdb
//End

//-------------------------
//UI AND VISUAL STAFF BELOW
//-------------------------

//Start
//Function show age on people page
async function ShowAge(birthDate, years, months)
{
	var container = " <span>(Age: " + years + " year" + (years === 1 ? '' : 's') + ", " + months + " month" + (months === 1 ? '' : 's') + ")</span>";
	var adm = await GM.getValue("adm");

	if (debug && adm && (document.URL.match(/https:\/\/www\.imdb\.com\/name\/nm1782299/i) || document.URL.match(/https:\/\/www\.imdb\.com\/name\/nm0914612/i)))
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
function ShowGenre(id, row)
{
	var g = "(";
	var div = $(row).parent().parent();
	//console.log(cache[id]["genres"]);
	//console.log(Object.keys(cache[id]["genres"]).length);
	for (let i = 0; i < Object.keys(cache[id]["genres"]).length; i++)
	{
		if (i === (Object.keys(cache[id]["genres"]).length - 1))
		{
			g += "<a href=" + Object.values(cache[id]["genres"])[i] + " style='font-size:11px;'>" + Object.keys(cache[id]["genres"])[i] + "</a>";
		}
		else
		{
			g += "<a href=" + Object.values(cache[id]["genres"])[i] + " style='font-size:11px;'>" + Object.keys(cache[id]["genres"])[i] + "</a>, ";
		}
	}
	g += ") <br>";
	//console.log(g);
	//console.log($(div).children("br")[0]);
	$($(div).children("br")[0]).after(g);
}
//Function show genre on people page
//End

//Start
//Function show Connections on movie page
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
					+ "<b><a href='https://www.imdb.com/title/" + cache[id]["connects"][i][x]["id"] + "'>" + cache[id]["connects"][i][x]["nameMovie"] + "</a></b>"
					+ "<br>" + cache[id]["connects"][i][x]["text"] + endContentRowEven;
			} else
			{
				contents += begContentRowOdd + "<span class='year_column'>&nbsp;" + cache[id]["connects"][i][x]["year"] + "</span>"
					+ "<b><a href='https://www.imdb.com/title/" + cache[id]["connects"][i][x]["id"] + "'>" + cache[id]["connects"][i][x]["nameMovie"] + "</a></b>"
					+ "<br>" + cache[id]["connects"][i][x]["text"] + endContentRowOdd;
			}
		}
		contentH += begHead + "<a name='actress'>" + cache[id]["connects"][i]["name"] + "</a> (" + (Object.keys(cache[id]["connects"][i]).length - 1) + ")" + endHead + begContent + contents + endContent;
	}
	console.log(contentH);

	const divConnections = $("<div id=imdbe_divconnections class=article></div>").html("<div> \
<span class='rightcornerlink'> \
<a href='https://www.imdb.com/title/" + id + "/movieconnections'>Learn more</a> \
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

	if (Object.keys(cache[id]["connects"]).length > 0 || typeof cache[id]["connects"] === "undefined")
	{
		//$("#filmography").append($("<div class=article></div>").html("Connections"));
	} else
	{
		console.log($("#filmography"));
		$("#filmography").append($("<div class=article></div>").html("No Connections"));
	}
	SetEvents("connections");
}
//Function show Connections on movie page
//End


//Start
//Function show Ratings on movies/tv page
async function ShowRatings(url, which)
{
	try
	{
		var id = url.match(/\/(tt\d+)\//)[1];
		var revBar = $('.titleReviewBar');
		var html;
		const div = $('<div class="imdbe_revBarC">&nbsp;</div>');
		if ($('.imdbe_revBarC').length === 0)
		{
			$('.plot_summary_wrapper').after(revBar);
			revBar.before(div);
			revBar.css("height", "auto");
		}

		switch (which)
		{
			case "kinopoisk":
				if ($.isEmptyObject(cache[id]["ratings"]["kinopoisk"]))
				{
					await xmlIMDB("kinopoisk", document.URL);
					return;
				}

				html = "\
				<div class='titleReviewBarItem'>\
                <a href='" + cache[id]["ratings"]["kinopoisk"]["url"] + "'><div\
                    class='rt-consensus metacriticScore score_" + GetStringScore(cache[id]["ratings"]["kinopoisk"]["score"]) + " titleReviewBarSubItem'><span>" + cache[id]["ratings"]["kinopoisk"]["score"] + "</span></div></a>\
               <div class='titleReviewBarSubItem'>\
                   <div>\
                       <a href='" + cache[id]["ratings"]["kinopoisk"]["url"] + "'>Kinopoisk</a>\
                   </div>\
                   <div>\
                       <span class='subText'>\
                           From <a href='https://www.kinopoisk.ru/' target='_blank'>Kinopoisk</a>\
                       </span>\
                   </div>\
                </div>\
				</div>\
				<div class='divider'></div>";

				revBar.prepend(html);
				break;
			case "rottenTomatoes":
				if (typeof cache[id]["ratings"]["rottenTomatoes"] === "undefined")
				{
					await xmlIMDB("rottenTomatoes", document.URL);
					return;
				}

				html = "\
				<div class='titleReviewBarItem'>\
                <a href='" + cache[id]["ratings"]["rottenTomatoes"]["url"] + "'><div\
                    class='rt-consensus metacriticScore score_" + GetStringScore(cache[id]["ratings"]["rottenTomatoes"]["score"]) + " titleReviewBarSubItem'><span>" + cache[id]["ratings"]["rottenTomatoes"]["score"] + "</span></div></a>\
               <div class='titleReviewBarSubItem'>\
                   <div>\
                       <a href='" + cache[id]["ratings"]["rottenTomatoes"]["url"] + "'>Rotten Tomatoes</a>\
                   </div>\
                   <div>\
                       <span class='subText'>\
                           From <a href='https://www.rottentomatoes.com/' target='_blank'>Rotten Tomatoes</a>\
                       </span>\
                   </div>\
                </div>\
				</div>\
				<div class='divider'></div>";

				revBar.prepend(html);
				break;
			case "tmdb":
				if ($.isEmptyObject(cache[id]["ratings"]["tmdb"]))
				{
					await xmlIMDB("tmdb", document.URL);
					return;
				}

				html = "\
				<div class='titleReviewBarItem'>\
                <a href='" + cache[id]["ratings"]["tmdb"]["url"] + "'><div\
                    class='rt-consensus metacriticScore score_" + GetStringScore(cache[id]["ratings"]["tmdb"]["score"]) + " titleReviewBarSubItem'><span>" + cache[id]["ratings"]["tmdb"]["score"] + "</span></div></a>\
               <div class='titleReviewBarSubItem'>\
                   <div>\
                       <a href='" + cache[id]["ratings"]["tmdb"]["url"] + "'>The Movie DB</a>\
                   </div>\
                   <div>\
                       <span class='subText'>\
                           From <a href='https://www.themoviedb.org/' target='_blank'>The Movie DB</a>\
                       </span>\
                   </div>\
                </div>\
				</div>\
				<div class='divider'></div>";

				revBar.prepend(html);
				break;
			case "rMovies":
				if ($.isEmptyObject(cache[id]["ratings"]["rMovies"]))
				{
					await xmlIMDB("rMovies", document.URL);
					return;
				}

				html = "\
				<div class='titleReviewBarItem'>\
                <a href='" + cache[id]["ratings"]["rMovies"]["url"] + "'><div\
                    class='rt-consensus metacriticScore score_" + GetStringScore(cache[id]["ratings"]["rMovies"]["score"]) + " titleReviewBarSubItem'><span>" + cache[id]["ratings"]["rMovies"]["score"] + "</span></div></a>\
               <div class='titleReviewBarSubItem'>\
                   <div>\
                       <a href='" + cache[id]["ratings"]["rMovies"]["url"] + "'>r/Movies</a>\
                   </div>\
                   <div>\
                       <span class='subText'>\
                           From <a href='https://www.reddit.com/r/movies/' target='_blank'>r/Movies</a>\
                       </span>\
                   </div>\
                </div>\
				</div>\
				<div class='divider'></div>";

				revBar.prepend(html);
				break;
			default:
				alert("fun:ShowRatings(" + url + "," + which + "). default switch");
				break;
		}

	} catch (e) { console.error(e); }
}
//Function show Ratings on movies/tv page
//End


//Start
//Function show PopUp 
function ShowPopUp(event, what)
{
	if ($(event.target).attr("href").match(/(pro)/) || $(event.target).attr("href").match(/\/(tt\d+\/(characters|fullcredits|reviews|trivia|faq|keywords|releaseinfo|registration|videogallery|mediaindex|movieconnection))/))
		return;

	var id = $(event.target).attr("href").match(/\/(tt\d+)|\/(nm\d+)/)[1];

	const div = $("<div id=imdbe_popupDiv class='tooltip'></div>").html("LOADING...");

	var tPosX = event.pageX - 250;
	var tPosY = event.pageY + 25;

	var html = "<div class='lister-item imdbe_mode-advanced'>";

	if ($("#imdbe_popupDiv").length === 0)
	{
		div.appendTo('body');
		$("#imdbe_popupDiv").hide();
	}
	//console.log(id);

	switch (what)
	{
		case "movie":
			//TODO RATINGSSSSSSSSSSSSSSS!!!!!!!!!!!!!!!!!!!!!!!!!!
			timeoutID = setTimeout(async function()
			{
				$("#imdbe_popupDiv").show(oneSecond);
				$('div.tooltip').css({ 'position': 'absolute', 'top': tPosY, 'left': tPosX });
				if ($.isEmptyObject(cache[id]))
					await xmlIMDB("movie", "/" + id + "/");
				//console.log($("#imdbe_popupDiv"));
				$("#imdbe_popupDiv")[0].innerHTML = "";
				html += "<div class='imdbe_lister-item-image float-left'><img alt='" + cache[id]["name"] + "' class='loadlate' src='" + cache[id]["image"] + "' width='67' height='98'>\
					</div>\
 <div class='imdbe_lister-item-content'><h3 class='lister-item-header'> <a href='-'>" + cache[id]["name"] + "</a><span class='lister-item-year text-muted unbold'>(" + cache[id]["imdbYear"] + ")</span></h3>\
			<p class='text-muted'><span class='genre'>";
				for (let i = 0; i < Object.keys(cache[id]["genres"]).length; i++)
				{
					if (i === (Object.keys(cache[id]["genres"]).length - 1))
					{
						html += Object.keys(cache[id]["genres"])[i];
					}
					else
					{
						html += Object.keys(cache[id]["genres"])[i] + ", ";
					}
				}
				html += "</span></p>";

				//TODO HERE RATINGS!!!!!!!!!!!!!!!!!!!!

				html += "<p class='text-muted'>" + cache[id]["summary"] + "</p><p class=''>Directors:";

				if (typeof cache[id]["directors"] !== "string")
				{
					for (let i = 0; i < Object.keys(cache[id]["directors"]).length; i++)
					{
						if (i === (Object.keys(cache[id]["directors"]).length - 1))
						{
							html += "<a href='-'>" + Object.values(cache[id]["directors"])[i] + "</a>";
						}
						else
						{
							html += "<a href='-'>" + Object.values(cache[id]["directors"])[i] + "</a>, ";
						}
					}
				} else
				{
					html += "<a href='-'>" + Object.values(cache[id]["directors"]) + "</a>";
				}

				html += "<span class='ghost'> | </span>Stars:";

				if (typeof cache[id]["stars"] !== "string")
				{
					for (let i = 0; i < Object.keys(cache[id]["stars"]).length; i++)
					{
						if (i === (Object.keys(cache[id]["stars"]).length - 1))
						{
							html += "<a href='-'>" + Object.values(cache[id]["stars"])[i] + "</a>";
						}
						else
						{
							html += "<a href='-'>" + Object.values(cache[id]["stars"])[i] + "</a>, ";
						}
					}
				} else
				{
					html += "<a href='-'>" + Object.values(cache[id]["stars"]) + "</a>";
				}

				html += "<span class='ghost'> | </span>Writers:";

				if (typeof cache[id]["writers"] !== "string")
				{
					for (let i = 0; i < Object.keys(cache[id]["writers"]).length; i++)
					{
						if (i === (Object.keys(cache[id]["writers"]).length - 1))
						{
							html += "<a href='-'>" + Object.values(cache[id]["writers"])[i] + "</a>";
						}
						else
						{
							html += "<a href='-'>" + Object.values(cache[id]["writers"])[i] + "</a>, ";
						}
					}
				} else
				{
					html += "<a href='-'>" + Object.values(cache[id]["writers"]) + "</a>";
				}

				html += "</p></div></div>";

				//console.info(html);

				$("#imdbe_popupDiv").append(html);
			}, 500);
			
			/*
		<div class="lister-item mode-advanced">
			 <div class="lister-item-image float-left">
				<img alt="Avengers: Infinity War" class="loadlate" data-tconst="tt4154756" src="https://m.media-amazon.com/images/M/MV5BMjMxNjY2MDU1OV5BMl5BanBnXkFtZTgwNzY1MTUwNTM@._V1_UX67_CR0,0,67,98_AL_.jpg" width="67" height="98">
			</div>
        <div class="lister-item-content">
			<h3 class="lister-item-header">
				<a href="/title/tt4154756/?ref_=adv_li_tt">Avengers: Infinity War</a>
				<span class="lister-item-year text-muted unbold">(2018)</span>
			</h3>
		<p class="text-muted ">
            <span class="genre">Action, Adventure, Fantasy</span>
		</p>
    <div class="ratings-bar">
		<div class="inline-block ratings-imdb-rating" name="ir" data-value="8.6">
			<span class="global-sprite rating-star imdb-rating"></span>
				<strong>8.6</strong>
		</div>
        <div class="inline-block ratings-metascore">
			<span class="metascore  favorable">68</span>
			Metascore
        </div>
    </div>

	<p class="text-muted">
    The Avengers and their allies must be willing to sacrifice all in an attempt to defeat the powerful Thanos before his blitz of devastation and ruin puts an end to the universe.</p>
    <p class="">
    Directors:
		<a href="/name/nm0751577/?ref_=adv_li_dr_0">Anthony Russo</a>,
		<a href="/name/nm0751648/?ref_=adv_li_dr_1">Joe Russo</a>
                 <span class="ghost">|</span>
    Stars:
		<a href="/name/nm0000375/?ref_=adv_li_st_0">Robert Downey Jr.</a>,
		<a href="/name/nm1165110/?ref_=adv_li_st_1">Chris Hemsworth</a>,
		<a href="/name/nm0749263/?ref_=adv_li_st_2">Mark Ruffalo</a>,
		<a href="/name/nm0262635/?ref_=adv_li_st_3">Chris Evans</a>
    </p>
    </div>
    </div>
			 */
			break;
		case "people":
			//TODO if popup is blocking hide it
			break;
		default:
			alert("fun:ShowPopUp(href, what).Ratings(" + href + "," + what + "). default switch");
			break;
	}
	return;
}
//Function show PopUp 
//End


//Start
//Function show Youtube Url search trailer on movies/tv page
function ShowYoutubeUrl(url)
{
	try
	{
		var id = url.match(/\/(tt\d+)\//)[1];
		var slate = $("div.slate");
		if (debug)
			console.log(slate);
		if (slate.length !== 0)
			return;
		var div = $("<div id=imdbe_divtrailer ></div>").html("<h1> \
<a href='https://www.youtube.com/results?search_query=" + cache[id]["name"] + " trailer'>Search trailer on Youtube</a></h1 >\
");
		$("div.plot_summary_wrapper").prepend(div);
	} catch (e) { console.error(e); }
}
//Function show Youtube Url search trailer on movies/tv page
//End

//Start
//Function place css
function SetCSS()
{
	$("head").append($("<!--Start of IMDB Enhancement v" + GM.info.script.version + " CSS-->"));

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

	$("head").append($("<style type=text/css></style>").text(".imdbe_revBarC { \
	float:left;\
    padding-top:11px;\
	padding-left:15px;\
	padding-bottom:0px;\
}"));

	$("head").append($("<style type=text/css></style>").text("#imdbe_field { \
	padding-left:15px;\
}"));

	$("head").append($("<style type=text/css></style>").text("#imdbe_divtrailer { \
	padding-left:20px;\
}"));


	$("head").append($("<style type=text/css></style>").text("#imdbe_popupDiv { \
	background: #fbfbfb;\
	z-index: 500;\
	max-width: 650px;\
	max-height: 250px;\
	border: 1px solid #BBB;\
}"));

	$("head").append($("<style type=text/css></style>").text(".imdbe_mode-advanced { \
	font-size: 13px;\
	padding: 5px 10px;\
}"));

	$("head").append($("<style type=text/css></style>").text(".imdbe_lister-item-image { \
	display: inline-block;\
	vertical-align: top;\
	margin-right: 20px;\
}"));

	$("head").append($("<style type=text/css></style>").text(".imdbe_lister-item-content { \
	max-width: 84%;\
	display: inline-block;\
	vertical-align: top;\
}"));

	$("head").append($("<!--End of IMDB Enhancement v" + GM.info.script.version + " CSS-->"));
}
//Function place css
//End

//Start
//Function place option button and html option
function SetOption()
{
	const settingsDiv = $("<div id=imdbe_settings></div>").html("<div class=spaser><div class=sidecontentbox> \
<div class=name><h1 class='h1'>Options of IMDB Enhancement " + GM.info.script.version + "</h1></div>\
<ul class=content><li> \
<form> \
<br> \
<p>Options:</p>\
	<input type=checkbox name=age id=imdbe_age >Show age</input><br> \
	<input type=checkbox name=genre id=imdbe_genre >Show genre</input><br>\
	<input type=checkbox name=trailer id=imdbe_trailer >Show trailer</input><br><br> \
	<input type=checkbox name=connections id=imdbe_connections >Show connections</input><br><br> \
	<input type=checkbox name=popupM id=imdbe_popupM >Popup for movies</input><br><br> \
	<input type=checkbox name=additionalRatings id=imdbe_additionalRatings >Additional Ratings</input><br> \
		<fieldset id=imdbe_field>\
		<input type=checkbox name=kinopoisk id=imdbe_kinopoisk ><a href='https://www.kinopoisk.ru/' target='_blank'>Kinopoisk</a></input><br> \
		<input type=checkbox name=rottenTomatoes id=imdbe_rottenTomatoes ><a href='https://www.rottentomatoes.com/' target='_blank'>Rotten Tomatoes</a></input><br> \
		<input type=checkbox name=rMovies id=imdbe_rMovies ><a href='https://www.reddit.com/r/movies/' target='_blank'>r/Movies</a></input><br> \
		<input type=checkbox name=tmdb id=imdbe_tmdb ><a href='https://www.themoviedb.org/' target='_blank'>The Movie DB</a></input><br>\
		</fieldset>\
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
	SetEvents("setting");
	SetEvents("rating");
}
//Function place option button and html option
//End

//Start
//Function set UI values of settengs/options
function UIValues()
{
	$("#imdbe_age").prop("checked", age);
	$("#imdbe_genre").prop("checked", genre);
	$("#imdbe_trailer").prop("checked", trailer);
	$("#imdbe_connections").prop("checked", connections);
	$("#imdbe_additionalRatings").prop("checked", additionalRatings["on"]);
	$("#imdbe_kinopoisk").prop("checked", additionalRatings["kinopoisk"]);
	$("#imdbe_rottenTomatoes").prop("checked", additionalRatings["rottenTomatoes"]);
	$("#imdbe_rMovies").prop("checked", additionalRatings["rMovies"]);
	$("#imdbe_tmdb").prop("checked", additionalRatings["tmdb"]);
	$("#imdbe_popupM").prop("checked", popupM);
	$("#imdbe_debug").prop("checked", debug);
}
//Function set events
//End

//Start
//Function set events
function SetEvents(what)
{
	switch (what)
	{
		case "setting":
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

			$("#imdbe_trailer").change(function ()
			{
				options.trailer = $(this).prop("checked");
			});

			$("#imdbe_popupM").change(function ()
			{
				options.popupM = $(this).prop("checked");
			});
			break;
		case "rating":
			//RATINGS!!!!!!!!!!
			$("#imdbe_additionalRatings").change(function ()
			{
				options.additionalRatings["on"] = $(this).prop("checked");
			});
			$("#imdbe_kinopoisk").change(function ()
			{
				options.additionalRatings["kinopoisk"] = $(this).prop("checked");
			});
			$("#imdbe_rottenTomatoes").change(function ()
			{
				options.additionalRatings["rottenTomatoes"] = $(this).prop("checked");
			});
			$("#imdbe_rMovies").change(function ()
			{
				options.additionalRatings["rMovies"] = $(this).prop("checked");
			});
			$("#imdbe_tmdb").change(function ()
			{
				options.additionalRatings["tmdb"] = $(this).prop("checked");
			});
			//RATINGS!!!!!!!!!!
			break;
		case "connections":
			$("#imdbe_divconnections").find(".head").click(function ()
			{
				$(this).next(".filmo-category-section").toggle(500);
			});
			break;
		case "clickFilm":
			$("#filmography > div.head").click(function ()
			{
				GetContent.genre();
			});
			break;
		case "popupM":
			$("a").hover(function (e)
			{
				if ($(e.target).attr("href").includes("title/tt"))
				{
					if (debug) console.log("in: " + e.target);
					ShowPopUp(e, "movie");
				}
			}, function (e)
			{
				if ($(e.target).attr("href").includes("title/tt"))
				{
					if (debug) console.log("out: " + e.target);
					$("#imdbe_popupDiv").hide(500);
					clearTimeout(timeoutID);
				}
			});
			break;
		case "popupP":
			$("a").hover(function (e)
			{
				if ($(e.target).attr("href").includes("name/nm"))
				{
					if (debug) console.log(e.target);
					ShowPopUp(e, "people");
				}
			});
			break;
		default:
			console.error("SetEvents-" + what);
			break;
	//console.log($("#imdbe_divconnections").find(".head"));
}
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

//Start
//Function Get String Score
function GetStringScore(num)
{
	if (typeof num === "string" || num === null || typeof num === "undefined" || isNaN(num))
		return "tbd";
	else if (num >= 60)
		return "favorable";
	else if (num <= 40)
		return "unfavorable";
	else
		return "mixed";
}
//Function Get String Score
//End

// ------------
//  TODO
// ------------

/* TODO STARTS
	1)UI for options, almost done in 0.0.04
	2)Add ratings
✓	 2.1)Kinopoisk		//DONE 0.1.00
✓	 2.2)Rotten			//DONE 0.2.00
	  2.2.1)CANT BE ADD, NEED API????????
✓	 2.3)r/movies		//DONE 0.2.00
✓	 2.4)TMDB			//DONE 0.1.01
✓	3)Add genres	//DONE 0.0.08
✓	 3.0)Its done but only works when reload second time, i need detect when ALL xml requests are finished and call function ShowGenres		//DONE 0.0.09
	 3.1)on search(compact) too
✓	 3.2)Make reqests only if tab(actor/self/soundrack etc.) open and set event on other tabs		//DONE 0.1.05
	4)Change a bit Menu
	5)Dark theme?
✓	6)Connections to movies, almost done in 0.0.05		//DONE 0.0.07
	 6/1)Option show spinoff or not
	7)Cache functionality, almost done in 0.0.03
	8)Hide Elements
	 8.0)Maybe make option to hide only on not rated movies(To escape spoilers) or there different way to find, did user whatched movie or not ***RESEARCH NEEDED***
	 8.1)FAQ
	 8.2)Did You Know?
	 8.3)Recently Viewed
	9)Show months of movies on peaple page... maybe
	 9.1)On search too... maybe
✓	 10)Make event in different functions(For connections, for options and so on)		//DONE 0.1.05
✓	 11)Add search trailer on youtube if trailer not avalible		//DONE 0.1.02
✓	 12)Make pop-up for movies		//DONE 0.1.06
	 12.1)Clean event when unckecking in options!!!!
	13)Make pop-up for people
TODO ENDS */