export const buildDropdownActions = (attachment) => [
	{
		id: `attachment-dropdown-${attachment.sys_id}`,
		icon: 'ellipsis-v-outline',
		label: 'Attachment actions',
		items: [
			{ id: 'download', icon: 'download-outline', label: 'Download', href: attachment.download_link },
			{ id: 'delete', icon: 'trash-outline', label: 'Delete' },
			{ id: 'rename', icon: 'pencil-page-outline', label: 'Rename' },
		],
	}
];
