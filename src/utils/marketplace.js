import axios from 'axios'
import MarketplaceJSON from '../Marketplace.json'
import { GetIpfsUrlFromPinata } from './helpers'
import { quais } from 'quais'


// hits the rpcProvider to get all NFTs, sort the data, and return it
export const getAllNFTs = async (provider) => {
	const contract = new quais.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, provider)
	const NFTs = await contract.getAllNFTs()
	const NFTItems = await Promise.all(
		NFTs
		.filter(async (NFT) => {
			return NFT.listed;
		  })
		  .map(async (NFT) => {
			var tokenURI = await contract.tokenURI(NFT.tokenId)
			tokenURI = GetIpfsUrlFromPinata(tokenURI)
			const metadata = await axios.get(tokenURI)
			return {
				price: quais.utils.formatEther(NFT.price),
				tokenId: NFT.tokenId.toNumber(),
				seller: NFT.seller,
				owner: NFT.owner,
				onSale: NFT.onSale,
				name: metadata.data.name,
				description: metadata.data.description,
				image: metadata.data.image,
			}
		})
	)
	return NFTItems
}

// hits the web3provider to prompt user to confirm purchase of NFT, returns transaction status
export const buyNFT = async (provider, tokenId, price) => {
	let res
	const contract = new quais.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, provider.getSigner())
	await contract
		.executeSale(tokenId, {
			value: quais.utils.parseEther(price),
			gasLimit: quais.utils.hexlify(150000),
		})
		.then((tx) => {
			res = { status: 'success', data: tx.hash }
		})
		.catch((err) => {
			res = { status: 'error', data: err }
		})

	return res
};
  
  
// hits the web3provider to prompt user to confirm listing of NFT, returns transaction status
export const createNFT = async (provider, metadataURL, price) => {
	console.log('Creating NFT')
	let res
	const contract = new quais.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, provider.getSigner())
	const listingPrice = await contract.getListingPrice()
	const listingPriceString = listingPrice.toString()
	await contract
		.createToken(metadataURL, price, true, {
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
  

// Function to list an NFT for sale
export const listNFTForSale = async (provider, tokenId, priceInQuai) => {
	let res
	console.log(`Attempting to list NFT for sale. Token ID: ${tokenId}, Price in QUAI: ${priceInQuai}`);
  
	console.log('Creating contract instance with provider...');
	const contract = new quais.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, provider.getSigner());

	// Предварительная проверка прав владения NFT
	const tokenowner = await contract.ownerOf(tokenId);
	const owner = await provider.getSigner().getAddress();
	if (owner !== tokenowner) {
		console.error("The signer is not the owner of the NFT.");
		return { status: 'error', data: { message: "You must own the NFT to list it for sale." } };
	}

	console.log(`Preparing to list NFT for sale. Token ID: ${tokenId}, Price: ${priceInQuai}`);

	await contract
		.updateToken(tokenId, priceInQuai, true, {
			gasLimit: quais.utils.hexlify(180000),
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
};
