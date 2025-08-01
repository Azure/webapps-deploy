"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpnWebAppSiteContainersValidator = void 0;
const Validations_1 = require("../Validations");
const SpnLinuxWebAppValidator_1 = require("./SpnLinuxWebAppValidator");
const actionparameters_1 = require("../../actionparameters");
class SpnWebAppSiteContainersValidator extends SpnLinuxWebAppValidator_1.SpnLinuxWebAppValidator {
    validate() {
        const _super = Object.create(null, {
            validate: { get: () => super.validate }
        });
        return __awaiter(this, void 0, void 0, function* () {
            let actionParams = actionparameters_1.ActionParameters.getActionParams();
            if (!!actionParams.blessedAppSitecontainers) {
                yield _super.validate.call(this);
            }
            (0, Validations_1.validateSiteContainersInputs)();
        });
    }
}
exports.SpnWebAppSiteContainersValidator = SpnWebAppSiteContainersValidator;
