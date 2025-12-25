import {App, PluginSettingTab, Setting} from "obsidian";
import TurboInventionPlugin from "./main";

export interface TurboInventionSettings {
	mySetting: string;
	confluenceUrl: string;
	confluenceEmail: string;
	confluenceApiToken: string;
}

export const DEFAULT_SETTINGS: TurboInventionSettings = {
	mySetting: 'default',
	confluenceUrl: '',
	confluenceEmail: '',
	confluenceApiToken: ''
}

export class TurboInventionSettingTab extends PluginSettingTab {
	plugin: TurboInventionPlugin;

	constructor(app: App, plugin: TurboInventionPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Confluence connection')
			.setHeading();

		new Setting(containerEl)
			.setName('Confluence URL')
			.setDesc('Your Confluence instance URL (e.g., https://your-domain.atlassian.net)')
			.addText(text => text
				.setPlaceholder('https://your-domain.atlassian.net')
				.setValue(this.plugin.settings.confluenceUrl)
				.onChange(async (value) => {
					this.plugin.settings.confluenceUrl = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Confluence email')
			.setDesc('Your Confluence account email')
			.addText(text => text
				.setPlaceholder('your-email@example.com')
				.setValue(this.plugin.settings.confluenceEmail)
				.onChange(async (value) => {
					this.plugin.settings.confluenceEmail = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Confluence API token')
			.setDesc('Your Confluence API token (create one at https://id.atlassian.com/manage-profile/security/api-tokens)')
			.addText(text => {
				text.setPlaceholder('Enter your API token')
					.setValue(this.plugin.settings.confluenceApiToken)
					.onChange(async (value) => {
						this.plugin.settings.confluenceApiToken = value;
						await this.plugin.saveSettings();
					});
				text.inputEl.type = 'password';
			});

		new Setting(containerEl)
			.setName('Other')
			.setHeading();

		new Setting(containerEl)
			.setName('Settings #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
