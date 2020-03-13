node-qiwi-api
================
[![npm](https://img.shields.io/npm/v/node-qiwi-api)](https://www.npmjs.com/package/node-qiwi-api)
[![npm](https://img.shields.io/npm/dt/node-qiwi-api.svg)](https://www.npmjs.com/package/node-qiwi-api)
[![npm](https://img.shields.io/npm/dm/node-qiwi-api.svg)](https://www.npmjs.com/package/node-qiwi-api)
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
var Qiwi = require('node-qiwi-api');
var wallet = new Qiwi(token);
```
Now you can get information about your wallet and make money transfers.

Identification data
----------------
```js
wallet.getIdentificationData(wallet, (err, data) => {
  if(err) {
    /*hanle error*/
  }
  console.log(info);
})
**wallet** - wallet number without plus (+) and with prefix (79991234567)
```
Identify wallet
----------------
```js
wallet.identifyWallet(wallet, requestOptions, (err, data) => {
  if(err) {
    /*hanle error*/
  }
  console.log(info);
})
```
**wallet** - wallet number without plus (+) and with prefix (79991234567)

requestOptions includes: 
* **birthDate** - Date of birth (YYYY-MM-DD)
* **firstName** - First name
* **middleName** - Middle name
* **lastName** - Last name
* **passport** - Serial and number of passport 
* **snils** - SNILS number
* **inn** - INN number
* **oms** - OMS number

Information about account
----------------
```js
wallet.getAccountInfo((err, info) => {
  if(err) {
    /*hanle error*/
  }
  console.log(info);
})
```

Balance
----------------
```js
wallet.getBalance((err, balance) => {
  if(err) {
    /*hanle error*/
  }
  console.log(balance);
})
```
Operation history
----------------
```js
wallet.getOperationHistory(requestOptions, (err, operations) => {
  if(err) {
    /*hanle error*/
  }
  console.log(operations);
})
```
requestOptions includes: 
* **rows** - Amount of payments in response. Integer from 1 to 50. Required.
* **operation** - Operation type. ALL - all operations, IN - incoming only, OUT - outgoing only, QIWI_CARD - just payments by QIWI cards (QVC, QVP). Default - ALL
* **sources** - Payment source. Array of values. Allowable values: QW_RUB - ruble account of wallet, QW_USD - usd account of wallet, QW_EUR - euro account of wallet, CARD - added and not added to wallet cards, MK - account of mobile operator. If not presented, you will receive info from all sources
* **startDate** - Start date (YYYY-MM-ddThh:mm:ssZ). By default equals yesterday date. Use only with endDate
* **endDate** - End date (YYYY-MM-ddThh:mm:ssZ). By default equals current date. Use only with startDate
* **nextTxnDate** - Transaction date (YYYY-MM-ddThh:mm:ssZ), (see nextTxnDate in response). Use only with nextTxnId
* **nextTxnId** - Previous transaction number (see nextTxnId in response). Use only with nextTxnDate
Maximum interval between startDate and endDate - 90 days.

As example - information about 25 outgoing payments can be get by next way:
```js
wallet.getOperationHistory({rows: 25, operation: "OUT"}, (err, operations) => {
  /* some code */
})
```
Operations statistics
----------------
If you want to see statistics for summs of payments by period of time use this method. Example:
```js
wallet.getOperationStatistics(requestOptions, (err, stats) => {
  if(err) {
    /*hanle error*/
  }
  console.log(stats);
})
```
requestOptions: **operation, sources, startDate, endDate** - Parameters are similar to **getOperationHistory**.

Get transaction info
----------------
Example:
```js
wallet.getTransactionInfo(transactionId, (err, data) => {
  if(err) {
    /*hanle error*/
  }
  console.log(stats);
})
```

Get transaction receipt
----------------
Example:
```js
wallet.getReceipt(transactionId, requestOptions, (err, data) => {
  if(err) {
    /*hanle error*/
  }
  console.log(stats);
})
```
requestOptions includes: 
* **type** - Transaction type from getOperationHistory
* **format** - File format, see wallet.receiptFormat

Transfer to Qiwi wallet
----------------
```js
wallet.toWallet({ amount: '0.01', comment: 'test', account: '+79261234567' }, (err, data) => {
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
wallet.toMobilePhone({ amount: '0.01', comment: 'test', account: '9261234567' }, (err, data) => {
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
wallet.toCard({ amount: '0.01', comment: 'test', account: '5213********0000' }, (err, data) => {
  if(err) {
    /* handle err*/
    }
  console.log(data);
})
```

Transfer to bank account
----------------
```js
wallet.toBank({ amount: '0.01', account: '5213********0000', account_type: '1', exp_date: 'MMYY' }, recipient, (err, data) => {
  if(err) {
    /* handle err*/
    }
  console.log(data);
})
```
* **ammount** - Ammount of money
* **account** - Receiver card/account number
* **account_type** - Type of bank identificator.
  * for Alfa-bank (Альфа-Банк) - 1
  * for OTP Bank (АО ОТП БАНК) - 1
  * for Rosselhozbank (АО РОССЕЛЬХОЗБАНК) - 5
  * for Russian Standard (Русский Стандарт) - 1
  * for VTB (ВТБ ПАО) - 5
  * for Promsvyazbank (Промсвязьбанк) - 7
  * for Sberbank (ПАО Сбербанк) - 5
  * for Renessans Credit (Ренессанс Кредит) - 1
  * for Moscow Credit Bank (ПАО Московский кредитный банк) - 5
* **exp_date** - Card expiration date (MMYY), в формате ММГГ (as examlpe: 0218 - february 2018). Only for card transfer.
* **recipient** -
  * 464 - Alfa-bank (Альфа-Банка)
  * 466 - Tinkoff Bank (Тинькофф Банк)
  * 804 - OTP Bank (АО ОТП БАНК)
  * 810 - Rosselhozbank (АО РОССЕЛЬХОЗБАНК)
  * 815 - Russian Standard (Русский Стандарт)
  * 816 - VTB (ВТБ ПАО)
  * 821 - Promsvyazbank (Промсвязьбанк)
  * 870 - Sberbank (ПАО Сбербанк)
  * 881 - Renessans Credit (Ренессанс Кредит)
  * 1135 - Moscow Credit Bank (ПАО Московский кредитный банк)


Check commission rates
----------------
```js
wallet.checkOnlineCommission(recipient, requestOptions, (err, data) => {
  if(err) {
    /* handle err*/
    }
  console.log(data);
})
```
**recipient** - Allowable values stored in wallet.recipients

requestOptions includes: 
* **account** - Phone number with international prefix or card/account number, as example 79991234567
* **amount** - Amount of money for calculate commission

Check operation commission
----------------
```js
wallet.checkCommission(recipient, (err, data) => {
  if(err) {
    /* handle err*/
    }
  console.log(data);
})
```
data.content.terms.commission.ranges[i]:
* **recipient** - Allowable values stored in wallet.recipients
Response contains:
* **bound** - Payment amount, starting from which the condition applies
* **rate** - Commission (absolute multiplier)
* **fixed** - Fixed amount of commission
