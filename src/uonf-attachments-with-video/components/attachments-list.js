import '@servicenow/now-checkbox';
import './attachment';

export const AttachmentsList = ({ attachments, selectedAttachments }) => {
	if (!Array.isArray(attachments) || !attachments.length) {
		return (<p>No attachments were found</p>);
	}
	
	return (
		<ul className="sn-card-list full">
				{attachments.map((attachment) => {
						return (
							<li
								className="sn-card"
								key={attachment.sys_id}
							>
								<uonf-attachment-card
									attachment={attachment}
									selectedAttachments={selectedAttachments}
								></uonf-attachment-card>
							</li>
						)
					})
				}
		</ul>
	);
};
