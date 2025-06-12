# Ideogram MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/ideogram-mcp-server)](https://nodejs.org)
[![npm version](https://badge.fury.io/js/ideogram-mcp-server.svg)](https://badge.fury.io/js/ideogram-mcp-server)

A Model Context Protocol (MCP) server implementation for the Ideogram AI API. This server provides tools for generating, editing, and describing images using Ideogram's powerful AI models.

## Features

- Generate images from text descriptions
- Edit existing images using masks
- Generate descriptions for images
- Download generated images to local directory
- Prompt templates for common operations

## Installation

1. Clone the repository
```bash
git clone https://github.com/delorenj/ideogram-mcp-server.git
cd ideogram-mcp-server
```

2. Install dependencies
```bash
npm install
```

3. Build the project
```bash
npm run build
```

## Cursor Integration

To use this MCP in Cursor, add the following configuration to your Cursor settings (Settings > AI > Model Context Protocol):

```json
{
  "mcps": {
    "ideogram-mcp": {
      "command": "node",
      "args": ["PATH_TO_YOUR_DIST/index.js"],
      "env": {
        "IDEOGRAM_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

Replace:
- `PATH_TO_YOUR_DIST/index.js` with the absolute path to your built `index.js` file
- `your-api-key-here` with your actual Ideogram API key

Example (redacted):
```json
{
  "mcps": {
    "ideogram-mcp": {
      "command": "node",
      "args": ["/path/to/ideogram-mcp-server/dist/index.js"],
      "env": {
        "IDEOGRAM_API_KEY": "xxxxx-REDACTED-xxxxx"
      }
    }
  }
}
```

## Available Tools

1. `generate`
   - Generate images from text prompts
   - Parameters:
     - `prompt`: string (required)
     - `aspect_ratio`: string (optional) - One of: ASPECT_1_1, ASPECT_16_9, ASPECT_9_16, ASPECT_4_3, ASPECT_3_4
     - `model`: string (optional) - One of: V_1, V_2, V_2_TURBO
     - `magic_prompt_option`: string (optional) - One of: AUTO, ON, OFF
     - `num_images`: number (optional) - Between 1 and 8
     - `seed`: number (optional) - Between 0 and 2147483647

2. `edit`
   - Edit images using masks
   - Parameters:
     - `image_file`: string (required) - Base64 or file path
     - `mask`: string (required) - Base64 or file path
     - `prompt`: string (required)
     - `model`: string (required) - One of: V_2, V_2_TURBO

3. `describe`
   - Generate descriptions for images
   - Parameters:
     - `image_file`: string (required) - Base64 or file path

4. `download_images`
   - Download generated images to local directory
   - Parameters:
     - `urls`: string[] (required) - Array of image URLs
     - `output_dir`: string (required) - Output directory path

### Prompt Templates

1. `generate_image`
   - Template for generating images
   - Parameters:
     - `description`: string

## Development

```bash
# Build the project
npm run build

# Run in development mode
npm run dev

# Run tests
npm test

# Run linter
npm run lint
```

## Requirements

- Node.js >= 18.0.0
- Ideogram API key

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request