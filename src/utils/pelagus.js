import { getShardFromAddress } from 'quais/lib/utils'

// requestAccounts should be triggered by a user action, prompts connection request via extension pop-up
// if user accepts, account is returned
// if user denies, a 4001 error is printed to the console and nothing happens on the user side, undefined is returned
export const requestAccounts = async (provider) => {
	if (!provider) {
		console.log('Provider is null');
		return
	}
	let account
	await provider
		.send('quai_requestAccounts')
		.then((accounts) => {
			if (accounts.length !== 0) {
				account = {
					addr: accounts[0],
					shard: getShardFromAddress(accounts[0]),
				}
			} else {
				account = undefined
			}
		})
		.catch((err) => {
			console.log('Error getting accounts.', err)
		})
	return account
}

// getAccounts should only run in the background, checks for an existing wallet connection
// if user is connected, account is returned
// if user is not connected, undefined is returned
export const getAccounts = async (provider) => {
	if (!provider) {
		console.log('provider is null');
		return;
	}
	let account
	await provider
		.send('quai_accounts')
		.then((accounts) => {
			if (accounts.length !== 0) {
				account = {
					addr: accounts[0],
					shard: getShardFromAddress(accounts[0]),
				}
			} else {
				account = undefined
			}
		})
		.catch((err) => {
			console.log('Error getting accounts.', err)
			console.error(err)
		})
	return account
}
