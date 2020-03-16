const axios = require('axios').default;

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
     * Currency codes
     */
    this.currencyCode = {
        RUB: '643',
        USD: '840',
        EUR: '978',
        KZT: '398'
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
     */
    this.getIdentificationData = function (wallet) {
        var options = {
            url: `${apiUri}/identification/v1/persons/${wallet}/identification`
        };

        return get(options);
    }

    /**
     * Identify wallet
     * @link https://developer.qiwi.com/ru/qiwi-wallet-personal/index.html#ident
     * @param {string} wallet Wallet number without plus (+) and with prefix, as example: 79991234567
     * @param {{birthDate:string, firstName:string, middleName:string, lastName:string, passport:string, inn:string, snils:string, oms:string}} requestOptions
     */
    this.identifyWallet = function (wallet, requestOptions) {
        var options = {
            url: `${apiUri}/identification/v1/persons/${wallet}/identification`,
            body: requestOptions
        };

        return post(options);
    }

    /**
     * Get accounts of wallet
     * @link https://developer.qiwi.com/ru/qiwi-wallet-personal/index.html#balances_list
     * @param {string} wallet Wallet number without plus (+) and with prefix, as example: 79991234567
     */
    this.getAccounts = function (wallet) {
        var options = {
            url: `${apiUri}/funding-sources/v2/persons/${wallet}/accounts`,
        };

        return get(options)
    }

    /**
     * Creates new account by alias
     * @link https://developer.qiwi.com/ru/qiwi-wallet-personal/index.html#balance_create
     * @param {string} wallet Wallet number without plus (+) and with prefix, as example: 79991234567
     * @param {string} accountAlias Alias of account name
     */
    this.createAccount = function (wallet, accountAlias) {
        var options = {
            url: `${apiUri}/funding-sources/v2/persons/${wallet}/accounts`,
            body: {
                alias: accountAlias
            }
        };

        return post(options);
    }

    /**
     * Sets default account
     * @link https://developer.qiwi.com/ru/qiwi-wallet-personal/index.html#default_balance
     * @param {string} wallet Wallet number without plus (+) and with prefix, as example: 79991234567
     * @param {string} accountAlias Alias of account name
     */
    this.setDefaultAccount = function (wallet, accountAlias) {
        var options = {
            url: `${apiUri}/funding-sources/v2/persons/${wallet}/accounts/${accountAlias}`,
            headers: headers,
            body: {
                defaultAccount: true
            },
            json: true
        };

        return patch(options);
    }

    /**
     * Get possible aliases of account
     * @link https://developer.qiwi.com/ru/qiwi-wallet-personal/index.html#funding_offer
     * @param {string} wallet Wallet number without plus (+) and with prefix, as example: 79991234567
     */
    this.getPossibleAccountAliases = function (wallet) {
        var options = {
            url: `${apiUri}/funding-sources/v2/persons/${wallet}/accounts/offer`,
        };

        return get(options);
    }

    /**
     * Get information about current account
     * @link https://developer.qiwi.com/ru/qiwi-wallet-personal/index.html#profile
     */
    this.getAccountInfo = function () {
        var options = {
            url: `${apiUri}/person-profile/v1/profile/current`,
        };

        return get(options);
    }

    /**
     * Get operation history 
     * @link https://developer.qiwi.com/ru/qiwi-wallet-personal/index.html#payments_list
     * @param {string} wallet Wallet number without plus (+) and with prefix, as example: 79991234567
     * @param {{rows:number, operation:string, sources:string, startDate:Date, endDate:Date, nextTxnDate:Date, nextTxnId:number}} requestOptions 
     */
    this.getOperationHistory = function (wallet, requestOptions) {
        var options = {
            url: `${apiUri}/payment-history/v2/persons/${wallet}/payments`,
            params: requestOptions,
        };

        return get(options);
    }

    /**
     * Get statistics for operations
     * @link https://developer.qiwi.com/ru/qiwi-wallet-personal/index.html#stat
     * @param {string} wallet Wallet number without plus (+) and with prefix, as example: 79991234567
     * @param {{operation:string, sources:string, startDate:Date, endDate:Date}} requestOptions 
     */
    this.getOperationStatistics = function (wallet, requestOptions) {
        var options = {
            url: `${apiUri}/payment-history/v2/persons/${wallet}/payments/total`,
            params: requestOptions
        };

        return get(options);
    }

    /**
     * Get information about transaction
     * @link https://developer.qiwi.com/ru/qiwi-wallet-personal/index.html#txn_info
     * @param {string} transactionId Transaction Id
     * @param {string} type Transaction type. Possible values: null, IN, OUT (type from ationHistory)
     */
    this.getTransactionInfo = function (transactionId) {
        var options = {
            url: `${apiUri}/payment-history/v2/transactions/${transactionId}`,
        };

        return get(options);
    }

    /**
     * Get receipt by transaction
     * @link https://developer.qiwi.com/ru/qiwi-wallet-personal/index.html#payment_receipt
     * @param {string} transactionId Transaction Id
     * @param {{type:string, format:string}} requestOptions
     */
    this.getReceipt = function (transactionId, requestOptions) {
        var options = {
            url: `${apiUri}/payment-history/v1/transactions/${transactionId}/cheque/file`,
            params: requestOptions,
        };

        return get(options);
    }

    /**
     * Send to qiwi wallet
     * @link https://developer.qiwi.com/ru/qiwi-wallet-personal/index.html#p2p
     * @param {{amount:number, comment:string, account:string}} requestOptions 
     */
    this.toWallet = function (requestOptions) {
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

        return post(options);
    }

    /**
     * Send to mobile phone
     * @link https://developer.qiwi.com/ru/qiwi-wallet-personal/index.html#cell
     * @param {{amount:number, comment:string, account:string}} requestOptions 
     */
    this.toMobilePhone = async function (requestOptions) {
        try {
            var operator = await detectOperator(`7${requestOptions.account}`);
            var options = {
                url: `${apiUri}/sinap/terms/${operator.message}/payments`,
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

            return post(options);
        }
        catch (error) {
            throw error;
        }
    }


    /**
     * Send to card
     * @link https://developer.qiwi.com/ru/qiwi-wallet-personal/index.html#cards
     * @param {{amount:number, comment:string, account:string}} requestOptions 
     */
    this.toCard = async function (requestOptions) {
        try {
            var card = await detectCard(requestOptions.account);
            var options = {
                url: `${apiUri}/sinap/terms/${card.message}/payments`,
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

            return post(options);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Send to bank account
     * @param {{ammount:number,account:string,account_type:number,exp_date:number}} requestOptions 
     * @param {number} recipient 
     */
    this.toBank = function (requestOptions, recipient) {
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

        return post(options);
    }

    /**
     * Get information about commission
     * @param {number} recipient receiver identifier, see this.recipients
     */
    this.checkCommission = function (recipient) {
        var options = {
            url: `${apiUri}/sinap/providers/${recipient}/form`
        };

        return get(options);
    }

    /**
     * Check commission rates
     * @link https://developer.qiwi.com/ru/qiwi-wallet-personal/index.html#rates
     * @param {number} recipient receiver identifier, see this.recipients
     * @param {{account:string, amount: number}} requestOptions options
     */
    this.checkOnlineCommission = function (recipient, requestOptions) {
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

        return post(options);
    }

    /**
     * Get cross rates
     * @link https://developer.qiwi.com/ru/qiwi-wallet-personal/index.html#section-1
     */
    this.getCrossRates = function () {
        var options = {
            url: `${apiUri}/sinap/crossRates`
        };

        return get(options);
    }

    /**
     * Convert currency at wallet
     * @link https://developer.qiwi.com/ru/qiwi-wallet-personal/index.html#CCY
     * @param {{amount:number, currency:string, account:string}} requestOptions
     * account - number of your wallet, example: '+79991234567'
     */
    this.convertCurrency = function (requestOptions) {
        var options = {
            url: `${apiUri}/sinap/api/v2/terms/99/payments`,
            body: {
                id: (1000 * Date.now()).toString(),
                sum: {
                    amount: requestOptions.amount,
                    currency: requestOptions.currency
                },
                paymentMethod: {
                    type: "Account",
                    accountId: "643"
                },
                comment: requestOptions.comment,
                fields: {
                    account: requestOptions.account
                }
            }
        }

        return post(options);
    }

    /**
     * Add webhook by url 
     * @param {string} url Url address
     * @param {number} txnType type of messages. 0 - "In", 1 - "Out". 2 - "All", see this.txnType
     */
    this.addWebHook = function (url, txnType) {
        var options = {
            url: `${apiUri}/payment-notifier/v1/hooks`,
            params: {
                hookType: 1,
                param: url,
                txnType: txnType
            }
        };

        return put(options);
    }

    /**
     * Remove webhook by UUID
     * @param {string} hookId webhook UUID
     */
    this.removeWebHook = function (hookId) {
        var options = {
            url: `${apiUri}/payment-notifier/v1/hooks/${hookId}`
        };

        return del(options);
    }

    /**
     * Get webhook secret key by UUID
     * @param {string} hookId webhook UUID
     */
    this.getWebHookSecret = function (hookId) {
        var options = {
            url: `${apiUri}/payment-notifier/v1/hooks/${hookId}/key`
        };

        return get(options);
    }

    /**
     * Refresh webhook secret key by UUID
     * @param {string} hookId webhook UUID
     */
    this.getNewWebHookSecret = function (hookId) {
        var options = {
            url: `${apiUri}/payment-notifier/v1/hooks/${hookId}/newkey`
        };

        return post(options);
    }

    /**
     * Get information about active webhook for this wallet(token)
     * @link https://developer.qiwi.com/ru/qiwi-wallet-personal/index.html#hook_active
     * @param {function(err,data)} 
     */
    this.getActiveWebHook = function () {
        var options = {
            url: `${apiUri}/payment-notifier/v1/hooks/active`,
        };

        return get(options);
    }

    /**
     * Sends test request to active webhook
     * @link https://developer.qiwi.com/ru/qiwi-wallet-personal/index.html#hook_test
     */
    this.testActiveWebHook = function () {
        var options = {
            url: `${apiUri}/payment-notifier/v1/hooks/test`,
        };

        return get(options);
    }


    /**
     * Detects operator of phone number
     * @link https://developer.qiwi.com/ru/qiwi-wallet-personal/index.html#cell
     * @param {string} phone phone number
     */
    async function detectOperator(phone) {
        var options = {
            url: 'https://qiwi.com/mobile/detect.action',
            params: {
                phone: phone
            },
        };

        const errorMessage = 'Can\'t detect operator';
        try {
            var result = await post(options);
            if (result.code.value == "2")
                throw new Error(errorMessage);
            return result;
        } catch (error) {
            if (error.message != undefined && error.message == errorMessage)
                throw error;

            throw error.response.data;
        }
    }

    /**
     * Detects card type
     * @param {string} cardNumber card number
     */
    async function detectCard(cardNumber) {
        var options = {
            url: 'https://qiwi.com/card/detect.action',
            params: {
                cardNumber: cardNumber
            }
        };

        const errorMessage = 'Wrong card number';
        try {
            var result = await post(options);
            if (result.code.value == "2")
                throw new Error(errorMessage);
            return result;
        } catch (error) {
            if (error.message != undefined && error.message == errorMessage)
                throw error;

            throw error.response.data;
        }
    }

    /**
     * Execute get request
     * @param {{url:string,params:*}} options 
     */
    async function get(options) {
        options.headers = headers;
        try {
            var result = await axios.get(options.url, options);
            if (result.data.errorCode != undefined)
                throw result.data;

            return result.data;
        }
        catch (error) {
            throw error.response.data;
        }
    }

    /**
     * Execute post request
     * @param {{url:string,body:*}} options 
     */
    async function post(options) {
        options.headers = headers;
        try {
            var result = await axios.post(options.url, options.body, options);
            if (result.data.errorCode != undefined)
                throw result.data;

            return result.data;
        }
        catch (error) {
            throw error.response.data;
        }
    }

    /**
     * Execute patch request
     * @param {{url:string,body:*}} options 
     */
    async function patch(options) {
        options.headers = headers;
        try {
            var result = await axios.patch(options.url, options.body, options);
            if (result.data.errorCode != undefined)
                throw result.data;

            return result.data;
        } catch (error) {
            throw error.response.data;
        }
    }

    /**
     * Execute put request
     * @param {{url:string,body:*}} options 
     */
    async function put(options) {
        options.headers = headers;
        try {
            var result = await axios.put(options.url, options.params, options);
            if (result.data.errorCode != undefined)
                throw result.data;

            return result.data;
        } catch (error) {
            throw error.response.data;
        }
    }

    /**
     * Execute delete request
     * @param {{url:string,body:*}} options 
     */
    async function del(options) {
        options.headers = headers;
        try {
            var result = await axios.delete(options.url, options)
            if (result.data.errorCode != undefined)
                throw result.data;

            return result.data;
        } catch (error) {
            throw error.response.data;
        }
    }

}