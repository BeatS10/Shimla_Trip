# Shimla Trip Media Gallery - Shared Portal

A gorgeous, high-fidelity web application to browse, stream, and download photos and videos directly from a Google Drive folder. Built with Next.js (TypeScript), Vanilla CSS Modules, and the Google Drive API.

Features a responsive grid, fuzzy searching, type filters (Photos vs Videos), multi-select ZIP downloader, custom lightbox preview, and an autoplay slideshow.

---

## ⚡ Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Open `.env.local` and add your **Google API Key** (see [Google Cloud API Key Setup](#-google-cloud-api-key-setup) below).

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔗 Shareable Links (Dynamic Folders)

To make it incredibly easy to share different folders, the app dynamically reads the folder ID from the URL.

Share a link like this:
```
https://your-app-url.vercel.app/?folder=GOOGLE_DRIVE_FOLDER_ID
```
Anyone opening this link will immediately see the photos and videos in that Google Drive folder, without you needing to rebuild the app or change environment variables!

---

## 🛠️ Google Cloud API Key Setup

To connect the app to Google Drive, you need a free Google Cloud API key:

1. **Enable API**: Go to the [Google Cloud Console](https://console.cloud.google.com/), create a project, open the **API Library**, and enable the **Google Drive API**.
2. **Create Key**: Go to **APIs & Services > Credentials**, click **+ Create Credentials**, and select **API Key**.
3. **Share Folder**: Open your Google Drive folder, click **Share**, and set the permission to **"Anyone with the link can view"**.
4. **Copy Folder ID**: Extract the ID from the folder URL: `https://drive.google.com/drive/folders/YOUR_FOLDER_ID`.
5. **Configure**: Enter the API Key and default Folder ID in your `.env.local` or Vercel settings.

---

## 🚀 Deploying to Vercel (Free Tier)

This app is optimized for Vercel's free tier. Follow these steps to deploy:

1. Push your code to a GitHub repository.
2. Log in to [Vercel](https://vercel.com/) and click **Add New > Project**.
3. Import your repository.
4. Expand **Environment Variables** and add:
   - `GOOGLE_API_KEY`: *Your Google API Key*
   - `NEXT_PUBLIC_DEFAULT_FOLDER_ID`: *Your Shimla Trip Folder ID*
5. Click **Deploy**. Vercel will build and host your app for free!

