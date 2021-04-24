// ==UserScript==
// @name        IMDB Enhancement
// @namespace   https://greasyfork.org/users/102866
// @description IMDB Enhancement adds features
// @include     https://www.imdb.com/*
// @require     https://code.jquery.com/jquery-3.6.0.min.js
// @author      TiLied
// @version     0.3.00
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

const oneSecond = 1000,
	oneDay = oneSecond * 60 * 60 * 24,
	oneWeek = oneDay * 7,
	oneMonth = oneWeek * 4;

let whatPage = 0;

/**
* ENUM, BECAUSE WHY NOT ¯\_(ツ)_/¯
* SEE FUNCTION GetPage()
*/

let Page;
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

class Options2 
{
	constructor(version)
	{
		this.version = version;
		this.debug = false;

		this.additionalRatings = {
			on: false,
			kinopoisk: false,
			rottenTomatoes: false,
			rMovies: false,
			tmdb: false
		};
		this.hide = {};

		this.age = false;
		this.connections = false;
		this.genre = false;
		this.trailer = false;

		this.popupM = false;
		this.popupP = false;
	}

	then(resolve)
	{
		console.time("Options2.then");
		console.timeLog("Options2.then");

		Options2._GMHasValue("imdbe_options2").then((r) =>
		{
			if (r === true)
			{
				GM.getValue("imdbe_options2").then((v) =>
				{
					let _v = JSON.parse(v);
					this.SetOptions = _v;
				});
			} else
			{
				let stringStorage = 
					{
						version :this.version,
						debug :this.debug,

						additionalRatings :this.additionalRatings,
						hide :this.hide,

						age :this.age,
						connections : this.connections,
						genre : this.genre,
						trailer : this.trailer,

						popupM : this.popupM,
						popupP : this.popupP
					};

				Options2._GMUpdate("options2", stringStorage);
			}

			console.timeEnd("Options2.then");
			resolve("done");
		});

	}


//Start
//Functions GM_VALUE
//Check if value exists or not.  optValue = Optional
static async _GMHasValue(nameVal, optValue)
{
	return new Promise((resolve, reject) =>
	{
		GM.listValues().then(vals =>
		{

			if (vals.length === 0)
			{
				if (optValue !== undefined)
				{
					GM.setValue(nameVal, optValue);
					resolve(true);
				} else
				{
					resolve(false);
				}
			}

			if (typeof nameVal !== "string")
			{
				reject(console.error("name of value: '" + nameVal + "' are not string"));
			}

			for (let i = 0; i < vals.length; i++)
			{
				if (vals[i] === nameVal)
				{
					resolve(true);
				}
			}

			if (optValue !== undefined)
			{
				GM.setValue(nameVal, optValue);
				resolve(true);
			} else
			{
				resolve(false);
			}
		});
	});
	
}

//Delete Values
static async _GMDeleteValues(nameVal)
{
	let vals = await GM.listValues();

	if (vals.length === 0 || typeof nameVal !== "string")
		return;

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
			return;
		default:
			for (let i = 0; i < vals.length; i++)
			{
				if (vals[i] === nameVal)
				{
					GM.deleteValue(nameVal);
				}
			}
			return;
	}
}

///Update gm value what:"cache","options"
static _GMUpdate(what, _v)
{
	let _l = JSON.stringify(_v);
	switch (what)
	{
		case "cache2":

			GM.setValue("imdbe_cache2", _l);
			break;
		case "options2":
			GM.setValue("imdbe_options2", _l);
			break;
		default:
			console.error("method:_GMUpdate(" + what +"," + _v + "). default switch");
			break;
	}
}
//Functions GM_VALUE
//End

	set SetOptions(obj)
	{
		this.debug = obj.debug;

		this.additionalRatings = { ...this.additionalRatings, ...obj.additionalRatings };
		this.hide = { ...this.hide, ...obj.hide };

		this.age = obj.age;
		this.connections = obj.connections;
		this.genre = obj.genre;
		this.trailer = obj.trailer;

		this.popupM = obj.popupM;
		this.popupP = obj.popupP;
	}
}

class Cache2
{
	constructor(versionCache)
	{
		this.versionCache = versionCache;
	}

	then(resolve)
	{
		console.time("Cache2.then");
		console.timeLog("Cache2.then");

		Options2._GMHasValue("imdbe_cache2").then((r) =>
		{
			if (r === true)
			{
				GM.getValue("imdbe_cache2").then((v) =>
				{
					this.SetCache = JSON.parse(v);
				});
			} else
			{
				let stringStorage = JSON.stringify(this);

				Options2._GMUpdate("cache2", stringStorage);
			}

			console.timeEnd("Cache2.then");
			resolve("done");
		});

	}

	set SetCache(obj)
	{
		if (obj["versionCache"] === this.versionCache)
		{
			let _k = Object.keys(obj)
			for (let i = 0; i < _k.length; i++)
			{
				this[_k[i]] = obj[_k[i]];
			}
		}
		//todo update cache
	}

	CheckData(_data)
	{
		//check with sorage timeid and update if its older
		let _keys = Object.keys(this);
		for (let i = 0; i <= _keys.length; i++)
		{
			if (i === _keys.length)
			{
				this[_data["id"]] = _data;
				return;
			}
			if (_data["id"] === _keys[i])
			{
				if (this[_keys[i]]["dateId"] + oneMonth <= Date.now())
				{
					this[_keys[i]] = _data;
					return;
				}
				return;
			}
		}
	}

	AddConnects(id, doc)
	{
		//if (typeof this[id] === "undefined")
		//{
		let c = {},
			x = 0,
			y = 0,
			keys = [],
			n = [],
			divs = [];

		let hrefs = $(doc).contents().find(".jumpto > a");
		let parent = $(doc).contents().find("div.list").find('*');

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
		//console.log(c);

			this[id]["connects"] = c;
			Options2._GMUpdate("cache2", this);
		//} else { }

	}

	async AddRatings(what, id, doc)
	{
		let el, obj = {}, url , d;
		switch (what)
		{
			case "kinopoisk": 
				{
					el = $(doc).contents().find("a[class*='styles_linkDark']").attr("href");

					if (typeof el === "undefined")
					{
						obj = {
							url: "https://www.kinopoisk.ru/index.php?level=7&from=forma&result=adv&m_act%5Bfrom%5D=forma&m_act%5Bwhat%5D=content&m_act%5Bfind%5D=" + this[id]["name"] + "&m_act%5Bcast%5D=" + this[id]["director"][0],
							score: "N/A"
						};
						this[id]["ratings"]["kinopoisk"] = obj;
					} else
					{
						obj.url = "https://www.kinopoisk.ru/film/" + el.match(/(\d)\w+/)[0];
						obj.score = parseInt($(doc).contents().find("span.film-rating-value").text().slice(0, 3).split(".").join(""));

						this[id]["ratings"]["kinopoisk"] = obj;
					}

					Options2._GMUpdate("cache2", this);
					return;
				}
			case "rottenTomatoes":
				{
					url = $(doc).contents().find("p.title > a").attr("href");

					if (typeof url !== "undefined")
					{
						d = await xmlIMDB("xml", url);
					} else
					{
						url = $(doc).contents().find("a[href^='https://www.rottentomatoes.com/']").attr("href");

						if (typeof url === "undefined")
						{
							obj = {
								url: "https://www.rottentomatoes.com/search/?search=" + this[id]["name"],
								score: "N/A"
							};
							this[id]["ratings"]["rottenTomatoes"] = obj;
							Options2._GMUpdate("cache2", this);
							return;
						}
					}

					url = $(d).contents().find("a[href^='https://www.rottentomatoes.com/']").attr("href");
					console.log(url);
					if (typeof url === "undefined")
					{
						obj = {
							url: "https://www.rottentomatoes.com/search/?search=" + this[id]["name"],
							score: "N/A"
						};
						this[id]["ratings"]["rottenTomatoes"] = obj;
						Options2._GMUpdate("cache2", this);
						return;
					}

					d = await xmlIMDB("xml", url);

					el = JSON.parse($(d.head).find("script[type='application/ld+json']").text());

					if (typeof el === "undefined")
					{
						obj = {
							url: "https://www.rottentomatoes.com/search/?search=" + this[id]["name"],
							score: "N/A"
						};
						this[id]["ratings"]["rottenTomatoes"] = obj;
						Options2._GMUpdate("cache2", this);
						return;
					}

					obj.url = url;
					obj.score = parseInt(el["aggregateRating"]["ratingValue"]);

					this[id]["ratings"]["rottenTomatoes"] = obj;
					Options2._GMUpdate("cache2", this);
					return;
				}
			case "tmdb":
				{
					url = $(doc).contents().find("a.result").attr("href");

					url = "https://www.themoviedb.org/" + url;

					console.log(url);

					if (typeof url === "undefined")
					{
						obj = {
							url: "https://www.themoviedb.org/search?query=" + this[id]["name"],
							score: "N/A"
						};
						this[id]["ratings"]["tmdb"] = obj;
						Options2._GMUpdate("cache2", this);
						return;
					}

					d = await xmlIMDB("xml", url);

					el = $(d).contents().find("div.user_score_chart");
					console.log(el);
					if (typeof el === "undefined")
					{
						obj = {
							url: "https://www.themoviedb.org/search?query=" + this[id]["name"] + " y:" + this[id]["year"],
							score: "N/A"
						};

						this[id]["ratings"]["tmdb"] = obj;
						Options2._GMUpdate("cache2", this);
						return;
					}

					obj.url = url;
					obj.score = parseInt($(el).attr("data-percent"));

					if (obj.score === 0.0)
						obj.score = "tbd";

					this[id]["ratings"]["tmdb"] = obj;
					Options2._GMUpdate("cache2", this);
					return;
				}
			case "rMovies":
				{
					url = $(doc).contents().find("p.title > a").attr("href");

					if (typeof url !== "undefined")
					{
						d = await xmlIMDB("xml", url);
					} else
					{
						url = $(doc).contents().find("a[href^='https://youpoll.me/']:odd").attr("href");

						if (typeof url === "undefined")
						{
							obj = {
								url: "https://www.reddit.com/r/movies/search?q=" + this[id]["name"] + "&restrict_sr=on&sort=relevance&t=all",
								score: "N/A"
							};

							this[id]["ratings"]["rMovies"] = obj;
							Options2._GMUpdate("cache2", this);
							return;
						}
					}

					obj.url = url;

					url = $(d.body).contents().find("a[href^='https://youpoll.me/']:odd").attr("href");

					if (typeof url === "undefined")
					{
						obj = {
							url: "https://www.reddit.com/r/movies/search?q=" + this[id]["name"] + "&restrict_sr=on&sort=relevance&t=all",
							score: "N/A"
						};

						this[id]["ratings"]["rMovies"] = obj;
						Options2._GMUpdate("cache2", this);
						return;
					}

					d = await xmlIMDB("xml", url);

					el = $(d.body).find("span.rating-mean-value").text().split(".").join("");

					if (typeof el === "undefined")
					{
						obj = {
							url: "https://www.reddit.com/r/movies/search?q=" + this[id]["name"] + "&restrict_sr=on&sort=relevance&t=all",
							score: "N/A"
						};

						this[id]["ratings"]["rMovies"] = obj;
						Options2._GMUpdate("cache2", this);
						return;
					}

					obj.score = parseInt(el.slice(0, 2));

					this[id]["ratings"]["rMovies"] = obj;
					Options2._GMUpdate("cache2", this);
					return;
				}
		}
	}
}

class MovieData
{
	constructor(url, body)
	{
		//console.log($(body).find("script[id='__NEXT_DATA__']"));
		let __NEXT_DATA__ = JSON.parse($(body).find("script[id='__NEXT_DATA__']").text());
		if (typeof __NEXT_DATA__ === "undefined")
			return console.error(__NEXT_DATA__);


		let metaObj = __NEXT_DATA__["props"]["urqlState"];
		console.log(metaObj);

		this.url = url;
		this.dateId = Date.now();
		this.ratings = {};

		for (let i = 0; i < Object.keys(metaObj).length; i++)
		{
			let _k = Object.keys(metaObj)[i];

			if (typeof metaObj[_k]["data"]["title"] === "undefined")
				continue;

			if (typeof metaObj[_k]["data"]["title"]["originalTitleText"] !== "undefined")
				this.name = metaObj[_k]["data"]["title"]["originalTitleText"]["text"];

			if (typeof metaObj[_k]["data"]["title"]["releaseYear"] !== "undefined")
				this.year = metaObj[_k]["data"]["title"]["releaseYear"]["year"];

			if (typeof metaObj[_k]["data"]["title"]["releaseDate"] !== "undefined")
				this.releaseDate = metaObj[_k]["data"]["title"]["releaseDate"]["year"] + "/" + metaObj[_k]["data"]["title"]["releaseDate"]["month"] + "/" + metaObj[_k]["data"]["title"]["releaseDate"]["day"];

			if (typeof metaObj[_k]["data"]["title"]["plot"] !== "undefined")
				this.summary = metaObj[_k]["data"]["title"]["plot"]["plotText"]["plainText"];

			if (typeof metaObj[_k]["data"]["title"]["principalCredits"] !== "undefined")
			{
				let _credits = metaObj[_k]["data"]["title"]["principalCredits"];

				for (let j = 0; j < _credits.length; j++)
				{
					let __credits = _credits[j]["credits"];

					this[_credits[j]["category"]["id"]] = [];

					for (let y = 0; y < __credits.length; y++)
					{
						let _obj = {
							id: __credits[y]["name"]["id"],
							name: __credits[y]["name"]["nameText"]["text"],
						}
						this[_credits[j]["category"]["id"]].push(_obj)
					}
				}
			}

			if (typeof metaObj[_k]["data"]["title"]["genres"] !== "undefined")
			{
				let _genres = metaObj[_k]["data"]["title"]["genres"]["genres"];

				let __genres = [];

				for (let j = 0; j < _genres.length; j++)
				{
					__genres.push(_genres[j]["id"]);
				}
				this.genres = __genres;
			}

			if (typeof metaObj[_k]["data"]["title"]["metacritic"] !== "undefined")
			{
				this.ratings["metacritic"] =
					{
					score: metaObj[_k]["data"]["title"]["metacritic"]["metascore"]["score"]
					}
			}

			if (typeof metaObj[_k]["data"]["title"]["ratingsSummary"] !== "undefined" && typeof metaObj[_k]["data"]["title"]["ratingsSummary"]["aggregateRating"] !== "undefined" )
			{
				let _s = metaObj[_k]["data"]["title"]["ratingsSummary"]["aggregateRating"];
				_s =_s.toString();
				if (_s.includes("."))
					_s = parseInt(_s.split(".").join(""));
				else
					_s = parseInt(_s + 0);
				this.ratings["imdb"] =
				{
					score: _s
				}
			} 

			if (typeof metaObj[_k]["data"]["title"]["id"] !== "undefined")
				this.id = metaObj[_k]["data"]["title"]["id"];

			if (typeof metaObj[_k]["data"]["title"]["primaryImage"] !== "undefined")
				if (typeof metaObj[_k]["data"]["title"]["primaryImage"]["url"] !== "undefined")
					this.image = metaObj[_k]["data"]["title"]["primaryImage"]["url"];
		}

	}

	then(resolve)
	{
		//
	}
}

class PeopleData
{
	constructor(url, doc)
	{
		//console.log($(doc.head).find("script[type='application/ld+json']"));
		let metaObj = JSON.parse($(doc.head).find("script[type='application/ld+json']").text());

		if (typeof metaObj === "undefined")
			return console.error(metaObj);
		console.log(metaObj);

		this.url = url;
		this.id = metaObj["url"].match(/\/(tt\d+|nm\d+)\//)[1];

		this.dateId = Date.now();

		if (typeof metaObj.name === "undefined")
			this.name = "-";
		else
			this.name =  metaObj.name;

		if (typeof metaObj.birthDate === "undefined")
			this.birthDate = "-";
		else
			this.birthDate = metaObj.birthDate;

		if (typeof metaObj.deathDate === "undefined")
			this.deathDate = "-";
		else
			this.deathDate = metaObj.deathDate;

		let arr = [];

		if (typeof metaObj.jobTitle === "undefined")
			arr.push("-");
		if (typeof metaObj.jobTitle === "string")
			arr.push(metaObj.jobTitle);
		if (typeof metaObj.jobTitle === "object")
			arr = metaObj.jobTitle;

		this.jobTitle = arr;

		if (typeof metaObj.description === "undefined")
			this.summaryPeople = "-";
		else
			this.summaryPeople =  metaObj.description;

		if (typeof metaObj.image === "undefined")
			this.image = "-";
		else
			this.image =  metaObj.image;

	}

	then(resolve)
	{
		//
	}
}

//Start
//Function main2
void function Main2()
{
	//Options2._GMDeleteValues("all");
	console.log("IMDB Enhancement v" + GM.info.script.version + " initialization");

	//Set css
	SetCSS();

	//Set cache
	let cache2 = new Cache2(0.1);
	cache2.then(() =>
	{
		console.log(cache2);

		//Set options
		let options2 = new Options2(GM.info.script.version);
		options2.then(() =>
		{
			console.log(options2);

			//Console log prefs with value
			GM.listValues().then(async (_v) =>
			{
				console.log("*prefs:");
				console.log("*-----*");

				for (let i = 0; i < _v.length; i++)
				{
					let str = await GM.getValue(_v[i]);
					console.log("*" + _v[i] + ":" + str);
					console.log(JSON.parse(str));
					const byteSize = str => new Blob([str]).size;
					console.log("Size " + _v[i] + ": " + FormatBytes(byteSize(str)) + "");
				}

				console.log("*-----*");

				//On what page are we?
				SwitchPage(GetPage(document.URL), cache2, options2);
				console.log("Page number: " + whatPage + "/" + Page[whatPage] + " page");

				//Set Html
				SetHtml(options2);
			});
		});
	});
}();
//Function main2
//End

//Start
//Functions Get on what page are we and switch
function SwitchPage(n, cache2, options2)
{
/*
1-front page
2-search page
3-movie/TV page
4-connections
5-people(Actor,Actress, etc.) page
10-anything else
*/
	let _data;
	switch (n)
	{
		case 1:
			if (options2.popupM)
				SetEvents("popupM", options2, cache2);

			if (options2.popupP)
				SetEvents("popupP", options2, cache2);
			break;
		case 2:
			if (options2.popupM)
				SetEvents("popupM", options2, cache2);

			if (options2.popupP)
				SetEvents("popupP", options2, cache2);
			break;
		case 3:
			_data = new MovieData(document.URL, document.body);
			console.log(_data);
			cache2.CheckData(_data);
			console.log(cache2);

			if (options2.connections)
				ShowConnections(document.URL, cache2);

			if (options2.trailer)
				ShowYoutubeUrl(document.URL, cache2);

			if (options2.additionalRatings["on"])
			{
				if (options2.additionalRatings["kinopoisk"])
					ShowRatings(document.URL, "kinopoisk", cache2);

				if (options2.additionalRatings["rottenTomatoes"])
					ShowRatings(document.URL, "rottenTomatoes", cache2);

				if (options2.additionalRatings["rMovies"])
					ShowRatings(document.URL, "rMovies", cache2);

				if (options2.additionalRatings["tmdb"])
					ShowRatings(document.URL, "tmdb", cache2);
			}

			if (options2.hide["on"])
			{
				//TODO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
			}

			if (options2.popupM)
				SetEvents("popupM", options2, cache2);

			if (options2.popupP)
				SetEvents("popupP", options2, cache2);

			break;
		case 4:
			//AddCache("connects", document.URL);
			//SetUpForConnects();
			if (options2.popupM)
				SetEvents("popupM", options2, cache2);

			if (options2.popupP)
				SetEvents("popupP", options2, cache2);
			break;
		case 5:
			_data = new PeopleData(document.URL, document);
			console.log(_data);
			cache2.CheckData(_data);
			console.log(cache2);

			if (options2.age)
				ShowAge();

			if (options2.genre)
			{
				ShowGenre(cache2);
				//event detecting click
				SetEvents("clickFilm", options2, cache2);
			}

			if (options2.popupM)
				SetEvents("popupM", options2, cache2);

			if (options2.popupP)
				SetEvents("popupP", options2, cache2);
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
	const reg = new RegExp("https:\\/\\/www\\.imdb\\.com");

	if (document.location.pathname === "/")
	{
		whatPage = 1;
	} else if (url.match(new RegExp(reg.source + "/search", "i")))
	{
		whatPage = 2;
	} else if (url.match(new RegExp(reg.source + "/title/", "i")) && !url.match(/(movieconnections)|(tt_trv_(cnn|snd|trv|qu|gf|cc)|tt(cnn|snd|trv|qu|gf|cc))/i))
	{
		whatPage = 3;
	} else if (url.match(new RegExp(reg.source + "/title/", "i")) && url.match(/(movieconnections)|(tt_trv_cnn|ttcnn)/i))
	{
		whatPage = 4;
	} else if (url.match(new RegExp(reg.source + "/name/","i")))
	{
		whatPage = 5;
	} else
	{
		whatPage = 10;
	}

	return whatPage;
}
//Functions Get on what page are we and switch
//End

//-------------------------
//XMLHTTPREQUESTS BELOW
//-------------------------

//Start
//Function xml/iframe on imdb
function xmlIMDB(what, url, cache2)
{
	let id

	if (what !== "xml")
	{
		id = url.match(/\/(tt\d+|nm\d+)\//)[1];
	}

	let parser = new DOMParser();
	let doc;

	switch (what)
	{
		case "connections":
			return new Promise(function (resolve, reject)
			{
				GM.xmlHttpRequest({
					method: "GET",
					url: "https://www.imdb.com/title/" + id + "/movieconnections",
					timeout: oneSecond * 5,
					onload: function (response)
					{
						console.log(response);
						doc = parser.parseFromString(response.responseText, "text/html");

						cache2.AddConnects(id, doc.body);

						resolve(ShowConnections(url, cache2));
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
				//console.log(what);
				//console.log(url);
				//console.log(cache2);
				GM.xmlHttpRequest({
					method: "GET",
					url: "https://www.imdb.com/title/" + id,
					timeout: oneSecond * 5,
					onload: function (response)
					{
						console.log(response);
						doc = parser.parseFromString(response.responseText, "text/html");

						let _data = new MovieData("https://www.imdb.com/title/" + id, doc.body);
						console.log(_data);
						resolve(cache2.CheckData(_data));
					},
					onerror: function (e)
					{
						reject(console.error(e));
					}
				});
			});
		case "people":
			return new Promise(function (resolve, reject)
			{
				//console.log(what);
				//console.log(url);
				//console.log(cache2);
				GM.xmlHttpRequest({
					method: "GET",
					url: "https://www.imdb.com/name/" + id,
					timeout: oneSecond * 5,
					onload: function (response)
					{
						console.log(response);
						doc = parser.parseFromString(response.responseText, "text/html");

						let _data = new PeopleData("https://www.imdb.com/name/" + id, doc);
						console.log(_data);
						resolve(cache2.CheckData(_data));
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
					url: "https://www.kinopoisk.ru/index.php?level=7&from=forma&result=adv&m_act%5Bfrom%5D=forma&m_act%5Bwhat%5D=content&m_act%5Bfind%5D=" + cache2[id]["name"] + "&m_act%5Bcast%5D=" + cache2[id]["director"][0]["name"],
					//headers: { "User-agent": navigator.userAgent, "Accept": "document" },
					timeout: oneSecond * 5,
					onload: function (response)
					{
						console.log(response);
						doc = parser.parseFromString(response.responseText, "text/html");

						resolve(cache2.AddRatings("kinopoisk", id, doc.body));

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
					url: "https://i.reddit.com/r/discussionarchive/search?q=" + cache2[id]["name"] + "&restrict_sr=on&sort=relevance&t=all",
					headers: { "User-agent": "Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19", "Accept": "document" },
					timeout: oneSecond * 5,
					onload: function (response)
					{
						console.log(response);
						doc = parser.parseFromString(response.responseText, "text/html");

						resolve(cache2.AddRatings("rottenTomatoes", id, doc.body));
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
					url: "https://www.themoviedb.org/search?query=" + cache2[id]["name"] + " y:" + cache2[id]["year"],
					timeout: oneSecond * 5,
					onload: function (response)
					{
						console.log(response);
						doc = parser.parseFromString(response.responseText, "text/html");

						resolve(cache2.AddRatings("tmdb", id, doc.body));
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
					url: "https://i.reddit.com/r/discussionarchive/search?q=" + cache2[id]["name"] + "&restrict_sr=on&sort=relevance&t=all",
					headers: { "User-agent": "Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19", "Accept": "document" },
					timeout: oneSecond * 5,
					onload: function (response)
					{
						console.log(response);
						doc = parser.parseFromString(response.responseText, "text/html");

						resolve(cache2.AddRatings("rMovies", id, doc.body));
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
					url: url,
					timeout: oneSecond * 5,
					onload: function (response)
					{
						console.log(response);
						doc = parser.parseFromString(response.responseText, "text/html");
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
function ShowAge()
{
	let birthDate = $("#name-born-info > time");
	let deathDate = $("#name-death-info > time");
	let born = new Date();
	let age;

	//If true change it
	if (birthDate && birthDate.attr('datetime'))
	{
		date = birthDate.attr('datetime').split('-');
		born.setFullYear(date[0]);
		born.setMonth(date[1] - 1);
		born.setDate(date[2]);

		age = new Date() - born.getTime();
		age = age / (1000 * 60 * 60 * 24 * 365.242199);

		let years = Math.floor(age);
		let months = Math.floor((age - years) * 12);
		if (deathDate.length === 0)
		{
			let container = " <span>(Age: " + years + " year" + (years === 1 ? '' : 's') + ", " + months + " month" + (months === 1 ? '' : 's') + ")</span>";

			$(container).insertAfter(birthDate);
		}
	}

}
//Function show age on people page
//End

//Start
//Function show genre on people page
function ShowGenre(cache2)
{
	let id,
		rows = $("div.filmo-category-section").not("div[style='display:none;']").find("div.filmo-row b > a");

	for (let i = 0; i < rows.length; i++)
	{
		id = $(rows[i]).attr("href").match(/\/(tt\d+)\//)[1];

		if (typeof cache2[id] === "undefined")
			continue;

		let g = "(";
		let div = $(rows[i]).parent().parent();

		for (let j = 0; j < cache2[id]["genres"].length; j++)
		{
			if (j === (cache2[id]["genres"].length - 1))
			{
				g += "<a href=https://www.imdb.com/search/title?genres=" + cache2[id]["genres"][j] + " style='font-size:11px;'>" + cache2[id]["genres"][j] + "</a>";
			}
			else
			{
				g += "<a href=https://www.imdb.com/search/title?genres=" + cache2[id]["genres"][j] + " style='font-size:11px;'>" + cache2[id]["genres"][j] + "</a>, ";
			}
		}
		g += ") <br>";

		$($(div).children("br")[0]).after(g);
	}
}
//Function show genre on people page
//End

//Start
//Function show Connections on movie page
function ShowConnections(url, cache2)
{
	//
	//TODO CHANGE FOR NEW REDISIGN!
	//
	let id = url.match(/\/(tt\d+)\//)[1];
	//console.log(id);
	//console.log(cache2);
	if ($.isEmptyObject(cache2[id]["connects"]))
	{
		xmlIMDB("connections", document.URL, cache2);
		return;
	}

	let contentH = "";
	let contents = "";

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

	for (let i = 0; i < Object.keys(cache2[id]["connects"]).length; i++)
	{
		contents = "";
		//console.log(Object.keys(cache[id]["connects"]).length);
		//SORT TODO FOLOWS FIRST AND FOLLOING BY SECCONG, AND MAkE SETTINGS BY SHOWING SPIN OFF OR NOT
		for (let x = 0; x < (Object.keys(cache2[id]["connects"][i]).length - 1); x++)
		{
			if (x % 2)
			{
				contents += begContentRowEven + "<span class='year_column'>&nbsp;" + cache2[id]["connects"][i][x]["year"] + "</span>"
					+ "<b><a href='https://www.imdb.com/title/" + cache2[id]["connects"][i][x]["id"] + "'>" + cache2[id]["connects"][i][x]["nameMovie"] + "</a></b>"
					+ "<br>" + cache2[id]["connects"][i][x]["text"] + endContentRowEven;
			} else
			{
				contents += begContentRowOdd + "<span class='year_column'>&nbsp;" + cache2[id]["connects"][i][x]["year"] + "</span>"
					+ "<b><a href='https://www.imdb.com/title/" + cache2[id]["connects"][i][x]["id"] + "'>" + cache2[id]["connects"][i][x]["nameMovie"] + "</a></b>"
					+ "<br>" + cache2[id]["connects"][i][x]["text"] + endContentRowOdd;
			}
		}
		contentH += begHead + "<a name='actress'>" + cache2[id]["connects"][i]["name"] + "</a> (" + (Object.keys(cache2[id]["connects"][i]).length - 1) + ")" + endHead + begContent + contents + endContent;
	}
	console.log(contentH);

	const divConnections = $("<div id=imdbe_divconnections class=article></div>").html("<div> \
<span class='rightcornerlink'> \
<a href='https://www.imdb.com/title/" + id + "/movieconnections'>Learn more</a> \
</span>\
<div class=name><h1 class='h2'>Connections</h1></div>\
<div id='filmography'>" + contentH + "</div >\
");


	$("section[data-testid='title-cast']").before(divConnections);

	for (let i = 0; i < Object.keys(cache2[id]["connects"]).length; i++)
	{
		//console.log(((cache[id]["connects"][i]["name"] !== "Follows") | (cache[id]["connects"][i]["name"] !== "Followed by") ? "yes" : "no"));
		if (cache2[id]["connects"][i]["name"] !== "Follows")
		{
			if (cache2[id]["connects"][i]["name"] !== "Followed by")
			{
				$("#imdbe_divconnections").find(".head:eq(" + i + ")").next(".filmo-category-section").toggle();
				//console.log($("#imdbe_divconnections").find(".head:eq(" + i + ")"));
			}
		}
	}

	console.log(cache2[id]["connects"]);

	if (Object.keys(cache2[id]["connects"]).length > 0 || typeof cache2[id]["connects"] === "undefined")
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
async function ShowRatings(url, which, cache2)
{
	let id = url.match(/\/(tt\d+)\//)[1];

	let revBar = $('ul[data-testid="reviewContent-all-reviews"]');
	let html;

	switch (which)
	{
		case "kinopoisk":
			if ($.isEmptyObject(cache2[id]["ratings"]["kinopoisk"]))
			{
				await xmlIMDB("kinopoisk", document.URL, cache2);
			}

			html = '<li role="presentation" class="ipc-inline-list__item ReviewContent__StyledListItem-vlmc3o-1 bUNAEL"><a href="' + cache2[id]["ratings"]["kinopoisk"]["url"] + '" class="ipc-link ipc-link--baseAlt ipc-link--touch-target ReviewContent__StyledTextLink-vlmc3o-2 lnlzUS isReview"><span class="three-Elements"><span class="score"><span class="score-meta" style="background-color:' + GetStringScore(cache2[id]["ratings"]["kinopoisk"]["score"])+'">' + cache2[id]["ratings"]["kinopoisk"]["score"] + '</span></span><span class="label">Kinopoisk</span></span></a></li>';

			revBar.append(html);
			break;
		case "rottenTomatoes":
			if (typeof cache2[id]["ratings"]["rottenTomatoes"] === "undefined")
			{
				await xmlIMDB("rottenTomatoes", document.URL, cache2);
			}

			html = '<li role="presentation" class="ipc-inline-list__item ReviewContent__StyledListItem-vlmc3o-1 bUNAEL"><a href="' + cache2[id]["ratings"]["rottenTomatoes"]["url"] + '" class="ipc-link ipc-link--baseAlt ipc-link--touch-target ReviewContent__StyledTextLink-vlmc3o-2 lnlzUS isReview"><span class="three-Elements"><span class="score"><span class="score-meta" style="background-color:' + GetStringScore(cache2[id]["ratings"]["rottenTomatoes"]["score"]) + '">' + cache2[id]["ratings"]["rottenTomatoes"]["score"] + '</span></span><span class="label">Rotten Tomatoes</span></span></a></li>';

			revBar.append(html);
			break;
		case "tmdb":
			if (typeof cache2[id]["ratings"]["tmdb"] === "undefined")
			{
				await xmlIMDB("tmdb", document.URL, cache2);
			}

			html = '<li role="presentation" class="ipc-inline-list__item ReviewContent__StyledListItem-vlmc3o-1 bUNAEL"><a href="' + cache2[id]["ratings"]["tmdb"]["url"] + '" class="ipc-link ipc-link--baseAlt ipc-link--touch-target ReviewContent__StyledTextLink-vlmc3o-2 lnlzUS isReview"><span class="three-Elements"><span class="score"><span class="score-meta" style="background-color:' + GetStringScore(cache2[id]["ratings"]["tmdb"]["score"]) + '">' + cache2[id]["ratings"]["tmdb"]["score"] + '</span></span><span class="label">The Movie DB</span></span></a></li>';

			revBar.append(html);
			break;
		case "rMovies":
			if ($.isEmptyObject(cache2[id]["ratings"]["rMovies"]))
			{
				await xmlIMDB("rMovies", document.URL, cache2);
			}

			html = '<li role="presentation" class="ipc-inline-list__item ReviewContent__StyledListItem-vlmc3o-1 bUNAEL"><a href="' + cache2[id]["ratings"]["rMovies"]["url"] + '" class="ipc-link ipc-link--baseAlt ipc-link--touch-target ReviewContent__StyledTextLink-vlmc3o-2 lnlzUS isReview"><span class="three-Elements"><span class="score"><span class="score-meta" style="background-color:' + GetStringScore(cache2[id]["ratings"]["rMovies"]["score"]) + '">' + cache2[id]["ratings"]["rMovies"]["score"] + '</span></span><span class="label">r/Movies</span></span></a></li>';

			revBar.append(html);

			break;
		default:
			alert("fun:ShowRatings(" + url + "," + which + "). default switch");
			break;
	}
	
}
//Function show Ratings on movies/tv page
//End

//Start
//Function show PopUp 
async function ShowPopUp(event, what, cache2)
{
	if ($(event.target).attr("href").match(/(pro)/) || $(event.target).attr("href").match(/\/(tt\d+|nm\d+)\/\b/))
		return;

	let id = $(event.target).attr("href").match(/\/(tt\d+|nm\d+)\//)[1];

	let tPosX = event.pageX - 250;
	let tPosY = event.pageY + 2;

	if (tPosX <= 0)
		tPosX = 5;

	let imdbe_popupDiv = $("#imdbe_popupDiv");

	let popupImage = $(imdbe_popupDiv).find("#popupImage");
	let popupTitle = $(imdbe_popupDiv).find("#popupTitle");
	let popupGenres = $(imdbe_popupDiv).find("#popupGenres");
	let popupRatings = $(imdbe_popupDiv).find("#popupRatings");
	let popupSummary = $(imdbe_popupDiv).find("#popupSummary");
	let popupCast = $(imdbe_popupDiv).find("#popupCast");

	$(popupTitle).empty();
	$(popupGenres).empty();
	$(popupRatings).empty();
	$(popupSummary).empty();
	$(popupCast).empty();


	switch (what)
	{
		case "movie": {
			$("#imdbe_popupDiv").show(oneSecond);

			//place tooltip
			$('div.tooltip').css({ 'position': 'absolute', 'top': tPosY, 'left': tPosX });

			if (typeof cache2[id] === "undefined")
				await xmlIMDB("movie", "/" + id + "/", cache2);

			//image
			$(popupImage).attr("style", "height: 200px;");
			$(popupImage).attr("src", cache2[id]["image"]);
			$(popupImage).attr("alt", cache2[id]["name"]);

			//title
			let _t = $("<h2 style='font-size: 20px;'></h2>").html("<a class='ipc-link ipc-link--baseAlt ipc-link--inherit-color' href=" + cache2[id]["url"] + ">" + cache2[id]["name"] + "</a> <span>(" + cache2[id]["year"] + ")</span>");
			$(popupTitle).append(_t);

			//genres
			for (let i = 0; i < cache2[id]["genres"].length; i++)
			{
				let _a = $("<a class='ipc-link ipc-link--baseAlt ipc-link--inherit-color' href=https://www.imdb.com/search/title?genres=" + cache2[id]["genres"][i] + "><span>" + cache2[id]["genres"][i] + "</span>,</a>")
				$(popupGenres).append(_a);
			}
			$("</br>").appendTo(popupGenres);

			//ratings
			let _i = $("<span style='color:" + GetStringScore(cache2[id]["ratings"]["imdb"]["score"]) + "'> | Imdb: " + cache2[id]["ratings"]["imdb"]["score"] + "</span>");
			$(popupRatings).prepend(_i);

			let _m = $("<span style='color:" + GetStringScore(cache2[id]["ratings"]["metacritic"]["score"]) + "'> | Metacritic: " + cache2[id]["ratings"]["metacritic"]["score"] + "</span>");
			$(popupRatings).prepend(_m);

			if (typeof cache2[id]["ratings"]["kinopoisk"] !== "undefined")
			{
				let _k = $("<span style='color:" + GetStringScore(cache2[id]["ratings"]["kinopoisk"]["score"]) + "'> | Kinopoisk: " + cache2[id]["ratings"]["kinopoisk"]["score"] + "</span>");
				$(popupRatings).prepend(_k);
			}
			if (typeof cache2[id]["ratings"]["tmdb"] !== "undefined")
			{
				let _t = $("<span style='color:" + GetStringScore(cache2[id]["ratings"]["tmdb"]["score"]) + "'> | The Movie DB: " + cache2[id]["ratings"]["tmdb"]["score"] + "</span>");
				$(popupRatings).prepend(_t);
			}
			if (typeof cache2[id]["ratings"]["rMovies"] !== "undefined")
			{
				$("<span style='color:" + GetStringScore(cache2[id]["ratings"]["rMovies"]["score"]) + "'> | r/Movie: " + cache2[id]["ratings"]["rMovies"]["score"] + "</span>").prependTo(popupRatings);
			}
			if (typeof cache2[id]["ratings"]["rottenTomatoes"] !== "undefined")
			{
				$("<span style='color:" + GetStringScore(cache2[id]["ratings"]["rottenTomatoes"]["score"]) + "'> | Rotten Tomatoes: " + cache2[id]["ratings"]["rottenTomatoes"]["score"] + "</span>").prependTo(popupRatings);
			}

			//summary
			$("</br><p>" + cache2[id]["summary"] + "</p></br>").appendTo(popupSummary);

			//casts
			$("<span>Director: </span>").appendTo(popupCast);
			for (let i = 0; i < Object.keys(cache2[id]["director"]).length; i++)
			{
				$("<a class='ipc-link ipc-link--baseAlt ipc-link--inherit-color' href=/'" + cache2[id]["director"][Object.keys(cache2[id]["director"])[i]]["id"] + "'>" + cache2[id]["director"][Object.keys(cache2[id]["director"])[i]]["name"] + ",</a>").appendTo(popupCast);
			}

			$("<span class='ghost'> | Stars: </span>").appendTo(popupCast);
			for (let i = 0; i < Object.keys(cache2[id]["cast"]).length; i++)
			{
				$("<a class='ipc-link ipc-link--baseAlt ipc-link--inherit-color' href=/'" + cache2[id]["cast"][Object.keys(cache2[id]["cast"])[i]]["id"] + "'>" + cache2[id]["cast"][Object.keys(cache2[id]["cast"])[i]]["name"] + ",</a>").appendTo(popupCast);
			}

			$("<span class='ghost'> | Writers: </span>").appendTo(popupCast);
			for (let i = 0; i < Object.keys(cache2[id]["writer"]).length; i++)
			{
				$("<a class='ipc-link ipc-link--baseAlt ipc-link--inherit-color' href=/'" + cache2[id]["writer"][Object.keys(cache2[id]["writer"])[i]]["id"] + "'>" + cache2[id]["writer"][Object.keys(cache2[id]["writer"])[i]]["name"] + ",</a>").appendTo(popupCast);
			}
			break;
		}
		case "people":
			{
			$("#imdbe_popupDiv").show(oneSecond);

			//place tooltip
			$('div.tooltip').css({ 'position': 'absolute', 'top': tPosY, 'left': tPosX });

			if (typeof cache2[id] === "undefined")
				await xmlIMDB("people", "/" + id + "/", cache2);

			//image
			$(popupImage).attr("style", "height: 200px;");
			$(popupImage).attr("src", cache2[id]["image"]);
			$(popupImage).attr("alt", cache2[id]["name"]);

			//title
				let _t = $("<h2 style='font-size: 20px;'></h2>").html("<a class='ipc-link ipc-link--baseAlt ipc-link--inherit-color' href=" + cache2[id]["url"] + ">" + cache2[id]["name"] + "</a> <span>(" + cache2[id]["birthDate"] + " - " + cache2[id]["deathDate"] + ")</span>");
			$(popupTitle).append(_t);

			//genres
			for (let i = 0; i < cache2[id]["jobTitle"].length; i++)
			{
				let _a = $("<span>," + cache2[id]["jobTitle"][i] + "</span>")
				$(popupGenres).prepend(_a);
			}

			//summary
				$("</br><p>" + cache2[id]["summaryPeople"] + "</p></br>").appendTo(popupSummary);

			break;
		}
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
function ShowYoutubeUrl(url, cache2)
{
	let id = url.match(/\/(tt\d+)\//)[1];
	let slate = $("div.ipc-slate");

	if (slate.length !== 0)
		return;

	let div = $("<div id=imdbe_divtrailer ></div>").html("<h1> \
<a href='https://www.youtube.com/results?search_query=" + cache2[id]["name"] + " trailer'>Search trailer on Youtube</a></h1 >\
");
		$("div.plot_summary_wrapper").prepend(div);
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
	$("head").append($("<style type=text/css></style>").text("div.imdbe_image {width: 40px;height: 40px;background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgNTEyIDUxMiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNTEyIDUxMjsiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPGNpcmNsZSBzdHlsZT0iZmlsbDojRkZENDAwOyIgY3g9IjI1NiIgY3k9IjI1NiIgcj0iMjU2Ii8+DQo8cGF0aCBzdHlsZT0iZmlsbDojRkY5RjAwOyIgZD0iTTUxMiwyNTZjMC01LTAuMTU5LTkuOTYzLTAuNDQyLTE0Ljg5MkwzNjguNzI1LDk4LjI3NUwzNjIsMTE4bC0yMS4yODktMWwtNTIuOTg3LTUzTDY0LDI4Ny43MjQNCglsNTMsNTIuOTg3bDI2LjAwMyw3Mi43NDJsOTguMTA1LDk4LjEwNUMyNDYuMDM3LDUxMS44NDEsMjUxLDUxMiwyNTYsNTEyQzM5Ny4zODUsNTEyLDUxMiwzOTcuMzg1LDUxMiwyNTZ6Ii8+DQo8cGF0aCBzdHlsZT0iZmlsbDojNUE1QTVBOyIgZD0iTTQ0OCwyODcuNzI0di02My40NDlsLTUyLjA1MS0xMC4zNWMtMi45MjQtOS40NS02LjUyNS0xOC40NS0xMS4yNS0yNy4yMjVsMjkuMDI2LTQzLjQyNWwtNDUtNDUNCglMMzI1LjMsMTI3LjMwMWMtOC43NzUtNC43MjUtMTcuNzc2LTguMzI2LTI3LjIyNS0xMS4yNUwyODcuNzI0LDY0aC02My40NDlsLTEwLjM1LDUyLjA1MWMtOS40NSwyLjkyNC0xOC40NSw2LjUyNS0yNy4yMjUsMTEuMjUNCglsLTQzLjQyNS0yOS4wMjZsLTQ1LDQ1bDI5LjAyNiw0My40MjVjLTQuNzI1LDguNzc1LTguMzI2LDE3Ljc3Ni0xMS4yNSwyNy4yMjVMNjQsMjI0LjI3NnY2My40NDlsNTIuMDUxLDEwLjM1DQoJYzIuOTI0LDkuNDUsNi41MjUsMTguNDUsMTEuMjUsMjcuMjI1bC0yOS4wMjYsNDMuNDI1bDQ1LDQ1bDQzLjQyNS0yOS4wMjZjOC43NzUsNC43MjUsMTcuNzc2LDguMzI2LDI3LjIyNSwxMS4yNUwyMjQuMjc2LDQ0OA0KCWg2My40NDlsMTAuMzUtNTIuMDUxYzkuNDUtMi45MjQsMTguNDUtNi41MjUsMjcuMjI1LTExLjI1bDQzLjQyNSwyOS4wMjZsNDUtNDVMMzg0LjY5OSwzMjUuMw0KCWM0LjcyNS04Ljc3NSw4LjMyNi0xNy43NzYsMTEuMjUtMjcuMjI1TDQ0OCwyODcuNzI0eiBNMjU2LDMzNC43NWMtNDMuNDI1LDAtNzguNzUtMzUuMzI1LTc4Ljc1LTc4Ljc1czM1LjMyNS03OC43NSw3OC43NS03OC43NQ0KCXM3OC43NSwzNS4zMjUsNzguNzUsNzguNzVTMjk5LjQyNSwzMzQuNzUsMjU2LDMzNC43NXoiLz4NCjxwYXRoIHN0eWxlPSJmaWxsOiM0NDQ0NDQ7IiBkPSJNMzk1Ljk0OSwyOTguMDc1Yy0yLjkyNCw5LjQ1LTYuNTI1LDE4LjQ1LTExLjI1LDI3LjIyNWwyOS4wMjYsNDMuNDI1bC00NSw0NUwzMjUuMywzODQuNjk5DQoJYy04Ljc3NSw0LjcyNS0xNy43NzYsOC4zMjYtMjcuMjI1LDExLjI1TDI4Ny43MjQsNDQ4SDI1NlYzMzQuNzVjNDMuNDI1LDAsNzguNzUtMzUuMzI1LDc4Ljc1LTc4Ljc1cy0zNS4zMjUtNzguNzUtNzguNzUtNzguNzVWNjQNCgloMzEuNzI0bDEwLjM1LDUyLjA1MWM5LjQ1LDIuOTI0LDE4LjQ1LDYuNTI1LDI3LjIyNSwxMS4yNWw0My40MjUtMjkuMDI2bDQ1LDQ1TDM4NC42OTksMTg2LjcNCgljNC43MjUsOC43NzUsOC4zMjYsMTcuNzc2LDExLjI1LDI3LjIyNUw0NDgsMjI0LjI3NnY2My40NDlMMzk1Ljk0OSwyOTguMDc1eiIvPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPC9zdmc+DQo=)}"));

	/* Customizes all icons at once */
	$("head").append($("<style type=text/css></style>").text(".icon { \
	display: inline-block; \
}"));

	$("head").append($("<style type=text/css></style>").text("#imdbe_setbutton { \
	display: inline-flex;\
	cursor: pointer;\
	order: 10;\
}"));

	$("head").append($("<style type=text/css></style>").text("#imdbe_settings { \
	position: fixed;\
	z-index: 500;\
	background: #1f1f1f;\
	font-family: Roboto,Helvetica,Arial,sans-serif;\
	color:#dddddd;\
	padding:10px;\
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
	background: #1f1f1f;\
	z-index: 500;\
	max-width: 700px;\
	min-height: 200px;\
	border: 2px solid #f5c518;\
	color:#bcbcbc;\
		padding:5px;\
		display: flex\
}"));

	$("head").append($("<style type=text/css></style>").text(".imdbe_mode-advanced { \
	font-size: 14px;\
	padding: 5px 10px;\
}"));

	$("head").append($("<style type=text/css></style>").text(".imdbe_lister-item-image { \
	display: inline-block;\
	vertical-align: top;\
	margin-right: 20px;\
}"));

	$("head").append($("<style type=text/css></style>").text(".imdbe_lister-item-content { \
	max-width: 90%;\
	display: inline-block;\
	vertical-align: top;\
}"));

	$("head").append($("<!--End of IMDB Enhancement v" + GM.info.script.version + " CSS-->"));
}
//Function place css
//End

//Start
//Function place option button and html option
function SetHtml(options2)
{
	//settings
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
	<input type=checkbox name=popupM id=imdbe_popupM >Popup for movies</input><br>\
	<input type=checkbox name=popupP id=imdbe_popupP >Popup for peoples</input><br><br> \
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

	$(".navbar__inner").append($("<div id=imdbe_setbutton></div>").html("<div class='icon imdbe_image'></div>"));

	$(".ipc-page-wrapper, #wrapper").prepend(settingsDiv);

	$("#imdbe_settings").hide();

	UIValues(options2);

	SetEvents("setting", options2);

	//popup
	const div = $("<div id=imdbe_popupDiv class='tooltip'></div>").html("LOADING...");

	div.appendTo('body');

	let _div = $("#imdbe_popupDiv").html("<img id='popupImage'>\
<div id='popupRigtSection' style='padding: inherit;'>\
<div id='popupTitle'></div>\
<div id='popupGenres'></div>\
<div id='popupRatings'></div>\
<div id='popupSummary'></div>\
<div id='popupCast'></div></div>");

	_div.hide();

	SetEvents("popupDiv");
}
//Function place option button and html option
//End

//Start
//Function set UI values of settengs/options
function UIValues(options2)
{
	$("#imdbe_age").prop("checked", options2.age);
	$("#imdbe_genre").prop("checked", options2.genre);
	$("#imdbe_trailer").prop("checked", options2.trailer);
	$("#imdbe_connections").prop("checked", options2.connections);
	$("#imdbe_additionalRatings").prop("checked", options2.additionalRatings["on"]);
	$("#imdbe_kinopoisk").prop("checked", options2.additionalRatings["kinopoisk"]);
	$("#imdbe_rottenTomatoes").prop("checked", options2.additionalRatings["rottenTomatoes"]);
	$("#imdbe_rMovies").prop("checked", options2.additionalRatings["rMovies"]);
	$("#imdbe_tmdb").prop("checked", options2.additionalRatings["tmdb"]);
	$("#imdbe_popupM").prop("checked", options2.popupM);
	$("#imdbe_popupP").prop("checked", options2.popupP);
	$("#imdbe_debug").prop("checked", options2.debug);
}
//Function set events
//End

//Start
//Function set events
function SetEvents(what, options2, cache2)
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
				Options2._GMUpdate("options2", options2);
				$("#imdbe_settings").toggle(1000);
			});

			$("#imdbe_clear").click(function ()
			{
				Options2._GMDeleteValues("imdbe_cache2");
			});

			$("#imdbe_debug").change(function ()
			{
				options2.debug = $(this).prop("checked");
				//debug = $(this).prop("checked");
			});

			$("#imdbe_age").change(function ()
			{
				options2.age = $(this).prop("checked");
			});

			$("#imdbe_connections").change(function ()
			{
				options2.connections = $(this).prop("checked");
			});

			$("#imdbe_genre").change(function ()
			{
				options2.genre = $(this).prop("checked");
			});

			$("#imdbe_trailer").change(function ()
			{
				options2.trailer = $(this).prop("checked");
			});

			$("#imdbe_popupM").change(function ()
			{
				options2.popupM = $(this).prop("checked");
			});

			$("#imdbe_popupP").change(function ()
			{
				options2.popupP = $(this).prop("checked");
			});
			//RATINGS!!!!!!!!!!
			$("#imdbe_additionalRatings").change(function ()
			{
				options2.additionalRatings["on"] = $(this).prop("checked");
			});
			$("#imdbe_kinopoisk").change(function ()
			{
				options2.additionalRatings["kinopoisk"] = $(this).prop("checked");
			});
			$("#imdbe_rottenTomatoes").change(function ()
			{
				options2.additionalRatings["rottenTomatoes"] = $(this).prop("checked");
			});
			$("#imdbe_rMovies").change(function ()
			{
				options2.additionalRatings["rMovies"] = $(this).prop("checked");
			});
			$("#imdbe_tmdb").change(function ()
			{
				options2.additionalRatings["tmdb"] = $(this).prop("checked");
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
				ShowGenre(cache2);
			});
			break;
		case "popupM":
			$("a").hover(function (e)
			{
				if ($(e.target).attr("href").includes("title/tt"))
				{
					//console.log("in: " + e.target);
					ShowPopUp(e, "movie", cache2);
				}
			}, function (e)
				{
					if (!$('#imdbe_popupDiv').is(':hover'))
					{
						$("#imdbe_popupDiv").hide(100);
						e.preventDefault();
					}
			});
			break;
		case "popupP":
			$("a").hover(function (e)
			{
				if ($(e.target).attr("href").includes("name/nm"))
				{
					//console.log("in: " + e.target);
					ShowPopUp(e, "people", cache2);
				}
			}, function (e)
			{
				if (!$('#imdbe_popupDiv').is(':hover'))
				{
					$("#imdbe_popupDiv").hide(100);
					e.preventDefault();
				}
			});
			break;
		case "popupDiv":
			$("#imdbe_popupDiv").mouseleave(function (e)
			{
				$("#imdbe_popupDiv").hide(100);
				e.preventDefault();
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
//TOOLS STUFF BELOW
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
		return "#000";
	else if (num >= 60)
		return "#54A72A";
	else if (num <= 40)
		return "#FF0000";
	else
		return "#BB8A00";
}
//Function Get String Score
//End

//Start
//Format bytes https://stackoverflow.com/a/18650828
function FormatBytes(bytes, decimals = 2)
{
	if (bytes === 0) return '0 Bytes';

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
//Format bytes https://stackoverflow.com/a/18650828
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
✓	13)Make pop-up for people				//DONE 0.2.02
TODO ENDS */