import runService from './runService';

describe( 'runService', function () {
  beforeEach( function () {
    this.request = {
      resource: 'resource'
    };
  });

  it( 'should return a promise', function () {
    expect( runService( () => {}, this.request ) ).to.be.an.instanceof( Promise );
  });

  context( 'when function returns a promise', function () {
    it( 'should pass on resolutions', function () {
      var val = 'hello';
      var fn = ( req ) => new Promise( ( resolve, reject ) => resolve( val ) );

      expect( runService( fn, this.request ) ).to.eventually.equal( val );
    });

    it( 'should pass on rejections', function () {
      var err = new Error( 'Oh my!' );
      var fn = ( req ) => new Promise( ( resolve, reject ) => reject( err ) );

      expect( runService( fn, this.request ) ).to.be.rejectedWith( err );
    });
  });

  context( 'when function uses a callback', function () {
    context( 'and the callback provides a value', function () {
      it( 'should resolve the promise with the value', function () {
        var val = 'hello';
        var fn = ( req, cb ) => setTimeout( () => cb( null, val ), 1 );

        expect( runService( fn, this.request ) ).to.eventually.equal( val );
      });
    });

    context( 'and the callback provides an error', function () {
      it( 'should reject the promise with the error', function () {
        var err = new Error( 'Oh my!' );
        var fn = ( req, cb ) => setTimeout( () => cb( err ), 1 );

        expect( runService( fn, this.request ) ).to.be.rejectedWith( err );
      });
    });
  });

  context( 'when function is synchronous', function () {
    it( 'should resolve the promise with the value', function () {
      var val = 'hello';
      var fn = () => val;

      expect( runService( fn, this.request ) ).to.eventually.equal( val );
    });

    it( 'should catch an error and reject the promise', function () {
      var err = new Error( 'Oh my!' );
      var fn = () => { throw err; };

      expect( runService( fn, this.request ) ).to.be.rejectedWith( err );
    });
  });

  context( 'when function returns a stream', function () {
    it.skip( 'should resolve with the final value from the stream', function () {});

    it.skip( 'should reject with any errors on the stream', function () {});
  });
});

