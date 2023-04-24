import { writeFileSync, mkdirSync, copyFileSync } from "node:fs";

import manifest from "../manifest.json" assert { type: "json" };
const backgroundFile = "lib/background.js";

const files = [
	"background.js",
	"content-script.js",
	"background.js.map",
	"content-script.js.map",
];

const manifestForVendors = {
	chrome: {
		background: {
			service_worker: backgroundFile,
		},
	},
	firefox: {
		background: {
			scripts: [backgroundFile],
		},
		browser_specific_settings: {
			geoko: {
				id: "{0ba0191c-a4b1-4475-b5e8-9c2a6c6865e6}",
				strict_min_version: "109",
			},
		},
	},
};

for (const vendor in manifestForVendors) {
	console.log(`Creating ${vendor} manifest`);
	const tempManifest = {
		...manifest,
		...manifestForVendors[vendor],
	};
	const fileName = `${vendor}/manifest.json`;

	mkdirSync(vendor);
	mkdirSync(vendor + "/lib");
	writeFileSync(fileName, JSON.stringify(tempManifest, null, 2));

	for (const file of files) {
		copyFileSync(`lib/${file}`, `${vendor}/lib/${file}`);
	}
}
