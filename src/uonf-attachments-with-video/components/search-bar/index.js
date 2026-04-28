import { createCustomElement } from '@servicenow/ui-core';
import '@servicenow/now-icon';
import '@servicenow/now-input';
import styles from '../../styles.scss';
import { actionHandlers } from '../../handlers/search-bar-handlers';

createCustomElement('uonf-search-bar', {
	initialState: {
		searchTerm: '',
	},

	properties: {
		table: { default: '' },
		sysId: { default: '' },
	},

	actionHandlers,

	view: (state) => (
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
					></now-button-iconic>
				</now-input>
			</div>
			<div className="sn-panel-header-content">
				<input
					type="file"
					id="upload-attachment-input"
					style={{ display: 'none' }}
					multiple
				/>
				<now-button
					componentName="upload-attachment-button"
					icon="plusOutline"
					variant="tertiary"
					size="md"
					data-tooltip="Add file"
					data-ariadescribedby="Add file"
				></now-button>
			</div>
		</div>
	),

	styles
});
