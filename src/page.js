import { renderMarkdown } from "./components.js";
import { formatDate, formatTime, MONTHS, monthName } from "./utils.js";

export async function renderChannel(channel, { slice = 5 } = {}) {
	let html = "";
	const blockPages = [];
	let lastMonth = "";
	channel.contents = channel.contents.sort((a, b) => b.connection.position - a.connection.position)
	for (const block of channel.contents ?? []) {
		if (block.type !== "Text" && block.type !== "Image"  ) continue;
		if (block.title?.toUpperCase() === "DRAFT" || block.title?.toLowerCase() === ".canvas") continue;
			const updatedAt = new Date(block.updated_at);
			const createdAt = new Date(block.created_at);
			const date = block.title ?? formatDate(createdAt);
			const thumbnails = [];
			
			
			const currentMonth = monthName(new Date(date));
		if (block.type == "Text" ){
			const content = await renderMarkdown(block.content?.markdown ?? "", thumbnails);
			const contentLines = content.split("\n");
			const contentSliced = contentLines.slice(0, slice).join("\n");

			if (MONTHS.includes(currentMonth) && currentMonth !== lastMonth) {
				html += `<div class="block month mt30"><h1>${currentMonth}</h1></div>`;
			}
			if (MONTHS.includes(currentMonth)) lastMonth = currentMonth;

			html += `
				<div class="block-list">
					<a href="./blocks/${block.id}.html"><h1>${contentLines[0] ?? ""}</h1></a>
					${thumbnails.length ? `<div class="image-thumbnails">${thumbnails.join("\n")}</div>` : ""}
				</div>
				<div class="block">
					<p class="date">${date}</p>
					<span class="metadata">updated_at: ${Number.isNaN(updatedAt.getTime()) ? "" : formatTime(updatedAt)}</span>
					<span class="metadata">posted_on: ${Number.isNaN(createdAt.getTime()) ? "" : formatTime(createdAt)}</span>
					${contentSliced}
					<a href="./blocks/${block.id}.html"> See more </a>
				</div>
			`;
			blockPages.push({
			id: block.id,
			html: `<div class="block">${content}</div>`,
			});
		}

		else if (block.type == "Image" ){
			const image = (block) => `<div class="image"><img loading="lazy" src="${imageSrc(block)}" /></div>`;
			const imageSrc = (block, size = "large") => block.image?.[size]?.src ?? block.image?.src ?? "";
			let content = image(block)
			html += `

				<div class="block">
					<p class="date">${date}</p>
					<span class="metadata">updated_at: ${Number.isNaN(updatedAt.getTime()) ? "" : formatTime(updatedAt)}</span>
					<span class="metadata">posted_on: ${Number.isNaN(createdAt.getTime()) ? "" : formatTime(createdAt)}</span>
					${content}
					<a href="./blocks/${block.id}.html"> See more </a>
				</div>
			`;
			blockPages.push({
			id: block.id,
			html: `<div class="block">${content}</div>`,
			});
		}
	}

	return { html, blockPages };
}

export const viewOptions = `
		<div class="view-options">
			<h4>View</h4>
			<div class="option-group">
				<button type="button" data-width="1100">1100px</button>
				<button type="button" data-width="800">800px</button>
				<button type="button" data-width="500">500px</button>
			</div>
			<div class="option-group">
				<button type="button" data-view="grid">normal</button>
				<button type="button" data-view="list">list</button>
			</div>
		</div>`;

export function wrapPage(html, { links = "", isIndex = false } = {}) {
	return `<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<link rel="icon" type="image/x-icon" href="https://a-p.space/favicon.ico">
		<link rel="stylesheet" href="/style.css">
		${isIndex ? '<link rel="alternate" type="application/rss+xml" href="/feed.xml" title="Aaryan\'s Feed">' : ""}
	</head>
	<body>
		<aside class="panel">
			<h4>Pages</h4>
			<p><a href="/">home</a></p>
			<p><a href="https://github.com/caizoryan/feed.a-p">about</a></p>
			${links}
			${viewOptions}
		</aside>
		<main class="container" data-width="500" data-view="grid">${html}</main>
		<script src="/script.js" defer></script>
	</body>
</html>`;
}
