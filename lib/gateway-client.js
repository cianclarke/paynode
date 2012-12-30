var qs = require('querystring'),
    https = require('https');

function GatewayClient(opts, authInfo){
  verifyRequiredArguments(opts);

  this.request = function(request, callback){
    var requestString = qs.stringify(request);

    var options = {
        host: opts.host,
        path: opts.path,
        port: 443,
        method: 'POST',
        headers: {
            'Host': opts.host,
            'Content-Type': opts.contentType,
            'Content-Length': requestString.length
        }
    };

    if (authInfo) {
      options.cert = authInfo.cert;
      options.key = authInfo.key;
    }

    var req = https.request(options);

    req.end(requestString);
    req.on('response', function(res){
        res.on('data', function(data){
          callback(opts.responseParser.parseResponse(request, data.toString(), opts.responseOptions))
        })
    })
    
    req.on('error', function(err) {
        return callback(err); // TODO: Callback should always take 2 params - err, res - but at least now we won't crash..
    });

  }
}

exports.GatewayClient = GatewayClient;

function verifyRequiredArguments(opts){
  var required = [ 'host', 'path', 'contentType', 'responseParser' ]
  if(!opts) throw new Error("Required fields missing. Need an option containing configuration details.")
  var missingFields = required.filter(function(s){ return !(s in opts) || !opts[s] })
  if(missingFields.length > 0){
    throw new Error("GatewayClient ctor is missing required fields " + missingFields.join(','))
  }
}

