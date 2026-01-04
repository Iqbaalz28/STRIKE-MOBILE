export const formatTimeAgo = (dateString: string) => {
	const date = new Date(dateString);
	const now = new Date();
	const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

	let interval = seconds / 31536000;
	if (interval > 1) return Math.floor(interval) + " thn lalu";

	interval = seconds / 2592000;
	if (interval > 1) return Math.floor(interval) + " bln lalu";

	interval = seconds / 86400;
	if (interval > 1) return Math.floor(interval) + " hari lalu";

	interval = seconds / 3600;
	if (interval > 1) return Math.floor(interval) + " jam lalu";

	interval = seconds / 60;
	if (interval > 1) return Math.floor(interval) + " mnt lalu";

	return "Baru saja";
};
