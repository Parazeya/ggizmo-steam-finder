'use strict'

const { Registry } = require('rage-edit')
    , fs = require('fs')
    , cp = require('child_process')
    , parser = require('steam-acf2json').decode
    , express = (require('express')()).listen();


; (async () => {
    try {
        const REGISTRY_PATH = "HKEY_CURRENT_USER\\Software\\Valve\\Steam"
        var SteamPath = await Registry.get(REGISTRY_PATH, 'SteamPath'),
            SteamAppsDirectory, SteamAppFolders, SteamAppVDF, i, e, sourceIcon, source600x900, iconFolder = folder() + "/icons/", manifest, outputData = [];
        if (!fs.existsSync(folder() + "/icons")) {
            fs.mkdirSync(folder() + "/icons")
        }
        if (SteamPath === undefined) throw new Error("Cant find Steam registry: " + REGISTRY_PATH)
        SteamAppFolders = parser(fs.readFileSync(SteamPath + "/config/libraryfolders.vdf", 'utf8'))
        if (SteamAppFolders === undefined) throw new Error("Cant read file:", "LibraryFolders.vdf")
        SteamAppVDF = Object.values(SteamAppFolders.libraryfolders).filter(t => t.path !== undefined)
        if (SteamAppVDF === undefined || SteamAppVDF[0] === undefined) {
            if(!fs.existsSync(SteamPath.replace(/\\\\/g, "/") + "/steamapps"))
            SteamAppsDirectory = fs.readdirSync(SteamPath.replace(/\\\\/g, "/") + "/steamapps").filter(f => f.split(".").pop() === "acf")
            if (SteamAppsDirectory[0] === undefined) throw new Error("0 manifest finded!")
            for (i in SteamAppsDirectory) {
                if(!fs.existsSync(fs.readFileSync(SteamPath.replace(/\\\\/g, "/") + "/steamapps/" + SteamAppsDirectory[i]))) return;
                manifest = parser(fs.readFileSync(SteamPath.replace(/\\\\/g, "/") + "/steamapps/" + SteamAppsDirectory[i], 'utf8'))
                sourceIcon = SteamPath + "/appcache/librarycache/" + manifest.AppState.appid + "_icon.jpg";
                source600x900 = SteamPath + "/appcache/librarycache/" + manifest.AppState.appid + "_library_600x900.jpg"
                if (!fs.existsSync(iconFolder + manifest.AppState.appid + "_icon.jpg") && fs.existsSync(sourceIcon)) fs.copyFileSync(sourceIcon, iconFolder + manifest.AppState.appid + "_icon.jpg")
                if (!fs.existsSync(iconFolder + manifest.AppState.appid + "_library_600x900.jpg") && fs.existsSync(source600x900)) fs.copyFileSync(source600x900, iconFolder + manifest.AppState.appid + "_library_600x900.jpg")
                outputData.push({
                    Caption: manifest.AppState.name,
                    ExecutablePath: manifest.AppState.LauncherPath.replace(/\\\\/g, "/"),
                    Arguments: "steam://rungameid/" + manifest.AppState.appid,
                    WorkingDirectory: manifest.AppState.LauncherPath.replace(/\\\\/g, "/").replace("/steam.exe", ""),
                    ManifestName: SteamAppsDirectory[i],
                    Deployment: {
                        Steam: {
                            Name: "Steam",
                            Source: SteamPath.replace(/\\\\/g, "/"),
                            Destination: SteamPath.replace(/\\\\/g, "/"),
                            INEXClusions: {
                                ExcludeFiles: "steam_client_win32.installed;steam_client_win32.manifest",
                                ExcludeDirectories: "steamapps;userdata"
                            }  
                        },
                        SteamApp: {
                            Name: manifest.AppState.name + " Steam",
                            Source: SteamPath.replace(/\\\\/g, "/") + "/steamapps/common/" + manifest.AppState.installdir,
                            Destination: SteamPath.replace(/\\\\/g, "/") + "/steamapps/common/" + manifest.AppState.installdir   
                        },
                        ACF: {
                            Name: manifest.AppState.name + " ACF",
                            Source: SteamPath.replace(/\\\\/g, "/") + "/steamapps",
                            Destination: SteamPath.replace(/\\\\/g, "/") + "/steamapps"   
                        }
                    }
                })
            }
        } else {
            for (i in SteamAppVDF) {
                SteamAppsDirectory = fs.readdirSync(SteamAppVDF[i].path.replace(/\\\\/g, "/") + "/steamapps").filter(f => f.split(".").pop() === "acf")
                if (SteamAppsDirectory[0] === undefined) continue;

                for (e in SteamAppsDirectory) {
                    manifest = parser(fs.readFileSync(SteamAppVDF[i].path.replace(/\\\\/g, "/") + "/steamapps/" + SteamAppsDirectory[e], 'utf8'))
                    if (manifest.AppState.appid == 228980 || manifest.AppState.name.toLowerCase().search(/ soundtrack/) != -1) continue;
                    sourceIcon = SteamPath + "/appcache/librarycache/" + manifest.AppState.appid + "_icon.jpg";
                    source600x900 = SteamPath + "/appcache/librarycache/" + manifest.AppState.appid + "_library_600x900.jpg"
                    if (!fs.existsSync(iconFolder + manifest.AppState.appid + "_icon.jpg") && fs.existsSync(sourceIcon)) fs.copyFileSync(sourceIcon, iconFolder + manifest.AppState.appid + "_icon.jpg")
                    if (!fs.existsSync(iconFolder + manifest.AppState.appid + "_library_600x900.jpg") && fs.existsSync(source600x900)) fs.copyFileSync(source600x900, iconFolder + manifest.AppState.appid + "_library_600x900.jpg")
                    outputData.push({
                        Caption: manifest.AppState.name,
                        ExecutablePath: manifest.AppState.LauncherPath.replace(/\\\\/g, "/"),
                        Arguments: "steam://rungameid/" + manifest.AppState.appid,
                        WorkingDirectory: manifest.AppState.LauncherPath.replace(/\\\\/g, "/").replace("/steam.exe", ""),
                        ManifestName: SteamAppsDirectory[e],
                        Deployment: {
                            Steam: {
                                Name: "Steam",
                                Source: SteamAppVDF[i].path.replace(/\\\\/g, "/"),
                                Destination: SteamAppVDF[i].path.replace(/\\\\/g, "/"),
                                INEXClusions: {
                                    ExcludeFiles: "steam_client_win32.installed;steam_client_win32.manifest",
                                    ExcludeDirectories: "steamapps;userdata"
                                }  
                            },
                            SteamApp: {
                                Name: manifest.AppState.name + " Steam",
                                Source: SteamAppVDF[i].path.replace(/\\\\/g, "/") + "/steamapps/common/" + manifest.AppState.installdir,
                                Destination: SteamAppVDF[i].path.replace(/\\\\/g, "/") + "/steamapps/common/" + manifest.AppState.installdir   
                            },
                            ACF: {
                                Name: manifest.AppState.name + " ACF",
                                Source: SteamAppVDF[i].path.replace(/\\\\/g, "/") + "/steamapps",
                                Destination: SteamAppVDF[i].path.replace(/\\\\/g, "/") + "/steamapps"   
                            }
                        }
                    })
                }
            }
        }
        fs.writeFileSync(`${folder()}\\${filename()}`, JSON.stringify(outputData, null, 2))
        console.log("Done, close this application. Created file: " + filename())
    } catch (e) {
        console.log(e.message)
    }
})()

function filename() {
    var Arguments = process.argv,
        filename = Arguments.find(e => e.search(/--filename=/) != -1)
    if (filename === undefined) filename = "apps.json"
    else {
        filename = filename.split("=").pop()
    }
    return filename
}

function folder() {
    var Arguments = process.argv,
        foldername = Arguments.find(e => e.search(/--foldername=/) != -1)
    if (foldername === undefined) foldername = process.cwd()
    else {
        foldername = foldername.split("=").pop()
    }
    return foldername
}