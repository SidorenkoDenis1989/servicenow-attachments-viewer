import "../styles.scss"; 
export const VideoPlayer = ({ attachment }) => {
	return (
		<div
			className="attachment-video-player"
			style={{
				width: "100%",
				textAlign: "center"
			}}
		>
			<video
				controls
				autoplay={false}
				poster={undefined}
				muted={false}
				style={{
					width: 'auto',
					height: 'auto',
					borderRadius: '6px',
					outline: 'none',
					background: '#000',
					maxWidth: '100%',
					maxHeight: '80vh',
				}}
			>
				<source src={`/sys_attachment.do?sys_id=${attachment.sys_id}`} type={attachment.content_type} />
			</video>
		</div>
	);
}

