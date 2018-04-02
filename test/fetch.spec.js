// This is a suite that tests different parts of the fetch api. It
// must be EcmaScript 5 since it will run on old browsers. Every spec
// here will also run on the following two test environments:
// * test/browser/
// * test/node/
function addSuite(envName) {

  // Helper function
  var responseToText = function (res) {
    if (res.status >= 400) {
      throw new Error('Bad server response');
    }

    return res.text();
  };

  describe(envName, function () {
    describe('fetch', function () {
      it('should be defined', function () {
        expect(fetch).to.be.a('function');
      });

      // Ensure that we're testing the polyfill version rather the native one
      it('should be a polyfill', function () {
        expect(fetch.polyfill).to.be.true;
      });

      it('should facilitate the making of requests', function () {
        return fetch('//lquixa.da/succeed.txt')
          .then(responseToText)
          .then(function (data) {
            expect(data).to.equal('hello world.');
          });
      });

      it('should do the right thing with bad requests', function () {
        return fetch('//lquixa.da/fail.txt')
          .then(responseToText)
          .catch(function (err) {
            expect(err.toString()).to.equal('Error: Bad server response');
          });
      });
    });

    describe('Request', function () {
      it('should be defined', function () {
        expect(Request).to.be.a('function');
      });

      it('should define GET as default method', function () {
        var request = new Request('//lquixa.da/');
        expect(request.method).to.equal('GET');
      });

      it('construct with string url', function() {
        var request = new Request('https://fetch.spec.whatwg.org/');
        expect(request.url).to.equal('https://fetch.spec.whatwg.org/');
      });

      // featureDependent(test, support.url, 'construct with URL instance', function() {
      //   var url = new URL('https://fetch.spec.whatwg.org/');
      //   url.pathname = 'cors';
      //   var request = new Request(url);
      //   expect(request.url, 'https://fetch.spec.whatwg.org/cors');
      // });

      it('construct with non-Request object', function() {
        var url = { toString: function() { return 'https://fetch.spec.whatwg.org/'; } };
        var request = new Request(url);
        expect(request.url).to.equal('https://fetch.spec.whatwg.org/');
      });

      it.skip('construct with Request', function() {
        var request1 = new Request('https://fetch.spec.whatwg.org/', {
          method: 'post',
          body: 'I work out',
          headers: {
            accept: 'application/json',
            'Content-Type': 'text/plain'
          }
        });
        var request2 = new Request(request1);

        return request2.text().then(function(body2) {
          expect(body2).to.equal('I work out');
          expect(request2.method).to.equal('POST');
          expect(request2.url).to.equal('https://fetch.spec.whatwg.org/');
          expect(request2.headers.get('accept')).to.equal('application/json');
          expect(request2.headers.get('content-type')).to.equal('text/plain');

          return request1.text().then(function() {
            expect(false, 'original request body should have been consumed').to.be.true;
          }, function(error) {
            expect(error instanceof TypeError, 'expected TypeError for already read body').to.be.true;
          });
        });
      });

      it('construct with Request and override headers', function() {
        var request1 = new Request('https://fetch.spec.whatwg.org/', {
          method: 'post',
          body: 'I work out',
          headers: {
            accept: 'application/json',
            'X-Request-ID': '123'
          }
        });
        var request2 = new Request(request1, {
          headers: { 'x-test': '42' }
        });

        expect(request2.headers.get('accept')).to.be.null;
        expect(request2.headers.get('x-request-id')).to.be.null;
        expect(request2.headers.get('x-test')).to.equal('42');
      });

      it('construct with Request and override body', function() {
        var request1 = new Request('https://fetch.spec.whatwg.org/', {
          method: 'post',
          body: 'I work out',
          headers: {
            'Content-Type': 'text/plain'
          }
        });
        var request2 = new Request(request1, {
          body: '{"wiggles": 5}',
          headers: { 'Content-Type': 'application/json' }
        });

        return request2.json().then(function(data) {
          expect(data.wiggles).to.equal(5);
          expect(request2.headers.get('content-type')).to.equal('application/json');
        });
      });

      // featureDependent(test, !nativeChrome, 'construct with used Request body', function() {
      //   var request1 = new Request('https://fetch.spec.whatwg.org/', {
      //     method: 'post',
      //     body: 'I work out'
      //   });

      //   return request1.text().then(function() {
      //     assert.throws(function() {
      //       new Request(request1);
      //     }, TypeError);
      //   });
      // });

      it('GET should not have implicit Content-Type', function() {
        var req = new Request('https://fetch.spec.whatwg.org/');
        expect(req.headers.get('content-type')).to.be.null;
      });

      it('POST with blank body should not have implicit Content-Type', function() {
        var req = new Request('https://fetch.spec.whatwg.org/', {
          method: 'post'
        });
        expect(req.headers.get('content-type')).to.be.null;
      });

      it('construct with string body sets Content-Type header', function() {
        var req = new Request('https://fetch.spec.whatwg.org/', {
          method: 'post',
          body: 'I work out'
        });

        expect(req.headers.get('content-type')).to.equal('text/plain;charset=UTF-8');
      });

      // featureDependent(test, support.blob, 'construct with Blob body and type sets Content-Type header', function() {
      //   var req = new Request('https://fetch.spec.whatwg.org/', {
      //     method: 'post',
      //     body: new Blob(['test'], { type: 'image/png' })
      //   });

      //   expect(req.headers.get('content-type'), 'image/png');
      // });

      it('construct with body and explicit header uses header', function() {
        var req = new Request('https://fetch.spec.whatwg.org/', {
          method: 'post',
          headers: { 'Content-Type': 'image/png' },
          body: 'I work out'
        });

        expect(req.headers.get('content-type')).to.equal('image/png');
      });

      // featureDependent(test, support.blob, 'construct with Blob body and explicit Content-Type header', function() {
      //   var req = new Request('https://fetch.spec.whatwg.org/', {
      //     method: 'post',
      //     headers: { 'Content-Type': 'image/png' },
      //     body: new Blob(['test'], { type: 'text/plain' })
      //   });

      //   expect(req.headers.get('content-type'), 'image/png');
      // });

      // featureDependent(test, support.searchParams, 'construct with URLSearchParams body sets Content-Type header', function() {
      //   var req = new Request('https://fetch.spec.whatwg.org/', {
      //     method: 'post',
      //     body: new URLSearchParams('a=1&b=2')
      //   });

      //   expect(req.headers.get('content-type'), 'application/x-www-form-urlencoded;charset=UTF-8');
      // });

      // featureDependent(test, support.searchParams, 'construct with URLSearchParams body and explicit Content-Type header', function() {
      //   var req = new Request('https://fetch.spec.whatwg.org/', {
      //     method: 'post',
      //     headers: { 'Content-Type': 'image/png' },
      //     body: new URLSearchParams('a=1&b=2')
      //   });

      //   expect(req.headers.get('content-type'), 'image/png');
      // });

      it('clone GET request', function() {
        var req = new Request('https://fetch.spec.whatwg.org/', {
          headers: {'content-type': 'text/plain'}
        });
        var clone = req.clone();

        expect(clone.url).to.equal(req.url);
        expect(clone.method).to.equal('GET');
        expect(clone.headers.get('content-type')).to.equal('text/plain');
        expect(clone.headers).to.not.equal(req.headers);
        expect(req.bodyUsed).to.be.false;
      });

      it('clone POST request', function() {
        var req = new Request('https://fetch.spec.whatwg.org/', {
          method: 'post',
          headers: {'content-type': 'text/plain'},
          body: 'I work out'
        });
        var clone = req.clone();

        expect(clone.method).to.equal('POST');
        expect(clone.headers.get('content-type')).to.equal('text/plain');
        expect(clone.headers).to.not.equal(req.headers);
        expect(req.bodyUsed).to.equal(false);

        return Promise.all([clone.text(), req.clone().text()]).then(function(bodies) {
          expect(bodies).to.deep.equal(['I work out', 'I work out']);
        });
      });

      // featureDependent(test, !nativeChrome, 'clone with used Request body', function() {
      //   var req = new Request('https://fetch.spec.whatwg.org/', {
      //     method: 'post',
      //     body: 'I work out'
      //   });

      //   return req.text().then(function() {
      //     assert.throws(function() {
      //       req.clone();
      //     }, TypeError);
      //   });
      // });

      // testBodyExtract(function(body) {
      //   return new Request('', { method: 'POST', body: body });
      // });
    });

    describe('Response', function () {
      it('should be defined', function () {
        expect(Response).to.be.a('function');
      });

      it('should be ok :)', function () {
        var response = new Response();
        expect(response.ok).to.be.ok;
      });

      it('default status is 200 OK', function() {
        var res = new Response();
        expect(res.status).to.equal(200);
        expect(res.statusText).to.equal('OK');
        expect(res.ok).to.be.true;
      });

      it('default status is 200 OK when an explicit undefined status code is passed', function() {
        var res = new Response('', {status: undefined});
        expect(res.status).to.equal(200);
        expect(res.statusText).to.equal('OK');
        expect(res.ok).to.be.true;
      });

      // testBodyExtract(function(body) {
      //   return new Response(body)
      // })

      it('creates Headers object from raw headers', function() {
        var r = new Response('{"foo":"bar"}', {headers: {'content-type': 'application/json'}});
        expect(r.headers instanceof Headers, true);
        return r.json().then(function(json){
          expect(json.foo).to.equal('bar');
          return json;
        });
      });

      it('always creates a new Headers instance', function() {
        var headers = new Headers({ 'x-hello': 'world' });
        var res = new Response('', {headers: headers});

        expect(res.headers.get('x-hello'), 'world');
        expect(res.headers).to.not.equal(headers);
      });

      it('clone text response', function() {
        var res = new Response('{"foo":"bar"}', {
          headers: {'content-type': 'application/json'}
        });
        var clone = res.clone();

        expect(clone.headers, 'headers were cloned').to.not.equal(res.headers);
        expect(clone.headers.get('content-type'), 'application/json');

        return Promise.all([clone.json(), res.json()]).then(function(jsons){
          expect(jsons[0], 'json of cloned object is the same as original').to.deep.equal(jsons[1]);
        });
      });

      // featureDependent(test, support.blob, 'clone blob response', function() {
      //   var req = new Request(new Blob(['test']))
      //   req.clone()
      //   expect(req.bodyUsed, false)
      // })

      // TODO: normalize it!
      it.skip('error creates error Response', function() {
        var r = Response.error();
        expect(r instanceof Response).to.be.true;
        expect(r.status).to.equal(0);
        expect(r.statusText).to.equal('');
        expect(r.type).to.equal('error');
      });

      // TODO: normalize it!
      it.skip('redirect creates redirect Response', function() {
        var r = Response.redirect('https://fetch.spec.whatwg.org/', 301);
        expect(r instanceof Response);
        expect(r.status, 301);
        expect(r.headers.get('Location'), 'https://fetch.spec.whatwg.org/');
      });

      // TODO: normalize it!
      it.skip('construct with string body sets Content-Type header', function() {
        var r = new Response('I work out');
        expect(r.headers.get('content-type')).to.equal('text/plain;charset=UTF-8');
      });

      // featureDependent(test, support.blob, 'construct with Blob body and type sets Content-Type header', function() {
      //   var r = new Response(new Blob(['test'], { type: 'text/plain' }))
      //   expect(r.headers.get('content-type'), 'text/plain')
      // })

      it('construct with body and explicit header uses header', function() {
        var r = new Response('I work out', {
          headers: {
            'Content-Type': 'text/plain'
          },
        });

        expect(r.headers.get('content-type')).to.equal('text/plain');
      });
    });

    describe('Headers', function () {
      it('should be defined', function () {
        expect(Headers).to.be.a('function');
      });

      it('should set a header', function () {
        var headers = new Headers({'Custom': 'foo'});
        expect(headers.get('Custom')).to.equal('foo');
      });

      it('should set a multi-value header', function () {
        var headers = new Headers({'Custom': ['header1', 'header2']});
        expect(headers.get('Custom')).to.equal('header1,header2');
      });

      it('should set a undefined header', function () {
        var headers = new Headers({'Custom': null});
        expect(headers.get('Custom')).to.equal('null');
      });

      it('should set a null header', function () {
        var headers = new Headers({'Custom': undefined});
        expect(headers.get('Custom')).to.equal('undefined');
      });

      it('should not init an invalid header', function () {
        expect(function () { new Headers({ 'Héy': 'ok' }); }).to.throw();
      });

      it('should not set an invalid header', function () {
        var headers = new Headers();
        expect(function () { headers.set('Héy', 'ok'); }).to.throw();
      });

      it('should not get an invalid header', function () {
        var headers = new Headers();
        expect(function () { headers.get('Héy'); }).to.throw();
      });

      // TODO: normalize it!
      it.skip('constructor copies headers', function() {
        var original = new Headers();
        original.append('Accept', 'application/json');
        original.append('Accept', 'text/plain');
        original.append('Content-Type', 'text/html');

        var headers = new Headers(original);
        expect(headers.get('Accept')).to.equal('application/json, text/plain');
        expect(headers.get('Content-type')).to.equal('text/html');
      });

      it('constructor works with arrays', function() {
        var array = [
          ['Content-Type', 'text/xml'],
          ['Breaking-Bad', '<3']
        ];
        var headers = new Headers(array);

        expect(headers.get('Content-Type')).to.equal('text/xml');
        expect(headers.get('Breaking-Bad')).to.equal('<3');
      });

      it('headers are case insensitive', function() {
        var headers = new Headers({'Accept': 'application/json'});
        expect(headers.get('ACCEPT')).to.equal('application/json');
        expect(headers.get('Accept')).to.equal('application/json');
        expect(headers.get('accept')).to.equal('application/json');
      });

      it('appends to existing', function() {
        var headers = new Headers({'Accept': 'application/json'});
        expect(headers.has('Content-Type')).to.be.false;
        headers.append('Content-Type', 'application/json');
        expect(headers.has('Content-Type')).to.be.true;
        expect(headers.get('Content-Type'), 'application/json');
      });

      it.skip('appends values to existing header name', function() {
        var headers = new Headers({'Accept': 'application/json'});
        headers.append('Accept', 'text/plain');
        expect(headers.get('Accept')).to.equal('application/json,text/plain');
      });

      it('sets header name and value', function() {
        var headers = new Headers();
        headers.set('Content-Type', 'application/json');
        expect(headers.get('Content-Type')).to.equal('application/json');
      });

      it('returns null on no header found', function() {
        var headers = new Headers();
        expect(headers.get('Content-Type')).to.be.null;
      });

      it('has headers that are set', function() {
        var headers = new Headers();
        headers.set('Content-Type', 'application/json');
        expect(headers.has('Content-Type')).to.be.true;
      });

      it('deletes headers', function() {
        var headers = new Headers();
        headers.set('Content-Type', 'application/json');
        expect(headers.has('Content-Type')).to.be.true;
        headers.delete('Content-Type');
        expect(headers.has('Content-Type')).to.be.false;
        expect(headers.get('Content-Type')).to.be.null;
      });

      it('converts field name to string on set and get', function() {
        var headers = new Headers();
        headers.set(1, 'application/json');
        expect(headers.has('1')).to.be.true;
        expect(headers.get(1), 'application/json');
      });

      it('converts field value to string on set and get', function() {
        var headers = new Headers();
        headers.set('Content-Type', 1);
        headers.set('X-CSRF-Token', undefined);
        expect(headers.get('Content-Type')).to.equal('1');
        expect(headers.get('X-CSRF-Token')).to.equal('undefined');
      });

      it('throws TypeError on invalid character in field name', function() {
        expect(function() { new Headers({'<Accept>': 'application/json'}); }).to.throw( TypeError);
        expect(function() { new Headers({'Accept:': 'application/json'}); }).to.throw( TypeError);
        expect(function() {
          var headers = new Headers();
          headers.set({field: 'value'}, 'application/json');
        }).to.throw(TypeError);
      });

      it.skip('is iterable with forEach', function() {
        var headers = new Headers();
        headers.append('Accept', 'application/json');
        headers.append('Accept', 'text/plain');
        headers.append('Content-Type', 'text/html');

        var results = [];
        headers.forEach(function(value, key, object) {
          results.push({value: value, key: key, object: object});
        });

        expect(results.length).to.equal(2);
        expect({key: 'accept', value: 'application/json,text/plain', object: headers}).to.equal(results[0]);
        expect({key: 'content-type', value: 'text/html', object: headers}).to.equal(results[1]);
      });

      it.skip('forEach accepts second thisArg argument', function() {
        var headers = new Headers({'Accept': 'application/json'});
        var thisArg = 42;
        headers.forEach(function() {
          expect(this).to.equal(thisArg);
        }, thisArg);
      });

      it('is iterable with keys', function() {
        var headers = new Headers();
        headers.append('Accept', 'application/json');
        headers.append('Accept', 'text/plain');
        headers.append('Content-Type', 'text/html');

        var iterator = headers.keys();
        expect({done: false, value: 'accept'}).to.deep.equal(iterator.next());
        expect({done: false, value: 'content-type'}).to.deep.equal(iterator.next());
        expect({done: true, value: undefined}).to.deep.equal(iterator.next());
      });

      it.skip('is iterable with values', function() {
        var headers = new Headers();
        headers.append('Accept', 'application/json');
        headers.append('Accept', 'text/plain');
        headers.append('Content-Type', 'text/html');

        var iterator = headers.values();
        expect({done: false, value: 'application/json,text/plain'}).to.deep.equal(iterator.next());
        expect({done: false, value: 'text/html'}).to.deep.equal(iterator.next());
        expect({done: true, value: undefined}).to.deep.equal(iterator.next());
      });

      it.skip('is iterable with entries', function() {
        var headers = new Headers();
        headers.append('Accept', 'application/json');
        headers.append('Accept', 'text/plain');
        headers.append('Content-Type', 'text/html');

        var iterator = headers.entries();
        expect({done: false, value: ['accept', 'application/json,text/plain']}).to.deep.equal(iterator.next());
        expect({done: false, value: ['content-type', 'text/html']}).to.deep.equal(iterator.next());
        expect({done: true, value: undefined}).to.deep.equal(iterator.next());
      });
    });
  });
}

// Since this test suite needs to run on different environments,
// we used a simplified UMD pattern here.
if (typeof module === 'object' && module.exports) {
    module.exports = addSuite;
}
