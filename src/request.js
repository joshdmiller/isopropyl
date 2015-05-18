import querystring from 'querystring';
import xhr from 'xhr';
import debug from 'debug';

let log = debug( 'Isopropyl:request' );

var request = function ( req ) {
  // TODO: merge default config
  
  var query = querystring.stringify( req.query || {} );
  req.url = `${req.url}?${query}`;
  req.responseType = 'json';

  if ( req.body ) {
    req.json = req.body;
    delete req.body;
  }

  return new Promise( ( resolve, reject ) => {
    xhr( req, ( err, res ) => {
      if ( err ) {
        log( 'XHR resulted in an error. Response was:', res );
        reject( err );
      } else if ( res.statusCode < 200 || res.statusCode > 299 ) {
        log( 'Non-20x response received from server. Response was:', res );
        reject( new Error( `Unknown Error: Server returned a status of ${res.statusCode}` ) );
      } else {
        log( 'XHR success.' );
        resolve( res.body );
      }
    });
  });
};

export default request;

