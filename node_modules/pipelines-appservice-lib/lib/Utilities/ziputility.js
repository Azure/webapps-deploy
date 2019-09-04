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
const path = require("path");
const Q = require("q");
const fs = require("fs");
const StreamZip = require("node-stream-zip");
var DecompressZip = require('decompress-zip');
var archiver = require('archiver');
function unzip(zipLocation, unzipLocation) {
    return __awaiter(this, void 0, void 0, function* () {
        var defer = Q.defer();
        var unzipper = new DecompressZip(zipLocation);
        console.log('extracting ' + zipLocation + ' to ' + unzipLocation);
        unzipper.on('error', function (error) {
            defer.reject(error);
        });
        unzipper.on('extract', function (log) {
            console.log('extracted ' + zipLocation + ' to ' + unzipLocation + ' Successfully');
            defer.resolve(unzipLocation);
        });
        unzipper.extract({
            path: unzipLocation
        });
        return defer.promise;
    });
}
exports.unzip = unzip;
function archiveFolder(folderPath, targetPath, zipName) {
    return __awaiter(this, void 0, void 0, function* () {
        var defer = Q.defer();
        console.log('Archiving ' + folderPath + ' to ' + zipName);
        var outputZipPath = path.join(targetPath, zipName);
        var output = fs.createWriteStream(outputZipPath);
        var archive = archiver('zip');
        output.on('close', function () {
            console.log('Successfully created archive ' + zipName);
            defer.resolve(outputZipPath);
        });
        output.on('error', function (error) {
            defer.reject(error);
        });
        archive.pipe(output);
        archive.directory(folderPath, '/');
        archive.finalize();
        return defer.promise;
    });
}
exports.archiveFolder = archiveFolder;
/**
 *  Returns array of files present in archived package
 */
function getArchivedEntries(archivedPackage) {
    return __awaiter(this, void 0, void 0, function* () {
        var deferred = Q.defer();
        var unzipper = new DecompressZip(archivedPackage);
        unzipper.on('error', function (error) {
            deferred.reject(error);
        });
        unzipper.on('list', function (files) {
            var packageComponent = {
                "entries": files
            };
            deferred.resolve(packageComponent);
        });
        unzipper.list();
        return deferred.promise;
    });
}
exports.getArchivedEntries = getArchivedEntries;
function checkIfFilesExistsInZip(archivedPackage, files) {
    let deferred = Q.defer();
    for (let i = 0; i < files.length; i++) {
        files[i] = files[i].toLowerCase();
    }
    const zip = new StreamZip({
        file: archivedPackage,
        storeEntries: true,
        skipEntryNameValidation: true
    });
    zip.on('ready', () => {
        let fileCount = 0;
        for (let entry in zip.entries()) {
            if (files.indexOf(entry.toLowerCase()) != -1) {
                fileCount += 1;
            }
        }
        zip.close();
        deferred.resolve(fileCount == files.length);
    });
    zip.on('error', error => {
        deferred.reject(error);
    });
    return deferred.promise;
}
exports.checkIfFilesExistsInZip = checkIfFilesExistsInZip;
