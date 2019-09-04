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
const webClient = require("../webClient");
class ApiResult {
    constructor(error, result, request, response) {
        this.error = error;
        this.result = result;
        this.request = request;
        this.response = response;
    }
}
exports.ApiResult = ApiResult;
class AzureError {
}
exports.AzureError = AzureError;
function ToError(response) {
    var error = new AzureError();
    error.statusCode = response.statusCode;
    error.message = response.body;
    if (response.body && response.body.error) {
        error.code = response.body.error.code;
        error.message = response.body.error.message;
        error.details = response.body.error.details;
        console.log("##[error]" + error.message);
    }
    return error;
}
exports.ToError = ToError;
class ServiceClient {
    constructor(endpoint, timeout) {
        this.endpoint = endpoint;
        this.subscriptionId = this.endpoint.subscriptionID;
        this.baseUrl = this.endpoint.baseUrl;
        this.longRunningOperationRetryTimeout = !!timeout ? timeout : 0; // In minutes
    }
    getRequestUri(uriFormat, parameters, queryParameters, apiVersion) {
        return this.getRequestUriForbaseUrl(this.baseUrl, uriFormat, parameters, queryParameters, apiVersion);
    }
    getRequestUriForbaseUrl(baseUrl, uriFormat, parameters, queryParameters, apiVersion) {
        var requestUri = baseUrl + uriFormat;
        requestUri = requestUri.replace('{subscriptionId}', encodeURIComponent(this.subscriptionId));
        for (var key in parameters) {
            requestUri = requestUri.replace(key, encodeURIComponent(parameters[key]));
        }
        // trim all duplicate forward slashes in the url
        var regex = /([^:]\/)\/+/gi;
        requestUri = requestUri.replace(regex, '$1');
        // process query paramerters
        queryParameters = queryParameters || [];
        if (!!apiVersion) {
            queryParameters.push('api-version=' + encodeURIComponent(apiVersion));
        }
        if (queryParameters.length > 0) {
            requestUri += '?' + queryParameters.join('&');
        }
        return requestUri;
    }
    beginRequest(request) {
        return __awaiter(this, void 0, void 0, function* () {
            var token = yield this.endpoint.getToken();
            request.headers = request.headers || {};
            request.headers["Authorization"] = "Bearer " + token;
            request.headers['Content-Type'] = 'application/json; charset=utf-8';
            var httpResponse = null;
            try {
                httpResponse = yield webClient.sendRequest(request);
                if (httpResponse.statusCode === 401 && httpResponse.body && httpResponse.body.error && httpResponse.body.error.code === "ExpiredAuthenticationToken") {
                    // The access token might have expire. Re-issue the request after refreshing the token.
                    token = yield this.endpoint.getToken(true);
                    request.headers["Authorization"] = "Bearer " + token;
                    httpResponse = yield webClient.sendRequest(request);
                }
            }
            catch (exception) {
                let exceptionString = exception.toString();
                if (exceptionString.indexOf("Hostname/IP doesn't match certificates's altnames") != -1
                    || exceptionString.indexOf("unable to verify the first certificate") != -1
                    || exceptionString.indexOf("unable to get local issuer certificate") != -1) {
                    console.log('Warning:' + 'ASE_SSLIssueRecommendation');
                }
                throw exception;
            }
            return httpResponse;
        });
    }
    accumulateResultFromPagedResult(nextLinkUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            var result = [];
            while (nextLinkUrl) {
                var nextRequest = {
                    method: 'GET',
                    uri: nextLinkUrl
                };
                var response = yield this.beginRequest(nextRequest);
                if (response.statusCode == 200 && response.body) {
                    if (response.body.value) {
                        result = result.concat(response.body.value);
                    }
                    nextLinkUrl = response.body.nextLink;
                }
                else {
                    return new ApiResult(ToError(response));
                }
            }
            return new ApiResult(null, result);
        });
    }
}
exports.ServiceClient = ServiceClient;
