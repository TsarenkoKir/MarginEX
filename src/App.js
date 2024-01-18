import { useState, useEffect } from 'react'
import { quais } from 'quais'
import { Navbar, Footer } from './components'
import Home from './pages/home/Home'
import Item from './pages/item/Item'
import Create from './pages/create/Create'
import Profile from './pages/profile/Profile'
import { Routes, Route } from 'react-router-dom'
import { getAccounts } from './utils/pelagus'
import { getAllNFTs } from './utils/marketplace'
import { filterNFTsByOwner, getShardNameFromId, toastConfig } from './utils/helpers'
import { ToastContainer, toast } from 'react-toastify'
import { ToastMessage } from './components/toast/ToastMessage'
import 'react-toastify/dist/ReactToastify.css'
import './App.css'

function App() {
	const [provider, setProvider] = useState({
		rpcProvider: new quais.providers.JsonRpcProvider('https://rpc.cyprus2.colosseum.quaiscan.io'),
		web3Provider: null,
	})
	const [user, setUser] = useState()
	const [allNFTs, setAllNFTs] = useState()
	const [userNFTs, setUserNFTs] = useState()
	const [isCyprus2, setIsCyprus2] = useState(false)

	const fetchAllNFTs = async (provider) => {
		await getAllNFTs(provider)
			.then((NFTs) => {
				setAllNFTs(NFTs.reverse())
			})
			.catch((err) => {
				console.log('Error getting NFTs', err)
			})
	}

	const fetchAccounts = async (provider) => {
		await getAccounts(provider)
			.then((account) => {
				if (account !== undefined) {
					if (account.shard === 'zone-0-1') {
						setIsCyprus2(true)
					} else {
						setIsCyprus2(false)
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

	useEffect(() => {
		console.log('Use Effect 1')
		fetchAllNFTs(provider.rpcProvider)
		if (window.ethereum.isPelagus) {
			const web3Provider = new quais.providers.Web3Provider(window.ethereum)
			setProvider({ ...provider, web3Provider: web3Provider })
			fetchAccounts(web3Provider)
			window.ethereum.on('accountsChanged', (accounts) => {
				if (accounts.length !== 0) {
					const shard = quais.utils.getShardFromAddress(accounts[0])
					if (shard === 'zone-0-1') {
						setIsCyprus2(true)
					} else {
						setIsCyprus2(false)
						toast(
							<ToastMessage
								title='Incorrect Shard'
								text={'Connection detected on ' + getShardNameFromId(shard) + '.'}
								text2={'Please connect to Cyprus 2.'}
							/>,
							toastConfig
						)
					}
					setUser({
						addr: accounts[0],
						shard: shard,
					})
				} else {
					setIsCyprus2(false)
					setUser()
				}
			})
		} else {
			console.log('No Pelagus provider found')
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [provider.rpcProvider])

	useEffect(() => {
		if (allNFTs && user && isCyprus2) {
			setUserNFTs(filterNFTsByOwner(allNFTs, user.addr))
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [allNFTs, user])

	return (
		<div>
			<ToastContainer bodyClassName='toast-body' />
			<Navbar
				user={user}
				setUser={setUser}
				provider={provider}
				setIsCyprus2={setIsCyprus2}
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
							isCyprus2={isCyprus2}
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
							isCyprus2={isCyprus2}
						/>
					}
				/>
				<Route
					path='/profile'
					element={
						<Profile
							user={user}
							userNFTs={userNFTs}
							isCyprus2={isCyprus2}
						/>
					}
				/>
			</Routes>
			<Footer />
		</div>
	)
}

export default App
