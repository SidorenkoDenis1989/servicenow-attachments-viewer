import attachmentsService from '../../service/attachment.service';
import authService from '../../service/auth.service';
import { debounce } from '../../utils/utils';
import { VideoPlayer } from '../video-player';
import { AudioPlayer } from '../audio-player';
import { ACTION_NAMES, COMPONENT_BOOTSTRAPPED } from './constants';

export const actionHandlers = {
	[COMPONENT_BOOTSTRAPPED]: ({ updateState, state }) => {
		updateState({ fileName: state.properties.attachment?.file_name ?? '' });
	},

	'NOW_CARD#CLICKED': async ({ state, updateState }) => {
		if (state.isRenaming) return;
		const { attachment } = state.properties;

		if (attachmentsService.isImage(attachment)) {
			updateState({
				showContent: true,
				attachmentContent: <now-image slot="identifier" src={`/sys_attachment.do?sys_id=${attachment.sys_id}`} alt={attachment.file_name}></now-image>
			});
			return;
		}

		if (attachmentsService.isVideo(attachment)) {
			updateState({ showContent: true, attachmentContent: <VideoPlayer attachment={attachment}></VideoPlayer> });
			return;
		}

		if (attachmentsService.isAudio(attachment)) {
			updateState({ showContent: true, attachmentContent: <AudioPlayer attachment={attachment}></AudioPlayer> });
			return;
		}

		if (attachmentsService.isText(attachment)) {
			const res = await fetch(`/api/now/attachment/${attachment.sys_id}/file`, {
				method: 'GET',
				credentials: 'same-origin',
				headers: { 'X-UserToken': authService.token }
			});
			if (!res.ok) throw new Error(`Download failed: ${res.status}`);
			const text = await res.text();
			updateState({ showContent: true, attachmentContent: <pre>{text}</pre> });
		}
	},

	'NOW_CARD_HEADER#ACTION_CLICKED': ({ action, state, updateState }) => {
		const actionId = action?.payload?.action?.id;
		if (!actionId) return;

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
			updateState({ isRenaming: !state.isRenaming });
		}
	},

	'NOW_CHECKBOX#CHECKED_SET': ({ action, state, host }) => {
		const val = action?.payload?.value;
		if (val === undefined) return;
		host.dispatch('ATTACHMENT_SELECTED', {
			bubbles: true,
			composed: true,
			details: { attachmentSysId: state.properties.attachment?.sys_id, isSelected: val }
		});
	},

	'NOW_MODAL#OPENED_SET': ({ updateState }) => {
		updateState({ showContent: false, attachmentContent: '', showDeleteModal: false });
	},

	'NOW_MODAL#FOOTER_ACTION_CLICKED': async ({ action, state, updateState, host }) => {
		const { id, attachmentId } = action.payload.action;
		const { attachment } = state.properties;

		if (id === ACTION_NAMES.cancelDeleteAttachment) {
			updateState({ showDeleteModal: false });
			return;
		}

		if (id === ACTION_NAMES.deleteAttachment && attachmentId === attachment.sys_id) {
			try {
				await attachmentsService.delete(attachment.sys_id);
				host.dispatch('ATTACHMENT_DELETED', {
					bubbles: true,
					composed: true,
					details: { attachment }
				});
				updateState({ showVideo: false, showDeleteModal: false });
			} catch (err) {
				console.error('Attachment delete error', err);
				alert('Could not delete the attachment.');
			}
			return;
		}

		if (id === ACTION_NAMES.downloadAttachment) {
			attachmentsService.download(attachment);
		}
	},

	'NOW_INPUT#INPUT': debounce(({ action, updateState }) => {
		updateState({ fileName: action?.payload?.fieldValue ?? '' });
	}),

	'NOW_BUTTON_ICONIC#CLICKED': async ({ action, updateState, state, host }) => {
		const componentName = action.meta?.componentName;

		if (componentName === ACTION_NAMES.cancelRenaming) {
			updateState({ fileName: state.properties.attachment.file_name ?? '', isRenaming: false });
			return;
		}

		if (componentName === ACTION_NAMES.applyRenaming) {
			try {
				await attachmentsService.rename(state.properties.attachment?.sys_id, state.fileName);
				updateState({ isRenaming: false });
				host.dispatch('ATTACHMENT_RENAMED', {
					bubbles: true,
					composed: true,
					details: { attachmentId: state.properties.attachment.sys_id, newName: state.fileName }
				});
			} catch (err) {
				console.error('Attachment renaming error', err);
			}
		}
	},
};
