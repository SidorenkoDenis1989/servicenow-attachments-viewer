import { createCustomElement, actionTypes } from '@servicenow/ui-core';
import '@servicenow/now-checkbox';
import attachmentsService from './service/attachment.service';
import './components/header';
import './components/search-bar';
import { AttachmentsList } from './components/attachments-list';
import styles from './styles.scss';

const SELECT_ALL_CHECKBOX_NAME = "select-all-attachments";
const { COMPONENT_BOOTSTRAPPED } = actionTypes;
const getCheckedStateForSelectAll = (attachmentsLength, selectedAttachmentsLength) => {
	if (selectedAttachmentsLength === 0) return false;
	if (attachmentsLength === selectedAttachmentsLength) return true;
	return 'indeterminate';
}

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

	actionHandlers: {
		[COMPONENT_BOOTSTRAPPED]: async ({ updateState, state }) => {
				try {
						const { table, sysId } = state.properties ?? {};
						if (!table || !sysId) return;

						const { attachments, sortDirection } = await attachmentsService.fetch(table, sysId);

						const sorted = [...attachments].sort((a, b) => 
								attachmentsService.sort(sortDirection ?? 'ascending', a, b)
						);

						await updateState({
								attachments:     sorted,
								initAttachments: sorted,
								sortDirection:   sortDirection ?? 'ascending'
						});
				} catch (e) {
						console.error('Error fetching attachments', e);
				}
		},
		'ATTACHMENT_SELECTED': ({ action, state, updateState, host }) => {
			const isSelected = action?.payload?.details?.isSelected;
			const attachmentId = action?.payload?.details?.attachmentSysId;
			const newSelectedAttachments = new Set(state.selectedAttachments);

			if (isSelected) {
				newSelectedAttachments.add(attachmentId);
			} else {
				newSelectedAttachments.delete(attachmentId);
			}

			updateState({ selectedAttachments: newSelectedAttachments });

			host.dispatch('CHANGE_ATTACHMENTNS_STATE', {
				bubbles: true,
				composed: true,
				details: { selectedAttachments: newSelectedAttachments }
			});

		},
		'NOW_CHECKBOX#CHECKED_SET': ({ action, state, updateState, host }) => {
			const val = action?.payload?.value;
			const name = action?.payload?.name;

			if (name !== SELECT_ALL_CHECKBOX_NAME) return;
			const newSelectedAttachments = val ? new Set(state.attachments.map(att => att.sys_id)) : new Set();
			updateState({ selectedAttachments: newSelectedAttachments });

			host.dispatch('CHANGE_ATTACHMENTNS_STATE', {
				bubbles: true,
				composed: true,
				details: { selectedAttachments: newSelectedAttachments }
			});
		},
		'ATTACHMENT_DELETED': ({ action, state, updateState }) => {
			const deletedAttachment = action?.payload?.details?.attachment;
			const newAttachments = state.attachments.filter(att => att.sys_id !== deletedAttachment.sys_id);
			updateState({
				attachments: newAttachments,
				initAttachments: newAttachments,
			});
			updateState({ selectedAttachments: new Set() });
		},

		'SEARCH_TERM_SET': ({ action, state, updateState }) => {
			const searchTerm = action?.payload?.value ?? "";
			if (!searchTerm) {
				updateState({
					attachments: state.initAttachments
				});
				return;
			}
			
			const filteredAttachments = state.initAttachments.filter(att => att.file_name.toLowerCase().includes(searchTerm.toLowerCase()));
			updateState({ attachments: filteredAttachments });
		},

		'SORT_ATTACHMENTS': async ({ action, updateState, state }) => {
				const newSortDirection = action?.payload?.sortDirection;
				const sortedAttachments = [...state.attachments].sort((a, b) => 
						attachmentsService.sort(newSortDirection, a, b)
				);
				updateState({ attachments: sortedAttachments, sortDirection: newSortDirection });

				try {
						await attachmentsService.updateSortPreference(state.properties.table, newSortDirection);
				} catch (err) {
						console.error('Failed to save sort preference', err);
				}
		},

		'ATTACHMENT_RENAMED': ({action, updateState, state }) => {
			const attachmentId = action?.payload?.details?.attachmentId;
			const newName = action?.payload?.details?.newName;
			const updatedAttachments = state.attachments.map(att => {
				if (att.sys_id === attachmentId) {
					return { ...att, file_name: newName };
				}
				return att;
			});
			const updatedInitAttachments = state.initAttachments.map(att => {
				if (att.sys_id === attachmentId) {
					return { ...att, file_name: newName };
				}
				return att;
			});

			updateState({ attachments: updatedAttachments, initAttachments: updatedInitAttachments });
		},

		'UPLOAD_ATTACHMENT_CLICKED': ({ host }) => {
			console.log(host.shadowRoot.querySelector('#upload-attachment-input'));
      host.querySelector('#upload-attachment-input')?.click();
    },

		'UPLOAD_ATTACHMENT_SUCCESS': ({ action, updateState, state }) => {
			const newAttachment = action?.payload?.attachment;
			if (newAttachment) {
				const updatedAttachments = [...state.attachments, newAttachment];
				const updatedInitAttachments = [...state.initAttachments, newAttachment];
				updateState({ attachments: updatedAttachments, initAttachments: updatedInitAttachments });
			}
		}
  },


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
