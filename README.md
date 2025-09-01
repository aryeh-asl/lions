# Duty Assignment App

A web application for managing duty assignments and availability tracking, built with HTML, CSS, and JavaScript. **Now with online data storage using Firebase Firestore!**

## Features

- **People Management**: Add and remove people from the duty roster
- **Availability Tracking**: Mark people as unavailable on specific dates
- **Smart Assignment**: Automatically assign duties considering availability and duty count balance
- **Week Forward Planning**: Create assignments for the next 7 days
- **Real-time Updates**: Data syncs across all devices in real-time
- **Offline Support**: Falls back to local storage when offline

## Online Data Storage Setup

This app now uses **Firebase Firestore** to store data online instead of locally. Follow these steps to set it up:

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or select an existing project
3. Give your project a name (e.g., "duty-assignment-app")
4. Follow the setup wizard (you can disable Google Analytics if not needed)

### 2. Enable Firestore Database

1. In your Firebase project, click on "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (for development - you can secure it later)
4. Select a location close to your users
5. Click "Done"

### 3. Get Your Firebase Configuration

1. In your Firebase project, click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>)
5. Register your app with a nickname
6. Copy the `firebaseConfig` object

### 4. Update the Configuration File

1. Open `firebase-config.js` in your project
2. Replace the placeholder values with your actual Firebase configuration:

```javascript
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "your-messaging-sender-id",
    appId: "your-app-id"
};
```

### 5. Security Rules (Optional but Recommended)

In Firestore Database → Rules, you can set up security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // For development only
    }
  }
}
```

**Note**: The current rules allow anyone to read/write. For production, implement proper authentication and security rules.

## Usage

1. **Add People**: Enter names in the People Management tab
2. **Mark Unavailability**: Select people and dates when they're unavailable
3. **Create Assignments**: 
   - Single assignment: Pick a date and assign 2 people
   - Week forward: Automatically create assignments for the next 7 days
4. **Monitor Status**: Check the connection status in the header

## Data Structure

The app creates three collections in Firestore:
- **`people`**: List of people with duty counts
- **`unavailability`**: Dates when people are unavailable
- **`assignments`**: Duty assignments with dates and assigned people

## Offline Support

- When online: Data is saved to Firebase Firestore
- When offline: Data is saved locally and syncs when connection is restored
- Real-time listeners automatically update the UI across all devices

## Browser Compatibility

- Modern browsers with ES6+ support
- Firebase requires HTTPS in production (works on localhost for development)

## Troubleshooting

- **Connection Issues**: Check your Firebase configuration and internet connection
- **Data Not Syncing**: Ensure Firestore is enabled and rules allow read/write
- **Offline Mode**: The app automatically falls back to local storage when offline

## Local Development

For local development without Firebase:
1. Comment out the Firebase script tags in `index.html`
2. Remove the `firebase-config.js` script tag
3. The app will automatically use localStorage

## License

This project is open source and available under the MIT License. 