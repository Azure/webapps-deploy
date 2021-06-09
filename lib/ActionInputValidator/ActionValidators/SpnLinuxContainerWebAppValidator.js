"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
<<<<<<< HEAD
=======
exports.SpnLinuxContainerWebAppValidator = void 0;
>>>>>>> 0c31588... added post build js files
const Validations_1 = require("../Validations");
const actionparameters_1 = require("../../actionparameters");
class SpnLinuxContainerWebAppValidator {
    validate() {
        let actionParams = actionparameters_1.ActionParameters.getActionParams();
        Validations_1.packageNotAllowed(actionParams.packageInput);
        Validations_1.validateContainerInputs();
    }
}
exports.SpnLinuxContainerWebAppValidator = SpnLinuxContainerWebAppValidator;
