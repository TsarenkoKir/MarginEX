import axios from 'axios'
import MarketplaceJSON from '../Marketplace.json'
import { GetIpfsUrlFromPinata } from './helpers'
import { quais } from 'quais'


// hits the rpcProvider to get all NFTs, sort the data, and return it
export const getAllNFTs = async (provider) => {
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

// hits the web3provider to prompt user to confirm purchase of NFT, returns transaction status
export const buyNFT = async (provider, tokenId, price) => {
	try {
	  const contract = new quais.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, provider.getSigner());
	  // Отправляем транзакцию и получаем хэш
	  const tx = await contract.executeSale(tokenId, {
		value: quais.utils.parseEther(price.toString()), // Предполагаем, что price - это строка с числом в эфире
		gasLimit: quais.utils.hexlify(150000),
	  });
	  console.log('Transaction sent:', tx);
	  await tx.wait(); // Ожидаем подтверждения транзакции
	  console.log('Transaction confirmed:', tx);
	  return { status: 'success', data: tx.hash }; // Возвращаем хэш транзакции
	} catch (err) {
	  console.error('Error sending transaction:', err);
	  return { status: 'error', data: err.message ? err.message : err }; // Возвращаем сообщение об ошибке
	}
  };
  
  

// hits the web3provider to prompt user to confirm listing of NFT, returns transaction status
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
  

// Function to list an NFT for sale
export const listNFTForSale = async (provider, tokenId, priceInQuai) => {
	console.log(`Attempting to list NFT for sale. Token ID: ${tokenId}, Price in QUAI: ${priceInQuai}`);
  
	try {
	  console.log('Creating contract instance with provider...');
	  const contract = new quais.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, provider.getSigner());
  
	  // Предварительная проверка прав владения NFT
	  const owner = await contract.ownerOf(tokenId);
	  if (owner !== provider.getSigner().getAddress()) {
		console.error("The signer is not the owner of the NFT.");
		return { status: 'error', data: { message: "You must own the NFT to list it for sale." } };
	  }
  
	  // Предварительная проверка состояния листинга NFT
	  const nft = await contract.getListedTokenForId(tokenId);
	  if (nft.currentlyListed) {
		console.error("The NFT is already listed for sale.");
		return { status: 'error', data: { message: "NFT is already listed for sale." } };
	  }
  
	  console.log(`Preparing to list NFT for sale. Token ID: ${tokenId}, Price: ${priceInQuai}`);
	  const transaction = await contract.listNFTForSale(tokenId, priceInQuai);
  
	  console.log('Transaction initiated. Awaiting confirmation...');
	  const receipt = await transaction.wait();
  
	  console.log(`Transaction confirmed with receipt: ${JSON.stringify(receipt)}`);
	  return {
		status: 'success',
		data: {
		  transactionHash: receipt.transactionHash,
		  blockNumber: receipt.blockNumber,
		  // Include any other relevant details from receipt
		}
	  };
	} catch (error) {
	  console.error(`Failed to list NFT for sale: ${error.message}`);
	  return {
		status: 'error',
		data: {
		  message: error.message,
		  // Include any other relevant error details
		}
	  };
	}
  };
  
  
  
  

  
  
