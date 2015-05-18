import {parse} from 'querystring';
import debug from 'debug';
import runService from './runService.js';

let log = debug( 'Isopropyl:Router' );

class Router {
  constructor () {
    this._rules = [];
  }

  add ( name, handlers ) {
    var pathParts = name.split( '.' );
    var resource = pathParts.pop();
    var paramName = `${resource}`;
    var parts = [];

    // For each parent resource, add it and its id. E.g. for `articles.comments`, this will add
    // `/articles/:articles_id` to the paths.
    pathParts.forEach( part => parts.push( { part }, { part, param: true } ) );

    // And add the resource and its optional ID on top of it. Continuing with the example, we'd
    // now have `/articles/:articles_id/comments/:comments_id`.
    parts.push( { part: resource }, { part: resource, param: true } );

    log( `Registering handler for ${name}` );

    this._rules.push({ name, parts, handlers });
  }

  run ( req ) {
    var url = req.path;

    if ( url.length ) {
      // Strip leading and trailing '/' (at end or before query string)
      url = url.replace(/^\/|\/($|\?)/, '');
    }

    var urlParts = url.split( '?', 2 );
    var pathParts = urlParts[0].split( '/', 50 );
    var query = urlParts[1] ? parse( urlParts[1] ) : {};
    var service, params, singular;

    this._rules.some( rule => {
      var matches = rule.parts.every( ( rulePart, idx ) => {
        var pathPart = pathParts[ idx ];
        params = {};

        if ( pathPart !== undefined ) {
          if ( rulePart.param ) {
            params[ rulePart.part ] = pathPart;
            return true;
          } else {
            return rulePart.part === pathPart;
          }
        } else if ( rulePart.param ) {
          return true;
        } else {
          return false;
        }
      });

      if ( ! matches ) {
        return false;
      } else {
        singular = params[ rule.parts[rule.parts.length - 1].part ] !== undefined;

        // If the number of path parts is not right, this is not a match.
        if ( singular && pathParts.length !== rule.parts.length ) {
          return false;
        } else if ( ! singular && pathParts.length !== rule.parts.length - 1 ) {
          return false;
        }

        service = rule;
        req.params = params;
        req.resource = service.name;

        log( `Request path matched ${service.name}` );

        return true;
      }
    });

    if ( service ) {
      var fn = req.method.toLowerCase() + ( singular ? 'One' : '' );

      if ( service.handlers[ fn ] ) {
        log( `Executing ${service.name}::${fn}` );
        return runService( service.handlers[ fn ].bind( service.handlers ), req );
      }
    }

    // Else return 404
    var err = new Error( 'Route not matched.' );
    err.statusCode = 404;
    return Promise.reject( err );
  }
}

export default Router;

