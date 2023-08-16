enum Distance_Unit {
    //% block="mm" enumval=0
    Distance_Unit_mm,

    //% block="cm" enumval=1
    Distance_Unit_cm,

    //% block="inch" enumval=2
    Distance_Unit_inch,
}

//% color=#fd00fd  icon="\uf1b9" block="PI" blockId="PI"
namespace PI {
    const board_address = 0x10

    export enum LightMode {
        //% block="BREATH"
        BREATH,
        //% block="OFF"
        OFF
    }

    export enum Boo {
        //% block="True"
        T,
        //% block="False
        F
    }
    /**
    * MotorList
    */
    export enum MotorList {
        //% block="M1"
        M1,
        //% block="M2"
        M2
    }
    /**
    * ServoList
    */
    export enum ServoList {
        //% block="S0" enumval=0
        S0,
        //% block="S1" enumval=1
        S1,
        //% block="S2" enumval=2
        S2,
        //% block="S3" enumval=3
        S3,
        //% block="S4" enumval=4
        S4,
        //% block="S5" enumval=5
        S5,
        //% block="S6" enumval=6
        S6,
        //% block="S7" enumval=7
        S7
    }
    /**
    * ServoTypeList
    */
    export enum ServoTypeList {
        //% block="180°" 
        _180,
        //% block="270°"
        _270,
        //% block="360°" 
        _360
    }

    //% weight=90
    //% blockId=setMotorSpeed block="Set motor %motor speed to %speed"
    //% speed.min=-100 speed.max=100
    export function setMotorSpeed(motor: MotorList, speed: number): void {
        let buf = pins.createBuffer(4);
        switch (motor) {
            case MotorList.M1:
                buf[0] = 0x01;
                buf[1] = 0x01;
                if (speed < 0) {
                    buf[1] = 0x02;
                    speed = speed * -1
                }
                buf[2] = speed;
                buf[3] = 0;
                pins.i2cWriteBuffer(board_address, buf);
                break;
            case MotorList.M2:
                buf[0] = 0x02;
                buf[1] = 0x01;
                if (speed < 0) {
                    buf[1] = 0x02;
                    speed = speed * -1
                }
                buf[2] = speed;
                buf[3] = 0;
                pins.i2cWriteBuffer(board_address, buf);
                break;
            default:
                break;
        }
    }

    //% weight=89
    //% blockId=setAllMotor block="set motor M1 speed %m1speed M2 speed %m2speed"
    //% m1speed.min=-100 m1speed.max=100
    //% m2speed.min=-100 m2speed.max=100
    export function setAllMotor(m1speed: number, m2speed: number): void {
        setMotorSpeed(MotorList.M1, m1speed)
        setMotorSpeed(MotorList.M2, m2speed)
    }

    //% weight=88
    //% blockId=stopMotor block="Stop motor %motor"
    export function stopMotor(motor: MotorList): void {
        setMotorSpeed(motor, 0)
    }

    //% weight=87
    //% blockId=stopAllMotor  block="Stop all motor"
    export function stopAllMotor(): void {
        setMotorSpeed(MotorList.M1, 0)
        setMotorSpeed(MotorList.M2, 0)
    }

    //% weight=86
    //% blockId=turnLeft  block="turn left with speed %speed"
    //% speed.min=-100 speed.max=100
    export function turnLeft(speed: number): void {
        setMotorSpeed(MotorList.M1, 0)
        setMotorSpeed(MotorList.M2, speed)
    }

    //% weight=85
    //% blockId=turnRight  block="turn right with speed %speed"
    //% speed.min=-100 speed.max=100
    export function turnRight(speed: number): void {
        setMotorSpeed(MotorList.M1, speed)
        setMotorSpeed(MotorList.M2, 0)
    }

    //% weight=84
    //% blockId=goForward  block="go forward with speed %speed"
    //% speed.min=-100 speed.max=100
    export function goForward(speed: number): void {
        setMotorSpeed(MotorList.M1, speed)
        setMotorSpeed(MotorList.M2, speed)
    }

    //% weight=83
    //% blockId=goBack  block="go Backward with speed %speed"
    //% speed.min=-100 speed.max=100
    export function goBackward(speed: number): void {
        setMotorSpeed(MotorList.M1, -speed)
        setMotorSpeed(MotorList.M2, -speed)
    }

    //% weight=82
    //% blockId=followLine  block="follow line with speed %speed left pin %lpin right pin %rpin"
    //% speed.min=31 speed.max=100
    export function followLine(speed: number, lpin: DigitalPin, rpin: DigitalPin): void {
        if (pins.digitalReadPin(lpin) == 0 && pins.digitalReadPin(rpin) == 0) {
            goForward(speed)
        } else if (pins.digitalReadPin(lpin) == 0 && pins.digitalReadPin(rpin) == 1) {
            turnRight(speed-30)
        } else if (pins.digitalReadPin(lpin) == 1 && pins.digitalReadPin(rpin) == 0) {
            turnLeft(speed-30)
        } else if (pins.digitalReadPin(lpin) == 1 && pins.digitalReadPin(rpin) == 1) {
            setMotorSpeed(MotorList.M1, -speed)
            setMotorSpeed(MotorList.M2, speed)
        }
    }

    //% weight=81
    //% blockId=sonar_ping block="ping trig %trig|echo %echo"
    export function ping(trig: DigitalPin, echo: DigitalPin, maxCmDistance = 20): number {
        // send pulse
        pins.setPull(trig, PinPullMode.PullNone);
        pins.digitalWritePin(trig, 0);
        control.waitMicros(2);
        pins.digitalWritePin(trig, 1);
        control.waitMicros(10);
        pins.digitalWritePin(trig, 0);

        // read pulse
        const d = pins.pulseIn(echo, PulseValue.High, maxCmDistance * 58);

        return Math.idiv(d, 58);
    }

    //% weight=80
    //% blockId=setServoAngle block="Set %servoType servo %servo angle to %angle"
    //% angle.min=0 angle.max=360
    export function setServoAngle(servoType: ServoTypeList, servo: ServoList, angle: number): void {
        let buf = pins.createBuffer(4);
        if (servo == 0) {
            buf[0] = 0x03;
        }
        if (servo == 1) {
            buf[0] = 0x04;
        }
        if (servo == 2) {
            buf[0] = 0x05;
        }
        if (servo == 3) {
            buf[0] = 0x06;
        }
        if (servo == 4) {
            buf[0] = 0x07;
        }
        if (servo == 5) {
            buf[0] = 0x08;
        }
        if (servo == 6) {
            buf[0] = 0x09;
        }
        if (servo == 7) {
            buf[0] = 0x10;
        }

        switch (servoType) {
            case ServoTypeList._180:
                angle = Math.map(angle, 0, 180, 0, 180)
                break
            case ServoTypeList._270:
                angle = Math.map(angle, 0, 270, 0, 180)
                break
            case ServoTypeList._360:
                angle = Math.map(angle, 0, 360, 0, 180)
                break
        }

        buf[1] = angle;
        buf[2] = 0;
        buf[3] = 0;
        pins.i2cWriteBuffer(board_address, buf);
    }
}