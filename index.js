'use strict';
var typeOf = require('lc-type-of');
var isEmptyObject = require('lc-is-empty-object');
var ajax = {
    request: function(option){
        var req = new XMLHttpRequest();
        //request method
        if(!option.method){
            console.error('Sorry, request failed. Please fill request method argument.');
            option.resolve(false);
            return;
        }
        if(option.enctype){
            option.enctype = option.enctype.toUpperCase();
        }
        option.method = option.method.toUpperCase();
        //request url
        if(option.method === 'GET'){
            //check request enctype
            if(option.enctype){
                console.error('Request failed. Please do not set enctype argument when you use GET method.');
                option.resolve(false);
                return;
            }
            //fill request data
            if(option.data && !isEmptyObject(option.data)){
                if(typeOf(option.data) !== 'object'){
                    console.error('Request failed. Data argument must be an object.');
                    option.resolve(false);
                    return;
                }
                var query = [];
                for(var key in option.data){
                    if(option.data.hasOwnProperty(key)){
                        var val = option.data[key];
                        if(val === null || val === undefined){
                            val = '';
                        }
                        query.push(key + '=' + encodeURIComponent(val));
                    }
                }
                query = query.join('&');
                if(/\?$/.test(option.url)){
                    console.error('Request failed. Please do not put "?" at the end of the url.');
                    option.resolve(false);
                    return;
                }
                if(/\?[^?]$/.test(option.url)){
                    option.url += ('&' + query);
                }else{
                    option.url += ('?' + query);
                }
            }
        }
        if(option.method === 'POST'){
            option.enctype = option.enctype || 'JSON';
            var sendData;
            if(option.enctype === 'FORMDATA'){
                sendData = new FormData();
                for(var key1 in option.data){
                    if(option.data.hasOwnProperty(key1)){
                        sendData.append(key1, option.data[key1]);
                    }
                }
            }
            if(option.enctype === 'JSON'){
                sendData = JSON.stringify(option.data);
            }
        }
        req.open(option.method, option.url);
        
        req.addEventListener('load', function () {
            var res;
            var contentType = req.getResponseHeader('Content-Type');
            if(/application\/json|text\/json/.test(contentType)){
                res = JSON.parse(req.responseText);
                option.resolve(res);
                return;
            }
            res = req.responseText;
            option.resolve(res);
        });
        req.addEventListener('error', function() {
            return option.reject ? option.reject() : false;
        });
        //set headers must be after xhr.open and before xhr.send
        for(var key2 in option.headers){
            if(option.headers.hasOwnProperty(key2)){
                req.setRequestHeader(key2, option.headers[key2]);
            }
        }
        if(option.enctype === 'JSON'){
            req.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        }
        if(option.method === 'POST'){
            req.send(sendData);
        }
        if(option.method === 'GET'){
            req.send();
        }
    },
    get: function(url, data, headers){
        var self = this;
        return new Promise(function (resolve, reject) {
            self.request({
                method: 'GET',
                url: url,
                data: data,
                headers: headers,
                resolve: resolve,
                reject: reject
            });
        })
    },
    post: function (url, data, headers, enctype) {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.request({
                method: 'POST',
                url: url,
                data: data,
                headers: headers,
                enctype: enctype,
                resolve: resolve,
                reject: reject
            });
        });
    }
};
module.exports = ajax;