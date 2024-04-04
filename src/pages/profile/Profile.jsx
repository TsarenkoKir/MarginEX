import gradient from '../../assets/gradient.jpeg'
import NFTTile from '../nftTile/NFTTile'
import './profile.css'
import { shortenAddress } from '../../utils/helpers'
import NFTTileLoading from '../nftTile/NFTTileLoading'

const Profile = ({ user, userNFTs, isCyprus1 }) => {
	// Displays filtered NFTs based on user address
	// Displays user address if connected
	// Displays nothing if not connected or connected to the wrong shards
	// Displays loading if userNFTs have not been fetched yet
	return (
		<div className='profile'>
			<div className='profile-top section__padding'>
				<div className='profile-banner'>
					{user && isCyprus1 ? (
						<div className='profile-pic'>
							<img
								src={gradient}
								alt='profile'
								height={135}
							/>
							<h3 className='profile-text'>{shortenAddress(user.addr)}</h3>
						</div>
					) : (
						<h3>Connect a wallet to see your NFTs</h3>
					)}
				</div>
			</div>
			<div className='section__padding'>
				{isCyprus1 && (
					<div className='profile-container'>
						<div className='profile-container-text'>
							<h1>Inventory</h1>
						</div>

						<div className='profile-container-card'>
							{userNFTs ? (
								userNFTs.map((value, index) => {
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
				)}
			</div>
		</div>
	)
}

export default Profile
