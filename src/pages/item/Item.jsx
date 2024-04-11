import { useEffect, useState } from 'react'
import { ThreeCircles } from 'react-loader-spinner'
import { useLocation } from 'react-router-dom'
import { buyNFT, listNFTForSale } from '../../utils/marketplace'
import { toastConfig, createBlockExplorerUrl } from '../../utils/helpers'
import { toast } from 'react-toastify'
import { ToastMessage } from '../../components/toast/ToastMessage'
import { pollFor } from 'quais-polling'
import './item.css'
import { quais } from 'quais'




const Item = ({ provider, user, fetchAllNFTs, isCyprus1 }) => {
	const [loading, setLoading] = useState(false);
	const [isUserOwner, setIsUserOwner] = useState(false);
	const [showResellModal, setShowResellModal] = useState(false); // новое состояние для модального окна
	const [resellPrice, setResellPrice] = useState(''); // новое состояние для цены перепродажи
	const location = useLocation();
	const nftItem = location.state.data;

	/*
  On page load, check if user is owner of NFT, render different UI/buttons based on this
  - Re-runs check if user, shard, or nftItem.seller changes
  */
  useEffect(() => {
    if (user && nftItem.seller && user.addr.toLowerCase() === nftItem.seller.toLowerCase()) {
      setIsUserOwner(true);
    }
  }, [user, nftItem.seller]);

	/*
  Function to purchase NFT
  - Calls buyNFT function from marketplace.js, passes selected NFT data
  - If successful, polls for transaction receipt, if successful, fetches all NFTs again
  - If unsuccessful, displays error message
  - Handles loading state for animation
  */
  async function purchaseNFT() {
	setLoading(true);
	try {
	  console.log('Attempting to purchase NFT with token ID:', nftItem.tokenId);
	  console.log('Price before conversion:', nftItem.price);
	  
	  // Отправляем запрос на покупку NFT
	  const buyResponse = await buyNFT(provider.web3Provider, nftItem.tokenId, nftItem.price);
	  
	  // Логируем полный ответ, чтобы увидеть все данные
	  console.log('Full response from buyNFT:', buyResponse);
  
	  if (buyResponse.status === 'success') {
		// Предположим, что buyResponse.data - это хэш транзакции, если это не так, найдите правильный ключ в объекте buyResponse
		const transactionHash = buyResponse.data; 
		console.log('Transaction hash:', transactionHash);
  
		// Передаем хэш транзакции для получения квитанции о транзакции
		const receipt = await pollFor(provider.rpcProvider, 'getTransactionReceipt', [transactionHash], 1.5, 1);
		console.log('Transaction receipt:', receipt);
  
		if (receipt && receipt.logs.length !== 0) {
		  toast(
			<ToastMessage
			  title='Purchase Successful'
			  link={{ href: createBlockExplorerUrl('transaction', receipt.transactionHash), text: 'View on Explorer' }}
			/>,
			toastConfig
		  );
		  fetchAllNFTs(provider.rpcProvider);
		} else {
		  toast(
			<ToastMessage
			  title='Purchase Failed'
			  text='Transaction reverted or logs are empty'
			  link={{ href: createBlockExplorerUrl('transaction', receipt.transactionHash), text: 'View on Explorer' }}
			/>,
			toastConfig
		  );
		}
	  } else {
		// Обработка неудачных ответов от buyNFT
		console.error('buyNFT response status was not success:', buyResponse);
		toast(
		  <ToastMessage
			title='Purchase Failed'
			text={buyResponse.data.message || 'Unknown error'}
		  />,
		  toastConfig
		);
	  }
	} catch (e) {
	  console.error('Exception caught during purchase:', e);
	  alert(`Error during purchase: ${e.message || e.toString()}`);
	} finally {
	  setLoading(false);
	}
  }

  // Функция для перевыставления NFT на продажу
  async function handleResell() {
	setLoading(true);
	try {
		// Преобразование цены в нужный формат
	  const price = quais.utils.parseUnits(resellPrice, 'ether')
	  
	  // Вызываем функцию для выставления NFT на продажу и получаем результат
	  const listResponse = await listNFTForSale(provider.web3Provider, nftItem.tokenId, price);
	  
	  console.log('Full response from listNFTForSale:', listResponse);
  
	  if (listResponse.status === 'success') {
		const transactionHash = listResponse.data; // Предполагаем, что это хэш транзакции
		console.log('Transaction hash:', transactionHash);
  
		// Передаем хэш транзакции для получения квитанции о транзакции
		const receipt = await pollFor(provider.rpcProvider, 'getTransactionReceipt', [transactionHash], 1.5, 1);
		console.log('Transaction receipt:', receipt);
  
		if (receipt) {
		  toast(
			<ToastMessage
			  title='Listing Successful'
			  link={{ href: createBlockExplorerUrl('transaction', receipt.transactionHash), text: 'View on Explorer' }}
			/>,
			toastConfig
		  );
		  fetchAllNFTs(provider.rpcProvider); // Обновляем список NFT
		} else {
		  toast(
			<ToastMessage
			  title='Listing Failed'
			  text='Transaction reverted or logs are empty'
			  link={{ href: createBlockExplorerUrl('transaction', receipt.transactionHash), text: 'View on Explorer' }}
			/>,
			toastConfig
		  );
		}
	  } else {
		// Обработка неудачных ответов от listNFTForSale
		console.error('listNFTForSale response status was not success:', listResponse);
		toast(
		  <ToastMessage
			title='Listing Failed'
			text={listResponse.data.message || 'Unknown error'}
		  />,
		  toastConfig
		);
	  }
	} catch (e) {
	  console.error('Exception caught during listing:', e);
	  alert(`Error during listing: ${e.message || e.toString()}`);
	} finally {
	  setLoading(false);
	  setShowResellModal(false); // Закрываем модальное окно после попытки листинга
	}
  }
  
    // JSX для модального окна
	const resellModal = showResellModal && (
		<div className='modal'>
		  <div className='modal-content'>
			<h2>Set a price to list your NFT</h2>
			<input
			  type='text'
			  placeholder='Enter price in ETH'
			  value={resellPrice}
			  onChange={(e) => setResellPrice(e.target.value)}
			/>
			<button onClick={handleResell}>List NFT For Sale</button>
			<button onClick={() => setShowResellModal(false)}>Cancel</button>
		  </div>
		</div>
	  );
  
  
	return (
		<div className='item section__padding'>
			<div className='item-image-container'>
				<img
					src={nftItem.image}
					alt='item'
				/>
				{resellModal}
			</div>
			<div className='item-content'>
				<div className='item-content-title'>
					<h1>{nftItem.name}</h1>
					<h2 className='item-title'>{nftItem.price} QUAI</h2>
				</div>
				<div className='item-content-creator'>
					<p className='item-title'>Contract Address</p>
					<a
						href={createBlockExplorerUrl('address', nftItem.owner)}
						target='_blank'
						rel='noreferrer'
						className='link'
					>
						{nftItem.owner}
					</a>
				</div>
				<div className='item-content-creator'>
					<p className='item-title'>Owner</p>
					<a
						href={createBlockExplorerUrl('address', nftItem.seller)}
						target='_blank'
						rel='noreferrer'
						className='link'
					>
						{isUserOwner ? 'Me' : nftItem.seller}
					</a>
				</div>
				<div className='item-content-creator'>
					<p className='item-title'>Description</p>
					{nftItem.description}
				</div>
				<div className='item-content-creator'>
					<p className='item-title'>Availability</p>
					{nftItem.onSale ? 'On sale' : 'Private' }
				</div>
				<div className='item-content-buy'>
      {!loading && (
        <>
          {isUserOwner ? (
            // If the user is the owner, show a "Sell" button
		<button
		onClick={() => {
			console.log('Нажата кнопка Sell');
			setShowResellModal(true);
		}}
		className='primary-btn'
		disabled={!isCyprus1 || !nftItem.onSale}
		>
		{nftItem.onSale ? 'Change price' : 'List for Sale'}
		</button>

          ) : (
            // If the user is not the owner, show a "Buy" button
            <button
              onClick={() => purchaseNFT()}
              className='primary-btn'
              disabled={!isCyprus1 || !nftItem.onSale}
            >
              Buy
            </button>
          )}
						</>
					)}

					<ThreeCircles
						visible={loading}
						height='90'
						width='90'
						justify-content='center'
						color='#EB1484'
						ariaLabel='three-circles-loading'
						wrapperStyle={{ justifyContent: 'center' }}
						wrapperClass=''
					/>
				</div>
			</div>
		
    
		</div>
	)
}

export default Item
