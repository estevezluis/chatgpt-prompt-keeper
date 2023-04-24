import { writeFileSync, unlinkSync, mkdirSync, rmdirSync } from "node:fs";
import { Zip } from "zip-lib";

import manifest from "../manifest.json" assert { type: "json" };
const backgroundFile = "lib/background.js";

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
	},
};

for (const vendor in manifestForVendors) {
	console.log(`Creating ${vendor} manifest`);
	const tempManifest = {
		...manifest,
		...manifestForVendors[vendor],
	};
	const fileName = `${vendor}/manifest.json`;
	const zip = new Zip();

	mkdirSync(vendor);
	writeFileSync(fileName, JSON.stringify(tempManifest, null, 2));

	zip.addFolder("./lib", "./lib");
	zip.addFile(fileName);

	for (const icon of Object.values(manifest.icons)) {
		zip.addFile(icon, icon);
	}

	await zip.archive(`./chatgpt-prompt-keeper-${vendor}.zip`);
	unlinkSync(fileName);
	rmdirSync(vendor);
}
