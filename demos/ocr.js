/*globals PDFJS, OCRAD, GOCR, FileReader, Uint8Array, ArrayBuffer*/
/*jslint todo: true, vars: true*/

/*
Todos:
1. Detect from the decoded URL "params" JSON object's fileType whether a PDF, image, or SVG has been opened and act accordingly in order to OCR.
*/

(function () {'use strict';

function $ (sel) {
    return document.querySelector(sel);
}

var pdfObj, canvas, context, initial, endValue, ocrEngine,
    saveMessage = 'webapp-save',
    excludedMessages = [saveMessage];


function getPDF (pgNum) {
    // Using promise to fetch the page
    pdfObj.getPage(pgNum).then(function(page) {
        var scale = 1.5;
        var viewport = page.getViewport(scale);

        // Prepare canvas using PDF page dimensions
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page into canvas context
        var renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        page.render(renderContext).promise.then(function() {
            var string = ocrEngine(canvas);
            $('#ocr-output').value += string;
            $('#ocr-output').blur();
            if (pgNum === endValue) {
                $('#ocr-output').readOnly = false;
                $('#begin').readOnly = false;
                $('#end').readOnly = false;
                $('#message').style.visibility = 'hidden';
                canvas.style.visibility = 'visible';
                return;
            }
            getPDF(++pgNum);
        });
    });
}
function resetPDF () {
    $('#begin').readOnly = true;
    $('#end').readOnly = true;
    $('#ocr-output').readOnly = true;
    $('#ocr-output').value = '';
    canvas = $('#the-canvas');
    context = canvas.getContext('2d');
    $('#message').style.visibility = 'visible';
    canvas.style.visibility = 'hidden';
    initial = parseInt($('#begin').value, 10) || 1;
    endValue = parseInt($('#end').value, 10);
    if (initial > pdfObj.numPages) {
        initial = pdfObj.numPages;
        $('#begin').value = pdfObj.numPages;
    }
    if (!endValue || endValue < initial) {
        endValue = initial;
        $('#end').value = initial;
    }
    else if (endValue > pdfObj.numPages) {
        endValue = pdfObj.numPages;
        $('#end').value = pdfObj.numPages;
    }
    ocrEngine = $('#ocrad').checked ? OCRAD : GOCR;
    getPDF(initial);
}

function setPDF (doc) {
    // Fetch the PDF document using promises
    //
    PDFJS.getDocument(
        doc
        // 'helloworld.pdf'
    ).then(function(pdf) {
      // $('#begin').min = $('#end').min = 1;
      $('#begin').max = $('#end').max = $('#end').placeholder = pdf.numPages;
      $('#begin').title = $('#end').title = 'Max: ' + pdf.numPages + ' pages';
      pdfObj = pdf;
      $('#begin').readOnly = false;
      $('#end').readOnly = false;
      $('#begin').addEventListener('change', resetPDF);
      $('#end').addEventListener('change', resetPDF);
  });
}

window.addEventListener('DOMContentLoaded', function () {
    
    $('#pdfFile').addEventListener('change', function (ev) {
    
        var f = ev.target.files[0];
        
        var reader = new FileReader();
        reader.onload = function (e) {
            var arrayBuffer = e.target.result;
            var array = new Uint8Array(arrayBuffer);
            setPDF(array);
        };
        reader.readAsArrayBuffer(f);
    });
    
    
    var pathID;
    
    window.addEventListener('message', function(e) {
        if (e.origin !== window.location.origin || // PRIVACY AND SECURITY! (for viewing and saving, respectively)
            (!Array.isArray(e.data) || excludedMessages.indexOf(e.data[0]) > -1) // Validate format and avoid our post below
        ) {
            return;
        }
        var messageType = e.data[0];
        switch (messageType) {
            case 'webapp-view':
                // Populate the contents
                pathID = e.data[1];
                var i;
                var raw = e.data[2];
                var rawLength = raw.length;
                var array = new Uint8Array(new ArrayBuffer(rawLength));
                for (i = 0; i < rawLength; i++) {
                    array[i] = raw.charCodeAt(i);
                }
                setPDF(array);
                // $('#save').disabled = false;
                break;
            // Todo: We could allow raw editing of the PDF until such time as WYSIWYG editing becomes possible
            // case 'webapp-save-end':
                // alert('save complete for pathID ' + e.data[1] + '!');
                // break;
            default:
                throw 'Unexpected mode';
        }
    }, false);
});

}());
