import debug from 'debug';

let log = debug( 'Isopropyl::middleware' );

function middleware () {
  log( 'Generating middleware.' );

  return ( req, res, next ) => {
    log( `Handling ${req.method}: ${req.path}` );

    var fakeRequest = {
      contentType: 'application/json',
      type: 'json',
      path: req.path.replace( this.xhrPath(), '' ),
      method: req.method,
      query: req.query,
      body: req.body
    };

    this._router.run( fakeRequest )
    .then( reply => {
      log( 'Resource resolved successfully.' );
      res.send( reply );
    }, err => {
      log( 'Resource returned an error:', err );
      next( err );
    })
    .catch( err => {
      log( 'Uncaught error:', err );
    });
  };
}

export default middleware;

