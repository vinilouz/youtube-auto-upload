# YouTube Channel Automation

This project automates various tasks for managing YouTube channels, including account login, video upload, and scheduling.

## Features

- Automated and manual account login
- Video upload with customizable metadata
- Video scheduling
- Support for multiple YouTube accounts

## Prerequisites

- Node.js
- Chromium

## Installation

1. Clone the repository
2. Run `npm install` to install dependencies
3. Copy `config.example.js` to `config.js` and fill in your account details
4. Place your videos in the `videos/` directory
5. Run `npm run videos` to generate the initial `videos.json` file
6. Edit `videos.json` to customize your video metadata

## Usage

### Login

- Automated login: `npm run login`
- Manual login: `npm run manual`

### Video Management

- Generate video JSON: `npm run videos`
- Upload videos: `npm run upload`

To upload videos for a specific account, use: 

`npm run upload -- --name=accountName` or `npm run upload -- -n=accountName`

## Project Structure

- `functions/`: Contains main functionality scripts
  - `login.js`: Automated login
  - `manual_login.js`: Manual login helper
  - `upload.js`: Video upload and scheduling
  - `videos.js`: Generates video metadata JSON
  - `utils.js`: Utility functions
- `config.js`: Account configuration
- `videos.json`: Video metadata

## Configuration

### Account Configuration (config.js)
```javascript
module.exports = {
  accounts: [
    { 
      name: 'account1',
      email: 'email1@example.com',
      password: 'password1'
    },
    // Add more accounts as needed
  ]
};
```

### Video Configuration (videos.json)

```json
[
  {
    "filename": "video_filename", // Required
    "title": "Video Title", // Optional
    "description": "Video description.", // Optional
    "scheduleDate": "DD/MM/YYYY", // Optional
    "scheduleTime": "HH:MM AM/PM", // Optional
    "privacy": "PRIVATE", // Optional: UNLISTED (default) | PRIVATE | PUBLIC
    "tags": ["tag1", "tag2"], // Optional
    "alertSubs": true, // Optional: false (default) | true
    "kids": false  // Optional: false (default) | true
  }
]
```

## Notes
- The project uses Playwright for browser automation
- User agents are randomized for each session
- Videos should be placed in a `videos/` directory in the project root
- Run `npm run videos` after adding new videos to the `videos/` directory to update `videos.json`

## In Development
- Fixed first comment
- Multi channel, same account

## License
This project is licensed under the ISC License.

## Disclaimer
This project is for educational and automation purposes. Use it responsibly and at your own risk. The author is not responsible for any misuse or consequences arising from the use of this project.
