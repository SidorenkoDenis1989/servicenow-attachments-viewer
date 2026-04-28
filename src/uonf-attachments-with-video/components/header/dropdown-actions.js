import { DOWNLOAD_ALL } from '../../constants/header-constants';

export const getDropdownItems = (selectedItems = []) => [
	{
		id: DOWNLOAD_ALL,
		icon: 'download-outline',
		label: selectedItems.length > 0 ? `Download (${selectedItems.length})` : 'Download All',
	}
];
