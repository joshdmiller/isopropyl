import debug from 'debug';
import runService from './runService';
import request from './request';

let log = debug( 'Isopropyl:Resource' );
let logError = debug( 'Isopropyl:Resource:error' );
let error = function ( msg, ...args ) {
  logError( msg, ...args );
  throw new Error( msg );
};

class Resource {
  constructor ( options = {}, name, ...ids ) {
    var parts;

    if ( ! name ) {
      error( 'Expected a resource name.' );
    }

    parts = name.split( '.' );
    options.fns = options.fns || {};

    if ( ids.length === parts.length - 1 ) {
      this._isCollection = true;
    } else if ( ids.length === parts.length ) {
      this._isCollection = false;
    } else if ( ids.length > parts.length ) {
      this._isCollection = false;
      error( 'Too many IDs provided based on resource', name );
    } else {
      this._isCollection = true;
      error( 'Too few IDs provided based on resource', name );
    }

    this._resource = name;
    this._isLocallyDefined = Object.keys( options.fns ).length ? true : false;
    this._options = options;
    this._ids = {};
    this._url = this._options.xhrPath || '';

    // Build the URL and store the IDs
    parts.forEach( ( part, idx ) => {
      this._url += `/${part}`;

      if ( ids[ idx ] ) {
        this._url += `/${ids[ idx ]}`;
        this._ids[ part ] = ids[ idx ];
      }
    });

    log( 'URI set to ', this._url );
  }

  _run ( method, query = {}, data = {} ) {
    log( `Running ${this._resource}::${method}` );
    var fns = this._options.fns;
    var fn = this._isCollection ? fns[ method ] : fns[ `${method}One` ];

    var req = {
      resource: this._resource,
      url: this.uri(),
      params: this._ids,
      contentType: 'application/json',
      type: 'json',
      body: data,
      method,
      query
    };

    // If the method isn't defined locally, we need to run an XHR to get the data.
    // Otherwise, we want to run the function and return a promise with its result.
    if ( ! this._isLocallyDefined || typeof fn !== 'function' ) {
      log( 'Running XHR' );
      return request( req );
    } else {
      log( 'Running locally' );
      return runService( fn.bind( fns ), req );
    }
  }

  isLocallyDefined () {
    return this._isLocallyDefined;
  }

  isCollection () {
    return this._isCollection;
  }

  uri () {
    return this._url;
  }

  get ( query ) {
    return this._run( 'get', query );
  }

  put ( data, query ) {
    return this._run( 'put', query, data );
  }

  post ( data, query ) {
    return this._run( 'post', query, data );
  }

  patch ( data, query ) {
    return this._run( 'patch', query, data );
  }

  delete ( query ) {
    return this._run( 'delete', query );
  }
}

export default Resource;

