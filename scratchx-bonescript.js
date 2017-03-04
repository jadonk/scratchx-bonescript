(function(ext) {
    var boardStatus = 1; // 0=error, 1=not ready, 2=ready
    var b;
    var buttonStatus = {
        'pause_pressed': false,
        'pause_released': false,
        'mode_pressed': false,
        'mode_released': false
    };
    var motorStatus = false;
    
    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {
        b.rcMotor('ALL', 'DISABLE');
    };

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        var msgs = [
            'Lost connection',
            'Not yet connected',
            'Ready'
        ];
        var msg = msgs[boardStatus];
        return {status: boardStatus, msg: msg};
    };

    ext._deviceConnected = function() { };

    ext._deviceRemoved = function() { };

    ext.connect = function(address, callback) {
        (function() {
            var head = document.getElementsByTagName('head')[0];
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = 'http://' + address + '/bonescript.js';
            script.charset = 'UTF-8';
            var scriptObj = head.appendChild(script);
            scriptObj.onload = _onBonescriptLoaded;
        }());

        function _onBonescriptLoaded() {
            _bonescript.on.connecting = bsError;
            _bonescript.on.disconnect = bsDisconnected;
            _bonescript.on.connect_failed = bsError;
            _bonescript.on.error = bsError;
            _bonescript.on.reconnect = bsError;
            _bonescript.on.reconnect_failed = bsError;
            _bonescript.on.reconnecting = bsError;
            _bonescript.on.initialized = bsConnected;
        }

        function bsConnected() {
            b = require('bonescript');
            boardStatus = 2;
            callback();
        }

        function bsDisconnected() {
            b = null;
            boardStatus = 1;
        }

        function bsError() {
            b = null;
            boardStatus = 0;
            console.log("Unhandled BoneScript socket.io error");
        }
    };

    ext.whenButton = function(button, action) {
        var buttonAction = button + "_" + action;
        if(buttonStatus[buttonAction]) {
            buttonStatus[buttonAction] = false;
            return(true);
        }
        return(false);
    };

    ext.getEncoder = function(encoder, callback) {
        if(!b) return;
        b.rcEncoder(encoder, undefined, getEncoderCallback);
        function getEncoderCallback(x) {
            if(x.error) return;
            callback(x.value);
        };
    };

    ext.motor = function(motor, speed) {
        if(!b) return;
        if(!motorStatus) {
            motorStatus = true;
            b.rcMotor('ALL', 'ENABLE', continueMotor);

            function continueMotor(x) {
                if(x.error) return;
                ext.motor(motor, speed);
            }

            return;
        }

        if(speed > 100) speed = 100;
        else if(speed < -100) speed = -100;
        speed = speed / 100;
        b.rcMotor(motor, speed);
    };

    ext.disableMotor = function(motor) {
        if(!b) return;
        b.rcMotor(motor, 'FREE_SPIN');
    };

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            ['w', 'connect to %s', 'connect', 'beaglebone.local'],
            ['h', 'when %m.button button %m.buttonAction', 'whenButton'],
            ['R', 'encoder %m.encoder', 'getEncoder'],
            [' ', 'set motor %m.motor speed %n', 'motor'],
            [' ', 'disable motor %m.motor', 'disableMotor'],
        ],
        menus: {
            button: ['PAUSE', 'MODE'],
            buttonAction: ['PRESSED', 'RELEASED'],
            encoder: [1, 2, 3, 4],
            motor: ['ALL', 1, 2, 3, 4],
        }
    };

    // Register the extension
    ScratchExtensions.register('BoneScript', descriptor, ext);
})({});

// vim: set ts=4 sts=4 sw=4 et:
