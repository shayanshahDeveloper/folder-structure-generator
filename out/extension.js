"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
// @ts-ignore
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
function activate(context) {
    console.log("Folder Structure Generator is now active!");
    let disposable = vscode.commands.registerCommand("folder-structure-generator.generateFromTree", async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("No active text editor found!");
            return;
        }
        const document = editor.document;
        const selection = editor.selection;
        const text = selection.isEmpty
            ? document.getText()
            : document.getText(selection);
        if (!text.trim()) {
            vscode.window.showErrorMessage("No tree structure found! Please select or provide a folder tree structure.");
            return;
        }
        try {
            const structure = parseTreeStructure(text);
            // Debug: Show what will be created
            console.log("Structure to create:", JSON.stringify(structure, null, 2));
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                vscode.window.showErrorMessage("No workspace folder open!");
                return;
            }
            const basePath = workspaceFolders[0].uri.fsPath;
            const itemCount = countItems(structure);
            const choice = await vscode.window.showWarningMessage(`This will create ${itemCount} items in your workspace. Continue?`, "Yes", "No");
            if (choice !== "Yes") {
                return;
            }
            await createFolderStructure(basePath, structure);
            vscode.window.showInformationMessage(`Successfully created folder structure with ${itemCount} items!`);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error creating folder structure: ${error.message}`);
        }
    });
    context.subscriptions.push(disposable);
}
function parseTreeStructure(treeText) {
    const lines = treeText.split("\n").filter((line) => line.trim());
    const root = [];
    const stack = [];
    for (const line of lines) {
        // Skip empty lines
        if (!line.trim())
            continue;
        // Calculate depth based on tree characters (│, ├, └)
        let depth = 0;
        let i = 0;
        // Count tree structure characters to determine depth
        while (i < line.length) {
            const char = line[i];
            if (char === "│" || char === "├" || char === "└") {
                depth++;
                i++;
            }
            else if (char === " " || char === "\t") {
                i++;
            }
            else {
                break;
            }
        }
        // Extract the actual name after tree characters and dashes
        let content = line.substring(i).trim();
        // Remove the connecting dashes (──) if present
        if (content.startsWith("──")) {
            content = content.substring(2).trim();
        }
        else if (content.startsWith("--")) {
            content = content.substring(2).trim();
        }
        else if (content.startsWith("─")) {
            content = content.substring(1).trim();
        }
        else if (content.startsWith("-")) {
            content = content.substring(1).trim();
        }
        // Skip if no content left
        if (!content)
            continue;
        // Determine if it's a folder or file
        const isFolder = content.endsWith("/") ||
            (!content.includes(".") &&
                !["php", "css", "js", "html", "json", "txt", "md"].some((ext) => content.toLowerCase().includes("." + ext)));
        let name = content;
        if (isFolder && name.endsWith("/")) {
            name = name.slice(0, -1); // Remove trailing slash
        }
        // Skip if name is empty after processing
        if (!name.trim())
            continue;
        const item = {
            name: name.trim(),
            type: isFolder ? "folder" : "file",
            children: isFolder ? [] : undefined,
        };
        console.log(`Parsed: "${line}" -> Name: "${item.name}", Depth: ${depth}, Type: ${item.type}`);
        // Find the correct parent in the stack
        while (stack.length > 0 && stack[stack.length - 1].depth >= depth) {
            stack.pop();
        }
        if (stack.length === 0) {
            root.push(item);
        }
        else {
            const parent = stack[stack.length - 1].item;
            if (parent.children) {
                parent.children.push(item);
            }
            else {
                console.warn(`Parent ${parent.name} has no children array!`);
            }
        }
        if (isFolder) {
            stack.push({ item, depth });
        }
    }
    return root;
}
async function createFolderStructure(basePath, structure) {
    for (const item of structure) {
        await createItem(basePath, item);
    }
}
async function createItem(currentPath, item) {
    const itemPath = path.join(currentPath, item.name);
    if (item.type === "folder") {
        if (!fs.existsSync(itemPath)) {
            fs.mkdirSync(itemPath, { recursive: true });
            console.log(`Created folder: ${itemPath}`);
        }
        else {
            console.log(`Folder already exists: ${itemPath}`);
        }
        if (item.children && item.children.length > 0) {
            for (const child of item.children) {
                await createItem(itemPath, child);
            }
        }
    }
    else {
        if (!fs.existsSync(itemPath)) {
            const extension = path.extname(item.name).toLowerCase();
            let content = "";
            switch (extension) {
                case ".php":
                    content = `<?php\n// ${item.name}\n?>`;
                    break;
                case ".html":
                    content = `<!DOCTYPE html>\n<html>\n<head>\n    <title>${item.name}</title>\n</head>\n<body>\n    \n</body>\n</html>`;
                    break;
                case ".css":
                    content = `/* ${item.name} */\nbody {\n    margin: 0;\n    padding: 0;\n}`;
                    break;
                case ".js":
                    content = `// ${item.name}\nconsole.log('${item.name} loaded');`;
                    break;
                case ".json":
                    if (item.name === "package.json") {
                        content = `{\n  "name": "project",\n  "version": "1.0.0"\n}`;
                    }
                    else {
                        content = "{}";
                    }
                    break;
                default:
                    content = `# ${item.name}`;
            }
            fs.writeFileSync(itemPath, content);
            console.log(`Created file: ${itemPath}`);
        }
        else {
            console.log(`File already exists: ${itemPath}`);
        }
    }
}
function countItems(structure) {
    let count = 0;
    function countRecursive(items) {
        for (const item of items) {
            count++;
            if (item.children) {
                countRecursive(item.children);
            }
        }
    }
    countRecursive(structure);
    return count;
}
function deactivate() { }
//# sourceMappingURL=extension.js.map