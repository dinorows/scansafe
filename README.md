# ScanSafe


Scans source code packages for potential javascript vulnerabilities embedded in the Gulp file as strings or regular expressions.
Leverages the Gulp task runner to efficiently traverse all packages with source code listed under a 'src' folder.
Scans for potential vulnerabilities as strings or regular expressions, listed in function forEachFolder() of your Gulp file.
We start with a listing of known dangerous mozilla API calls, but this listing is easily modified by the user.
Prints on the command line number of vulnerabilities found per package, together with a total number of bytes per package.
That way you can rack and stack your packages by number of potential vulnerabilities.
It is difficult today for static parsers to build complete Abstract Syntax Trees for javascript and do a source to sink analysis
because of the number of popular proprietary (but open source) javascript frameworks in use (angular, react, etc.), each with 
different modularizing conventions about how to stitch code at runtime. When many open source packages are in play, sometimes it is 
useful to be able to rank them by potential vulnerabilities in order to inform a more careful inspection, or to compare functionally 
similar packages.


## Install


Make sure you've already installed Node.js. Create a new working folder. In a command shell in that folder, install scansafe locally:

```
npm install scansafe
```

followed by
```
npm install -g gulp
```

You want to be able to run gulp commands in the command shell, and the last command above ensures gulp is installed not in your current
folder, but in a globally available folder mapped to your PATH environment variable.

## Usage

1. Create a folder called 'src' in your current working folder in the command shell after you've installed scansafe.
2. Put all your javascript packages' source code into that folder (each subfolder of the 'src' folder will be scanned independently)
3. Copy the gulpfile.js file from the node_modules/scansafe folder two levels up to your current working folder. 
4. In a command shell in your current working folder, run:
```
gulp scan
```
   
That should scan each package folder and give you a count of vulnerabilities over total number of bytes of source code per package,
together with files where the potentially dangerous API calls were made, and instance counts.

5. You may also
```
gulp scan --verbosity terse
```
   
In order to omit file and instance information.

## Architecture

ScanSafe leverages the Gulp task runner to build a pipeline that lists package source code subfolders based on the npm q 
library that enables a pattern called a 'promise' in order to add blocking behavior to Gulp’s asynchronous runtime. This is what allows 
us to finish scanning a folder, with a running count of unsafe coding patterns and total number of bytes, before moving on to the next folder. 
Within each folder, the scan task runs asynchronously and leverages the gulp-contains2 npm package that scans files for patterns and regular 
expressions.

## License

Released under the Apache2 license.
