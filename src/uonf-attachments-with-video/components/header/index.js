import { createCustomElement } from '@servicenow/ui-core';
import '@servicenow/now-icon';
import '@servicenow/now-dropdown';
import styles from '../../styles.scss';

const SORT_ATTACHMENTS = 'sort-attachments';
const DOWNLOAD_ALL = 'download-all';
const getDropdownItems = (selectedItems = []) => {
	const label = selectedItems.length > 0 ? `Download (${selectedItems.length})` : 'Download All';
	return [
		{
			id: DOWNLOAD_ALL,
			icon: 'download-outline',
			label: label,
		}
	];
};

createCustomElement('uonf-attachments-header', {

	properties: {
    sysId: { default: '' },
    selectedAttachments: { default: [] },
		sortDirection: { default: '' },
  },

	actionHandlers: {
		'NOW_DROPDOWN#ITEM_CLICKED': ({ action, state }) => {
			const payload = action?.payload;
			const itemId = payload?.item?.id;
			if (!payload || !itemId || itemId !== DOWNLOAD_ALL) return;

			const sysId = state.properties.sysId;
			const selectedAttachments = state.properties.selectedAttachments;

			if (!selectedAttachments.length) {
				window.location.href = `/download_all_attachments.do?sysparm_sys_id=${sysId}`;
				return
			};

			window.location.href = `/download_all_attachments.do?sysparm_sys_id=${sysId}&sysparm_attachment_ids=${[...selectedAttachments].join(',')}`;
		},
		'NOW_BUTTON_ICONIC#CLICKED': ({ action, updateState, state, host }) => {
			if (action?.meta?.componentName === SORT_ATTACHMENTS) {
				const direction = state.properties.sortDirection === "ascending" ? "descending" : "ascending";
				host.dispatch('SORT_ATTACHMENTS', {
					bubbles:  true,
					composed: true,
					sortDirection: direction
				});

				updateState({ sortDirection: direction });
			}

		},
	},

	view: (state) => {
		const { selectedAttachments, sortDirection } = state.properties;
		const sortIcon = sortDirection !== "descending" ? "sort-ascending-outline" : "sort-descending-outline";
		return (
			<div className="attachments-header">
				<h2>
					Attachments
				</h2>
				<now-button-iconic
					icon={sortIcon}
					className="sort-button"
					size="md"
					aria-label={state.sortDirection !== "descending" ? "Sort by newest to oldest" : "Sort by oldest to newest"}
					variant="tertiary"
					bare
					data-tooltip={state.sortDirection !== "descending" ? "Sort by newest to oldest" : "Sort by oldest to newest"}
					data-ariadescribedby={state.sortDirection !== "descending" ? "Sort by newest to oldest" : "Sort by oldest to newest"}
					componentName={SORT_ATTACHMENTS}
				>
				</now-button-iconic>
				<now-dropdown
					icon="ellipsis-v-outline"
					items={getDropdownItems(selectedAttachments)}
					hide-caret={true}
					bare={true}
					select="none"

				></now-dropdown>
			</div>
		);
	},
	styles
});
