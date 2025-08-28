# Ideogram MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A FastMCP server for the Ideogram AI API. This server provides tools for generating, editing, and describing images using Ideogram's powerful V3 generative API.

## Features

✨ **V3 Generative AI Capabilities**
- **Advanced Image Generation**: Create stunning images from text prompts with Ideogram's state-of-the-art V3 model
- **Multiple Rendering Modes**: Choose from Turbo (fast), Default (balanced), or Quality (best results) rendering speeds
- **Flexible Resolutions**: Support for various aspect ratios from 1:1 to 16:9 with high-quality output
- **Style Controls**: Auto, General, Realistic, Design, and Fiction style types for diverse creative outputs
- **Character References**: Upload reference images to maintain character consistency across generations
- **Color Palette Control**: Fine-tune color schemes for your generated images
- **Magic Prompt Enhancement**: Automatic prompt optimization for better results
- **Batch Generation**: Generate up to 8 images per request for increased productivity
- **Safety Filtering**: Built-in content safety checks ensure appropriate image generation
- **Reproducible Results**: Seed-based generation for consistent and reproducible outputs

## Installation

```json
{
  "mcpServers": {
    "ideogram-v3-tools": {
      "command": "bunx",
      "args": ["@delorenj/ideogram-mcp-server"],
      "env": {
        "IDEOGRAM_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## Available Tools

### 🎨 V3 Image Generation Tools

#### 1. `generate` - Advanced V3 Image Generation
Generate stunning images using Ideogram's powerful V3 model with comprehensive styling controls.

**Parameters:**
- `prompt`: string (required) - Your creative text description
- `resolution`: string (optional) - Image dimensions (e.g., "1024x1024", "1440x1024", "1024x1440")
- `aspect_ratio`: string (optional) - One of: ASPECT_1_1, ASPECT_16_9, ASPECT_9_16, ASPECT_4_3, ASPECT_3_4
- `rendering_speed`: string (optional) - One of: TURBO (fastest), DEFAULT (balanced), QUALITY (best results)
- `style_type`: string (optional) - One of: AUTO, GENERAL, REALISTIC, DESIGN, FICTION
- `color_palette`: object (optional) - Custom color scheme configuration
- `magic_prompt_option`: string (optional) - One of: AUTO, ON, OFF (prompt enhancement)
- `num_images`: number (optional) - Between 1 and 8 images per generation
- `seed`: number (optional) - Between 0 and 2147483647 for reproducible results
- `style_reference_image`: string (optional) - Base64 or file path for style reference
- `character_reference_image`: string (optional) - Base64 or file path for character consistency
- `negative_prompt`: string (optional) - Describe what you don't want in the image

#### 2. `edit` - Image Editing with Masks
Edit and modify existing images using intelligent masking technology.

**Parameters:**
- `image_file`: string (required) - Base64 encoded image or file path
- `mask`: string (required) - Base64 encoded mask or file path defining edit areas
- `prompt`: string (required) - Description of desired changes
- `model`: string (optional) - Model version (V_2, V_2_TURBO)
- `rendering_speed`: string (optional) - TURBO, DEFAULT, or QUALITY

#### 3. `describe` - AI Image Analysis
Generate detailed, contextual descriptions of images using AI vision capabilities.

**Parameters:**
- `image_file`: string (required) - Base64 encoded image or file path
- `detail_level`: string (optional) - Level of description detail (basic, detailed, comprehensive)

#### 4. `download_images` - Batch Image Downloader
Efficiently download multiple generated images to your local system.

**Parameters:**
- `urls`: string[] (required) - Array of Ideogram image URLs
- `output_dir`: string (required) - Local directory path for downloads
- `filename_prefix`: string (optional) - Custom prefix for downloaded files
- `preserve_metadata`: boolean (optional) - Save generation metadata alongside images

## Development

### Prerequisites
- Node.js >= 20.0.0
- bun >= 1.0.0
- Ideogram API key

### Local Development
```bash
# Install dependencies
bun install

# Build the project
bun run build

# Run in development mode
bun run dev

# Run tests
bun test

# Run linter
bun run lint
```

## Requirements

- Node.js >= 20.0.0
- bun >= 1.0.0
- Ideogram API key

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

---

*Built with ❤️ by someone who truly believes Ideogram is changing the creative landscape.*
