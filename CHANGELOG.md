2.1.1
=====================
Add
---------------------
* toOther - payment method, that can help with making transfers to Yandex.Money, Steam etc.

Update
---------------------
* Fixed spelling of "ammount" in asyncApi.js and callbackApi.js

2.1.0
=====================
Add
---------------------
* getInvoices - get invoices
* payInvoice - pay invoice
* cancelInvoice - cancel not payed invoice

2.0.0
=====================
Add
---------------------
* getAccounts - get wallet accounts
* createAccount - create account in new currency by alias
* setDefaultAccount - set default account
* getPossibleAccountAliases - get possible account aliases
* getIdentificationData - get wallet identification data
* getCrossRates - get exchange rates
* getTransactionInfo - get information about transaction
* getReceipt - get receipt of transaction
* checkOnlineCommission - get information about future operation commission
* identifyWallet - identify wallet 
* convertCurrency - convert currency at wallet
* toRequisites - pay by requisites

Update
---------------------
* README.md
* recipients
* getOperationHistory - update path to v2
* getOperationStatistics - update path to v2
* getOperationHistory and getOperationStatistics - now accepts wallet into arguments and not calling getAccountInfo anymore

Rename
---------------------
* getOperationStats -> getOperationStatistics
* requestNewWebHookSecret -> getNewWebHookSecret

Remove
---------------------
* getBalance - now you can get same data from getAccounts

Infrastructure
---------------------
* Add async api
* Replace request with axios