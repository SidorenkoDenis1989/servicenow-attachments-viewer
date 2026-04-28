import { createCustomElement } from '@servicenow/ui-core';
import '@servicenow/now-template-card';
import '@servicenow/now-checkbox';
import '@servicenow/now-image';
import '@servicenow/now-icon';
import '@servicenow/now-input';
import '@servicenow/now-modal';
import styles from '../../styles.scss';
import attachmentsService from '../../service/attachment.service';
import { bytesToLabel } from '../../utils/utils';
import { actionHandlers } from './handlers';
import { buildIdentifier } from './identifier';
import { buildDropdownActions } from './dropdown-actions';
import { ACTION_NAMES } from './constants';

createCustomElement('uonf-attachment-card', {
	initialState: {
		showVideo: false,
		showDeleteModal: false,
		isRenaming: false,
		fileName: '',
		showContent: false,
		attachmentContent: ''
	},

	properties: {
		attachment: { default: null },
		interaction: { default: 'click' },
		selectedAttachments: { default: [] }
	},

	actionHandlers,

	view: (state) => {
		const { attachment, selectedAttachments } = state.properties;
		if (!attachment) return null;

		const { isRenaming } = state;
		const caption = bytesToLabel(attachment.size_bytes);
		const actions = buildDropdownActions(attachment);

		return (
			<div className="attachment-card__wrapper">
				<div className="attachment-card">
					<now-checkbox
						checked={selectedAttachments.includes(attachment.sys_id)}
						name={`checkbox-${attachment.sys_id}`}
					></now-checkbox>
					<now-card
						className="attachment-card__card"
						size="md"
						interaction={attachmentsService.isPreviewable(attachment) ? 'click' : 'none'}
						variant="secondary"
					>
						<now-card-header
							className="attachment-card__header"
							heading={{ label: !isRenaming ? attachment.file_name : '', level: 2 }}
							caption={{ label: !isRenaming ? caption : '', lines: 1 }}
							dropdowns={actions}
						>
							{buildIdentifier(attachment)}
							{isRenaming && (
								<now-input
									style={{
										position: 'absolute',
										left: '50px',
										top: '50%',
										right: '40px',
										margin: '0',
										transform: 'translateY(-50%)'
									}}
									type="text"
									name={`rename-${attachment.sys_id}`}
									slot="metadata"
									value={state.fileName}
									size="sm"
								>
									<now-button-iconic
										actionId="apply-renaming"
										componentName="apply-renaming"
										slot="end"
										icon="checkOutline"
										size="sm"
										aria-label="Apply renaming"
										variant="tertiary"
										bare
										data-tooltip="Apply renaming"
										data-ariadescribedby="Apply renaming"
									></now-button-iconic>
									<now-button-iconic
										componentName="cancel-renaming"
										slot="end"
										icon="closeOutline"
										size="sm"
										aria-label="Cancel renaming"
										variant="tertiary"
										bare
										data-tooltip="Cancel renaming"
										data-ariadescribedby="Cancel renaming"
									></now-button-iconic>
								</now-input>
							)}
						</now-card-header>
					</now-card>
				</div>
				{state.showDeleteModal && (
					<now-modal
						opened={true}
						header-label="Delete Attachment"
						heading-level={2}
						content={`Attachment "${attachment.file_name}" will be deleted permanently.`}
						footer-actions={[
							{ id: ACTION_NAMES.cancelDeleteAttachment, label: 'Cancel', variant: 'secondary' },
							{ id: ACTION_NAMES.deleteAttachment, attachmentId: attachment.sys_id, label: 'Delete', variant: 'primary-negative' },
						]}
					></now-modal>
				)}
				{state.showContent && (
					<now-modal
						opened={true}
						size="fullscreen"
						header-label={attachment.file_name}
						heading-level={2}
						content={state.attachmentContent}
						footer-actions={[
							{ id: ACTION_NAMES.deleteAttachment, attachmentId: attachment.sys_id, label: 'Delete', variant: 'primary-negative' },
							{ id: ACTION_NAMES.downloadAttachment, label: 'Download', variant: 'primary' },
						]}
					></now-modal>
				)}
			</div>
		);
	},

	styles
});
