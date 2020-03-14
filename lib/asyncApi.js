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
     * Get accounts of wallet
     * @link https://developer.qiwi.com/ru/qiwi-wallet-personal/index.html#balances_list
     * @param {string} wallet Wallet number without plus (+) and with prefix, as example: 79991234567
     * @param {function(err,data)} callback 
     */
    this.getAccounts = function (wallet) {
        var options = {
            url: `${apiUri}/funding-sources/v2/persons/${wallet}/accounts`,
        };

        return get(options)
    }


    /**
     * Send to mobile phone
     * @param {{amount:number, comment:string, account:string}} requestOptions 
     * @param {function(err,data)} callback 
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

        const errorMessage = 'Can\'t detect operator.';
        try {
            var result = await post(options);
            if (result.code.value == "2")
                throw new Error(errorMessage);
            return result;
        } catch (error) {
            if(error.message != undefined && error.message == errorMessage)
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
     * @param {function(err,data)} callback 
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