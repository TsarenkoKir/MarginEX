import axios from 'axios'
import MarketplaceJSON from '../Marketplace.json'
import { GetIpfsUrlFromPinata } from './helpers'
import { quais } from 'quais'

export const getAllNFTs = async (provider) => {
	console.log('Fetching all NFTs')
	const contract = new quais.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, provider)
	const NFTs = await contract.getAllNFTs()
	const NFTItems = await Promise.all(
		NFTs.map(async (NFT) => {
			var tokenURI = await contract.tokenURI(NFT.tokenId)
			tokenURI = GetIpfsUrlFromPinata(tokenURI)
			const metadata = await axios.get(tokenURI)
			return {
				price: quais.utils.formatEther(NFT.price),
				tokenId: NFT.tokenId.toNumber(),
				seller: NFT.seller,
				owner: NFT.owner,
				name: metadata.data.name,
				description: metadata.data.description,
				image: metadata.data.image,
			}
		})
	)
	return NFTItems
}

// --------- Opted for a simple filter instead of a contract call to get user NFTs ---------
// export const getUserNFTs = async (provider) => {
// 	console.log('Fetching user NFTs')
// 	const contract = new quais.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, provider.getSigner())
// 	const NFTs = await contract.getMyNFTs()
// 	const NFTItems = await Promise.all(
// 		NFTs.map(async (NFT) => {
// 			var tokenURI = await contract.tokenURI(NFT.tokenId)
// 			tokenURI = GetIpfsUrlFromPinata(tokenURI)
// 			const metadata = await axios.get(tokenURI)
// 			return {
// 				price: quais.utils.formatEther(NFT.price),
// 				tokenId: NFT.tokenId.toNumber(),
// 				seller: NFT.seller,
// 				owner: NFT.owner,
// 				name: metadata.data.name,
// 				description: metadata.data.description,
// 				image: metadata.data.image,
// 			}
// 		})
// 	)
// 	return NFTItems
// }

export const buyNFT = async (provider, tokenId, price) => {
	let res
	const contract = new quais.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, provider.getSigner())
	await contract
		.executeSale(tokenId, {
			value: quais.utils.parseEther(price),
			gasLimit: quais.utils.hexlify(150000),
		})
		.then((tx) => {
			res = { status: 'success', data: 'Transaction Broadcasted' }
		})
		.catch((err) => {
			console.log(err)
			res = { status: 'error', data: err }
		})

	return res
}

export const createNFT = async (provider, metadataURL, price) => {
	console.log('Creating NFT')
	let res
	const contract = new quais.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, provider.getSigner())
	const listingPrice = await contract.getListPrice()
	const listingPriceString = listingPrice.toString()
	await contract
		.createToken(metadataURL, price, {
			value: listingPriceString,
			gasLimit: quais.utils.hexlify(350000),
		})
		.then((tx) => {
			console.log('Transaction broadcasted')
			res = { status: 'success', data: tx.hash }
		})
		.catch((err) => {
			console.log('Error', err)
			res = { status: 'error', data: err }
		})

	return res
}
