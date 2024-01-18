import React from 'react'
import './footer.css'
import { AiOutlineTwitter } from 'react-icons/ai'
import { RiDiscordFill } from 'react-icons/ri'
import { FaGithub } from 'react-icons/fa'
import { FaTelegramPlane } from 'react-icons/fa'

const marginExLinks = [
	{ title: 'Twitter', href: 'https://twitter.com/margin_exchange' },
	{ title: 'Discord [Coming Soon!]', href: '' },
	{ title: 'Docs [Coming Soon!]', href: '' },
	{ title: 'Contact', href: 'https://t.me/Kyryllo22' },
]

const quaiLinks = [
	{ title: 'Discord', href: 'https://discord.gg/quai' },
	{ title: 'Twitter', href: 'https://twitter.com/QuaiNetwork' },
	{ title: 'Develop on Quai', href: 'https://qu.ai/docs/category/tutorials/' },
	{ title: 'Mine Quai', href: 'https://qu.ai/docs/category/miner/' },
]

const socialLinks = [
	{
		title: 'Twitter',
		href: 'https://twitter.com/margin_exchange',
		icon: (
			<AiOutlineTwitter
				size={25}
				color='white'
				className='footer-icon'
			/>
		),
	},
	{
		title: 'Discord',
		href: 'https://discord.gg/quai',
		icon: (
			<RiDiscordFill
				size={25}
				color='white'
				className='footer-icon'
			/>
		),
	},
	{
		title: 'Telegram',
		href: 'https://t.me/Kyryllo22',
		icon: (
			<FaTelegramPlane
				size={25}
				color='white'
				className='footer-icon'
			/>
		),
	},
	{
		title: 'Github',
		href: 'https://github.com/TsarenkoKir/NFT-Marketplace',
		icon: (
			<FaGithub
				size={25}
				color='white'
				className='footer-icon'
			/>
		),
	},
]

const Footer = () => {
	return (
		<div className='footer'>
			<div className='footer-links'>
				<div className='footer-links-email'>
					<h4>Want more from MarginEX?</h4>
					<p>Get the lastest updates on MarginEX and Quai NFTs delivered right to your inbox.</p>
					<input
						type='text'
						placeholder='Your Email'
					/>
					<button>Email Me!</button>
				</div>
				<div className='footer-links-container'>
					<div className='footer-links-div'>
						<h4>MarginEX</h4>
						{marginExLinks.map((link, index) => (
							<a
								href={link.href}
								target='_blank'
								rel='noopener noreferrer'
								className='footer-link'
								key={index}
							>
								{link.title}
							</a>
						))}
					</div>
					<div className='footer-links-div'>
						<h4>Quai Network</h4>
						{quaiLinks.map((link, index) => (
							<a
								href={link.href}
								target='_blank'
								rel='noopener noreferrer'
								className='footer-link'
								key={index}
							>
								{link.title}
							</a>
						))}
					</div>
				</div>
			</div>
			<div className='footer-copyright'>
				<div>
					<p>© MarginEX {new Date().getFullYear()}. All Rights Reserved.</p>
				</div>
				<div className='footer-icon-container'>
					{socialLinks.map((link, index) => (
						<a
							href={link.href}
							key={index}
						>
							{link.icon}
						</a>
					))}
				</div>
			</div>
		</div>
	)
}

export default Footer
