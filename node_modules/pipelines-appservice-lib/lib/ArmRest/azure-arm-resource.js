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
const AzureServiceClient_1 = require("./AzureServiceClient");
class Resources {
    constructor(endpoint) {
        this._client = new AzureServiceClient_1.ServiceClient(endpoint, 30);
    }
    getResources(resourceType, resourceName) {
        return __awaiter(this, void 0, void 0, function* () {
            var httpRequest = {
                method: 'GET',
                uri: this._client.getRequestUri('//subscriptions/{subscriptionId}/resources', {}, [`$filter=resourceType EQ \'${encodeURIComponent(resourceType)}\' AND name EQ \'${encodeURIComponent(resourceName)}\'`], '2016-07-01')
            };
            var result = [];
            try {
                var response = yield this._client.beginRequest(httpRequest);
                if (response.statusCode != 200) {
                    throw AzureServiceClient_1.ToError(response);
                }
                result = result.concat(response.body.value);
                if (response.body.nextLink) {
                    var nextResult = yield this._client.accumulateResultFromPagedResult(response.body.nextLink);
                    if (nextResult.error) {
                        throw Error(nextResult.error);
                    }
                    result = result.concat(nextResult.result);
                }
                return result;
            }
            catch (error) {
                if (error && error.message && typeof error.message.valueOf() == 'string') {
                    error.message = "Failed to get resource ID for resource type " + resourceType + " and resource name " + resourceName + ".\n" + error.message;
                }
                throw error;
            }
        });
    }
}
exports.Resources = Resources;
