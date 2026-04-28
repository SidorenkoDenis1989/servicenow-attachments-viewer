import { actionTypes } from '@servicenow/ui-core';

export const SELECT_ALL_CHECKBOX_NAME = 'select-all-attachments';

export const { COMPONENT_BOOTSTRAPPED } = actionTypes;

export const getCheckedStateForSelectAll = (attachmentsLength, selectedAttachmentsLength) => {
	if (selectedAttachmentsLength === 0) return false;
	if (attachmentsLength === selectedAttachmentsLength) return true;
	return 'indeterminate';
};
