var request = require("request");

/**
 * Qiwi api
 * @param {string} token 
 * @link https://github.com/InsightAppDev/node-qiwi-api
 */
module.exports = function Qiwi(token) {
    this.recipients = {
        banks: {
            alfabank: 464,
            tinkoff: 466,
            ao_otp_bank: 804,
            ao_rosselhozbank: 810,
            russkiy_standard: 815,
            pao_vtb: 816,
            promsvyazbank: 821,
            pao_sberbank: 870,
            renessans_credit: 881,
            moskovskiy_kreditniy_bank: 1134
        },
        cards: {
            visa_sng: 1960,
            visa_rus: 1963,
            mastercard_sng: 21012,
            mastercard_rus: 21013,
            mir: 31652,
        },
        differentServices: {
            onlime: 674,
            podari_jizn: 1239
        },
        qiwi: 99,
    }
    this.token = token;
    this.headers = {
        'Accept': 'application/json',
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + this.token
    }
    this.apiUri = "https://edge.qiwi.com";

    this.txnType = {
        "IN": 0,
        "OUT": 1,
        "ALL": 2
    }

    /**
     * Get identification data
     * @link https://developer.qiwi.com/ru/qiwi-wallet-personal/index.html#ident_data
     * @param {string} wallet wallet number without plus (+) and with prefix, as example: 79991234567
     * @param {function(err,data)} callback 
     */
    this.getIdentificationData = function (wallet, callback) {
        var options = {
            url: `${this.apiUri}/identification/v1/persons/${wallet}/identification`,
            headers: this.headers,
            json: true
        };

        request.get(options, (error, response) => {
            callback(error, response.body);
        });
    }

    /**
     * Identify wallet
     * @link https://developer.qiwi.com/ru/qiwi-wallet-personal/index.html#ident
     * @param {string} wallet wallet number without plus (+) and with prefix, as example: 79991234567
     * @param {{birthDate:string, firstName:string, middleName:string, lastName:string, passport:string, inn:string, snils:string, oms:string}} requestOptions
     * @param {function(err,data)} callback 
     */
    this.identifyWallet = function (wallet, requestOptions, callback) {
        var options = {
            url: `${this.apiUri}/identification/v1/persons/${wallet}/identification`,
            headers: this.headers,
            body: requestOptions,
            json: true
        };

        request.post(options, (error, response) => {
            callback(error, response.body);
        });
    }

    /**
     * Get information about current account
     * @link
     * @param {function(err,data)} callback 
     */
    this.getAccountInfo = function (callback) {
        var options = {
            url: `${this.apiUri}/person-profile/v1/profile/current`,
            headers: this.headers,
            json: true
        };

        request.get(options, (error, response) => {
            callback(error, response.body);
        });
    }

    /**
     * Get information about account balance
     * @link
     * @param {function(err,data)} callback 
     */
    this.getBalance = function (callback) {
        var options = {
            url: `${this.apiUri}/funding-sources/v1/accounts/current`,
            headers: this.headers,
            json: true
        };

        request.get(options, (error, response) => {
            callback(error, response.body);
        });
    }

    /**
     * Get operation history 
     * @link
     * @param {{rows:number, operation:string, sources:string, startDate:Date, endDate:Date, nextTxnDate:Date, nextTxnId:number}} requestOptions 
     * @param {function(err,data)} callback 
     */
    this.getOperationHistory = function (requestOptions, callback) {
        this.getAccountInfo((err, data) => {
            if (err != null) {
                return callback(err, null);
            }
            if (data == null) {
                return callback(new Error("Can not retrieve account info"), null);
            }

            var options = {
                url: `${this.apiUri}/payment-history/v1/persons/${data.authInfo.personId}/payments`,
                headers: this.headers,
                qs: {
                    rows: requestOptions.rows,
                    operation: requestOptions.operation,
                    sources: requestOptions.sources,
                    startDate: requestOptions.startDate,
                    endDate: requestOptions.endDate,
                    nextTxnDate: requestOptions.nextTxnDate,
                    nextTxnId: requestOptions.nextTxnId
                },
                json: true
            };

            request.get(options, (error, response) => {
                callback(error, response.body);
            });
        });
    }

    /**
     * Get statistics for operations
     * @link
     * @param {{operation:string, sources:string, startDate:Date, endDate:Date}} requestOptions 
     * @param {function(err,data)} callback 
     */
    this.getOperationStats = function (requestOptions, callback) {
        this.getAccountInfo((err, data) => {
            if (err != null) {
                callback(err, null);
                return;
            }

            if (data == null) {
                callback(new Error("Can not retrieve account info"), null);
                return;
            }

            var options = {
                url: `${this.apiUri}/payment-history/v1/persons/${data.authInfo.personId}/payments/total`,
                headers: this.headers,
                qs: {
                    operation: requestOptions.operation,
                    sources: requestOptions.sources,
                    startDate: requestOptions.startDate,
                    endDate: requestOptions.endDate
                },
                json: true
            };

            request.get(options, (error, response) => {
                callback(error, response.body);
            });
        });
    }

    /**
     * Send to qiwi wallet
     * @link
     * @param {{amount:number, comment:string, account:string}} requestOptions 
     * @param {function(err,data)} callback 
     */
    this.toWallet = function (requestOptions, callback) {
        var options = {
            url: `${this.apiUri}/sinap/terms/99/payments`,
            headers: this.headers,
            body: {
                id: (1000 * Date.now()).toString(),
                sum: {
                    amount: requestOptions.amount,
                    currency: "643"
                },
                source: "account_643",
                paymentMethod: {
                    type: "Account",
                    accountId: "643"
                },
                comment: requestOptions.comment,
                fields: {
                    account: requestOptions.account
                }
            },
            json: true
        };

        request.post(options, (error, response) => {
            callback(error, response.body);
        });
    }

    /**
     * Send to mobile phone
     * @param {{amount:number, comment:string, account:string}} requestOptions 
     * @param {function(err,data)} callback 
     */
    this.toMobilePhone = function (requestOptions, callback) {
        detectOperator('7' + requestOptions.account, (err, data) => {
            if (err || data.code.value == "2") 
                throw new Error('Can\'t detect operator.');
            else {
                var options = {
                    url: `${this.apiUri}/sinap/terms/${data.message}/payments`,
                    headers: this.headers,
                    body: {
                        id: (1000 * Date.now()).toString(),
                        sum: {
                            amount: requestOptions.amount,
                            currency: "643"
                        },
                        source: "account_643",
                        paymentMethod: {
                            type: "Account",
                            accountId: "643"
                        },
                        comment: requestOptions.comment,
                        fields: {
                            account: requestOptions.account
                        }
                    },
                    json: true
                };

                request.post(options, (error, response) => {
                    let body = response.body;
                    if (typeof body.code != 'undefined') error = body;
                    callback(error, body);
                });
            }
        });
    }

    /**
     * Send to card
     * @param {{amount:number, comment:string, account:string}} requestOptions 
     * @param {function(err,data)} callback 
     */
    this.toCard = function (requestOptions, callback) {
        this.detectCard(requestOptions.account, (err, data) => {
            if (err || data.code.value == "2") {
                callback(new Error('Wrong card number!', null));
            }
            else {
                var options = {
                    url: `${this.apiUri}/sinap/terms/${data.message}/payments`,
                    headers: this.headers,
                    body: {
                        id: (1000 * Date.now()).toString(),
                        sum: {
                            amount: requestOptions.amount,
                            currency: "643"
                        },
                        source: "account_643",
                        paymentMethod: {
                            type: "Account",
                            accountId: "643"
                        },
                        comment: requestOptions.comment,
                        fields: {
                            account: requestOptions.account
                        }
                    },
                    json: true
                };

                request.post(options, (error, response) => {
                    callback(error, response.body);
                });
            }
        });
    }

    /**
     * Send to bank account
     * @param {{ammount:number,account:string,account_type:number,exp_date:number}} requestOptions 
     * @param {number} recipient 
     * @param {function(err,data)} callback 
     */
    this.toBank = function (requestOptions, recipient, callback) {
        var options = {
            url: `${this.apiUri}/sinap/terms/${recipient}/payments`,
            headers: this.headers,
            body: {
                id: (1000 * Date.now()).toString(),
                sum: {
                    amount: requestOptions.amount,
                    currency: "643"
                },
                source: "account_643",
                paymentMethod: {
                    type: "Account",
                    accountId: "643"
                },
                comment: requestOptions.comment,
                fields: {
                    account: requestOptions.account,
                    account_type: requestOptions.account_type,
                    exp_date: requestOptions.exp_date
                }
            },
            json: true
        };

        request.post(options, (error, response) => {
            callback(error, response.body);
        });
    }

    /**
     * Check commission for operation
     * @param {number} recipient receiver identifier, see this.recipients
     * @param {function(err,data)} callback 
     */
    this.checkCommission = function (recipient, callback) {
        var options = {
            url: `${this.apiUri}/sinap/providers/${recipient}/form`,
            json: true
        };

        request.get(options, (error, response) => {
            callback(error, response.body);
        });
    }

    /**
     * Detects operator of phone number
     * @link https://developer.qiwi.com/ru/qiwi-wallet-personal/index.html#cell
     * @param {string} phone phone number
     * @param {function(err,data)} callback 
     */
    function detectOperator(phone, callback) {
        var options = {
            url: 'https://qiwi.com/mobile/detect.action',
            headers: this.headers,
            qs: {
                phone: phone
            },
            json: true
        };

        request.post(options, (error, response) => {
            callback(error, response.body);
        });
    }

    /**
     * Detects card type
     * @param {string} cardNumber card number
     * @param {function(err,data)} callback 
     */
    this.detectCard = function (cardNumber, callback) {
        var options = {
            url: 'https://qiwi.com/card/detect.action',
            headers: this.headers,
            qs: {
                cardNumber: cardNumber
            },
            json: true
        };

        request.post(options, (error, response) => {
            callback(error, response.body);
        });
    }

    /**
     * Get cross rates
     * @link https://developer.qiwi.com/ru/qiwi-wallet-personal/index.html#section-1
     * @param {function(err,data)} callback 
     */
    this.getCrossRates = function (callback) {
        var options = {
            url: `${this.apiUri}/sinap/crossRates`,
            headers: this.headers,
            json: true
        };

        request.get(options, (error, response) => {
            callback(error, response.body);
        });
    }
    /**
     * Add webhook by url 
     * @param {string} url Url address
     * @param {number} txnType type of messages. 0 - "In", 1 - "Out". 2 - "All". (this.txnType)
     * @param {function(err,data)} callback 
     */
    this.addWebHook = function (url, txnType, callback) {
        var options = {
            url: `${this.apiUri}/payment-notifier/v1/hooks`,
            headers: this.headers,
            qs: {
                hookType: 1,
                param: url,
                txnType: txnType
            },
            json: true
        };

        request.put(options, (error, response) => {
            callback(error, response.body);
        });
    }

    /**
     * Remove webhook by UUID
     * @param {string} hookId webhook UUID
     * @param {function(err,data)} callback 
     */
    this.removeWebHook = function (hookId, callback) {
        var options = {
            url: `${this.apiUri}/payment-notifier/v1/hooks/${hookId}`,
            headers: this.headers,
            json: true
        };

        request.delete(options, (error, response) => {
            callback(error, response.body);
        });
    }

    /**
     * Get webhook secret key by UUID
     * @param {string} hookId webhook UUID
     * @param {function(err,data)} callback 
     */
    this.getWebHookSecret = function (hookId, callback) {
        var options = {
            url: `${this.apiUri}/payment-notifier/v1/hooks/${hookId}/key`,
            headers: this.headers,
            json: true
        };

        request.get(options, (error, response) => {
            callback(error, response.body);
        });
    }

    /**
     * Refresh webhook secret key by UUID
     * @param {string} hookId webhook UUID
     * @param {function(err,data)} callback 
     */
    this.requestNewWebHookSecret = function (hookId, callback) {
        var options = {
            url: `${this.apiUri}/payment-notifier/v1/hooks/${hookId}/newkey`,
            headers: this.headers,
            json: true
        };

        request.post(options, (error, response) => {
            callback(error, response.body);
        });
    }

    /**
     * Get information about active webhook for this wallet(token)
     * @link https://developer.qiwi.com/ru/qiwi-wallet-personal/index.html#hook_active
     * @param {function(err,data)} callback 
     */
    this.getActiveWebHook = function (callback) {
        var options = {
            url: `${this.apiUri}/payment-notifier/v1/hooks/active`,
            headers: this.headers,
            json: true
        };

        request.get(options, (error, response) => {
            callback(error, response.body);
        });
    }

    /**
     * Sends test request to active webhook
     * @param {function(err,data)} callback 
     */
    this.testActiveWebHook = function (callback) {
        var options = {
            url: `${this.apiUri}/payment-notifier/v1/hooks/test`,
            headers: this.headers,
            json: true
        };

        request.get(options, (error, response) => {
            callback(error, response.body);
        });
    }
}