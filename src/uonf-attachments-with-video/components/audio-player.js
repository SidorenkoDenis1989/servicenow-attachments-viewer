import "../styles.scss";
export const AudioPlayer = ({ attachment }) => {
	return (
		<div
			className="attachment-audio-player"
			style={{
				width: "100%",
				textAlign: "center"
			}}
		>
			<audio
				controls
				autoplay={false}
				muted={false}
				style={{
					width: '100%',
					outline: 'none',
					borderRadius: '6px',
				}}
			>
				<source src={`/sys_attachment.do?sys_id=${attachment.sys_id}`} type={attachment.content_type} />
			</audio>
		</div>
	);
}
