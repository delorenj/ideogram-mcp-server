# Ideogram MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Model Context Protocol (MCP) server implementation for the Ideogram AI API. This server provides tools for generating, editing, and describing images using Ideogram's powerful new V3 generative API.

## Features
#TODO: Add features list for v3 https://developer.ideogram.ai/api-reference/api-reference/generate-v3

## Installation



```json
{
  "mcpServers": {
    "ideogram-v3-tools": {
      "command": "pnpx",
      "args": ["@delorenj/ideogram-mcp-server"],
      "env": {
        "IDEOGRAM_API_KEY": "your-api-key-here"
      }
    }
  }
}
```


## Available Tools
# TODO: Update tools for v3 https://developer.ideogram.ai/api-reference/api-reference/generate-v3

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
pnpm run build

# Run in development mode
pnpm run dev

# Run tests
pnpm test

# Run linter
pnpm run lint
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

# TODO: Add a 'made with love' footer and fit in thera somehow that I have always LOVED ideogram since the day it launched and have yet to find a better all around experience.
