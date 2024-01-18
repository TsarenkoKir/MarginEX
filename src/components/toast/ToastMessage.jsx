import './toastMessage.css'

export const ToastMessage = ({ title, text, text2, link }) => {
	return (
		<div className='toast-message-container'>
			<h4>{title}</h4>
			<p>{text}</p>
			{text2 && <p>{text2}</p>}
			{link && (
				<a
					href={link.href}
					target='_blank'
					rel='noreferrer'
				>
					{link.text}
				</a>
			)}
		</div>
	)
}
