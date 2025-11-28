# Folder Structure Generator

A VS Code extension that generates folder structures from ASCII tree diagrams. Save time by automatically creating your project structure instead of manually creating each file and folder.

## Features

- ✅ Parse ASCII tree structures with `├──`, `│`, `└──` symbols
- ✅ Automatically create folders and files
- ✅ Add basic template content based on file type
- ✅ Prevent overwriting existing files
- ✅ Support for nested structures

## Usage

1. **Create a file** with your folder structure in ASCII tree format
2. **Select the text** (or leave unselected for entire document)
3. **Press `Ctrl+Shift+P`** and run **"Generate Folder Structure from Tree"**
4. **Confirm the action** when prompted
5. **All folders and files will be created automatically!**

## Examples

### Basic Structure:

├── src/
│ ├── index.js
│ └── utils.js
├── public/
│ └── index.html
├── package.json
└── README.md

### PHP Project Structure:

├── config/
│ ├── database.php
│ └── constants.php
├── includes/
│ ├── header.php
│ ├── footer.php
│ ├── functions.php
│ └── auth.php
├── assets/
│ ├── css/
│ │ ├── style.css
│ │ └── main.css
│ ├── js/
│ │ └── script.js
│ ├── images/
│ └── uploads/
├── admin/
│ ├── admin-dashboard.php
│ └── manage-users.php
├── index.php
├── login.php
├── register.php
└── package.json


## Supported File Types

The extension automatically adds basic content for:
- **.php** - PHP template
- **.html** - HTML boilerplate
- **.css** - CSS starter
- **.js** - JavaScript template
- **.json** - JSON structure
- **Others** - Basic header comment

## Configuration

You can configure the extension in VS Code settings:
- `folderStructureGenerator.autoCreateContent`: Enable/disable automatic content creation (default: true)

## Author

**Shayan Shah**  
- GitHub: [ShayanShahDev](https://github.com/shayanshahDeveloper/)

## License

MIT License - feel free to use this extension for personal or commercial projects.