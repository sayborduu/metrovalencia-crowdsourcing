# Metro NaviLens Upload System

A Next.js application for uploading images to Vercel Blob storage with categorization, stop selection, and attribution.

## Features

✅ **Upload Images** - Drag & drop or click to upload
✅ **Live Camera** - Capture photos directly from your device camera
✅ **Auto-Compression** - Automatically compresses images over 5MB
✅ **Categorization** - Select from NaviLens Go, Foto de Parada, or Otro
✅ **Stop Selection** - Searchable combobox with Madrid Metro stops
✅ **Attribution** - Add your name or username to uploads
✅ **Vercel Blob Storage** - Files are organized in a structured path

## File Storage Structure

Images are saved to Vercel Blob with the following path structure:

```
/{CATEGORY}/{STOP_NAME}/{ATTRIBUTION}_{TIMESTAMP}_{STOP_NAME}.{EXTENSION}
```

Example:
```
/NaviLens Go/Sol/alexbadi_1707155123456_Sol.jpg
```

## Requirements

- Node.js 18+ 
- Vercel Blob Storage (token in `.env.local`)

## Setup

1. Install dependencies:
```bash
npm install
# or
pnpm install
```

2. Make sure `.env.local` contains your Vercel Blob token:
```env
BLOB_READ_WRITE_TOKEN=your_token_here
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Usage

1. **Select Category**: Choose NaviLens Go, Foto de Parada, or Otro
2. **Choose Stop**: Search and select a metro stop from the combobox
3. **Enter Attribution**: Add your name or username
4. **Upload Image**: 
   - Click the upload area to select an image, or
   - Click "Use Camera" to take a photo directly
5. **Submit**: Click "Upload Image" to save to Vercel Blob

## Image Requirements

- **Format**: PNG, JPG, WEBP
- **Max Size**: 5MB (automatically compressed if larger)
- **Type**: Images only

## API Endpoint

### POST `/api/upload`

Uploads an image to Vercel Blob storage.

**Form Data:**
- `file`: Image file
- `category`: Selected category
- `stopName`: Metro stop name
- `attribution`: User's name/username

**Response:**
```json
{
  "url": "https://blob.vercel-storage.com/...",
  "pathname": "/NaviLens Go/Sol/alexbadi_1707155123456_Sol.jpg",
  "size": 123456
}
```

## Metro Stops

The application includes a comprehensive list of Madrid Metro stops. To add more stops, edit `/lib/stops.ts`.

## Technologies

- **Next.js 16** - React framework
- **Vercel Blob** - Cloud storage
- **Shadcn/UI** - UI components
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety

## Development

The main upload page is in `/app/page.tsx` and the API route is in `/app/api/upload/route.ts`.
