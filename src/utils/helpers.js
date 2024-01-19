export const shortenAddress = (address) => {
	return address.slice(0, 5) + '...' + address.slice(-3)
}

export const GetIpfsUrlFromPinata = (pinataUrl) => {
	var IPFSUrl = pinataUrl.split('/')
	const lastIndex = IPFSUrl.length
	IPFSUrl = 'https://ipfs.io/ipfs/' + IPFSUrl[lastIndex - 1]
	return IPFSUrl
}

// helper to create block explorer urls, takes in a type (transaction, address, block) and input (hash, address, block number)
export const createBlockExplorerUrl = (type, input) => {
	let url
	const baseURL = 'https://cyprus2.colosseum.quaiscan.io/'
	switch (type) {
		case 'transaction':
			url = baseURL + 'tx/' + input
			break
		case 'address':
			url = baseURL + 'address/' + input
			break
		case 'block':
			if (typeof input === 'number') input = input.toString()
			url = baseURL + 'block/' + input
			break
		default:
			url = baseURL
	}
	return url
}

// basic config for toast notifications
export const toastConfig = {
	position: 'top-center',
	autoClose: 5000,
	hideProgressBar: false,
	closeOnClick: true,
	pauseOnHover: true,
	draggable: true,
	progress: undefined,
	theme: 'dark',
}

// helper to get plain text shard names from shard ids
export const getShardNameFromId = (shardId) => {
	switch (shardId) {
		case 'zone-0-0':
			return 'Cyprus 1'
		case 'zone-0-1':
			return 'Cyprus 2'
		case 'zone-0-2':
			return 'Cyprus 3'
		case 'zone-1-0':
			return 'Paxos 1'
		case 'zone-1-1':
			return 'Paxos 2'
		case 'zone-1-2':
			return 'Paxos 3'
		case 'zone-2-0':
			return 'Hydra 1'
		case 'zone-2-1':
			return 'Hydra 2'
		case 'zone-2-2':
			return 'Hydra 3'
		default:
			return 'Unknown Shard'
	}
}

// filter for user NFTs from allNFTs
export const filterNFTsByOwner = (NFTs, owner) => {
	return NFTs.filter((NFT) => NFT.seller.toLowerCase() === owner)
}
