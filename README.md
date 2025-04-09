# HEPP Reviewer App

An interactive web application for learning and testing knowledge about Hydro Electric Power Plant (HEPP) components.

## Features

- **Learn Mode**: Interactive component exploration with detailed descriptions
- **Quiz Mode**: Test your knowledge by identifying HEPP components
- **Captcha Mode**: Practice component recognition in a grid-based format
- **Interactive Diagram**: Access to both labeled and blank HEPP diagrams

## Installation

1. Clone the repository
2. Navigate to the HEPP-Reviewer-App directory
3. Open `index.html` in your web browser

## Project Structure

```
.
├── images/          # Component and diagram images
├── sounds/          # Audio feedback files
├── index.html      # Main HTML file
├── styles.css      # Styling
├── app.js          # Application logic
├── components.json # Component descriptions
├── netlify.toml    # Netlify configuration
└── LICENSE         # MIT License
```

## Usage

- **Learn Mode**: Click on components to view detailed information
- **Quiz Mode**: Identify components from multiple choice options
- **Captcha Mode**: Select correct components from image grids
- Use the diagram button in any mode for reference

## Deployment

The app is configured for Netlify deployment:
1. Connect GitHub repository to Netlify
2. Configure build settings:
   - Build command: None required
   - Publish directory: `HEPP-Reviewer-App`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
