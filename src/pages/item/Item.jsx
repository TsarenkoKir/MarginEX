import { useEffect, useState } from 'react'
import { ThreeCircles } from 'react-loader-spinner'
import { useLocation } from 'react-router-dom'
import { buyNFT } from '../../utils/marketplace'
import { toastConfig, createBlockExplorerUrl } from '../../utils/helpers'
import { toast } from 'react-toastify'
import { ToastMessage } from '../../components/toast/ToastMessage'
import { pollFor } from 'quais-polling'
import './item.css'

const Item = ({ provider, user, fetchAllNFTs, isCyprus2 }) => {
	const [loading, setLoading] = useState(false)
	const [isUserOwner, setIsUserOwner] = useState(false)
	const location = useLocation()
	const receivedData = location.state
	const nftItem = receivedData.data

	useEffect(() => {
		if (user && isCyprus2) {
			if (user.addr.toLowerCase() === nftItem.seller.toLowerCase()) {
				setIsUserOwner(true)
			}
		}
	}, [user, isCyprus2, nftItem.seller])

	async function purchaseNFT() {
		setLoading(true)
		try {
			const response = await buyNFT(provider.web3Provider, nftItem.tokenId, nftItem.price)
			if (response.status === 'success') {
				const transaction = await pollFor(provider.rpcProvider, 'getTransactionReceipt', [response.data], 1.5, 1)
				if (transaction.logs.length !== 0) {
					toast(
						<ToastMessage
							title='Mint Successful'
							link={{ href: createBlockExplorerUrl('transaction', transaction.transactionHash), text: 'View on Explorer' }}
						/>,
						toastConfig
					)
					fetchAllNFTs(provider.rpcProvider)
				} else {
					toast(
						<ToastMessage
							title='Mint Failed'
							text='Transaction reverted'
							link={{ href: createBlockExplorerUrl('transaction', transaction.transactionHash), text: 'View on Explorer' }}
						/>,
						toastConfig
					)
				}
				setLoading(false)
			} else {
				toast(
					<ToastMessage
						title='Purchase Failed'
						text={response.data.message}
					/>,
					toastConfig
				)
				setLoading(false)
			}
		} catch (e) {
			alert(e)
		} finally {
			setLoading(false)
		}
	}
	return (
		<div className='item section__padding'>
			<div className='item-image'>
				<img
					src={nftItem.image}
					alt='item'
				/>
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
				<div className='item-content-buy'>
					{!loading && (
						<>
							<button
								onClick={() => purchaseNFT()}
								className='primary-btn'
								disabled={isUserOwner || !isCyprus2}
							>
								Buy
							</button>

							<button
								className='secondary-btn'
								disabled={!isCyprus2}
							>
								Make Offer (Coming Soon)
							</button>
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
