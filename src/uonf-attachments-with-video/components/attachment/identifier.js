import attachmentsService from '../../service/attachment.service';

export const buildIdentifier = (attachment) => {
	const isVideo = attachmentsService.isVideo(attachment);
	const isImage = attachmentsService.isImage(attachment);
	const isAudio = attachmentsService.isAudio(attachment);

	const getIcon = () => {
		if (isVideo) return 'document-video-fill';
		if (isAudio) return 'document-audio-fill';
		return 'document-fill';
	};

	if (isImage) {
		return (
			<now-image
				slot="identifier"
				src={`/${attachment.sys_id}.iix?t=small`}
				alt={attachment.file_name}
				width={32}
				height={32}
			></now-image>
		);
	}

	return (
		<now-icon
			slot="identifier"
			icon={getIcon()}
			size="xl"
		></now-icon>
	);
};
