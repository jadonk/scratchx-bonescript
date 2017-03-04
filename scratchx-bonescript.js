(function(ext) {
    var boardStatus = 0; // 0 = not ready, 2 = ready
    
    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {};

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        return {status: boardStatus, msg: 'Ready'};
    };

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            ['h', 'when %m.button button %m.buttonAction', 'onButton'],
        ],
        menus: {
            button: ['pause', 'mode'],
            buttonAction: ['pressed', 'released'],
        }
    };

    // Register the extension
    ScratchExtensions.register('BoneScript', descriptor, ext);
})({});
