// Copyright 2017 Dino Konstantopoulos, dino@mitre.org

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

    // http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';
var gulp             = require('gulp'),
    args             = require('yargs').argv,
    es               = require('event-stream'),
    contains         = require('gulp-contains2'),
	fs               = require('fs'),
	path 			 = require('path'),
	Q 				 = require('q');

// simple stream that prints the path of whatever file it gets into
var printFileNames = function(){

    return es.map(function(data, cb){

        console.log(data.path);
        cb(null, data);
    });
};

var count = 0;
var totalSizeBytes = 0;
function IncrementCount(value, index, arr)
{
	if(!isNaN(value)){
		if(!isNaN(parseInt(value))) {
			//console.log('*********** ' + parseInt(value));
			count += parseInt(value);
		}
	}
}

var forEachFolder = function(stream){

    return es.map(function(data, cb){

        if(data.isDirectory()){

            var pathToPass = data.path+'/*.*';  // change it to *.js if you want only js files for example

            //console.log('Piping files found in '+data.path);
			
			fs.readdir(data.path, function(err, files) {
				var i;
				if (err) throw err;
				for (i=0; i<files.length; i++) {
					//console.log('*** ' + files[i]);
					//var stats = fs.statSync(files[i]);
					//var fileSizeInBytes = stats["size"];
					fs.stat(data.path + '\\' + files[i], function(err, stats) {
						if (err) {
							console.log(err);
						} else {
							//if (stats.isDirectory()) { console.log('folder!');}
							//if (err) { throw err; }
							//if (stats.isFile()) { console.log('file!'); }
							if (stats.isFile()) { totalSizeBytes += stats.size; }
						}
					});
				}
			});

            if(stream !== undefined){
                //gulp.src([pathToPass])
                //.pipe(stream());
				
				gulp.src([pathToPass])
			        .pipe(contains({
			            search: [
							'child_process.exec(',
							'setTimeout(',
							'setInterval(',
							' req.body.',
							'eval(',
							'onmessage=',
							'indexedDB.',
							'localStorage.',
							'sessionStorage.',
							'new MozActivity(',
							'.mozSetMessageHandler(',
							'.getDataStores(',
							'.connect(',
							'.setMessageHandler(',
							'.mozAlarms',
							'window.open(',
							'.getUserMedia(',
							'.mozAudioChannelType',
							'.mozAudioChannel',
							'.addEventListener(',
							'.mozBluetooth',
							'.setAttribute(',
							'.addEventListener(',
							'.mozContacts',
							'new Notification(',
							'.getDeviceStorage(',
							'.mozDownloadManager',
							'.setAttribute(',
							'.mozFMRadio',
							'.geolocation',
							'.addIdleObserver',
							'.mozInputMethod',
							'.mozMobileConnections',
							'.lastKnownHomeNetwork',
							'.mozNetworkStats',
							'.mozNfc',
							'.mozPermissionSettings',
							'.mozPhoneNumberService',
							'.mozPower',
							'.mozSettings',
							'.mozMobileMessage',
							'MozSpeakerManager(',
							'new XMLHttpRequest(',
							'.mozTCPSocket',
							'.mozTelephony',
							'.mozTime',
							'.getUserMedia(',
							'.mozVoicemail',
							'.mozSetMessageHandler(',
							'.mozApps.',
							'.mozWifiManager',
							'.mozKeyboard',
							'.mozCellBroadcast',
							'.mozMobileConnection',
							'.mozNotification'
						],
			            onFound: function (string, file, cb) {
			                // string is the string that was found 
			                // file is the vinyl file object 
			                // cb is the through2 callback 
			 				if (!isTerse) console.log('found in ' + file.history.toString() + ": " + string);
							var res = string.toString().split("|"); 
							res.forEach(IncrementCount);
			                // return false to continue the stream 
							return true;
			            }
			        })).on('end', function() { console.log('end!')});
            }
        }

        cb(null, data);
    });
};

var scriptsPath = './src/';
function getFolders(dir) {
    return fs.readdirSync(dir)
      .filter(function(file) {
        return fs.statSync(path.join(dir, file)).isDirectory();
      });
}

function scanTask(src) {
  console.log('/// now scanning folder ' + src)
  var stream = gulp.src(src)
    .pipe(forEachFolder(printFileNames))
		.on('end', function() {  tallyTask(); if (!isTerse) console.log('\\\\\\ finished scanning folder ' + src);})
  return stream;
}

function tallyTask() {
	console.log('--------------------------');
	console.log('count = ' + count);
	console.log('totalSizeBytes = ' + totalSizeBytes);
	console.log('==========================');
	count = 0;
	totalSizeBytes = 0;
}

var isTerse = args.verbosity === 'terse';

gulp.task('scan', function() {
	var folders = getFolders(scriptsPath);
	var pipeline = new Pipeline();
	for (var key in folders)
	{
		pipeline.add('src/' + folders[key] + '/**');
	}
	pipeline.run(scanTask);
});

var Pipeline = function() {
    this.entries = [];
};
Pipeline.prototype.add = function() {
    this.entries.push(arguments);
};
Pipeline.prototype.run = function(callable) {
    var deferred = Q.defer();
    var i = 0;
    var entries = this.entries;
    var runNextEntry = function() {
        // see if we're all done looping
        if (typeof entries[i] === 'undefined') {
            deferred.resolve();
            return;
        }
        // pass app as this, though we should avoid using "this"
        // in those functions anyways
		//console.log(i + ': ' + entries[i]);
        callable.apply(this, entries[i]).on('end', function() {
            i++;
            runNextEntry();
        });
    };
    runNextEntry();
    return deferred.promise;
};