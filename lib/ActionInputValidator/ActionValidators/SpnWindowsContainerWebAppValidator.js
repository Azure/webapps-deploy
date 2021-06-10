"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Validations_1 = require("../Validations");
const actionparameters_1 = require("../../actionparameters");
class SpnWindowsContainerWebAppValidator {
    validate() {
        let actionParams = actionparameters_1.ActionParameters.getActionParams();
        Validations_1.packageNotAllowed(actionParams.packageInput);
        Validations_1.startupCommandNotAllowed(actionParams.startupCommand);
        Validations_1.multiContainerNotAllowed(actionParams.multiContainerConfigFile);
        Validations_1.validateContainerInputs();
    }
}
exports.SpnWindowsContainerWebAppValidator = SpnWindowsContainerWebAppValidator;
