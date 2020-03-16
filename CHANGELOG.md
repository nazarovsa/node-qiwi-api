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
* convertCurrency - convert currenty at wallet

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