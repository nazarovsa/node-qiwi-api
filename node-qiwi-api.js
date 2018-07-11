var request = require("request");

/**
 * Qiwi api
 * @param {string} token 
 * @link https://github.com/InsightAppDev/node-qiwi-api
 */
function Qiwi(token) {
    this.recipients = {
        qiwi: 99,
        visa_rus: 1963,
        mastercard_rus: 21013,
        visa_sng: 1960,
        mastercard_sng: 21012,
        mir: 31652,
        tinkoff: 466,
        alfa: 464,
        promsvyaz: 821,
        russkiy_standard: 815
    }
    this.token = token;
    this.headers = {
        'Accept': 'application/json',
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + this.token
    }
    this.apiUri = "https://edge.qiwi.com/";

    this.txnType = {
        "IN": 0,
        "OUT": 1,
        "ALL": 2
    }

    /**
     * Возвращает информацию о текущем аккаунте
     * @param {function(err,data)} callback 
     */
    this.getAccountInfo = function (callback) {
        var options = {
            url: this.apiUri + 'person-profile/v1/profile/current',
            headers: this.headers,
            json: true
        };

        request.get(options, (error, response, body) => {
            callback(error, body);
        });
    }

    /**
     * Возвращает информацию о балансе аккаунта
     * @param {function(err,data)} callback 
     */
    this.getBalance = function (callback) {
        var options = {
            url: this.apiUri + 'funding-sources/v1/accounts/current',
            headers: this.headers,
            json: true
        };

        request.get(options, (error, response, body) => {
            callback(error, body);
        });
    }

    /**
     * Возвращает историю операций аккаунта
     * @param {{rows:number, operation:string, sources:string, startDate:Date, endDate:Date, nextTxnDate:Date, nextTxnId:number} requestOptions 
     * @param {function(err,data)} callback 
     */
    this.getOperationHistory = function (requestOptions, callback) {
        this.getAccountInfo((err, data) => {
            var options = {
                url: this.apiUri + 'payment-history/v1/persons/' + data.authInfo.personId + '/payments',
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

            request.get(options, (error, response, body) => {
                callback(error, body);
            });
        });
    }

    /**
     * Возвращает статистику по операциям
     * @param {{operation:string, sources:string, startDate:Date, endDate:Date}} requestOptions 
     * @param {function(err,data)} callback 
     */
    this.getOperationStats = function (requestOptions, callback) {
        this.getAccountInfo((err, data) => {
            var options = {
                url: this.apiUri + 'payment-history/v1/persons/' + data.authInfo.personId + '/payments/total',
                headers: this.headers,
                qs: {
                    operation: requestOptions.operation,
                    sources: requestOptions.sources,
                    startDate: requestOptions.startDate,
                    endDate: requestOptions.endDate
                },
                json: true
            };

            request.get(options, (error, response, body) => {
                callback(error, body);
            });
        });
    }

    /**
     * Перевод средств на qiwi кошелек
     * @param {{amount:number, comment:string, account:string}} requestOptions 
     * @param {function(err,data)} callback 
     */
    this.toWallet = function (requestOptions, callback) {
        var options = {
            url: this.apiUri + 'sinap/terms/99/payments',
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

        request.post(options, (error, response, body) => {
            callback(error, body);
        });
    }

    /**
     * Перевод средств на мобильный телефон
     * @param {{amount:number, comment:string, account:string}} requestOptions 
     * @param {function(err,data)} callback 
     */
    this.toMobilePhone = function (requestOptions, callback) {
        detectOperator('7' + requestOptions.account, (err, data) => {
            if (err || data.code.value == "2") {
                throw new Error('Can\'t detect operator.');
            }
            else {
                var options = {
                    url: this.apiUri + 'sinap/terms/' + data.message + '/payments',
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

                request.post(options, (error, response, body) => {
                    if (typeof body.code != 'undefined') error = body;
                    callback(error, body);
                });
            }
        });
    }

    /**
     * Перевод стредств на карту
     * @param {{amount:number, comment:string, account:string}} requestOptions 
     * @param {function(err,data)} callback 
     */
    this.toCard = function (requestOptions, callback) {
        detectCard(requestOptions.account, (err, data) => {
            if (err || data.code.value == "2") {
                callback(new Error('Wrong card number!', null));
            }
            else {
                var options = {
                    url: this.apiUri + 'sinap/terms/' + data.message + '/payments',
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

                request.post(options, (error, response, body) => {
                    callback(error, body);
                });
            }
        });
    }

    /**
     * Перевод на банковский счет
     * @param {{ammount:number,account:string,account_type:number,exp_date:number}} requestOptions 
     * @param {number} recipient 
     * @param {function(err,data)} callback 
     */
    this.toBank = function (requestOptions, recipient, callback) {
        var options = {
            url: this.apiUri + 'sinap/terms/' + recipient + '/payments',
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

        request.post(options, (error, response, body) => {
            callback(error, body);
        });
    }

    /**
     * Проверяет значение комиссии по операции
     * @param {number} recipient идентификатор получателя (this.recipients)
     * @param {*} callback 
     */
    this.checkComission = function (recipient, callback) {
        var options = {
            url: this.apiUri + 'sinap/providers/' + recipient + '/form',
            json: true
        };

        request.get(options, (error, response, body) => {
            callback(error, body);
        });
    }

    function detectOperator(phone, callback) {
        var options = {
            url: 'https://qiwi.com/mobile/detect.action',
            headers: this.headers,
            qs: {
                phone: phone
            },
            json: true
        };

        request.post(options, (error, response, body) => {
            callback(error, body);
        });
    }

    this.detectCard = function (cardNumber, callback) {
        var options = {
            url: 'https://qiwi.com/card/detect.action',
            headers: this.headers,
            qs: {
                cardNumber: cardNumber
            },
            json: true
        };

        request.post(options, (error, response, body) => {
            callback(error, body);
        });
    }

    /**
     * Добавляет вебхук по заданному url 
     * @param {string} url Url адрес вебхука
     * @param {number} txnType тип сообщений. 0 - "Входящие", 1 - "Исходящие". 2 - "Все". (this.txnType)
     */
    this.addWebHook = function (url, txnType, callback) {
        var options = {
            url: this.apiUri + 'payment-notifier/v1/hooks',
            headers: this.headers,
            qs: {
                hookType: 1,
                param: url,
                txnType: txnType
            },
            json: true
        };

        request.put(options, (error, response, body) => {
            callback(error, body);
        });
    }

    /**
     * Удаляет вебхук с заданным UUID
     * @param {string} hookId UUID вебхука
     * @param {*} callback 
     */
    this.removeWebHook = function (hookId, callback) {
        var options = {
            url: this.apiUri + 'payment-notifier/v1/hooks/' + hookId,
            headers: this.headers,
            json: true
        };

        request.delete(options, (error, response, body) => {
            callback(error, body);
        });
    }

    /**
     * Получает секретный ключ вебхука по UUID
     * @param {string} hookId UUID
     * @param {*} callback 
     */
    this.getWebHookSecret = function (hookId, callback) {
        var options = {
            url: this.apiUri + 'payment-notifier/v1/hooks/' + hookId + '/key',
            headers: this.headers,
            json: true
        };

        request.get(options, (error, response, body) => {
            callback(error, body);
        });
    }

    /**
     * Обновляет секретный ключ вебхука по UUID
     * @param {string} hookId UUID
     * @param {*} callback 
     */
    this.requestNewWebHookSecret = function (hookId, callback) {
        var options = {
            url: this.apiUri + 'payment-notifier/v1/hooks/' + hookId + '/newkey',
            headers: this.headers,
            json: true
        };

        request.post(options, (error, response, body) => {
            callback(error, body);
        });
    }

    /**
     * Возвращает данные об активнон вебхуке для данного кощелька(токена)
     * @param {*} callback
     */
    this.getActiveWebHook = function (callback) {
        var options = {
            url: this.apiUri + 'payment-notifier/v1/hooks/active',
            headers: this.headers,
            json: true
        };

        request.get(options, (error, response, body) => {
            callback(error, body);
        });
    }

    /**
     * Отправляет тестовый запрос на активный вебхук
     * @param {*} callback 
     */
    this.testActiveWebHook = function (callback) {
        var options = {
            url: this.apiUri + 'payment-notifier/v1/hooks/test',
            headers: this.headers,
            json: true
        };

        request.get(options, (error, response, body) => {
            callback(error, body);
        });
    }
}

module.exports = {
    Qiwi: Qiwi
}
