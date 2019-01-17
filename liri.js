require("dotenv").config();
const dotevn = require('./env')
const API_Keys = require('./keys.js');
const twitter  = require('twitter');
const spotify  = require('node-spotify-api');
const request  = require('request');
const inquirer = require('inquirer');
const colors   = require('colors');
const fs  	   = require('fs');
const moment = require('moment')
const axios = reqire('axios')

programStart();


function programStart() {
	logStuffThatHappens('to start the program', 'node liri.js');

	inquirer.prompt([{
	    type: 'list',
	    name: 'program',
	    message: 'What program do you want to run?',
	    choices: [
			'my-tweets', 
			'spotify-this-song', 
			'movie-this', 
			'do-what-it-says'
	    ]
	  }
	])
	.then((answers) => {

		switch (answers.program) {

			case 'my-tweets':
				getTweets();
				break;

			case 'spotify-this-song':
				inquirer.prompt([{
				    type: 'input',
				    name: 'song',
				    message: 'What song would you like info for?',
				  }
				])
				.then((answers) => {
					const song = answers.song;
					getMusic(song);
				});
				break;

			case 'movie-this':
				inquirer.prompt([{
				    type: 'input',
				    name: 'movie',
				    message: 'What movie would you like info for?',
				  }
				])
				.then((answers) => {
					const movie = answers.movie;
					getMovie(movie);
				});
				break;

			case 'do-what-it-says':
				console.log('\nThis function is currently not supported.\n'.red);
				logStuffThatHappens('do-what-it-says     ', 'not supported');
				reRunProgram();
				break;

			default:
				logStuffThatHappens('programStart()      ', 'default Switch/Case');
				console.log("You've done something wrong, try again...\n".red)
		}
	})
}


function reRunProgram() {
	inquirer.prompt([{
	    type: 'confirm',
	    name: 'confirm',
	    message: 'Would you like to re-start the program?',
	  }
	])
	.then((answers) => {
		if (answers.confirm) {
			logStuffThatHappens('to reRun the program', 'Yes');
			programStart();
		} else {
			logStuffThatHappens('to abort the program', 'No');
			console.log("\nGood Bye!\n".cyan);
		}
	})
}


function getTweets() {
	const client = new twitter(API_Keys.twitterKeys);
	const queryUrl = "https://api.twitter.com/1.1/search/tweets.json?q=realFredLintz&result_type=recent&count=20";

	client.get(queryUrl, (error, tweets, response) => {

		if (error) {
			logErrors('getTweets()', '@realFredLintz');
			console.log(error);
		}

		console.log("\nHere are the latest tweets from @realFredLintz: \n".cyan);
   		
   		for (var i = 0; i < tweets.statuses.length; i++) {
   			console.log(tweets.statuses[i].created_at.substring(0,19).grey + " - " + tweets.statuses[i].text.cyan)
   		}
   		console.log('');	
	});

	logStuffThatHappens('my-tweets           ', '@realFredLintz');

	setTimeout(reRunProgram, 1000);
}


function getMusic(song) {
	const Spotify = new spotify(API_Keys.56353749afeb48c395f058bf3aaf388b);
 
	Spotify.search({ type: 'track', query: song, limit: 1 }, (err, data) => {
		if (err) {
			logErrors('getMusic()', song);
			return console.log(`\n${err}\n`.red);
		}
		// console.log(JSON.stringify(data.tracks.items[0], null, 2));
		let artistName = data.tracks.items[0].album.artists[0].name;
		let songName = data.tracks.items[0].name;
		let songURL = data.tracks.items[0].album.artists[0].external_urls.spotify;
		let albumName = data.tracks.items[0].album.name;

		console.log("\nGreat choice!\n".cyan);
		console.log(`I love '${songName}' by ${artistName}. Wasn't that on the album '${albumName}'?`.cyan);
		console.log(`Have a listen over at ${songURL.grey}\n`.cyan);

		logStuffThatHappens('spotify-this-song   ', song);

		setTimeout(reRunProgram, 1000);
	});
}

const getMeMovie = function (movieName) {
    if (movieName === undefined) {
        movieName = "Bloodsport"
    }

    const urlHit =
        "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=full&tomatoes=true&apikey=trilogy";

    axios.get(urlHit).then(function (response) {
        var data = response.data;
        // console.log(data)
        console.log("----------------------------------------")
        console.log("Title: " + data.Title);
        console.log("Year: " + data.Year);
        console.log("Rated: " + data.Rated);
        console.log("Released: " + data.Released);
        console.log("Genre: " + data.Genre)
        console.log("Director: " + data.Director);
        console.log("----------------------------------------")

    })
}


function logStuffThatHappens(func, query) {
	let stuffD = new Date();
	fs.appendFile("log.txt", `\n ${stuffD.getTime()}: User requested: '${func}' with a query of '${query}',`, (err) => {

		if (err) {
			logErrors('logStuffThatHappens()', query);
			return console.log(err);
		}
	});
}


function logErrors(func, query) { 
	let errorD =new Date();              
	fs.appendFile("log.txt", `\n ${errorD.getTime()}:  Error Occured: 'running: '${func}' with a query of '${query}',`, (err) => {

		if (err) {
			logErrors('logErrors()', query);
			return console.log(err);
		}
	});
}
