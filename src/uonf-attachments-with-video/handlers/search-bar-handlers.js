import { actionTypes } from '@servicenow/ui-core';
import attachmentsService from '../service/attachment.service';
import { debounce } from '../utils/utils';

const { COMPONENT_BOOTSTRAPPED } = actionTypes;

export const actionHandlers = {
	[COMPONENT_BOOTSTRAPPED]: async ({ state, host }) => {
		const input = host.shadowRoot.querySelector('#upload-attachment-input');
		if (!input) {
			console.warn('File input not found in shadow root');
			return;
		}

		const onFileSelected = async (e) => {
			const files = Array.from(e.target.files);
			if (!files.length) return;

			const { table, sysId } = state.properties;

			for (const file of files) {
				try {
					const uploaded = await attachmentsService.upload(table, sysId, file);
					host.dispatch('UPLOAD_ATTACHMENT_SUCCESS', {
						bubbles: true,
						composed: true,
						attachment: uploaded
					});
				} catch (err) {
					console.error('Upload failed', err);
				}
			}

			e.target.value = '';
		};

		input.addEventListener('change', onFileSelected);
		return () => input.removeEventListener('change', onFileSelected);
	},

	'NOW_BUTTON#CLICKED': ({ action, host }) => {
		if (action?.meta?.componentName !== 'upload-attachment-button') return;
		host.shadowRoot.querySelector('#upload-attachment-input')?.click();
	},

	'NOW_BUTTON_ICONIC#CLICKED': ({ updateState, host }) => {
		updateState({ searchTerm: '' });
		host.dispatch('SEARCH_TERM_SET', { bubbles: true, composed: true, value: '' });
	},

	'NOW_INPUT#INPUT': debounce(({ action, updateState, host }) => {
		const value = action?.payload?.fieldValue ?? '';
		updateState({ searchTerm: value });
		host.dispatch('SEARCH_TERM_SET', { bubbles: true, composed: true, value });
	}),
};
