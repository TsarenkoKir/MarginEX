import React, { useState } from 'react'
import { RiMenu3Line, RiCloseLine } from 'react-icons/ri'
import { Link } from 'react-router-dom'
import { requestAccounts } from '../../utils/pelagus'
import { shortenAddress, getShardNameFromId } from '../../utils/helpers'
import './navbar.css'

const Menu = () => (
	<>
		<Link to='/profile'>
			<p className='nav-link'>Profile</p>
		</Link>
		<Link to='/create'>
			<p className='nav-link'>Create</p>
		</Link>
	</>
)

const Navbar = ({ user, setUser, provider, setIsCyprus1 }) => {
	const [toggleMenu, setToggleMenu] = useState(false)
	async function connectWallet() {
		await requestAccounts(provider.web3Provider).then((account) => {
			if (account !== undefined) {
				if (account.shard === 'zone-0-0') {
					setIsCyprus1(true)
				} else {
					setIsCyprus1(false)
				}
				setUser(account)
			}
		})
	}

	return (
		<div className='navbar'>
			<div className='navbar-links'>
				<div className='navbar-links-title'>
					<Link to='/'>
						<h2 className='nav-link'>MarginEX</h2>
					</Link>
				</div>
				<div className='navbar-links-container'>
					<Menu />
				</div>
			</div>

			<div className='navbar-sign'>
				{user ? (
					<>
						<button
							type='button'
							className='secondary-btn'
							style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}
							disabled={true}
						>
							<p style={{ fontWeight: '500', fontSize: '16px', padding: '0', margin: '0' }}>{getShardNameFromId(user.shard)}</p>
							{shortenAddress(user.addr)}
						</button>
					</>
				) : (
					<>
						<button
							type='button'
							className='primary-btn'
							onClick={connectWallet}
						>
							Connect with Cyprus 1
						</button>
					</>
				)}
			</div>

			<div className='navbar-menu'>
				{toggleMenu ? (
					<RiCloseLine
						color='#fff'
						size={27}
						onClick={() => setToggleMenu(false)}
					/>
				) : (
					<RiMenu3Line
						color='#fff'
						size={27}
						onClick={() => setToggleMenu(true)}
					/>
				)}
				{toggleMenu && (
					<div className='navbar-menu-container scale-up-center'>
						<div className='navbar-menu-container-links-sign'>
							{user ? (
								<>
									<button
										type='button'
										className='secondary-btn'
									>
										Connected
									</button>
								</>
							) : (
								<>
									<button
										type='button'
										className='primary-btn'
										onClick={connectWallet}
									>
										Connect
									</button>
								</>
							)}
						</div>
						<div className='navbar-menu-container-links'>
							<Menu />
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

export default Navbar
