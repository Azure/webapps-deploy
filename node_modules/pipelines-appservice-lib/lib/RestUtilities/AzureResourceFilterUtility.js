"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const azure_arm_resource_1 = require("../ArmRest/azure-arm-resource");
class AzureResourceFilterUtility {
    static getAppDetails(endpoint, resourceName) {
        return __awaiter(this, void 0, void 0, function* () {
            var azureResources = new azure_arm_resource_1.Resources(endpoint);
            var filteredResources = yield azureResources.getResources('Microsoft.Web/Sites', resourceName);
            let resourceGroupName;
            let kind;
            if (!filteredResources || filteredResources.length == 0) {
                throw new Error('ResourceDoesntExist');
            }
            else if (filteredResources.length == 1) {
                resourceGroupName = filteredResources[0].id.split("/")[4];
                kind = filteredResources[0].kind;
            }
            else {
                throw new Error('MultipleResourceGroupFoundForAppService');
            }
            return {
                resourceGroupName: resourceGroupName,
                kind: kind
            };
        });
    }
}
exports.AzureResourceFilterUtility = AzureResourceFilterUtility;
