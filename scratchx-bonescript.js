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
    ext._shutdown = function() {};

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
        b.rcMotor(motor, 'FREE_SPIN');
    };

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
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
