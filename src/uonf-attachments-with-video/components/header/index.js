import { createCustomElement } from '@servicenow/ui-core';
import '@servicenow/now-icon';
import '@servicenow/now-dropdown';
import styles from '../../styles.scss';
import { actionHandlers } from '../../handlers/header-handlers';
import { getDropdownItems } from './dropdown-actions';
import { SORT_ATTACHMENTS } from '../../constants/header-constants';

createCustomElement('uonf-attachments-header', {
	properties: {
		sysId: { default: '' },
		selectedAttachments: { default: [] },
		sortDirection: { default: '' },
	},

	actionHandlers,

	view: (state) => {
		const { selectedAttachments, sortDirection } = state.properties;
		const isDescending = sortDirection === 'descending';
		const sortIcon = isDescending ? 'sort-descending-outline' : 'sort-ascending-outline';
		const sortLabel = isDescending ? 'Sort by oldest to newest' : 'Sort by newest to oldest';

		return (
			<div className="attachments-header">
				<h2>Attachments</h2>
				<now-button-iconic
					icon={sortIcon}
					className="sort-button"
					size="md"
					aria-label={sortLabel}
					variant="tertiary"
					bare
					data-tooltip={sortLabel}
					data-ariadescribedby={sortLabel}
					componentName={SORT_ATTACHMENTS}
				></now-button-iconic>
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
