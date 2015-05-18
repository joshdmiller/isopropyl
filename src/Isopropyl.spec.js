describe( 'Isopropyl', function () {
  var Isopropyl, Resource;
  var successObj = { prop: 'val' };
  var delaySuccess = function ( resolve, reject ) { setTimeout( () => resolve( successObj ), 1 ) };
  var request = sinon.spy( function () { return new Promise( delaySuccess ) } );

  before( function () {
    request = sinon.spy();

    Resource = proxyquire( './src/Resource', {
      './request': request
    });
    Isopropyl = proxyquire( './src/Isopropyl', {
      './Resource': Resource
    });
  });

  beforeEach( function () {
    request.reset();

    this.xhrPath = '/api';
    this.options = {
      xhrPath: this.xhrPath
    };

    this.isopropyl = new Isopropyl( this.options );
  });

  describe( 'constructor()', function () {
    it( 'should return a new instance of Isopropyl', function () {
      expect( this.isopropyl ).to.be.an.instanceof( Isopropyl );
    });
  });

  describe( 'register()', function () {
    context( 'given no name was provided', function () {
      it( 'should throw an error', function () {
        var fn = () => this.isopropyl.register();
        expect( fn ).to.throw( /resource name/ );
      });
    });

    context( 'given no services were provided', function () {
      it( 'should throw an error when missing', function () {
        var fn = () => this.isopropyl.register( 'TEST' );
        expect( fn ).to.throw( /map of services/ );
      });

      it( 'should throw an error when empty', function () {
        var fn = () => this.isopropyl.register( 'TEST', {} );
        expect( fn ).to.throw( /map of services/ );
      });
    });
  });

  describe( 'resource()', function () {
    beforeEach( function () {
      this.articlesName = 'articles';
    });

    context( 'given a service was registered', function () {
      beforeEach( function () {
        this.articles = {
          get: sinon.spy( () => new Promise( delaySuccess ) ),
          getOne: sinon.spy( () => new Promise( delaySuccess ) )
        };

        this.isopropyl.register( this.articlesName, this.articles );
        this.resource = this.isopropyl.resource( this.articlesName );
      });

      it( 'should return an instance of Resource', function () {
        expect( this.resource ).to.be.an.instanceof( Resource );
      });

      it( 'should be a local resource', function () {
        expect( this.resource.isLocallyDefined() ).to.be.true;
      });

      context( 'given an ID was not provided', function () {
        it( 'should be a collection', function () {
          expect( this.resource.isCollection() ).to.be.true;
        });

        it( 'should run get against the collection function provided', function () {
          this.resource.get();
          expect( this.articles.get ).to.have.been.called;
        });
      });

      context( 'given an ID was provided', function () {
        beforeEach( function () {
          this.id = 123;
          this.resource = this.isopropyl.resource( this.articlesName, this.id );
        });

        it( 'should not be a collection', function () {
          expect( this.resource.isCollection() ).to.be.false;
        });

        it( 'should run get against the singular function provided', function () {
          this.resource.get();
          expect( this.articles.getOne ).to.have.been.called;
        });
      });
    });

    context( 'given a service was not registered', function () {
      beforeEach( function () {
        this.resource = this.isopropyl.resource( this.articlesName );
      });

      it( 'should return an instance of Resource', function () {
        expect( this.resource ).to.be.an.instanceof( Resource );
      });

      it( 'should not be a local resource', function () {
        expect( this.resource.isLocallyDefined() ).to.be.false;
      });

      context( 'given an ID was not provided', function () {
        it( 'should be a collection', function () {
          expect( this.resource.isCollection() ).to.be.true;
        });

        it( 'should have the correct URI', function () {
          expect( this.resource.uri() ).to.equal( `${this.xhrPath}/${this.articlesName}` );
        });

        it( 'should run an XHR request on get', function () {
          this.resource.get();
          expect( request ).to.have.been.called;
        });
      });

      context( 'given an ID was provided', function () {
        beforeEach( function () {
          this.id = 123;
          this.resource = this.isopropyl.resource( this.articlesName, this.id );
        });

        it( 'should not be a collection', function () {
          expect( this.resource.isCollection() ).to.be.false;
        });

        it( 'should have the correct URI', function () {
          expect( this.resource.uri() ).to.equal( `${this.xhrPath}/${this.articlesName}/${this.id}` );
        });

        it( 'should run an XHR request on get', function () {
          this.resource.get();
          expect( request ).to.have.been.called;
        });
      });
    });
  });

  describe( 'middleware()', function () {
    beforeEach( function () {
      var delayResolve = function ( val ) {
        return function ( resolve, reject ) {
          setTimeout( () => resolve( val ), 1 );
        };
      };

      this.resource1Name = 'articles';
      this.method = 'get';
      this.resource1ElementHandler = sinon.spy( req => new Promise( delayResolve( req ) ) );
      this.resource1CollectionHandler = sinon.spy( req => new Promise( delayResolve( req ) ) );
      this.resource1Svc = {};
      this.resource1Svc[`${this.method}`] = this.resource1CollectionHandler;
      this.resource1Svc[`${this.method}One`] = this.resource1ElementHandler;

      this.req = {
        method: this.method,
        query: {},
        body: {}
      };
      this.res = {
        send: sinon.spy()
      };
      this.next = sinon.spy();

      // Scaffold the Isopropyl instance and get its middleware
      this.isopropyl.register( this.resource1Name, this.resource1Svc );
      this.middleware = this.isopropyl.middleware();
    });

    it( 'should return a function', function () {
      expect( this.middleware ).to.be.a.function;
    });

    context( 'given a top-level resource', function () {
      beforeEach( function () {
        this.req.path = `${this.xhrPath}/${this.resource1Name}`;
      });

      context( 'and the request is against the collection', function () {
        it( 'should call the collection handler for the appropriate method', function ( done ) {
          this.middleware( this.req, { send: ( res ) => {
            expect( res ).to.have.property( 'path', this.req.path.replace( this.xhrPath, '' ) );
            done();
          }}, this.next );

          expect( this.resource1CollectionHandler ).to.have.been.called;
          expect( this.next ).to.not.have.been.called;
        });

        it( 'should not have any params in the request', function ( done ) {
          this.middleware( this.req, { send: ( res ) => {
            expect( res ).to.have.property( 'params' ).and.be.empty;
            done();
          }}, this.next );
        });
      });

      context( 'and the request is against the element', function () {
        beforeEach( function () {
          this.id = '123';
          this.req.path += `/${this.id}`;
        });

        it( 'should call the element handler for the appropriate method', function ( done ) {
          this.middleware( this.req, { send: ( res ) => {
            expect( this.resource1ElementHandler ).to.have.been.called;
            expect( res ).to.have.property( 'path', this.req.path.replace( this.xhrPath, '' ) );
            done();
          }}, this.next );

          expect( this.next ).to.not.have.been.called;
        });

        it( 'should have a param in the request', function ( done ) {
          this.middleware( this.req, { send: ( res ) => {
            expect( res ).to.have.property( 'params' ).and.have.property( 'articles', this.id );
            done();
          }}, this.next );
        });
      });
    });
  });
});

