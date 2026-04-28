import { actionTypes } from '@servicenow/ui-core';

export const ACTION_NAMES = {
	deleteAttachment: 'delete-attachment',
	cancelDeleteAttachment: 'cancel-delete-attachment',
	applyRenaming: 'apply-renaming',
	cancelRenaming: 'cancel-renaming',
	downloadAttachment: 'download-attachment',
};

export const { COMPONENT_BOOTSTRAPPED } = actionTypes;
