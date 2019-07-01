"use strict";

const azureStorage = require('azure-storage');

module.exports = class AsyncTableService {
    /**
     * @param {azureStorage.TableService} tableService 
     */
    constructor(tableService) {
        this.tableService = tableService;
    }

    /**
     * @param {string} table 
     * @returns {Promise<azureStorage.services.table.TableService.TableResult>}
     */
    createTableIfNotExists(table) {
        return new Promise((resolve, reject) => this.tableService.createTableIfNotExists(table, function(error, result, response) {
            if (!error) {
                resolve(result);
            } else {
                reject(error);
            }
        }));

    }

    /**
     * @param {string} table 
     * @param {azureStorage.TableQuery} tableQuery 
     * @param {azureStorage.services.table.TableService.TableContinuationToken} currentToken 
     * @returns {Promise<azureStorage.services.table.TableService.QueryEntitiesResult<any>>}
     */
    queryEntities(table, tableQuery, currentToken) {
        return new Promise((resolve, reject) => this.tableService.queryEntities(table, tableQuery, currentToken, function(error, result, response) {
            if (!error) {
                resolve(result);
            } else {
                reject(error);
            }
        }));
    }

    /**
     * @param {string} table 
     * @param {azureStorage.TableQuery} tableQuery 
     * @returns {Promise<any[]>}
     */
    async queryAllEntities(table, tableQuery) {
        var continuationToken = null;
        var entities = [];
    
        do {
            let result = await this.queryEntities(table, tableQuery, continuationToken);
            entities.push(...result.entries);
            continuationToken = result.continuationToken;
        } while (continuationToken != null)
    
        return entities;
    }

    /**
     * @param {string} table 
     * @param {any} entityDescription 
     * @return {Promise<azureStorage.services.table.TableService.EntityMetadata>}
     */
    async insertOrReplaceEntity(table, entityDescription) {
        return new Promise((resolve, reject) => this.tableService.insertOrReplaceEntity(table, entityDescription, function(error, result, response) {
            if (!error) {
                resolve(result);
            } else {
                reject(error);
            }
        }));
    }

    /**
     * @param {string} table
     * @param {any} entityDescription
     * @return {Promise}
     */
    async deleteEntity(table, entityDescription) {
        return new Promise((resolve, reject) => this.tableService.deleteEntity(table, entityDescription, function(error, response) {
            if (!error) {
                resolve();
            } else {
                reject(error);
            }
        }));
    }
}
