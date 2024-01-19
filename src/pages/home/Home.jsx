import React from 'react'
import { NFTs, Header } from '../../components'

const Home = ({ allNFTs, setUser, provider }) => {
	return (
		<div>
			<Header />
			<NFTs
				setUser={setUser}
				provider={provider}
				allNFTs={allNFTs}
			/>
		</div>
	)
}

export default Home
