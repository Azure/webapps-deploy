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
class AzureApplicationInsights {
    constructor(endpoint, resourceGroupName, name) {
        this._client = new AzureServiceClient_1.ServiceClient(endpoint, 30);
        this._resourceGroupName = resourceGroupName;
        this._name = name;
    }
    addReleaseAnnotation(annotation) {
        return __awaiter(this, void 0, void 0, function* () {
            var httpRequest = {
                method: 'PUT',
                body: JSON.stringify(annotation),
                uri: this._client.getRequestUri(`//subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/microsoft.insights/components/{resourceName}/Annotations`, {
                    '{resourceGroupName}': this._resourceGroupName,
                    '{resourceName}': this._name,
                }, null, '2015-05-01')
            };
            try {
                var response = yield this._client.beginRequest(httpRequest);
                console.log(`addReleaseAnnotation. Data : ${JSON.stringify(response)}`);
                if (response.statusCode == 200 || response.statusCode == 201) {
                    return;
                }
                throw AzureServiceClient_1.ToError(response);
            }
            catch (error) {
                if (error && error.message && typeof error.message.valueOf() == 'string') {
                    error.message = "Failed to update Application Insights for resource " + this._name + ".\n" + error.message;
                }
                throw error;
            }
        });
    }
    getResourceGroupName() {
        return this._resourceGroupName;
    }
}
exports.AzureApplicationInsights = AzureApplicationInsights;
class ApplicationInsightsResources {
    constructor(endpoint) {
        this._client = new AzureServiceClient_1.ServiceClient(endpoint, 30);
    }
    list(resourceGroupName, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            resourceGroupName = resourceGroupName ? `resourceGroups/${resourceGroupName}` : '';
            var httpRequest = {
                method: 'GET',
                uri: this._client.getRequestUri(`//subscriptions/{subscriptionId}/${resourceGroupName}/providers/microsoft.insights/components`, {}, filter, '2015-05-01')
            };
            try {
                var response = yield this._client.beginRequest(httpRequest);
                if (response.statusCode == 200) {
                    var responseBody = response.body;
                    var applicationInsightsResources = [];
                    if (responseBody.value && responseBody.value.length > 0) {
                        for (var value of responseBody.value) {
                            applicationInsightsResources.push(value);
                        }
                    }
                    return applicationInsightsResources;
                }
                throw AzureServiceClient_1.ToError(response);
            }
            catch (error) {
                if (error && error.message && typeof error.message.valueOf() == 'string') {
                    error.message = "Failed to get Application Insights Resource.\n" + error.message;
                }
                throw error;
            }
        });
    }
}
exports.ApplicationInsightsResources = ApplicationInsightsResources;
