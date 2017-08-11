var request = require("request");

function Qiwi(token) {
    this.token = token;
    this.headers = {
        'Accept': 'application/json',
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + this.token
    }
    this.apiUri = "https://edge.qiwi.com/";

    this.getAccountInfo = function (callback) {
        var options = {
            url: this.apiUri + 'person-profile/v1/profile/current',
            headers: this.headers
        };

        request.get(options, (error, response, body) => {
            callback(error, JSON.parse(body));
        })
    }

    this.getBalance = function (callback) {
        var options = {
            url: this.apiUri + 'funding-sources/v1/accounts/current',
            headers: this.headers
        };

        request.get(options, (error, response, body) => {
            callback(error, JSON.parse(body));
        })
    }

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
                }
            };

            request.get(options, (error, response, body) => {
                callback(error, JSON.parse(body));
            });
        });
    }

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
                }
            };

            request.get(options, (error, response, body) => {
                callback(error, JSON.parse(body));
            });
        });
    }

    this.toWallet = function (requestOptions, callback) {
        var options = {
            url: this.apiUri + 'sinap/terms/99/payments',
            headers: this.headers,
            body: {
                id: requestOptions.id.toString(),
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

    this.toMobilePhone = function (requestOptions, callback) {
        detectOperator('7' + requestOptions.account, (err, data) => {
            if (err || data.code.value == "2") {
                throw new Error();
            }
            else {
                var options = {
                    url: this.apiUri + 'sinap/terms/' + data.message + '/payments',
                    headers: this.headers,
                    body: {
                        id: requestOptions.id.toString(),
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

    this.toCard = function (requestOptions, callback) {
        detectCard(requestOptions.account, (err, data) => {
            if (err || data.code.value == "2") {
                throw new Error();
            }
            else {
                var options = {
                    url: this.apiUri + 'sinap/terms/' + data.message + '/payments',
                    headers: this.headers,
                    body: {
                        id: requestOptions.id.toString(),
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


    function detectOperator(phone, callback) {
        var options = {
            url: 'https://qiwi.com/mobile/detect.action',
            headers: this.headers,
            qs: {
                phone: phone
            }
        };

        request.post(options, (error, response, body) => {
            callback(error, JSON.parse(body));
        });
    }

    function detectCard(cardNumber, callback) {
        var options = {
            url: 'https://qiwi.com/card/detect.action',
            headers: this.headers,
            qs: {
                cardNumber: cardNumber
            }
        };

        request.post(options, (error, response, body) => {
            callback(error, JSON.parse(body));
        });
    }
}


module.exports = {
    Qiwi: Qiwi
}