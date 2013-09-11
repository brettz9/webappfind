// Todo: replace with require polyfill plugin
if (!Array.isArray) {
    Array.isArray = function isArray(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    };
}
