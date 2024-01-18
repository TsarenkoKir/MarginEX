import { useEffect, useState } from 'react'
import { quais } from 'quais'
import { pollFor } from 'quais-polling'
import { uploadFileToIPFS, uploadJSONToIPFS } from '../../utils/pinata'
import { ThreeCircles } from 'react-loader-spinner'
import { createNFT } from '../../utils/marketplace'
import { toast } from 'react-toastify'
import { ToastMessage } from '../../components/toast/ToastMessage'
import { toastConfig, createBlockExplorerUrl } from '../../utils/helpers'
import './create.css'

const Create = ({ provider, fetchAllNFTs, isCyprus2 }) => {
	const [formParams, updateFormParams] = useState({ name: '', description: '', price: '' })
	const [fileURL, setFileURL] = useState(null)
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		if (!isCyprus2) {
			updateFormParams({ name: '', description: '', price: '' })
			setFileURL(null)
		}
	}, [isCyprus2])

	//This function uploads the NFT image to IPFS
	async function OnChangeFile(e) {
		setLoading(true)
		var file = e.target.files[0]
		//check for file extension
		try {
			//upload the file to IPFS
			const response = await uploadFileToIPFS(file)
			if (response.success === true) {
				setFileURL(response.pinataURL)
			}
		} catch (e) {
			console.log('Error during file upload', e)
		} finally {
			setLoading(false)
		}
	}

	//This function uploads the metadata to IPFS
	async function uploadMetadataToIPFS() {
		const { name, description, price } = formParams
		//Make sure that none of the fields are empty
		if (!name || !description || !price || !fileURL) {
			return -1
		}

		const nftJSON = {
			name,
			description,
			price,
			image: fileURL,
		}

		try {
			//upload the metadata JSON to IPFS
			const response = await uploadJSONToIPFS(nftJSON)
			if (response.success === true) {
				return response.pinataURL
			}
		} catch (e) {
			console.log('error uploading JSON metadata:', e)
		}
	}

	async function listNFT(e) {
		e.preventDefault()

		setLoading(true)
		//Upload data to IPFS
		try {
			const metadataURL = await uploadMetadataToIPFS()
			if (metadataURL === -1) return

			const price = quais.utils.parseUnits(formParams.price, 'ether')
			const response = await createNFT(provider.web3Provider, metadataURL, price)
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
				updateFormParams({ name: '', description: '', price: '' })
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

			// window.location.replace('/')
		} catch (e) {
			alert('Upload error' + e)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='create section__padding'>
			<div className='create-container'>
				<h1>Create new NFT</h1>
				<form
					className='writeForm'
					autoComplete='off'
				>
					<div className='formGroup'>
						<label>Name</label>
						<input
							type='text'
							placeholder='NFT Name'
							autoFocus={true}
							id='name'
							onChange={(e) => updateFormParams({ ...formParams, name: e.target.value })}
							value={formParams.name}
							disabled={!isCyprus2}
							className='input-handler'
						/>
					</div>
					<div className='formGroup'>
						<label>Description</label>
						<textarea
							type='text'
							rows={4}
							placeholder='Decription of your NFT'
							id='description'
							value={formParams.description}
							onChange={(e) => updateFormParams({ ...formParams, description: e.target.value })}
							disabled={!isCyprus2}
							className='input-handler'
						></textarea>
					</div>
					<div className='formGroup'>
						<label>Price</label>
						<div className='twoForm'>
							<input
								type='number'
								placeholder='Min 0.01 QUAI'
								step='0.01'
								value={formParams.price}
								onChange={(e) => updateFormParams({ ...formParams, price: e.target.value })}
								disabled={!isCyprus2}
								className='input-handler'
							/>
						</div>
					</div>
					<div className='formGroup'>
						<label>Category</label>
						<select
							disabled={!isCyprus2}
							className='input-handler'
						>
							<option>Meme</option>
							<option>Art</option>
							<option>Photography</option>
							<option>Sport</option>
							<option>Crypto</option>
							<option>Other</option>
						</select>
					</div>
					<div className='formGroup'>
						<label>Upload</label>
						<input
							type='file'
							className='custom-file-input input-handler'
							onChange={OnChangeFile}
							disabled={!isCyprus2}
						/>
					</div>
					{!loading && (
						<button
							className='writeButton primary-btn'
							onClick={listNFT}
							id='list-button'
							disabled={!isCyprus2}
						>
							List My NFT
						</button>
					)}
					<ThreeCircles
						visible={loading}
						height='90'
						width='90'
						color='#EB1484'
						justify-content='center'
						ariaLabel='three-circles-loading'
						wrapperStyle={{ justifyContent: 'center' }}
						wrapperClass=''
					/>
				</form>
			</div>
		</div>
	)
}

export default Create
