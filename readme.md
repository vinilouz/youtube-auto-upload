# YouTube Channel Automation

This project automates the process of uploading and managing videos on your YouTube channel using Node.js and Playwright.

## Features

* **Automated Uploads:** Easily upload multiple videos from a specified folder.
* **Customizable Settings:** Configure video titles, descriptions, privacy settings, and scheduling through a `videos.json` configuration file.
* **Persistent Login:** Securely stores your YouTube login session for seamless automation.
* **Manual Control:** Provides a manual script (`manual.js`) for interacting with the YouTube Studio interface directly.
* **Logout Functionality:** Includes a logout script (`logout.js`) to end your YouTube session.

## Installation

1. Make sure you have Node.js installed. You can download it from [https://nodejs.org/](https://nodejs.org/).

2. Clone this repository or download the project files.

3. Install the required dependencies:

   ```bash
   npm install
   ```

## Configuration

1. Create a `.env` file in the project root directory and add your YouTube login credentials:
```properties
EMAIL=[email address removed]
PASSWORD=your_password
```

2. Create a `videos.json` file in the project root directory to configure your video uploads. See the `videos.json` Configuration section below for details.

3. Place your video files in the `videos` folder.

#### `videos.json` Configuration
The `videos.json` file is a JSON array where each element represents a video to be uploaded.

### Video Object Properties
- `filename` (required): The name of the video file without the extension. The script will automatically search for the corresponding file in the `videos` folder.

- `title` (optional): The title of the video. If not provided, YouTube will use a default title or leave the field blank.

- `description` (optional): The description of the video. If not provided, YouTube will leave the field blank.

- `scheduleDate` (optional): The scheduled upload date in the format "day/month/year" (e.g., "15/08/2024"). If not provided, the video will be published immediately.

- `scheduleTime` (optional): The scheduled upload time in the format "hour:minute AM/PM" (e.g., "03:00 PM"). 

- `privacy` (optional): The privacy setting for the video. Can be "PRIVATE", "UNLISTED", or "PUBLIC". Defaults to "PRIVATE" if not set.

### Example `videos.json`
```json
[
  {
    "filename": "my_video" 
  },
  {
    "filename": "amazing_video",
    "title": "This Video is Amazing!",
    "description": "A detailed and captivating description of the video.",
    "scheduleDate": "25/12/2023",
    "scheduleTime": "10:00 AM",
    "privacy": "PUBLIC"
  }
]
```

## Usage
### Scripts
`npm run log`: Logs in to your YouTube account and stores the session for future use.
`npm run manual`: Opens YouTube Studio in a browser window for manual interaction (requires a valid login session).
`npm run up`: Uploads videos based on the `videos.json` configuration.
`npm run exit`: Logs out of your YouTube account and clears the stored session.

### Workflow
1. Run `npm run log` to log in to your YouTube account.
2. Prepare your `videos.json` file and place your video files in the `videos` folder.
3. Run `npm run up` to upload the videos.
4. Optionally, run `npm run manual` to interact with YouTube Studio manually.
5. When finished, run `npm run exit` to log out.

### Notes
- Keep your browser open while the upload script is running.
- Make sure your video files are in the correct format and meet YouTube's requirements.
- Respect YouTube's terms of service and avoid overloading their servers with excessive uploads.

### Disclaimer
This project is for educational and automation purposes. Use it responsibly and at your own risk. The author is not responsible for any misuse or consequences arising from the use of this project.


**This updated README includes the `package.json` information and provides a clear overview of the project's features and usage.**

// next steps: 
- update readme 
- tags 
- multi channel