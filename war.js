const request = require('request'),
    fs = require('fs'),
    striptags = require('striptags'),
    entities = require('html-entities'),
    player = require('play-sound')();

let lastPlayed = 0;

function playNews() {
    request.get("https://dlb-node.delfi.lt/?callback=jQuery183015372563901609904_1646482082273&eventid=98727&page=0&order=created_desc&_=1646503288059", (err, res, body) => {
        let json = body.substr(body.indexOf("\n")).slice(0, -1); // Sanitize
        json = JSON.parse('{' + json + '');
        let message = json.messages[Object.keys(json.messages).pop()];
        message.stripped = entities.decode(striptags(message.message)); // Sanitize
        message.stripped = message.stripped.replace(/(?:https?|ftp):\/\/[\n\S]+/g, ' nuoroda'); // Remove links
        if(lastPlayed !== message.id) {
            lastPlayed = message.id;
            process.stdout.write('...\n\x1b[32m' + message.stripped + '\n');
            textToSpeech("Pyp pyp pup, karo naujiena. " + message.stripped + " Pyp pyp pup");
        } else {
            process.stdout.write('.');
        }
    });
}

function textToSpeech(text) {
    request
        .get("https://runa.tilde.lv/client/say/lt-regina?text=" + encodeURIComponent(text) + "&tempo=1&pitch=1")
        .pipe(fs.createWriteStream('output.mp3'))
        .on('finish', () => {
            //player.player = 'powershell';
            player.play('./output.mp3');
        })
}

setInterval(playNews, 60000 * 2) && playNews();