import { Link } from 'react-router-dom'
import './nftTile.css'

function NFTTile(data) {
	const item = data.data
	return (
		<div className='card-column'>
			<Link
				to={'/item/' + item.tokenId}
				state={{ data: item, key: item.tokenId }}
			>
				<div className='bids-card'>
					<div className='bids-card-top'>
						<img
							src={item.image}
							alt=''
						/>

						<p className='bids-title'>{item.name}</p>
					</div>
					<div className='bids-card-bottom'>
						<p>{item.price} QUAI</p>
					</div>
				</div>
			</Link>
		</div>
	)
}

export default NFTTile
