import { createCustomElement, actionTypes } from '@servicenow/ui-core';
import '@servicenow/now-icon';
import '@servicenow/now-input';
import attachmentsService from '../../service/attachment.service';
import { debounce } from '../../utils/utils';
import styles from '../../styles.scss';

const { COMPONENT_BOOTSTRAPPED } = actionTypes;

createCustomElement('uonf-search-bar', {
	initialState: {
		searchTerm: "",
	},

	properties: {
		table: { default: '' },
		sysId: { default: '' },
	},

	actionHandlers: {
		[COMPONENT_BOOTSTRAPPED]: async ({state, host }) => {
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
							bubbles:  true,
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
			const name = action?.meta?.componentName;
			if (name !== 'upload-attachment-button') return;
      host.shadowRoot.querySelector('#upload-attachment-input')?.click();
		},

		'NOW_BUTTON_ICONIC#CLICKED': ({ updateState, host }) => {
			updateState({searchTerm: ""});
			host.dispatch('SEARCH_TERM_SET', {
				bubbles:  true,
				composed: true,
				value: ""
			});
		},

		'NOW_INPUT#INPUT': debounce(({ action, updateState, host }) => {
			updateState({searchTerm: action?.payload?.fieldValue ?? ""});
			host.dispatch('SEARCH_TERM_SET', {
				bubbles:  true,
				composed: true,
				value: action?.payload?.fieldValue ?? ""
			});
		}),
	},

	view: (state) => {
		return (
			<div className="sn-panel-header-search">
				<div className="sn-panel-header-content">
					<now-input
						className="search-input"
						placeholder="Search attachments"
						value={state.searchTerm}
						manageValue={true}
					>
						<now-icon
							className="search-icon"
							slot="start"
							icon="magnifyingGlassOutline"
							size="sm"
						></now-icon>
						<now-button-iconic
							slot="end"
							icon="closeOutline"
							size="sm"
							aria-label="Clear Search"
							variant="tertiary"
							bare
							data-tooltip="Clear search"
							data-ariadescribedby="Clear search"
						>
						</now-button-iconic>
					</now-input>
				</div>
				<div className="sn-panel-header-content">
					<input
						type="file"
						id="upload-attachment-input"
						style={{
							display: "none"
						}}
						multiple
					/>
					<now-button
						componentName="upload-attachment-button"
						icon="plusOutline"
						variant="tertiary"
						size="md"
						data-tooltip="Add file"
						data-ariadescribedby="Add file"
					>
					</now-button>
				</div>
			</div>
		);
	},
	styles
});
