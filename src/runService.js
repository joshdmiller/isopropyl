import debug from 'debug';

let log = debug( 'Isopropyl:runService' );

export default function runService ( fn, req ) {
  log( `Running ${req.resource}::${req.method}` );

  return new Promise( ( resolve, reject ) => {
    var result;

    function cb ( err, res ) {
      if ( err ) {
        reject( err );
      } else {
        resolve( res );
      }
    }

    try {
      result = fn( req, cb );
    } catch ( err ) {
      reject( err );
    }

    // If it's a promose, just resolve it
    if ( result && typeof result.then === 'function' ) {
      log( 'Service returned a promise.' );
      resolve( result );

      // If it's a stream, resolve its final value
    } else if ( result && typeof result.pipe === 'function' ) {
      log( 'Service returned a stream.' );
      // handle stream response

      // If no callback was defined for this method, we can assume it's synchronous
    } else if ( fn.length < 2 ) {
      log( 'Service returned a value.' );
      resolve( result );

    // Otherwise, the callback will take care of it, so we're good
    } else {
      log( 'Service used a callback.' );
    }
  });
}

