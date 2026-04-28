import { createCustomElement } from '@servicenow/ui-core';
import '@servicenow/now-checkbox';
import './components/header';
import './components/search-bar';
import { AttachmentsList } from './components/attachments-list';
import styles from './styles.scss';
import { actionHandlers } from './handlers/index-handlers';
import { SELECT_ALL_CHECKBOX_NAME, getCheckedStateForSelectAll } from './constants/index-constants';

createCustomElement('uonf-attachments-with-video', {
	initialState: {
		initAttachments: [],
		attachments: [],
		selectedAttachments: new Set(),
		sortDirection: 'ascending'
	},

	properties: {
		table: { default: '' },
		sysId: { default: '' },
	},

	actionHandlers,

	view: (state) => {
		const { attachments = [], selectedAttachments = new Set() } = state;
		return (
			<div className="attachments-container">
				<uonf-attachments-header
					sysId={state.properties.sysId}
					selectedAttachments={Array.from(selectedAttachments)}
					sortDirection={state.sortDirection}
				></uonf-attachments-header>
				<uonf-search-bar
					table={state.properties.table}
					sysId={state.properties.sysId}
				></uonf-search-bar>
				<now-checkbox
					checked={getCheckedStateForSelectAll(attachments.length, selectedAttachments.size)}
					name={SELECT_ALL_CHECKBOX_NAME}
					label="Select All"
				></now-checkbox>
				<AttachmentsList
					attachments={attachments}
					selectedAttachments={Array.from(selectedAttachments)}
				/>
			</div>
		);
	},

	styles
});
