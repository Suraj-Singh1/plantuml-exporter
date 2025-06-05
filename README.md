# Exporting PlantUML Diagrams in Obsidian – A Handy Plugin

So here’s the deal: if you're the kind of person who likes to sketch out systems or workflows using PlantUML in your Obsidian notes, there's a plugin that might just make your life a whole lot easier. It's called **PlantUML Exporter**, and what it does is pretty straightforward—it takes those code blocks where you’ve written your PlantUML diagrams and swaps them out for actual images. No fuss, no drama.

The cool part? You get to choose whether the plugin saves your new diagram-filled content in a fresh Markdown file (named something like `your-note-exported.md`), or if it just dives right in and updates your existing note on the spot. Totally up to you.

## What It Does

* It looks for those `plantuml` blocks you’ve written in your note.
* Then it runs that code through PlantUML’s standard encoding system.
* After that, it generates links to rendered diagram images hosted on a PlantUML server (default is `http://www.plantuml.com/plantuml`, but you can change that if you’ve got a favorite mirror).
* It supports both **PNG** and **SVG** formats—your pick.
* You’ll find a new command in Obsidian’s Command Palette called something like “Export PlantUML diagrams to images.”
* There’s also a handy little settings section where you can tweak things like the server URL, image format, and whether you want to export in-place or to a new file.

## Getting It Set Up

Installing it isn’t rocket science, but here’s the short version:

1. Grab the `plantuml-exporter.zip` file (should be linked wherever you found this plugin).
2. Unzip it—inside you’ll find `main.js`, `manifest.json`, and `styles.css`.
3. Open Obsidian and go to `Settings` → `Community plugins`.
4. If you haven’t already, enable community plugins (and yeah, read the warning about third-party code).
5. Click the folder icon next to “Installed plugins” to open the plugins directory (`YourVault/.obsidian/plugins/`).
6. Drop the `plantuml-exporter` folder you just unzipped into that directory.
7. Back in Obsidian, Reload the Obsidian.
8. Look for “PlantUML Exporter” in your plugin list and flip the switch to turn it on.

Boom, done.

## How to Actually Use It

Once it’s installed, here’s what you do:

1. If you want, head to `Settings` → `Community Plugins` → `PlantUML Exporter` and set things up (server, format, etc.).
2. Open any note that has PlantUML code blocks (the ones wrapped in triple backticks with `plantuml`).
3. Hit the Command Palette (`Ctrl+P` or `Cmd+P`) and look for the “Export PlantUML diagrams to images” command.
4. Run the command.

Depending on your export setting:

* If you chose to create a new file, you’ll get a shiny new note with the same content, but the PlantUML blocks will be replaced with image embeds.
* If you opted to update in place, the plugin will go ahead and swap the code blocks for image links right inside your current note.

## Tweak It to Your Taste

Head to the plugin’s settings and you’ll be able to configure:

* **PlantUML Server URL**: Maybe you’re self-hosting or just prefer a different server? Swap it here.
* **Output Format**: Choose between SVG (great for scaling) or PNG (more universal).
* **Export Mode**: New file or current file—whatever fits your workflow.

---

Bottom line: if you use PlantUML in Obsidian and you’re tired of flipping between diagrams and raw code, this plugin saves you the hassle. It’s not flashy, but it’s clean, smart, and does exactly what you need.
