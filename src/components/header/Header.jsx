import React from 'react'
import './header.css'
import coin from '../../assets/coin.png'

const Header = () => {
	return (
		<div className='header section__padding'>
			<div className='header-content'>
				<div className='header-content-text'>
					<h1> MarginEX</h1>
					<div>
						<h3>Trade and collect digital collectibles on</h3>
						<h2>
							<strong>the first NFT marketplace on Quai.</strong>
						</h2>
					</div>
				</div>
				<img
					className='shake-vertical'
					src={coin}
					alt=''
				/>
			</div>
		</div>
	)
}

export default Header
