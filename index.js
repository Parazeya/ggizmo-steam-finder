'use strict'

const { Registry } = require('rage-edit')
    , fs = require('fs')
    , cp = require('child_process')
    , parser = require('steam-acf2json').decode
    , express = (require('express')()).listen();

(async () => {
    try {
        const REGISTRY_PATH = "HKEY_CURRENT_USER\\Software\\Valve\\Steam"
        var SteamPath = await Registry.get(REGISTRY_PATH, 'SteamPath'),
            SteamAppsDirectory, SteamAppFolders, SteamAppVDF, i, e, manifest, outputData = []
        if (SteamPath === undefined) throw new Error("Cant find Steam registry: " + REGISTRY_PATH)
        SteamAppFolders = parser(fs.readFileSync(SteamPath + "\\config\\libraryfolders.vdf", 'utf8'))
        if (SteamAppFolders === undefined) throw new Error("Cant read file:", "LibraryFolders.vdf")
        SteamAppVDF = Object.values(SteamAppFolders.libraryfolders).filter(t => t.path !== undefined)
        if (SteamAppFolders === undefined) throw new Error("Cant read file:", "LibraryFolders.vdf")
        for (i in SteamAppVDF) {
            SteamAppsDirectory = fs.readdirSync(SteamAppVDF[i].path.replace(/\\\\/g, "/") + "/steamapps").filter(f => f.split(".").pop() === "acf")
            // console.log(SteamAppVDF[i].path.replace(/\\\\/g, "/") + "/steamapps", SteamAppsDirectory[0] === undefined)
            if (SteamAppsDirectory[0] === undefined) continue;
            for (e in SteamAppsDirectory) {
                manifest = parser(fs.readFileSync(SteamAppVDF[i].path.replace(/\\\\/g, "/") + "/steamapps/" + SteamAppsDirectory[e], 'utf8'))
                outputData.push({
                    Caption: manifest.AppState.name,
                    ExecutablePath: manifest.AppState.LauncherPath.replace(/\\\\/g, "\\"),
                    Arguments: "steam://rungameid/" + manifest.AppState.appid,
                    WorkingDirectory: manifest.AppState.LauncherPath.replace(/\\\\/g, "\\").replace("\\steam.exe","")
                })
                console.log(outputData)
            }
        }
        fs.writeFileSync(__dirname + "\\apps.json",JSON.stringify(outputData))
        console.log("DONE")
    } catch (e) {
        console.log(e.message)
    }
})()