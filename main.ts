import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile, TAbstractFile } from 'obsidian';
import { encode } from 'plantuml-encoder';

interface PlantUMLExporterSettings {
	plantumlServerUrl: string;
	outputFormat: 'png' | 'svg';
	exportMode: 'newFile' | 'modifyFile'; // Added export mode setting
}

const DEFAULT_SETTINGS: PlantUMLExporterSettings = {
	plantumlServerUrl: 'http://www.plantuml.com/plantuml',
	outputFormat: 'png',
	exportMode: 'newFile' // Default to creating a new file
}

export default class PlantUMLExporterPlugin extends Plugin {
	settings: PlantUMLExporterSettings;

	async onload() {
		await this.loadSettings();

		// This adds a command that can be triggered anywhere
		this.addCommand({
			id: 'export-plantuml-diagrams',
			name: 'Export PlantUML diagrams to images',
			callback: () => {
				this.exportDiagrams();
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new PlantUMLExporterSettingTab(this.app, this));

		console.log('PlantUML Exporter plugin loaded.');
	}

	onunload() {
		console.log('PlantUML Exporter plugin unloaded.');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async exportDiagrams() {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!activeView) {
			new Notice('No active Markdown view found.');
			return;
		}

		const file = activeView.file;
		if (!file) {
		    new Notice('No active file found.');
		    return;
		}

		const fileContent = await this.app.vault.read(file);
		const plantumlRegex = /```plantuml\n([\s\S]*?)\n```/g;
		let match;
		let newContent = fileContent;
		let diagramsFound = false;
		let blocksProcessed = 0;

		// Use replace with a function to handle multiple blocks correctly
		newContent = fileContent.replace(plantumlRegex, (originalBlock, plantumlCode) => {
			diagramsFound = true;
			try {
				const encoded = encode(plantumlCode);
				const imageUrl = `${this.settings.plantumlServerUrl}/${this.settings.outputFormat}/${encoded}`;
				const imageMarkdown = `![PlantUML Diagram](${imageUrl})`;
				blocksProcessed++;
				return imageMarkdown; // Return the replacement
			} catch (error) {
				console.error('Error encoding PlantUML:', error);
				new Notice(`Error processing PlantUML block: ${error.message}`);
				return originalBlock; // Keep the original block if encoding fails
			}
		});


		if (!diagramsFound) {
			new Notice('No PlantUML code blocks found in the current file.');
			return;
		}

		if (newContent === fileContent) {
		    new Notice('No changes made. Potential encoding errors occurred.');
		    return;
		}

		// Perform action based on exportMode setting
		if (this.settings.exportMode === 'newFile') {
			// Create the new file
			const newFileName = `${file.basename}-exported.md`;
			const newFilePath = file.path.replace(file.name, newFileName);

			try {
			    const existingFile = this.app.vault.getAbstractFileByPath(newFilePath);
			    if (existingFile instanceof TFile) {
			        await this.app.vault.modify(existingFile, newContent);
			        new Notice(`Updated existing exported file: ${newFileName} (${blocksProcessed} diagrams)`);
			    } else {
			        await this.app.vault.create(newFilePath, newContent);
			        new Notice(`Exported PlantUML diagrams to new file: ${newFileName} (${blocksProcessed} diagrams)`);
			    }
			} catch (error) {
			    console.error('Error creating/writing exported file:', error);
			    new Notice(`Error saving exported file: ${error.message}`);
			}
		} else { // exportMode === 'modifyFile'
			try {
				await this.app.vault.modify(file, newContent);
				new Notice(`Modified current file: ${file.name} (${blocksProcessed} diagrams replaced)`);
			} catch (error) {
				console.error('Error modifying current file:', error);
				new Notice(`Error modifying file: ${error.message}`);
			}
		}
	}
}

class PlantUMLExporterSettingTab extends PluginSettingTab {
	plugin: PlantUMLExporterPlugin;

	constructor(app: App, plugin: PlantUMLExporterPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'PlantUML Exporter Settings'});

		new Setting(containerEl)
			.setName('PlantUML Server URL')
			.setDesc('The URL of the PlantUML server to use for rendering.')
			.addText(text => text
				.setPlaceholder('Enter PlantUML server URL')
				.setValue(this.plugin.settings.plantumlServerUrl)
				.onChange(async (value) => {
					this.plugin.settings.plantumlServerUrl = value.trim() || DEFAULT_SETTINGS.plantumlServerUrl;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Output Format')
			.setDesc('The image format for the exported diagrams.')
			.addDropdown(dropdown => dropdown
				.addOption('png', 'PNG')
				.addOption('svg', 'SVG')
				.setValue(this.plugin.settings.outputFormat)
				.onChange(async (value: 'png' | 'svg') => {
					this.plugin.settings.outputFormat = value;
					await this.plugin.saveSettings();
				}));

		// Add setting for export mode
		new Setting(containerEl)
			.setName('Export Mode')
			.setDesc('Choose whether to create a new file or modify the current file.')
			.addDropdown(dropdown => dropdown
				.addOption('newFile', 'Create new file (*-exported.md)')
				.addOption('modifyFile', 'Modify current file in place')
				.setValue(this.plugin.settings.exportMode)
				.onChange(async (value: 'newFile' | 'modifyFile') => {
					this.plugin.settings.exportMode = value;
					await this.plugin.saveSettings();
				}));
	}
}
