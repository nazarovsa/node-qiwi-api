const axios = require('axios').default;

/**
 * Qiwi api
 * @param {string} token Access token
 * @link https://github.com/InsightAppDev/node-qiwi-api
 */
module.exports = function Qiwi(token) {

    /**
     * Api url
     */
    apiUri = "https://edge.qiwi.com";

    /**
     * Access token
     */
    token = token;

    /**
     * Headers
     */
    headers = {
        'Accept': 'application/json',
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + token
    }

    /**
     * Allowable recepients
     */
    this.recipients = {
        banks: {
            alfabank: { id: 464, accountType: 1 },
            tinkoff: { id: 466, accountType: 1 },
            ao_otp_bank: { id: 804, accountType: 1 },
            ao_rosselhozbank: { id: 810, accountType: 5 },
            russkiy_standard: { id: 815, accountType: 1 },
            pao_vtb: { id: 816, accountType: 5 },
            promsvyazbank: { id: 821, accountType: 7 },
            pao_sberbank: { id: 870, accountType: 5 },
            renessans_credit: { id: 881, accountType: 1 },
            moskovskiy_kreditniy_bank: { id: 1134, accountType: 5 }
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

    /**
     * Transaction type
     */
    this.txnType = {
        "IN": 0,
        "OUT": 1,
        "ALL": 2
    }

    /**
     * Format of receipt file
     */
    this.receiptFormat = {
        Jpeg: 'JPEG',
        Pdf: 'PDF'
    }

    /**
     * Get identification data
     * @link https://developer.qiwi.com/ru/qiwi-wallet-personal/index.html#ident_data
     * @param {string} wallet Wallet number without plus (+) and with prefix, as example: 79991234567
     * @param {function(err,data)} callback 
     */
    this.getIdentificationData = function (wallet, callback) {
        var options = {
            url: `${apiUri}/identification/v1/persons/${wallet}/identification`
        };

        get(options, callback);
    }

    /**
     * Identify wallet
     * @link https://developer.qiwi.com/ru/qiwi-wallet-personal/index.html#ident
     * @param {string} wallet Wallet number without plus (+) and with prefix, as example: 79991234567
     * @param {{birthDate:string, firstName:string, middleName:string, lastName:string, passport:string, inn:string, snils:string, oms:string}} requestOptions
     * @param {function(err,data)} callback 
     */
    this.identifyWallet = function (wallet, requestOptions, callback) {
        var options = {
            url: `${apiUri}/identification/v1/persons/${wallet}/identification`,
            body: requestOptions
        };

        post(options, callback);
    }

    /**
     * Get accounts of wallet
     * @link https://developer.qiwi.com/ru/qiwi-wallet-personal/index.html#balances_list
     * @param {string} wallet Wallet number without plus (+) and with prefix, as example: 79991234567
     * @param {function(err,data)} callback 
     */
    this.getAccounts = function (wallet, callback) {
        var options = {
            url: `${apiUri}/funding-sources/v2/persons/${wallet}/accounts`,
        };

        get(options, callback)
    }

    /**
     * Creates new account by alias
     * @link https://developer.qiwi.com/ru/qiwi-wallet-personal/index.html#balance_create
     * @param {string} wallet Wallet number without plus (+) and with prefix, as example: 79991234567
     * @param {string} accountAlias Alias of account name
     * @param {function(err,data)} callback 
     */
    this.createAccount = function (wallet, accountAlias, callback) {
        var options = {
            url: `${apiUri}/funding-sources/v2/persons/${wallet}/accounts`,
            body: {
                alias: accountAlias
            }
        };

        post(options, callback);
    }

    /**
     * Sets default account
     * @link https://developer.qiwi.com/ru/qiwi-wallet-personal/index.html#default_balance
     * @param {string} wallet Wallet number without plus (+) and with prefix, as example: 79991234567
     * @param {string} accountAlias Alias of account name
     * @param {function(err,data)} callback 
     */
    this.setDefaultAccount = function (wallet, accountAlias, callback) {
        var options = {
            url: `${apiUri}/funding-sources/v2/persons/${wallet}/accounts/${accountAlias}`,
            headers: headers,
            body: {
                defaultAccount: true
            },
            json: true
        };

        patch(options, callback);
    }

    /**
     * Get possible aliases of account
     * @link https://developer.qiwi.com/ru/qiwi-wallet-personal/index.html#funding_offer
     * @param {string} wallet Wallet number without plus (+) and with prefix, as example: 79991234567
     * @param {function(err,data)} callback 
     */
    this.getPossibleAccountAliases = function (wallet, callback) {
        var options = {
            url: `${apiUri}/funding-sources/v2/persons/${wallet}/accounts/offer`,
        };

        get(options, callback);
    }

    /**
     * Get information about current account
     * @link
     * @param {function(err,data)} callback 
     */
    this.getAccountInfo = function (callback) {
        var options = {
            url: `${apiUri}/person-profile/v1/profile/current`,
        };

        get(options, callback);
    }

    /**
     * Get operation history 
     * @link https://developer.qiwi.com/ru/qiwi-wallet-personal/index.html#payments_list
     * @param {string} wallet Wallet number without plus (+) and with prefix, as example: 79991234567
     * @param {{rows:number, operation:string, sources:string, startDate:Date, endDate:Date, nextTxnDate:Date, nextTxnId:number}} requestOptions 
     * @param {function(err,data)} callback 
     */
    this.getOperationHistory = function (wallet, requestOptions, callback) {
        var options = {
            url: `${apiUri}/payment-history/v2/persons/${wallet}/payments`,
            params: requestOptions,
        };

        get(options, callback);
    }

    /**
     * Get statistics for operations
     * @link https://developer.qiwi.com/ru/qiwi-wallet-personal/index.html#stat
     * @param {string} wallet Wallet number without plus (+) and with prefix, as example: 79991234567
     * @param {{operation:string, sources:string, startDate:Date, endDate:Date}} requestOptions 
     * @param {function(err,data)} callback 
     */
    this.getOperationStatistics = function (wallet, requestOptions, callback) {
        var options = {
            url: `${apiUri}/payment-history/v2/persons/${wallet}/payments/total`,
            params: requestOptions
        };

        get(options, callback);
    }

    /**
     * Get information about transaction
     * @link https://developer.qiwi.com/ru/qiwi-wallet-personal/index.html#txn_info
     * @param {string} transactionId Transaction Id
     * @param {string} type Transaction type. Possible values: null, IN, OUT (type from ationHistory)
     * @param {function(err,data)} callback 
     */
    this.getTransactionInfo = function (transactionId, callback) {
        var options = {
            url: `${apiUri}/payment-history/v2/transactions/${transactionId}`,
        };

        get(options, callback);
    }

    /**
     * Get receipt by transaction
     * @link https://developer.qiwi.com/ru/qiwi-wallet-personal/index.html#payment_receipt
     * @param {string} transactionId Transaction Id
     * @param {{type:string, format:string}} requestOptions
     * @param {function(err,data)} callback 
     */
    this.getReceipt = function (transactionId, requestOptions, callback) {
        var options = {
            url: `${apiUri}/payment-history/v1/transactions/${transactionId}/cheque/file`,
            params: requestOptions,
        };

        get(options, callback);
    }

    /**
     * Send to qiwi wallet
     * @link
     * @param {{amount:number, comment:string, account:string}} requestOptions 
     * @param {function(err,data)} callback 
     */
    this.toWallet = function (requestOptions, callback) {
        var options = {
            url: `${apiUri}/sinap/terms/99/payments`,
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
        };

        post(options, callback);
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
                    url: `${apiUri}/sinap/terms/${data.message}/payments`,
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
                    }
                };

                post(options, callback);
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
                    url: `${apiUri}/sinap/terms/${data.message}/payments`,
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
                    }
                };

                post(options, callback);
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
            url: `${apiUri}/sinap/terms/${recipient}/payments`,
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
            }
        };

        post(options, callback);
    }

    /**
     * Get information about commission
     * @param {number} recipient receiver identifier, see this.recipients
     * @param {function(err,data)} callback 
     */
    this.checkCommission = function (recipient, callback) {
        var options = {
            url: `${apiUri}/sinap/providers/${recipient}/form`
        };

        get(options, callback);
    }

    /**
     * Check commission rates
     * @link https://developer.qiwi.com/ru/qiwi-wallet-personal/index.html#rates
     * @param {number} recipient receiver identifier, see this.recipients
     * @param {{account:string, amount: number}} requestOptions options
     * @param {function(err,data)} callback 
     */
    this.checkOnlineCommission = function (recipient, requestOptions, callback) {
        var options = {
            url: `${apiUri}/sinap/providers/${recipient}/onlineCommission`,
            body: {
                account: requestOptions.account,
                paymentMethod: {
                    type: "Account",
                    accountId: "643"
                },
                purchaseTotals: {
                    total: {
                        amount: requestOptions.amount,
                        currency: "643"
                    }
                }
            }
        };

        post(options, callback);
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
            params: {
                phone: phone
            },
        };

        post(options, callback);
    }

    /**
     * Detects card type
     * @param {string} cardNumber card number
     * @param {function(err,data)} callback 
     */
    this.detectCard = function (cardNumber, callback) {
        var options = {
            url: 'https://qiwi.com/card/detect.action',
            params: {
                cardNumber: cardNumber
            }
        };

        post(options, callback);
    }

    /**
     * Get cross rates
     * @link https://developer.qiwi.com/ru/qiwi-wallet-personal/index.html#section-1
     * @param {function(err,data)} callback 
     */
    this.getCrossRates = function (callback) {
        var options = {
            url: `${apiUri}/sinap/crossRates`
        };
        
        get(options, callback);
    }
    /**
     * Add webhook by url 
     * @param {string} url Url address
     * @param {number} txnType type of messages. 0 - "In", 1 - "Out". 2 - "All", see this.txnType
     * @param {function(err,data)} callback 
     */
    this.addWebHook = function (url, txnType, callback) {
        var options = {
            url: `${apiUri}/payment-notifier/v1/hooks`,
            params: {
                hookType: 1,
                param: url,
                txnType: txnType
            }
        };

        put(options, callback);
    }

    /**
     * Remove webhook by UUID
     * @param {string} hookId webhook UUID
     * @param {function(err,data)} callback 
     */
    this.removeWebHook = function (hookId, callback) {
        var options = {
            url: `${apiUri}/payment-notifier/v1/hooks/${hookId}`
        };

        del(options, callback);
    }

    /**
     * Get webhook secret key by UUID
     * @param {string} hookId webhook UUID
     * @param {function(err,data)} callback 
     */
    this.getWebHookSecret = function (hookId, callback) {
        var options = {
            url: `${apiUri}/payment-notifier/v1/hooks/${hookId}/key`
        };

        get(options, callback);
    }

    /**
     * Refresh webhook secret key by UUID
     * @param {string} hookId webhook UUID
     * @param {function(err,data)} callback 
     */
    this.requestNewWebHookSecret = function (hookId, callback) {
        var options = {
            url: `${apiUri}/payment-notifier/v1/hooks/${hookId}/newkey`
        };

        post(options, callback);
    }

    /**
     * Get information about active webhook for this wallet(token)
     * @link https://developer.qiwi.com/ru/qiwi-wallet-personal/index.html#hook_active
     * @param {function(err,data)} callback 
     */
    this.getActiveWebHook = function (callback) {
        var options = {
            url: `${apiUri}/payment-notifier/v1/hooks/active`,
        };

        get(options, callback);
    }

    /**
     * Sends test request to active webhook
     * @param {function(err,data)} callback 
     */
    this.testActiveWebHook = function (callback) {
        var options = {
            url: `${apiUri}/payment-notifier/v1/hooks/test`,
        };

        get(options, callback);
    }

    /**
     * Execute get request
     * @param {{url:string,params:*}} options 
     * @param {function(err,data)} callback 
     */
    function get(options, callback) {
        options.headers = headers;
        axios.get(options.url, options)
            .then((response) => {
                if (response.data.errorCode != undefined)
                    return callback(response.data, null);

                callback(null, response.data);
            })
            .catch(err => {
                callback(err.response.data, null);
            });
    }

    /**
     * Execute post request
     * @param {{url:string,body:*}} options 
     * @param {function(err,data)} callback 
     */
    function post(options, callback) {
        options.headers = headers;
        axios.post(options.url, options.body, options)
            .then((response) => {
                if (response.data.errorCode != undefined)
                    return callback(response.data, null);

                callback(null, response.data);
            })
            .catch(err => {
                callback(err.response.data, null);
            });
    }

    /**
     * Execute patch request
     * @param {{url:string,body:*}} options 
     * @param {function(err,data)} callback 
     */
    function patch(options, callback) {
        options.headers = headers;
        axios.patch(options.url, options.body, options)
            .then((response) => {
                if (response.data.errorCode != undefined)
                    return callback(response.data, null);

                callback(null, response.data);
            })
            .catch(err => {
                callback(err.response.data, null);
            });
    }

    /**
     * Execute put request
     * @param {{url:string,body:*}} options 
     * @param {function(err,data)} callback 
     */
    function put(options, callback) {
        options.headers = headers;
        axios.put(options.url, options.params, options)
            .then((response) => {
                if (response.data.errorCode != undefined)
                    return callback(response.data, null);

                callback(null, response.data);
            })
            .catch(err => {
                callback(err.response.data, null);
            });
    }

    /**
     * Execute delete request
     * @param {{url:string,body:*}} options 
     * @param {function(err,data)} callback 
     */
    function del(options, callback) {
        options.headers = headers;
        axios.delete(options.url, options)
            .then((response) => {
                if (response.data.errorCode != undefined)
                    return callback(response.data, null);

                callback(null, response.data);
            })
            .catch(err => {
                callback(err.response.data, null);
            });
    }
}