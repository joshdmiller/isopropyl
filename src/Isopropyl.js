import debug from 'debug';
import Resource from './Resource';
import Router from './Router';
import middleware from './middleware';

let log = debug( 'Isopropyl' );
let logError = debug( 'Isopropyl:error' );
let error = function ( msg, ...args ) {
  logError( msg, ...args );
  throw new Error( msg );
};

class Isopropyl {
  constructor ( options ) {
    this._options = options || {};
    this._fns = {};
    this._router = new Router();
  }

  xhrPath () {
    return this._options.xhrPath || '/api';
  }

  register ( name, service ) {
    log( `Registering "${name}" service.` );
    console.log(name, service);

    if ( ! name ) {
      error( 'Expected a resource name.' );
    }

    if ( typeof service !== 'object' || Object.keys( service ).length === 0 ) {
      error( 'Expected a map of services.' );
    }

    this._fns[ name ] = service;
    this._router.add( name, service );
  }

  resource ( name, ...params ) {
    var options = {
      xhrPath: this.xhrPath(),
      fns: this._fns[ name ]
    };

    return new Resource( options, name, ...params );
  }

  middleware () {
    return middleware.bind( this )();
  }
}

export default Isopropyl;

