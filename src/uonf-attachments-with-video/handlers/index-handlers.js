import attachmentsService from '../service/attachment.service';
import { SELECT_ALL_CHECKBOX_NAME, COMPONENT_BOOTSTRAPPED } from '../constants/index-constants';

const renameInList = (list, attachmentId, newName) =>
	list.map(att => att.sys_id === attachmentId ? { ...att, file_name: newName } : att);

export const actionHandlers = {
	[COMPONENT_BOOTSTRAPPED]: async ({ updateState, state }) => {
		try {
			const { table, sysId } = state.properties ?? {};
			if (!table || !sysId) return;

			const { attachments, sortDirection } = await attachmentsService.fetch(table, sysId);
			const direction = sortDirection ?? 'ascending';
			const sorted = [...attachments].sort((a, b) => attachmentsService.sort(direction, a, b));

			updateState({ attachments: sorted, initAttachments: sorted, sortDirection: direction });
		} catch (e) {
			console.error('Error fetching attachments', e);
		}
	},

	'ATTACHMENT_SELECTED': ({ action, state, updateState, host }) => {
		const { isSelected, attachmentSysId } = action?.payload?.details ?? {};
		const newSelectedAttachments = new Set(state.selectedAttachments);

		isSelected
			? newSelectedAttachments.add(attachmentSysId)
			: newSelectedAttachments.delete(attachmentSysId);

		updateState({ selectedAttachments: newSelectedAttachments });
		host.dispatch('CHANGE_ATTACHMENTNS_STATE', {
			bubbles: true,
			composed: true,
			details: { selectedAttachments: newSelectedAttachments }
		});
	},

	'NOW_CHECKBOX#CHECKED_SET': ({ action, state, updateState, host }) => {
		const { value: val, name } = action?.payload ?? {};
		if (name !== SELECT_ALL_CHECKBOX_NAME) return;

		const newSelectedAttachments = val
			? new Set(state.attachments.map(att => att.sys_id))
			: new Set();

		updateState({ selectedAttachments: newSelectedAttachments });
		host.dispatch('CHANGE_ATTACHMENTNS_STATE', {
			bubbles: true,
			composed: true,
			details: { selectedAttachments: newSelectedAttachments }
		});
	},

	'ATTACHMENT_DELETED': ({ action, state, updateState }) => {
		const deleted = action?.payload?.details?.attachment;
		const newAttachments = state.attachments.filter(att => att.sys_id !== deleted.sys_id);
		updateState({ attachments: newAttachments, initAttachments: newAttachments, selectedAttachments: new Set() });
	},

	'SEARCH_TERM_SET': ({ action, state, updateState }) => {
		const searchTerm = action?.payload?.value ?? '';
		if (!searchTerm) {
			updateState({ attachments: state.initAttachments });
			return;
		}
		const term = searchTerm.toLowerCase();
		updateState({
			attachments: state.initAttachments.filter(att => att.file_name.toLowerCase().includes(term))
		});
	},

	'SORT_ATTACHMENTS': async ({ action, state, updateState }) => {
		const newSortDirection = action?.payload?.sortDirection;
		const sorted = [...state.attachments].sort((a, b) => attachmentsService.sort(newSortDirection, a, b));
		updateState({ attachments: sorted, sortDirection: newSortDirection });

		try {
			await attachmentsService.updateSortPreference(state.properties.table, newSortDirection);
		} catch (err) {
			console.error('Failed to save sort preference', err);
		}
	},

	'ATTACHMENT_RENAMED': ({ action, state, updateState }) => {
		const { attachmentId, newName } = action?.payload?.details ?? {};
		updateState({
			attachments: renameInList(state.attachments, attachmentId, newName),
			initAttachments: renameInList(state.initAttachments, attachmentId, newName),
		});
	},

	'UPLOAD_ATTACHMENT_SUCCESS': ({ action, state, updateState }) => {
		const newAttachment = action?.payload?.attachment;
		if (!newAttachment) return;
		updateState({
			attachments: [...state.attachments, newAttachment],
			initAttachments: [...state.initAttachments, newAttachment],
		});
	},
};
