export const bytesToLabel = (size) => {
    // if already a number, format directly
    if (typeof size === 'number') {
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
        if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
        return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }

    // if string — extract number and unit
    const match = String(size).match(/^([\d.]+)\s*(B|KB|K|MB|M|GB|G)?/i);
    if (!match) return size; // can't parse — return as is

    const value = parseFloat(match[1]);
    const unit  = (match[2] || 'B').toUpperCase();

    const unitMap = {
        'B':  1,
        'K':  1024,
        'KB': 1024,
        'M':  1024 * 1024,
        'MB': 1024 * 1024,
        'G':  1024 * 1024 * 1024,
        'GB': 1024 * 1024 * 1024,
    };

    const bytes = value * (unitMap[unit] ?? 1);

    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

export const debounce = (func, wait) => {
	const context = this;
	const delay = wait || 300;
	let timeoutId;
	return function (...args) {
		clearInterval(timeoutId);
		timeoutId = setTimeout(() => {
			func.apply(context, args);
		}, delay);
	}
};
