import { createCustomElement, actionTypes } from '@servicenow/ui-core';
import '@servicenow/now-template-card';
import '@servicenow/now-checkbox';
import '@servicenow/now-image';
import '@servicenow/now-icon';
import '@servicenow/now-input';
import '@servicenow/now-modal';
import {
	debounce,
	bytesToLabel,
} from '../../utils/utils';
import attachmentsService from '../../service/attachment.service';
import { VideoPlayer } from '../video-player';
import authService from '../../service/auth.service';
import styles from '../../styles.scss';

const ACTION_NAMES = {
	deleteAttachment: 'delete-attachment',
	cancelDeleteAttachment: 'cancel-delete-attachment',
	applyRenaming: 'apply-renaming',
	cancelRenaming: 'cancel-renaming',
	downloadAttachment: 'download-attachment',
}

const { COMPONENT_BOOTSTRAPPED } = actionTypes;

const buildIdentifier = (attachment) => {
		const isVideo = attachmentsService.isVideo(attachment);
		const isImage = attachmentsService.isImage(attachment);
		if (isImage) {
			return (
				<now-image
					slot="identifier"
					src={`/${attachment.sys_id}.iix?t=small`}
					alt={attachment.file_name}
					width={32}
					height={32}
				>
				</now-image>
			);
		}
		const icon = isVideo ? 'document-video-fill' : 'document-fill';
		return (
			<now-icon
				slot="identifier"
				icon={icon}
				size="xl"
			></now-icon>
		);
};


const buildDropdowbActions = (attachment, showVideo) => {
	const items = [
		{
			id: 'download',
			icon: 'download-outline',
			label: 'Download',
			href: attachment.download_link
		},
		{
			id: 'delete',
			icon: 'trash-outline',
			label: 'Delete'
		},
		{
			id: 'rename',
			icon: 'pencil-page-outline',
			label: 'Rename'
		}
	];

	const dropdowns = [
		{
			"id": `attachment-dropdown-${attachment.sys_id}`,
			"items": items,
			"icon":"ellipsis-v-outline",
			"label":"Attachment actions",
		}
	];

	return dropdowns;
};

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
			interaction:{ default: 'click' },
			selectedAttachments: { default: [] } 
		},

		actionHandlers: {
			[COMPONENT_BOOTSTRAPPED]: ({ updateState, state }) => {
				updateState({
					fileName: state.properties.attachment?.file_name ?? ""
				});
			},
			'NOW_CARD#CLICKED': async ({ action, state, updateState }) => {
				if (state.isRenaming) return;
				const contentClicked = action?.payload?.content;

				if (attachmentsService.isImage(state.properties.attachment)) {
					updateState({ showContent: true, attachmentContent: <now-image slot="identifier" src={`/sys_attachment.do?sys_id=${state.properties.attachment.sys_id}`} alt={state.properties.attachment.file_name}></now-image>});
				}

				if (attachmentsService.isVideo(state.properties.attachment)) {
					updateState({ showContent: true, attachmentContent: <VideoPlayer className="attachment-card__video" attachment={state.properties.attachment}></VideoPlayer> });									
				}

				if (attachmentsService.isText(state.properties.attachment)) {
					const res = await fetch(`/api/now/attachment/${state.properties.attachment?.sys_id}/file`, {
						method:      'GET',
						credentials: 'same-origin',
						headers: {
								'X-UserToken': authService.token
						}
					});

					if (!res.ok) throw new Error(`Download failed: ${res.status}`);

					const text = await res.text();
					updateState({ showContent: true, attachmentContent: <pre>{text}</pre> });
				}
			},
			'NOW_CARD_HEADER#ACTION_CLICKED': ({ action, state, updateState, host }) => {
				const payload = action?.payload;
				const actionId = payload?.action?.id;
				if (!payload || !actionId) return;

				if (actionId === 'toggle-video') {
					updateState({ showVideo: !state.showVideo });
					return;
				}

				if (actionId === 'delete') {
					updateState({ showDeleteModal: true });
					return;
				}

				if (actionId === 'download') {
					attachmentsService.download(state.properties.attachment);
					return;
				}

				if (actionId === 'rename') {
					const newIsRenaming = !state.isRenaming;
					updateState({ isRenaming: newIsRenaming });
					return;
				}
			},
			'NOW_CHECKBOX#CHECKED_SET': ({ action, state, host }) => {
				const val = action?.payload?.value;
				if (val === undefined) return;
				const attachmentSysId = state.properties.attachment?.sys_id;
				
				host.dispatch('ATTACHMENT_SELECTED', {
					bubbles: true,
					composed: true,
					details: { attachmentSysId: attachmentSysId, isSelected: val }
				});
			},
			'NOW_MODAL#OPENED_SET': ({action, updateState}) => {
				updateState({ showDeleteModal: action.payload.value });
			},
			'NOW_MODAL#FOOTER_ACTION_CLICKED': async ({ action, state, updateState, host }) => {
				if (action.payload.action.id === ACTION_NAMES.cancelDeleteAttachment){
					updateState({ showDeleteModal: false });
					return;
				}

				const { attachment } = state.properties;
				const { id, attachmentId } = action.payload.action;
				if (id === ACTION_NAMES.deleteAttachment && attachmentId === attachment.sys_id) {
					try {
						await attachmentsService.delete(attachment.sys_id);
						host.dispatch('ATTACHMENT_DELETED', {
							bubbles: true,
							composed: true,
							details: {
								attachment: state.properties.attachment
							}
						});
						updateState && updateState({ showVideo: false });
						updateState && updateState({ showDeleteModal: false });
					} catch (err) {
						console.error('Attachment delete error', err);
						alert('Could not delete the attachment.');
					}
				}
				if (id === ACTION_NAMES.downloadAttachment) {
					attachmentsService.download(attachment);
				}
			},

			'NOW_INPUT#INPUT': debounce(({ action, updateState }) => {
				updateState({fileName: action?.payload?.fieldValue ?? ""});
			}),

			'NOW_BUTTON_ICONIC#CLICKED': async ({ action, updateState, state, host }) => {
				if (action.meta?.componentName && action.meta.componentName === ACTION_NAMES.cancelRenaming){
					updateState({
						fileName: state.properties.attachment.file_name ?? "",
						isRenaming: false
					});
					return;
				}

				if (action.meta?.componentName && action.meta.componentName === ACTION_NAMES.applyRenaming){
					try {
						await attachmentsService.rename(state.properties.attachment?.sys_id, state.fileName);
						updateState && updateState({
							isRenaming: false,
						});
						host.dispatch('ATTACHMENT_RENAMED', {
							bubbles: true,
							composed: true,
							details: {
								attachmentId: state.properties.attachment.sys_id,
								newName: state.fileName
							}
						});
					} catch (err) {
						console.error('Attachment renaming error', err);
					}
					return;
				}
			},
			'NOW_MODAL#OPENED_SET': ({ updateState }) => {
				updateState({
					showContent: false,
					attachmentContent: '',
					showDeleteModal: false
				});
			}

		},

		view: (state) => {
				const { attachment, selectedAttachments } = state.properties;
				if (!attachment) return null;

				const { isRenaming } = state;
				const caption    = bytesToLabel(attachment.size_bytes);
				const actions    = buildDropdowbActions(attachment, state.showVideo);

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
									interaction={
										attachmentsService.isText(attachment)
										|| attachmentsService.isImage(attachment)
										|| attachmentsService.isVideo(attachment)
										? "click" : "none"
									}
									variant="secondary"
								>
									<now-card-header
										className="attachment-card__header"
										heading={{
											label: !isRenaming ? attachment.file_name : "",
											level: 2,
										}}
										caption={{
											label: !isRenaming ? caption : "",
											lines: 1
										}}
										dropdowns={actions}
									>
										{buildIdentifier(attachment)}
										{isRenaming && (
											<now-input
												style={{
													position: "absolute",
													left: "50px",
													top: "50%",
													right: "40px",
													margin: "0",
													transform: "translateY(-50%)"
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
												>
												</now-button-iconic>
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
												>
												</now-button-iconic>
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
									footer-actions={
										[
											{
												"id": ACTION_NAMES.cancelDeleteAttachment,
												"label":"Cancel",
												"variant": "secondary"
											},
											{
												"id": ACTION_NAMES.deleteAttachment,
												"attachmentId": attachment.sys_id,
												"label": "Delete",
												"variant": "primary-negative"
											},
										]
									}
								></now-modal>
							)}
							{state.showContent && (
								<now-modal
									opened={true}
									size="fullscreen"
									header-label={attachment.file_name}
									heading-level={2}
									content={state.attachmentContent}
									footer-actions={
										[
											{
												"id": ACTION_NAMES.deleteAttachment,
												"attachmentId": attachment.sys_id,
												"label": "Delete",
												"variant": "primary-negative"
											},
											{
												"id": ACTION_NAMES.downloadAttachment,
												"label":"Download",
												"variant": "primary"
											},

										]
									}
								></now-modal>
							)}
						</div>
				);
		},

		styles
});
