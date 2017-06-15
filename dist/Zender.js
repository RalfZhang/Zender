; (function () {
    var Register = function () {
        this.routes = []
    }
    Register.prototype = {
        regist: function (obj, k, fn) {
            var _i = this.routes.find(function (el) {
                if ((el.key === k || el.key.toString() === k.toString())
                    && Object.is(el.obj, obj)) {
                    return el
                }
            })
            if (_i) {
                _i.fn.push(fn)
            } else {
                this.routes.push({
                    obj: obj,
                    key: k,
                    fn: [fn]
                })
            }
        },

        build: function () {
            this.routes.forEach((route) => {
                observer(route.obj, route.key, route.fn)
            })
        }
    }


    window.Zender = function (el, data, elist) {
        this._data = data
        this.$register = new Register()
        this.$el = document.querySelector(el)
        this.$elist = elist
        this.$frag = this.node2Fragment(this.$el)
        this.scan(this.$frag)
        this.$el.appendChild(this.$frag)
        this.$register.build()
    }
    Zender.prototype =
        {
            node2Fragment: function (el) {
                var fragment = document.createDocumentFragment()
                var child = el.firstChild
                while (child) {
                    fragment.appendChild(child)
                    child = el.firstChild
                }
                return fragment
            },

            scan: function (node) {
                if (node === this.$frag || !node.getAttribute('zen-list')) {
                    for (var i = 0; i < node.children.length; i++) {
                        var _thisNode = node.children[i]
                        if (node.path) {
                            _thisNode.path = node.path
                        }
                        this.parseEvent(_thisNode)
                        this.parseClass(_thisNode)
                        this.parseModel(_thisNode)
                        if (_thisNode.children.length) {
                            this.scan(_thisNode)
                        }
                    }
                } else {
                    this.parseList(node)
                }
            },

            parseData: function (str, node) {
                var _list = str.split(':')
                var _data,
                    _path,
                    _j = 1
                var p = []
                _list.forEach((key, index) => {
                    if (index === 0) {
                        _data = this._data[key]
                        p.push(key)
                    } else {
                        if (node.path) {
                            _path = node.path[_j++]
                            if (_path === key) {
                                _data = _data[key]
                            } else {
                                p.push(_path)
                                _data = _data[_path][key]
                                _j++
                            }
                        } else {
                            _data = _data[key]
                        }
                        p.push(key)
                    }
                })
                if (node.path && node.path.length > p.length) {
                    var _i = node.path[node.path.length - 1]
                    if (typeof _i !== 'number') {
                        return
                    }
                    _data = _data[_i]
                    p.push(_i)
                }
                if (!node.path || node.path !== p) {
                    node.path = p
                }
                return {
                    path: p,
                    data: _data
                }
            },

            parseEvent: function (node) {
                if (node.getAttribute('zen-event')) {
                    var eventName = node.getAttribute('zen-event')
                    var _type = this.$elist[eventName].type
                    var _fn = this.$elist[eventName].fn.bind(node)
                    if (_type === 'input') {
                        var cmp = false
                        node.addEventListener('compositionstart', function () {
                            cmp = true
                        })
                        node.addEventListener('compositionend', function () {
                            cmp = false
                            node.dispatchEvent(new Event('input'))
                        })
                        node.addEventListener('input', function () {
                            if (!cmp) {
                                var start = this.selectionStart
                                var end = this.selectionEnd
                                _fn()
                                this.setSelectionRange(start, end)
                            }
                        })
                    } else {
                        node.addEventListener(_type, _fn)
                    }
                }
            },

            parseClass: function (node) {
                if (node.getAttribute('zen-class')) {
                    var className = node.getAttribute('zen-class')
                    var _data = this.parseData(className, node)
                    if (!node.classList.contains(_data.data)) {
                        node.classList.add(_data.data)
                    }
                    this.$register.regist(this._data, _data.path, function (old, now) {
                        node.classList.remove(old)
                        node.classList.add(now)
                    })
                }
            },

            parseModel: function (node) {
                if (node.getAttribute('zen-model')) {
                    var modelName = node.getAttribute('zen-model')
                    var _data = this.parseData(modelName, node)
                    if (node.tagName === 'INPUT') {
                        node.value = _data.data
                    } else {
                        node.innerText = _data.data
                    }
                    this.$register.regist(this._data, _data.path, function (old, now) {
                        if (node.tagName === 'INPUT') {
                            node.value = now
                        } else {
                            node.innerText = now
                        }
                    })
                }
            },

            parseList: function (node) {
                var _item = this.parseListItem(node)
                var _list = node.getAttribute('zen-list')
                var _listData = this.parseData(_list, node)
                _listData.data.forEach((_dataItem, index) => {
                    var _copyItem = _item.cloneNode(true)
                    if (node.path) {
                        _copyItem.path = node.path.slice()
                    }
                    if (!_copyItem.path) {
                        _copyItem.path = []
                    }
                    _copyItem.path.push(index)
                    this.scan(_copyItem)
                    node.insertBefore(_copyItem, _item)
                })
                node.removeChild(_item)
                this.$register.regist(this._data, _listData.path, () => {
                    while (node.firstChild) {
                        node.removeChild(node.firstChild)
                    }
                    var _listData = this.parseData(_list, node)
                    node.appendChild(_item)
                    _listData.data.forEach((_dataItem, index) => {
                        var _copyItem = _item.cloneNode(true)
                        if (node.path) {
                            _copyItem.path = node.path.slice()
                        }
                        if (!_copyItem.path) {
                            _copyItem.path = []
                        }
                        _copyItem.path.push(index)
                        this.scan(_copyItem)
                        node.insertBefore(_copyItem, _item)
                    })
                    node.removeChild(_item)
                })
            },

            parseListItem: function (node) {
                var me = this
                var target
                !function getItem(node) {
                    for (var i = 0; i < node.children.length; i++) {
                        var _thisNode = node.children[i]
                        if (node.path) {
                            _thisNode.path = node.path.slice()
                        }
                        me.parseEvent(_thisNode)
                        me.parseClass(_thisNode)
                        me.parseModel(_thisNode)
                        if (_thisNode.getAttribute('zen-list-item')) {
                            target = _thisNode
                        } else {
                            getItem(_thisNode)
                        }
                    }
                }(node)
                return target
            }
        }

    var observer = function (obj, k, callback) {
        if (Object.prototype.toString.call(k) === '[object Array]') {
            observePath(obj, k, callback)
        } else {
            var old = obj[k]
            if (Object.prototype.toString.call(old) === '[object Array]') {
                observeArray(old, callback)
            } else if (old.toString() === '[object Object]') {
                observeAllKey(old, callback)
            } else {
                Object.defineProperty(obj, k, {
                    enumerable: true,
                    configurable: true,
                    get: function () {
                        return old
                    },
                    set: function (now) {
                        if (now !== old) {
                            callback.forEach((fn) => {
                                fn(old, now)
                            })
                        }
                        old = now
                    }
                })
            }
        }
    }

    var observePath = function (obj, path, callback) {
        var _path = obj
        var _key
        path.forEach((p, index) => {
            if (parseInt(p) === p) {
                p = parseInt(p)
            }
            if (index < path.length - 1) {
                _path = _path[p]
            } else {
                _key = p
            }
        })
        observer(_path, _key, callback)
    }

    var observeArray = function (arr, callback) {
        var oam = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse']
        var arrayProto = Array.prototype
        var hackProto = Object.create(Array.prototype)
        oam.forEach(function (method) {
            Object.defineProperty(hackProto, method, {
                writable: true,
                enumerable: true,
                configurable: true,
                value: function (...arg) {
                    var old = arr.slice()
                    var now = arrayProto[method].call(this, ...arg)
                    callback.forEach((fn) => {
                        fn(old, this, ...arg)
                    })
                    return now
                },
            })
        })
        arr.__proto__ = hackProto
    }

    var observeAllKey = function (obj, callback) {
        Object.keys(obj).forEach(function (key) {
            observer(obj, key, callback)
        })
    }
})();