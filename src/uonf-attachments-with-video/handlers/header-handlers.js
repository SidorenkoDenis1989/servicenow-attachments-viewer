import { SORT_ATTACHMENTS, DOWNLOAD_ALL } from '../constants/header-constants';

export const actionHandlers = {
	'NOW_DROPDOWN#ITEM_CLICKED': ({ action, state }) => {
		const itemId = action?.payload?.item?.id;
		if (itemId !== DOWNLOAD_ALL) return;

		const { sysId, selectedAttachments } = state.properties;
		const base = `/download_all_attachments.do?sysparm_sys_id=${sysId}`;

		window.location.href = selectedAttachments.length
			? `${base}&sysparm_attachment_ids=${selectedAttachments.join(',')}`
			: base;
	},

	'NOW_BUTTON_ICONIC#CLICKED': ({ action, state, updateState, host }) => {
		if (action?.meta?.componentName !== SORT_ATTACHMENTS) return;

		const direction = state.properties.sortDirection === 'ascending' ? 'descending' : 'ascending';
		host.dispatch('SORT_ATTACHMENTS', { bubbles: true, composed: true, sortDirection: direction });
		updateState({ sortDirection: direction });
	},
};
