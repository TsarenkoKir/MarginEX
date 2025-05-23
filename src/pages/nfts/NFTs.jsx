import NFTTile from '../nftTile/NFTTile'
import NFTTileLoading from '../nftTile/NFTTileLoading'

const NFTs = ({ allNFTs }) => {
	// Displays all NFTs
	// Displays loading animation if allNFTs have not been fetched yet
	// TODO: Load more button is not properly implemented, need to add pagination functionality to only display 50 NFTs at a time
	return (
		<div className='bids section__padding'>
			<div className='bids-container'>
				<div className='bids-container-text'>
					<h1>NFTs</h1>
				</div>
				<div
					className='bids-container-card'
					id='bids-container-card'
				>
					{allNFTs ? (
						allNFTs.map((value, index) => {
							return (
								<NFTTile
									data={value}
									key={index}
								></NFTTile>
							)
						})
					) : (
						<>
							<NFTTileLoading />
							<NFTTileLoading />
							<NFTTileLoading />
							<NFTTileLoading />
							<NFTTileLoading />
						</>
					)}
				</div>
			</div>
			<div className='load-more'>
				<button>Load More</button>
			</div>
		</div>
	)
}

export default NFTs
