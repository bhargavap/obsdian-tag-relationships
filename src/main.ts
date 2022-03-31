import {
  App,
  Modal,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  TAbstractFile,
  TFile
} from "obsidian";
import matter = require('gray-matter');

interface ObsidianTagRelationshipsSettings {
  mySetting: string;
}
const DEFAULT_SETTINGS: ObsidianTagRelationshipsSettings = {
  mySetting: "default",
};
export default class ObsidianTagRelationships extends Plugin {
  settings: ObsidianTagRelationshipsSettings;
  async onload() {
    console.log("loading plugin");
    await this.loadSettings();

    this.registerEvent(
      this.app.vault.on('modify', (file) => this.InterpretKeywords(file)),
    );

  }
  onunload() {
    console.log("unloading plugin");
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  /**
   * Renames the file with the first heading found
   *
   * @param      {TAbstractFile}  file    The file
   */
 async InterpretKeywords(file: TAbstractFile) {
    if (!(file instanceof TFile)) { return; }
    
    var filecontents = this.app.vault.read(file).then((data) => {
      return matter(data);
    });
    var prefiltered = this.doFilter((await filecontents).content);
    console.log(prefiltered);
    var keywords = this.doStemming(prefiltered);
    console.log(keywords);
 }

 doFilter(text:string) {
    text = text.replace("#", "");
    if (text.indexOf("```") > 0 || text.indexOf("`[`") > 0) {
     text = text.replace(text.slice(text.indexOf("```"), text.indexOf("```", text.indexOf("```")+1)+3), "");
     text = text.replace(text.slice(text.indexOf("`[`"), text.indexOf("`]`:", text.indexOf("`[`")+1)+3), "");
     text = this.doFilter(text);
    }
   return text;
 }
 doStemming(data) {
    const { StemmerEn, StopwordsEn } = require('@nlpjs/lang-en');
    const stemmer = new StemmerEn();
    stemmer.stopwords = new StopwordsEn();
    var nData = stemmer.tokenizeAndStem(data, false);
    var out = {};
    for (let i = 0; i < nData.length; i++ ) {
      out[nData[i]] = out[nData[i]] + 1 || 1;
    }
    return out;
 }
}
