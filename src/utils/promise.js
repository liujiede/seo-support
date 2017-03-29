function Promise(fn) {
    var _this = this;
    this.thenList = [];
    this.hasResolve = false;
    this.resolveResult;
    this.catchList = [];
    this.hasReject = false;
    this.rejectMessage;
    fn && fn(function (data) {
        _this.resolve(data);
    }, function (ex) {
        _this.reject(ex);
    });
}

Promise.prototype.then = function (fn, onFail) {
    if (this.hasResolve) {
        var ret = fn(this.resolveResult);
        this.resolveResult = ret !== undefined ? ret : this.resolveResult;
    } else {
        this.thenList.push(fn);
    }
    onFail && this.catch(onFail);
    return this;
};
Promise.prototype.catch = function (fn) {
    if (this.hasReject) {
        fn(this.rejectMessage);
    } else {
        this.catchList.push(fn);
    }
    return this;
};
Promise.prototype.resolve = function (data) {
    this.resolveResult = data;
    this.thenList.forEach(function (fn) {
        var ret = fn(data);
        this.resolveResult = ret !== undefined ? ret : this.resolveResult;
    }.bind(this));
    this.thenList = [];
    this.hasResolve = true;
};
Promise.prototype.reject = function (ex) {
    this.catchList.forEach(function (fn) {
        fn(ex);
    });
    this.catchList = [];
    this.rejectMessage = ex;
    this.hasReject = true;
};
Promise.prototype.spread = function (fn, onRej) {
    return this.then((...args) => fn(...args), onRej);
}
Promise.resolve = function (data) {
    return new Promise(function (resolve) {
        resolve(data)
    });
};
Promise.reject = function (ex) {
    var promise = new Promise();
    promise.reject(ex);
    return promise;
};
Promise.all = function (promises) {
    return new this(function (resolve, reject) {
        var results = [];
        var remaining = 0;
        var resolver = function (index) {
            remaining += 1;
            return function (value) {
                results[index] = value;
                --remaining || resolve(results)
            };
        }
        for (var i = 0, promise; i < promises.length; i++) {
            promise = promises[i];
            if (promise && typeof promise.then === 'function')
                promise.then(resolver(i), reject);
            else
                results[i] = promise;
        }
        remaining || resolve(results);
    });
};
Promise.race = function (promises) {
    return new Promise(function (resolve, reject) {
        promises.forEach(function (obj) {
            obj.then(data => {
                resolve(data);
                return data;
            }, reason => {
                reject(reason);
                return reason;
            });
        });
    })
}
Promise.defer = Promise.deferred = function () {
    var dfd = {}
    dfd.promise = new Promise(function (resolve, reject) {
        dfd.resolve = resolve
        dfd.reject = reject
    })
    return dfd
}
Promise.done = () => new Promise(() => { });

module.exports = Promise;
