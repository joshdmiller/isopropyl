describe( 'Router', function () {
  var Router;
  var runService = sinon.spy( function ( fn, req ) { return fn( req ); } );

  before( function () {
    Router = proxyquire( './src/Router', {
      './runService': runService
    });
  });

  beforeEach( function () {
    runService.reset();
    this.router = new Router();
    this.delayResolve = function ( val ) {
      return function ( resolve, reject ) {
        setTimeout( () => resolve( val ), 1 );
      };
    };
  });

  describe( 'add()', function () {
    it( 'should store the route', function () {
      this.router.add( 'test.subtest', {} );
      expect( this.router._rules ).to.have.lengthOf( 1 );
    });

    it( 'should add two params per resource', function () {
      this.router.add( 'test', {} );
      this.router.add( 'test.subtest', {} );

      expect( this.router._rules[0] ).to.have.property( 'parts' ).with.lengthOf( 2 );
      expect( this.router._rules[1] ).to.have.property( 'parts' ).with.lengthOf( 4 );
    });
  });

  describe( 'run()', function () {
    beforeEach( function () {
      this.req = {
        method: 'get'
      };

      this.r1RsrcName = 'articles';
      this.r1Name = `${this.r1RsrcName}`;
      this.r1Id = '123';
      this.r1Svc = {
        get: sinon.spy( req => new Promise( delayResolve( req ) ) ),
        getOne: sinon.spy( req => new Promise( delayResolve( req ) ) )
      };

      this.r2RsrcName = 'comments';
      this.r2Name = `${this.r1RsrcName}.${this.r2RsrcName}`;
      this.r2Id = '456';
      this.r2Svc = {
        get: sinon.spy( req => new Promise( delayResolve( req ) ) ),
        getOne: sinon.spy( req => new Promise( delayResolve( req ) ) )
      };

      this.r3RsrcName = 'upvotes';
      this.r3Name = `${this.r1RsrcName}.${this.r2RsrcName}.${this.r3RsrcName}`;
      this.r3Id = '789';
      this.r3Svc = {
        get: sinon.spy( req => new Promise( delayResolve( req ) ) ),
        getOne: sinon.spy( req => new Promise( delayResolve( req ) ) )
      };

      this.router.add( this.r1Name, this.r1Svc );
      this.router.add( this.r2Name, this.r2Svc );
      this.router.add( this.r3Name, this.r3Svc );
    });

    context( 'when a top-level resource is requested', function () {
      beforeEach( function () {
        this.req.path = `/${this.r1RsrcName}`;
      });

      context( 'and no ID is provided', function () {
        it( 'should call the collection handler', function () {
          expect( this.router.run( this.req ) ).to.eventually.have.property( 'path', this.req.path );
          expect( this.r1Svc.get ).to.have.been.called;
        });
      });

      context( 'and an ID is provided', function () {
        beforeEach( function () {
          this.req.path += `/${this.r1Id}`;
        });

        it( 'should call the element handler', function () {
          expect( this.router.run( this.req ) ).to.eventually.have.property( 'path', this.req.path );
          expect( this.r1Svc.getOne ).to.have.been.called;
        });

        it( 'should pass the ID to the handler', function () {
          expect( this.router.run( this.req ) ).to.eventually.have.property( 'params' )
            .with.property( this.r1Name, this.r1Id );
        });
      });
    });

    context( 'when a nested resource is requested', function () {
      beforeEach( function () {
        this.req.path = `/${this.r1RsrcName}/${this.r1Id}/${this.r2RsrcName}/${this.r2Id}/${this.r3RsrcName}`;
      });

      context( 'and no final ID is provided', function () {
        it( 'should call the collection handler', function () {
          expect( this.router.run( this.req ) ).to.eventually.have.property( 'path', this.req.path );
          expect( this.r3Svc.get ).to.have.been.called;
        });

        it( 'should pass the IDs to the handler', function () {
          expect( this.router.run( this.req ) ).to.eventually.have.property( 'params' )
            .with.property( this.r1Name, this.r1Id );
        });
      });

      context( 'and an ID is provided', function () {
        beforeEach( function () {
          this.req.path += `/${this.r3Id}`;
        });

        it( 'should call the element handler', function () {
          expect( this.router.run( this.req ) ).to.eventually.have.property( 'path', this.req.path );
          expect( this.r3Svc.getOne ).to.have.been.called;
        });

        it( 'should pass the IDs to the handler', function () {
          expect( this.router.run( this.req ) ).to.eventually.have.property( 'params' )
            .with.property( this.r3Name, this.r3Id );
        });
      });
    });
  });
});

