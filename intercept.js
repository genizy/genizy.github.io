(function(global) {
  function interceptFetch(filterFn, transformFn) {
    if (typeof filterFn !== 'function' || typeof transformFn !== 'function') {
      throw new Error('interceptFetch requires two function arguments: filterFn and transformFn');
    }

    const originalFetch = global.fetch;
    if (!originalFetch) return;

    global.fetch = function(input, init) {
      let url;

      if (typeof input === 'string') {
        url = input;
      } else if (input instanceof Request) {
        url = input.url;
      } else {
        return originalFetch.apply(this, arguments);
      }

      if (filterFn(url)) {
        const newUrl = transformFn(url);

        if (typeof input === 'string') {
          input = newUrl;
        } else if (input instanceof Request) {
          input = new Request(newUrl, input);
        }
      }

      return originalFetch.call(this, input, init);
    };
  }

  function interceptXHR(filterFn, transformFn) {
    if (typeof filterFn !== 'function' || typeof transformFn !== 'function') {
      throw new Error('interceptXHR requires two function arguments: filterFn and transformFn');
    }

    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
      if (filterFn(url)) {
        url = transformFn(url);
      }
      return originalOpen.call(this, method, url, async, user, password);
    };
  }

  function interceptAll(filterFn, transformFn) {
    interceptFetch(filterFn, transformFn);
    interceptXHR(filterFn, transformFn);
  }

  global.interceptFetch = interceptFetch;
  global.interceptXHR = interceptXHR;
  global.interceptAll = interceptAll;

})(typeof window !== 'undefined' ? window : globalThis);
