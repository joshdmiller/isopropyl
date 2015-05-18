describe( 'request', function () {
  var request;
  var xhr = sinon.spy( function ( req, cb ) {
    setTimeout( function () {
      var res = { statusCode: req.$res || 200, body: 'body' };

      if ( req.$res === '500' ) {
        cb( new Error() );
      } else {
        cb( null, res );
      }
    }, 0);
  });

  before( function () {
    request = proxyquire( './src/request', {
      'xhr': xhr
    });
  });

  beforeEach( function () {
    xhr.reset();

    this.url = '/test/path';
    this.request = {
      url: this.url
    };
  });

  it( 'should return a promise', function () {
    expect( request( this.request ) ).to.be.an.instanceof( Promise );
  });

  it( 'should correctly translate the query string', function () {
    this.request.query = { one: 'hello', two: true };
    request( this.request );
    expect( xhr.firstCall.args[0].url ).to.equal( `${this.url}?one=hello&two=true` );
  });

  it( 'should use an empty query string if none is provided', function () {
    request( this.request );
    expect( xhr.firstCall.args[0].url ).to.equal( `${this.url}?` );
  });

  it( 'should reject the promise on 500 error', function () {
    this.request.$res = 500;
    expect( request( this.request ) ).to.be.rejectedWith( Error );
  });

  it( 'should reject the promise on non-20x error', function () {
    this.request.$res = 400;
    expect( request( this.request ) ).to.be.rejectedWith( /Server returned/ );
  });

  it( 'should resolve with the response body', function () {
    expect( request( this.request ) ).to.eventually.equal( 'body' );
  });
});

