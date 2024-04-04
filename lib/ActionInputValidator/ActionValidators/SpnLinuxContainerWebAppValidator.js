"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpnLinuxContainerWebAppValidator = void 0;
const Validations_1 = require("../Validations");
const actionparameters_1 = require("../../actionparameters");
class SpnLinuxContainerWebAppValidator {
    validate() {
        let actionParams = actionparameters_1.ActionParameters.getActionParams();
        (0, Validations_1.packageNotAllowed)(actionParams.packageInput);
        (0, Validations_1.validateContainerInputs)();
    }
}
exports.SpnLinuxContainerWebAppValidator = SpnLinuxContainerWebAppValidator;
