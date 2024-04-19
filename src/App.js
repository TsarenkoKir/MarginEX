import { useState, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import { Routes, Route } from 'react-router-dom'
import { quais } from 'quais'
import { Navbar, Footer } from './components'
import Home from './pages/home/Home'
import Item from './pages/item/Item'
import Create from './pages/create/Create'
import Profile from './pages/profile/Profile'
import { ToastMessage } from './components/toast/ToastMessage'
import { filterNFTsByOwner, getShardNameFromId, toastConfig } from './utils/helpers'
import { getAccounts } from './utils/pelagus'
import { getAllNFTs } from './utils/marketplace'
import 'react-toastify/dist/ReactToastify.css'
import './App.css'

function App() {
	const [user, setUser] = useState() // user: {addr: '0x...', shard: 'zone-0-1'}, handles connection status and user account
	const [allNFTs, setAllNFTs] = useState() // allNFTs: [{ NFT1 }, { NFT2 }, { NFT3 }], state array of all NFTs
	const [userNFTs, setUserNFTs] = useState() // userNFTs: [{ NFT1 }, { NFT2 }, { NFT3 }], state array of user NFTs filtered from allNFTs
	const [isCyprus1, setIsCyprus1] = useState(false) // isCyprus1: true/false, handles connection status to Cyprus 1
	const [provider, setProvider] = useState({
		rpcProvider: new quais.providers.JsonRpcProvider('https://rpc.cyprus1.colosseum.quaiscan.io'),
		web3Provider: null,
	}) // provider: {rpcProvider, web3Provider}, 2 providers, rpc provider for general data pulls, web3 provider for user actions

	/*
  UseEffect 1:
  - Serves as the entry point for the app
  - Runs on page load, only runs again if rpcProvider changes (which it won't)
  - Handles initial check for web3provider, will set accounts to state if user is already connected
  - Handles user notifications if user is connected to the wrong shard
  - Sets event listener to handle account changes
  */
	useEffect(() => {
		fetchAllNFTs(provider.rpcProvider)
		if (window.ethereum && window.ethereum.isPelagus) {
			const web3Provider = new quais.providers.Web3Provider(window.ethereum)
			setProvider({ ...provider, web3Provider: web3Provider })
			fetchAccounts(web3Provider)
			window.ethereum.on('accountsChanged', (accounts) => {
				if (accounts.length !== 0) {
					const shard = quais.utils.getShardFromAddress(accounts[0])
					if (shard === 'zone-0-0') {
						setIsCyprus1(true)
					} else {
						setIsCyprus1(false)
						toast(
							<ToastMessage
								title='Incorrect Shard'
								text={'Connection detected on ' + getShardNameFromId(shard) + '.'}
								text2={'Please connect to Cyprus 1.'}
							/>,
							toastConfig
						)
					}
					setUser({
						addr: accounts[0],
						shard: shard,
					})
				} else {
					setIsCyprus1(false)
					setUser()
				}
			})
		} else {
			console.log('No Pelagus provider found')
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [provider.rpcProvider])

	/*
  UseEffect 2:
  - Secondary data handler
  - Runs on page load, only runs again if allNFTs or user changes (new nft minted or user changes account)
  - Handles filtering of allNFTs to userNFTss
  */

	useEffect(() => {
		if (allNFTs && user && isCyprus1) {
			setUserNFTs(filterNFTsByOwner(allNFTs, user.addr))
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [allNFTs, user])

	const fetchAllNFTs = async (provider) => {
		try {
		  console.log('Fetching all NFTs...'); // Basic log to indicate the process has started
		  const NFTs = await getAllNFTs(provider);
		  setAllNFTs(NFTs.reverse());
		  console.log('Successfully fetched NFTs:', NFTs); // Log successful retrieval
		} catch (err) {
		  console.error('Error getting NFTs:', err); // Log the error object itself
		  if (err.data) {
			console.error('Error data:', err.data); // Log the error data, if available
		  }
		  if (err.transaction) {
			console.error('Transaction data:', err.transaction); // Log the transaction data
		  }
		  // Additional error properties can be logged here as needed
		}
	  }
	  

	// checks for user accounts and sets them to state if the user is already connected
	const fetchAccounts = async (provider) => {
		await getAccounts(provider)
			.then((account) => {
				if (account !== undefined) {
					if (account.shard === 'zone-0-0') {
						setIsCyprus1(true)
					} else {
						setIsCyprus1(false)
					}
					setUser(account)
				} else {
					setUser()
				}
			})
			.catch((err) => {
				console.error('Error getting accounts', err)
			})
	}

	return (
		<div>
			<ToastContainer bodyClassName='toast-body' />
			<Navbar
				user={user}
				setUser={setUser}
				provider={provider}
				setIsCyprus1={setIsCyprus1}
			/>
			<Routes>
				<Route
					path='/'
					element={
						<Home
							allNFTs={allNFTs}
							setUser={setUser}
							provider={provider}
						/>
					}
				/>
				<Route
					path='/item/:id'
					element={
						<Item
							provider={provider}
							user={user}
							fetchAllNFTs={fetchAllNFTs}
							isCyprus1={isCyprus1}
						/>
					}
				/>
				<Route
					path='/create'
					element={
						<Create
							provider={provider}
							user={user}
							fetchAllNFTs={fetchAllNFTs}
							isCyprus1={isCyprus1}
						/>
					}
				/>
				<Route
					path='/profile'
					element={
						<Profile
							user={user}
							userNFTs={userNFTs}
							isCyprus1={isCyprus1}
						/>
					}
				/>
			</Routes>
			<Footer />
		</div>
	)
}

export default App
