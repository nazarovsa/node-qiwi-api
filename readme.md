node-qiwi-api
================
[![npm](https://img.shields.io/npm/v/node-qiwi-api)](https://www.npmjs.com/package/node-qiwi-api)
[![npm](https://img.shields.io/npm/dt/node-qiwi-api.svg)](https://www.npmjs.com/package/node-qiwi-api)
[![npm](https://img.shields.io/npm/dw/node-qiwi-api.svg)](https://www.npmjs.com/package/node-qiwi-api)
----------------
Official [documentation](https://developer.qiwi.com/qiwiwallet/qiwicom_ru.html) for Qiwi api.

Get started
----------------
Firstly, get access token at [Qiwi](https://qiwi.com/api).
```
npm install node-qiwi-api
```
Initialise new wallet instance with your access token:
```js
var Qiwi = require('node-qiwi-api').Qiwi;
var Wallet = new Qiwi(token);
```
Now you can get information about your wallet and make money transfers.

Information about account
----------------
```js
Wallet.getAccountInfo((err, info) => {
  if(err) {
    /*hanle error*/
  }
  console.log(info);
})
```

Balance
----------------
```js
Wallet.getBalance((err, balance) => {
  if(err) {
    /*hanle error*/
  }
  console.log(balance);
})
```
Operation history
----------------
```js
Wallet.getOperationHistory(requestOptions, (err, operations) => {
  if(err) {
    /*hanle error*/
  }
  console.log(operations);
})
```
requestOptions включают в себя: 
* **rows** - Amount of payments in response. Integer from 1 to 50. Required.
* **operation** - Operation type. ALL - all operations, IN - incoming only, OUT - outgoing only, QIWI_CARD - just payments by QIWI cards (QVC, QVP). Default - ALL
* **sources** - Payment source. Каждый источник задается как отдельный параметр и нумеруется элементом массива, начиная с нуля (sources[0], sources[1] и т.д.). Допустимые значения: QW_RUB - рублевый счет кошелька, QW_USD - счет кошелька в долларах, QW_EUR - счет кошелька в евро, CARD - привязанные и непривязанные к кошельку банковские карты, MK - счет мобильного оператора. Если не указаны, учитываются все источники
* **startDate** - Start date (YYYY-MM-ddThh:mm:ssZ). By default equals yesterday date. Use only with endDate
* **endDate** - End date (YYYY-MM-ddThh:mm:ssZ). By default equals current date. Use only with startDate
* **nextTxnDate** - Transaction date (YYYY-MM-ddThh:mm:ssZ), (see nextTxnDate in response). Use only with nextTxnId
* **nextTxnId** - Previous transaction number (see nextTxnId in response). Use only with nextTxnDate
Maximum interval between startDate and endDate - 90 days.

As example - information about 25 outgoing payments can be get by next way:
```js
Wallet.getOperationHistory({rows: 25, operation: "OUT"}, (err, operations) => {
  /* some code */
})
```
Operations statistics
----------------
If you want to see statistics for summs of payments by period of time use this method. Example:
```js
Wallet.getOperationStats(requestOptions, (err, stats) => {
  if(err) {
    /*hanle error*/
  }
  console.log(stats);
})
```
requestOptions: **operation, sources, startDate, endDate** - Parameters are similar to **getOperationHistory**.

Transfer to Qiwi wallet
----------------
```js
Wallet.toWallet({ amount: '0.01', comment: 'test', account: '+79261234567' }, (err, data) => {
  if(err) {
    /* handle err*/
    }
  console.log(data);
})
```
* **amount** - Ammount of money
* **comment** - Commentary for payment.
* **account** - Receiver phone number (with international prefix)

Transfer to mobile phone
----------------
Similar to "transfer to qiwi wallet", but  number without international prefix:
```js
Wallet.toMobilePhone({ amount: '0.01', comment: 'test', account: '9261234567' }, (err, data) => {
  if(err) {
    /* handle err*/
    }
  console.log(data);
})
```

Transfer to card
----------------
Similar to other transfers, but account is card number:
```js
Wallet.toCard({ amount: '0.01', comment: 'test', account: '5213********0000' }, (err, data) => {
  if(err) {
    /* handle err*/
    }
  console.log(data);
})
```

Transfer to bank account
----------------
```js
Wallet.toBank({ amount: '0.01', account: '5213********0000', account_type: '1', exp_date: 'MMYY' }, recipient, (err, data) => {
  if(err) {
    /* handle err*/
    }
  console.log(data);
})
```
* **ammount** - Ammount of money
* **account** - Receiver card/account number
* **account_type** - Type of bank identificator.
  * for Tinkoff Bank (Тинькофф Банк) - card “1”, contract “3”
  * for Alfa-bank (Альфа-Банк) - card “1”, account “2”
  * for Promsvyazbank (Промсвязьбанк) - card “7”, account “9”
  * for Russian Standard (Русский Стандарт) - card “1”, account “2”, contract “3”
* **exp_date** - Card expiration date (MMYY), в формате ММГГ (as examlpe: 0218 - february 2018). Only for card transfer.
* **recipient** -
  * 466 - Tinkoff Bank (Тинькофф Банк)
  * 464 - Alfa-bank (Альфа-Банка)
  * 821 - Promsvyazbank (Промсвязьбанк)
  * 815 - Russian Standard (Русский Стандарт)

Check operation commission
----------------
```js
Wallet.checkComission(recipient, (err, data) => {
  if(err) {
    /* handle err*/
    }
  console.log(data);
})
```
data.content.terms.commission.ranges[i]:
* **recipient** - Allowable values stored in this.recipients. List at [official site](https://developer.qiwi.com/qiwiwallet/qiwicom_ru.html#commission).
Response contains:
* **bound** - Payment amount, starting from which the condition applies
* **rate** - Commission (absolute multiplier)
* **fixed** - Fixed amount of commission
