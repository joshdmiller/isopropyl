describe( 'Resource', function () {
  var delaySuccess = function ( resolve, reject ) { setTimeout( () => true, 1 ); };
  var request = sinon.spy( function () { return new Promise ( delaySuccess ) } );
  var runService = sinon.spy( function (fn) { fn(); return new Promise ( delaySuccess ) } );

  var Resource = proxyquire( './src/Resource.js', {
    './request': request,
    './runService': runService
  });

  var buildRequest = function ( method, resource, url, params = {}, body = {}, query = {} ) {
    return {
      contentType: 'application/json',
      type: 'json',
      resource,
      method,
      url,
      params,
      query,
      body
    };
  }

  beforeEach( function () {
    this.articles_id = 123;
    this.comments_id = 456;
    this.testBody = {
      some: 'value'
    };
    this.prefix = '/api';
    this.opts = {
      xhrPath: this.prefix
    };

    request.reset();
    runService.reset();
  });

  /**
   * SERVER-SIDE
   */
  context( 'when server-side', function () {
    beforeEach( function () {
      this.opts.fns = {
        get: sinon.spy(),
        put: sinon.spy(),
        post: sinon.spy(),
        patch: sinon.spy(),
        delete: sinon.spy(),

        getOne: sinon.spy(),
        putOne: sinon.spy(),
        postOne: sinon.spy(),
        patchOne: sinon.spy(),
        deleteOne: sinon.spy()
      };
    });

    context( 'given a single resource', function () {
      beforeEach( function () {
        this.resource = new Resource( this.opts, 'articles' );
      });

      it( 'should be locally-defined', function () {
        expect( this.resource.isLocallyDefined() ).to.be.true;
      });

      it( 'should be collection', function () {
        expect( this.resource.isCollection() ).to.be.true;
      });

      it( 'should call the get fn for .get()', function () {
        var req = buildRequest( 'get', 'articles', this.resource.uri() );
        this.resource.get();

        console.log("runService", runService.firstCall.args);

        /**
         * runService is called with the function and the request, but since the function is bound
         * first, we cannot use `calledWith`. Instead we check the request and that the right
         * function was called down the line.
         */
        expect( runService ).to.have.been.calledOnce;
        expect( runService.firstCall.args[1] ).to.eqls( req );
        expect( this.opts.fns.get ).to.have.been.calledOnce;
      });

      it( 'should call the delete fn for .delete()', function () {
        var req = buildRequest( 'delete', 'articles', this.resource.uri() );
        
        this.resource.delete();
        expect( runService ).to.have.been.calledOnce;
        expect( runService.firstCall.args[1] ).to.eqls( req );
        expect( this.opts.fns.delete ).to.have.been.calledOnce;
      });

      it( 'should call the put fn for .put()', function () {
        var req = buildRequest( 'put', 'articles', this.resource.uri(), {}, this.testBody );
        
        this.resource.put( this.testBody );
        expect( runService ).to.have.been.calledOnce;
        expect( runService.firstCall.args[1] ).to.eqls( req );
        expect( this.opts.fns.put ).to.have.been.calledOnce;
      });

      it( 'should call the patch fn for .patch()', function () {
        var req = buildRequest( 'patch', 'articles', this.resource.uri(), {}, this.testBody );
        
        this.resource.patch( this.testBody );
        expect( runService ).to.have.been.calledOnce;
        expect( runService.firstCall.args[1] ).to.eqls( req );
        expect( this.opts.fns.patch ).to.have.been.calledOnce;
      });

      it( 'should call the post fn for .post()', function () {
        var req = buildRequest( 'post', 'articles', this.resource.uri(), {}, this.testBody );
        
        this.resource.post( this.testBody );
        expect( runService ).to.have.been.calledOnce;
        expect( runService.firstCall.args[1] ).to.eqls( req );
        expect( this.opts.fns.post ).to.have.been.calledOnce;
      });
    });

    context( 'given a single resource and its ID', function () {
      beforeEach( function () {
        this.resource = new Resource( this.opts, 'articles', this.articles_id );
        this.ids = { articles: this.articles_id };
      });

      it( 'should be locally-defined', function () {
        expect( this.resource.isLocallyDefined() ).to.be.true;
      });

      it( 'should not be collection', function () {
        expect( this.resource.isCollection() ).to.be.false;
      });

      it( 'should call the get fn for .get()', function () {
        var req = buildRequest( 'get', 'articles', this.resource.uri(), this.ids );
        
        this.resource.get();
        expect( runService ).to.have.been.calledOnce;
        expect( runService.firstCall.args[1] ).to.eqls( req );
        expect( this.opts.fns.getOne ).to.have.been.calledOnce;
      });

      it( 'should call the delete fn for .delete()', function () {
        var req = buildRequest( 'delete', 'articles', this.resource.uri(), this.ids );
        
        this.resource.delete();
        expect( runService ).to.have.been.calledOnce;
        expect( runService.firstCall.args[1] ).to.eqls( req );
        expect( this.opts.fns.deleteOne ).to.have.been.calledOnce;
      });

      it( 'should call the put fn for .put()', function () {
        var req = buildRequest( 'put', 'articles', this.resource.uri(), this.ids, this.testBody );
        
        this.resource.put( this.testBody );
        expect( runService ).to.have.been.calledOnce;
        expect( runService.firstCall.args[1] ).to.eqls( req );
        expect( this.opts.fns.putOne ).to.have.been.calledOnce;
      });

      it( 'should call the patch fn for .patch()', function () {
        var req = buildRequest( 'patch', 'articles', this.resource.uri(), this.ids, this.testBody );
        
        this.resource.patch( this.testBody );
        expect( runService ).to.have.been.calledOnce;
        expect( runService.firstCall.args[1] ).to.eqls( req );
        expect( this.opts.fns.patchOne ).to.have.been.calledOnce;
      });

      it( 'should call the post fn for .post()', function () {
        var req = buildRequest( 'post', 'articles', this.resource.uri(), this.ids, this.testBody );
        
        this.resource.post( this.testBody );
        expect( runService ).to.have.been.calledOnce;
        expect( runService.firstCall.args[1] ).to.eqls( req );
        expect( this.opts.fns.postOne ).to.have.been.calledOnce;
      });
    });

    context( 'given two resources and one ID', function () {
      beforeEach( function () {
        this.resource = new Resource( this.opts, 'articles.comments', this.articles_id );
        this.ids = { articles: this.articles_id };
      });

      it( 'should be locally-defined', function () {
        expect( this.resource.isLocallyDefined() ).to.be.true;
      });

      it( 'should be collection', function () {
        expect( this.resource.isCollection() ).to.be.true;
      });

      it( 'should call the get fn for .get()', function () {
        var req = buildRequest( 'get', 'articles.comments', this.resource.uri(), this.ids );
        
        this.resource.get();
        expect( runService ).to.have.been.calledOnce;
        expect( runService.firstCall.args[1] ).to.eqls( req );
        expect( this.opts.fns.get ).to.have.been.calledOnce;
      });

      it( 'should call the delete fn for .delete()', function () {
        var req = buildRequest( 'delete', 'articles.comments', this.resource.uri(), this.ids );
        
        this.resource.delete();
        expect( runService ).to.have.been.calledOnce;
        expect( runService.firstCall.args[1] ).to.eqls( req );
        expect( this.opts.fns.delete ).to.have.been.calledOnce;
      });

      it( 'should call the put fn for .put()', function () {
        var req = buildRequest( 'put', 'articles.comments', this.resource.uri(), this.ids, this.testBody );
        
        this.resource.put( this.testBody );
        expect( runService ).to.have.been.calledOnce;
        expect( runService.firstCall.args[1] ).to.eqls( req );
        expect( this.opts.fns.put ).to.have.been.calledOnce;
      });

      it( 'should call the patch fn for .patch()', function () {
        var req = buildRequest( 'patch', 'articles.comments', this.resource.uri(), this.ids, this.testBody );
        
        this.resource.patch( this.testBody );
        expect( runService ).to.have.been.calledOnce;
        expect( runService.firstCall.args[1] ).to.eqls( req );
        expect( this.opts.fns.patch ).to.have.been.calledOnce;
      });

      it( 'should call the post fn for .post()', function () {
        var req = buildRequest( 'post', 'articles.comments', this.resource.uri(), this.ids, this.testBody );
        
        this.resource.post( this.testBody );
        expect( runService ).to.have.been.calledOnce;
        expect( runService.firstCall.args[1] ).to.eqls( req );
        expect( this.opts.fns.post ).to.have.been.calledOnce;
      });
    });

    context( 'given two resources and two IDs', function () {
      beforeEach( function () {
        this.resource = new Resource( this.opts, 'articles.comments', this.articles_id, this.comments_id );
        this.ids = { articles: this.articles_id, comments: this.comments_id };
      });

      it( 'should be locally-defined', function () {
        expect( this.resource.isLocallyDefined() ).to.be.true;
      });

      it( 'should not be collection', function () {
        expect( this.resource.isCollection() ).to.be.false;
      });

      it( 'should call the get fn for .get()', function () {
        var req = buildRequest( 'get', 'articles.comments', this.resource.uri(), this.ids );
        
        this.resource.get();
        expect( runService ).to.have.been.calledOnce;
        expect( runService.firstCall.args[1] ).to.eqls( req );
        expect( this.opts.fns.getOne ).to.have.been.calledOnce;
      });

      it( 'should call the delete fn for .delete()', function () {
        var req = buildRequest( 'delete', 'articles.comments', this.resource.uri(), this.ids );
        
        this.resource.delete();
        expect( runService ).to.have.been.calledOnce;
        expect( runService.firstCall.args[1] ).to.eqls( req );
        expect( this.opts.fns.deleteOne ).to.have.been.calledOnce;
      });

      it( 'should call the put fn for .put()', function () {
        var req = buildRequest( 'put', 'articles.comments', this.resource.uri(), this.ids, this.testBody );
        
        this.resource.put( this.testBody );
        expect( runService ).to.have.been.calledOnce;
        expect( runService.firstCall.args[1] ).to.eqls( req );
        expect( this.opts.fns.putOne ).to.have.been.calledOnce;
      });

      it( 'should call the patch fn for .patch()', function () {
        var req = buildRequest( 'patch', 'articles.comments', this.resource.uri(), this.ids, this.testBody );
        
        this.resource.patch( this.testBody );
        expect( runService ).to.have.been.calledOnce;
        expect( runService.firstCall.args[1] ).to.eqls( req );
        expect( this.opts.fns.patchOne ).to.have.been.calledOnce;
      });

      it( 'should call the post fn for .post()', function () {
        var req = buildRequest( 'post', 'articles.comments', this.resource.uri(), this.ids, this.testBody );
        
        this.resource.post( this.testBody );
        expect( runService ).to.have.been.calledOnce;
        expect( runService.firstCall.args[1] ).to.eqls( req );
        expect( this.opts.fns.postOne ).to.have.been.calledOnce;
      });
    });
  });


  /**
   * CLIENT-SIDE
   */
  context( 'when client-side', function () {
    context( 'given a single resource', function () {
      beforeEach( function () {
        this.resource = new Resource( this.opts, 'articles' );
        this.uri = `${this.prefix}/articles`;
      });

      it( 'should not be locally-defined', function () {
        expect( this.resource.isLocallyDefined() ).to.be.false;
      });

      it( 'should be collection', function () {
        expect( this.resource.isCollection() ).to.be.true;
      });

      it( 'should have the correct URI', function () {
        expect( this.resource.uri() ).to.equal( this.uri );
      });

      it( 'should run an xhr get fn for .get()', function () {
        var req = buildRequest( 'get', 'articles', this.resource.uri() );
        
        this.resource.get();
        expect( request ).to.have.been.calledOnce;
        expect( request ).to.have.been.calledWith( req );
      });

      it( 'should run an xhr delete fn for .delete()', function () {
        var req = buildRequest( 'delete', 'articles', this.resource.uri() );
        
        this.resource.delete();
        expect( request ).to.have.been.calledOnce;
        expect( request ).to.have.been.calledWith( req );
      });

      it( 'should run an xhr put fn for .put()', function () {
        var req = buildRequest( 'put', 'articles', this.resource.uri(), {}, this.testBody );
        
        this.resource.put( this.testBody );
        expect( request ).to.have.been.calledOnce;
        expect( request ).to.have.been.calledWith( req );
      });

      it( 'should run an xhr patch fn for .patch()', function () {
        var req = buildRequest( 'patch', 'articles', this.resource.uri(), {}, this.testBody );
        
        this.resource.patch( this.testBody );
        expect( request ).to.have.been.calledOnce;
        expect( request ).to.have.been.calledWith( req );
      });

      it( 'should run an xhr post fn for .post()', function () {
        var req = buildRequest( 'post', 'articles', this.resource.uri(), {}, this.testBody );
        
        this.resource.post( this.testBody );
        expect( request ).to.have.been.calledOnce;
        expect( request ).to.have.been.calledWith( req );
      });
    });

    context( 'given a single resource and its ID', function () {
      beforeEach( function () {
        this.resource = new Resource( this.opts, 'articles', this.articles_id );
        this.uri = `${this.prefix}/articles/${this.articles_id}`;
        this.ids = { articles: this.articles_id };
      });

      it( 'should not be locally-defined', function () {
        expect( this.resource.isLocallyDefined() ).to.be.false;
      });

      it( 'should not be collection', function () {
        expect( this.resource.isCollection() ).to.be.false;
      });

      it( 'should have the correct URI', function () {
        expect( this.resource.uri() ).to.equal( this.uri );
      });

      it( 'should run an xhr get fn for .get()', function () {
        var req = buildRequest( 'get', 'articles', this.resource.uri(), this.ids );
        
        this.resource.get();
        expect( request ).to.have.been.calledOnce;
        expect( request ).to.have.been.calledWith( req );
      });

      it( 'should run an xhr delete fn for .delete()', function () {
        var req = buildRequest( 'delete', 'articles', this.resource.uri(), this.ids );
        
        this.resource.delete();
        expect( request ).to.have.been.calledOnce;
        expect( request ).to.have.been.calledWith( req );
      });

      it( 'should run an xhr put fn for .put()', function () {
        var req = buildRequest( 'put', 'articles', this.resource.uri(), this.ids, this.testBody );
        
        this.resource.put( this.testBody );
        expect( request ).to.have.been.calledOnce;
        expect( request ).to.have.been.calledWith( req );
      });

      it( 'should run an xhr patch fn for .patch()', function () {
        var req = buildRequest( 'patch', 'articles', this.resource.uri(), this.ids, this.testBody );
        
        this.resource.patch( this.testBody );
        expect( request ).to.have.been.calledOnce;
        expect( request ).to.have.been.calledWith( req );
      });

      it( 'should run an xhr post fn for .post()', function () {
        var req = buildRequest( 'post', 'articles', this.resource.uri(), this.ids, this.testBody );
        
        this.resource.post( this.testBody );
        expect( request ).to.have.been.calledOnce;
        expect( request ).to.have.been.calledWith( req );
      });
    });

    context( 'given two resources and one ID', function () {
      beforeEach( function () {
        this.resource = new Resource( this.opts, 'articles.comments', this.articles_id );
        this.uri = `${this.prefix}/articles/${this.articles_id}/comments`;
        this.ids = { articles: this.articles_id };
      });

      it( 'should not be locally-defined', function () {
        expect( this.resource.isLocallyDefined() ).to.be.false;
      });

      it( 'should be collection', function () {
        expect( this.resource.isCollection() ).to.be.true;
      });

      it( 'should have the correct URI', function () {
        expect( this.resource.uri() ).to.equal( this.uri );
      });

      it( 'should run an xhr get fn for .get()', function () {
        var req = buildRequest( 'get', 'articles.comments', this.resource.uri(), this.ids );
        
        this.resource.get();
        expect( request ).to.have.been.calledOnce;
        expect( request ).to.have.been.calledWith( req );
      });

      it( 'should run an xhr delete fn for .delete()', function () {
        var req = buildRequest( 'delete', 'articles.comments', this.resource.uri(), this.ids );
        
        this.resource.delete();
        expect( request ).to.have.been.calledOnce;
        expect( request ).to.have.been.calledWith( req );
      });

      it( 'should run an xhr put fn for .put()', function () {
        var req = buildRequest( 'put', 'articles.comments', this.resource.uri(), this.ids, this.testBody );
        
        this.resource.put( this.testBody );
        expect( request ).to.have.been.calledOnce;
        expect( request ).to.have.been.calledWith( req );
      });

      it( 'should run an xhr patch fn for .patch()', function () {
        var req = buildRequest( 'patch', 'articles.comments', this.resource.uri(), this.ids, this.testBody );
        
        this.resource.patch( this.testBody );
        expect( request ).to.have.been.calledOnce;
        expect( request ).to.have.been.calledWith( req );
      });

      it( 'should run an xhr post fn for .post()', function () {
        var req = buildRequest( 'post', 'articles.comments', this.resource.uri(), this.ids, this.testBody );
        
        this.resource.post( this.testBody );
        expect( request ).to.have.been.calledOnce;
        expect( request ).to.have.been.calledWith( req );
      });
    });

    context( 'given two resources and two IDs', function () {
      beforeEach( function () {
        this.resource = new Resource( this.opts, 'articles.comments', this.articles_id, this.comments_id );
        this.uri = `${this.prefix}/articles/${this.articles_id}/comments/${this.comments_id}`;
        this.ids = { articles: this.articles_id, comments: this.comments_id };
      });

      it( 'should not be locally-defined', function () {
        expect( this.resource.isLocallyDefined() ).to.be.false;
      });

      it( 'should not be collection', function () {
        expect( this.resource.isCollection() ).to.be.false;
      });

      it( 'should have the correct URI', function () {
        expect( this.resource.uri() ).to.equal( this.uri );
      });

      it( 'should run an xhr get fn for .get()', function () {
        var req = buildRequest( 'get', 'articles.comments', this.resource.uri(), this.ids );
        
        this.resource.get();
        expect( request ).to.have.been.calledOnce;
        expect( request ).to.have.been.calledWith( req );
      });

      it( 'should run an xhr delete fn for .delete()', function () {
        var req = buildRequest( 'delete', 'articles.comments', this.resource.uri(), this.ids );
        
        this.resource.delete();
        expect( request ).to.have.been.calledOnce;
        expect( request ).to.have.been.calledWith( req );
      });

      it( 'should run an xhr put fn for .put()', function () {
        var req = buildRequest( 'put', 'articles.comments', this.resource.uri(), this.ids, this.testBody );
        
        this.resource.put( this.testBody );
        expect( request ).to.have.been.calledOnce;
        expect( request ).to.have.been.calledWith( req );
      });

      it( 'should run an xhr patch fn for .patch()', function () {
        var req = buildRequest( 'patch', 'articles.comments', this.resource.uri(), this.ids, this.testBody );
        
        this.resource.patch( this.testBody );
        expect( request ).to.have.been.calledOnce;
        expect( request ).to.have.been.calledWith( req );
      });

      it( 'should run an xhr post fn for .post()', function () {
        var req = buildRequest( 'post', 'articles.comments', this.resource.uri(), this.ids, this.testBody );
        
        this.resource.post( this.testBody );
        expect( request ).to.have.been.calledOnce;
        expect( request ).to.have.been.calledWith( req );
      });
    });
  });


  /**
   * ERROR CASES
   */
  context( 'given no name was provided', function () {
    it( 'should throw an error', function () {
      var fn = () => new Resource( {} );
      expect( fn ).to.throw( /resource name/ );
    });
  });

  context( 'given two resources and three IDs', function () {
    beforeEach( function () {
      this.articles_id = 123;
      this.comments_id = 456;
    });

    it( 'should throw an error', function () {
      var fn = () => new Resource( {}, 'articles.comments', this.articles_id, this.comments_id, 789 );
      expect( fn ).to.throw( /many IDs/ );
    });
  });

  context( 'given two resources and no IDs', function () {
    it( 'should throw an error', function () {
      var fn = () => new Resource( {}, 'articles.comments' );
      expect( fn ).to.throw( /few IDs/ );
    });
  });
});

