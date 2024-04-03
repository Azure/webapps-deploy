"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpnWindowsContainerWebAppValidator = void 0;
const Validations_1 = require("../Validations");
const actionparameters_1 = require("../../actionparameters");
class SpnWindowsContainerWebAppValidator {
    validate() {
        let actionParams = actionparameters_1.ActionParameters.getActionParams();
        (0, Validations_1.packageNotAllowed)(actionParams.packageInput);
        (0, Validations_1.startupCommandNotAllowed)(actionParams.startupCommand);
        (0, Validations_1.multiContainerNotAllowed)(actionParams.multiContainerConfigFile);
        (0, Validations_1.validateContainerInputs)();
    }
}
exports.SpnWindowsContainerWebAppValidator = SpnWindowsContainerWebAppValidator;
