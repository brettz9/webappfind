/*globals self, jml*/
(function () {'use strict';

// alert(document.querySelectorAll('a.file').length);
// document.body.innerHTML = 'Haha, it\'s working!';
// self.port.emit(name, jsonSerializableData);
// self.port.on/once/removeListener(name, function () {}); // self.on is used instead for built-in message listening
//});

var on, emit, options;
if (window.location.href.indexOf('.') === -1) { // In a directory (regex should remove need for this once working)
    on = self.port.on;
    emit = self.port.emit;
    options = self.options;
    
    on('getFileURLFromNativePathResponse', function (fileURL) {
        window.location.href = fileURL;
    });
    on('getNativePathFromFileURLResponse', function (result) {
        var h1 = document.querySelector('h1');
        h1.replaceChild(document.createTextNode('Index of '), h1.firstChild);
        h1.appendChild(jml(
            'input', {type: 'text', size: 100, value: result, $on: {change: function (e) {
                on('pathExistsResponse', function (pathExists) {
                    if (pathExists) {
                        emit('getFileURLFromNativePath', e.target.value);
                    }
                });
                emit('pathExists', e.target.value);
            }}},
            'input', {
                    type: 'button',
                    style: 'border: none; margin-left: 5px; background-color: transparent; width: 25px; background-repeat: no-repeat; '+
                            'background-size: 20px 20px; '+
                            'background-image: url("' + options.folderImage + '");',
                    $on: {click: function (e) {
                        emit('reveal', result);
                    }}
                }, null
        ));
    });
    emit('getNativePathFromFileURL', document.baseURI);

    /*window.addEventListener('click', function (e) {
        var el;
        if (e.button === 2) {
            el = e.target;
            emit('getNativePathFromFileURL', [el.href]);
        }    
    });*/
}

}());
