# Favicon Generation Instructions

To convert your shield icon image to favicon formats, you have several options:

## Option 1: Online Favicon Generator (Recommended)
1. Go to https://favicon.io/favicon-converter/
2. Upload your shield icon image
3. Download the generated favicon package
4. Extract and place the files in the `/public` directory:
   - `favicon.ico`
   - `favicon-16x16.png`
   - `favicon-32x32.png`
   - `apple-touch-icon.png`

## Option 2: Using ImageMagick (Command Line)
If you have ImageMagick installed:

```bash
# Convert to ICO format
convert your-shield-icon.png -resize 32x32 favicon.ico

# Convert to PNG formats
convert your-shield-icon.png -resize 16x16 favicon-16x16.png
convert your-shield-icon.png -resize 32x32 favicon-32x32.png
convert your-shield-icon.png -resize 180x180 apple-touch-icon.png
```

## Option 3: Using the SVG I created
I've created a basic SVG version of the shield icon at `/public/shield-icon.svg`. You can:
1. Use this SVG as a starting point
2. Modify it to better match your original image
3. Convert it to the required favicon formats

## Required Files
Make sure these files are in your `/public` directory:
- `favicon.ico` (16x16, 32x32, 48x48 sizes)
- `favicon-16x16.png`
- `favicon-32x32.png`
- `apple-touch-icon.png` (180x180 for iOS)

## Testing
After adding the favicon files:
1. Clear your browser cache
2. Restart your development server
3. Check the browser tab to see the new favicon

The layout.tsx has already been updated to reference these favicon files.
