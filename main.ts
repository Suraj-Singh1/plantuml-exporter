import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile, TAbstractFile } from 'obsidian';
import { encode } from 'plantuml-encoder';

// For remembering to rename these classes and interfaces!

interface PlantUMLExporterSettings {
	plantumlServerUrl: string;
	outputFormat: 'png' | 'svg';
}

const DEFAULT_SETTINGS: PlantUMLExporterSettings = {
	plantumlServerUrl: 'http://www.plantuml.com/plantuml',
	outputFormat: 'png'
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

		while ((match = plantumlRegex.exec(fileContent)) !== null) {
			diagramsFound = true;
			const originalBlock = match[0];
			const plantumlCode = match[1];

			try {
				const encoded = encode(plantumlCode);
				const imageUrl = `${this.settings.plantumlServerUrl}/${this.settings.outputFormat}/${encoded}`;
				const imageMarkdown = `![PlantUML Diagram](${imageUrl})`;
				newContent = newContent.replace(originalBlock, imageMarkdown);
			} catch (error) {
				console.error('Error encoding PlantUML:', error);
				new Notice(`Error processing PlantUML block: ${error.message}`);
				// Keep the original block if encoding fails
			}
		}

		if (!diagramsFound) {
			new Notice('No PlantUML code blocks found in the current file.');
			return;
		}

		// Create the new file
		const newFileName = `${file.basename}-exported.md`;
		const newFilePath = file.path.replace(file.name, newFileName);

		try {
		    // Check if file already exists
		    const existingFile = this.app.vault.getAbstractFileByPath(newFilePath);
		    if (existingFile instanceof TFile) {
		        // Optionally ask user if they want to overwrite, or just overwrite
		        await this.app.vault.modify(existingFile, newContent);
		        new Notice(`Exported PlantUML diagrams to existing file: ${newFileName}`);
		    } else {
		        await this.app.vault.create(newFilePath, newContent);
		        new Notice(`Exported PlantUML diagrams to new file: ${newFileName}`);
		    }
		} catch (error) {
		    console.error('Error creating/writing exported file:', error);
		    new Notice(`Error saving exported file: ${error.message}`);
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
					this.plugin.settings.plantumlServerUrl = value || DEFAULT_SETTINGS.plantumlServerUrl;
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
	}
}
