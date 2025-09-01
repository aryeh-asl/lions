# Duty Assignment App

A web-based application for managing duty assignments and availability tracking. This app allows you to assign two people from a list to duty calls while considering their availability.

## Features

- **People Management**: Add and remove people from your duty roster
- **Availability Tracking**: Mark people as unavailable for specific dates
- **Automatic Assignment**: Randomly assign two available people to duty calls
- **Persistent Storage**: All data is saved locally in your browser
- **Responsive Design**: Works on desktop and mobile devices

## How to Use

1. **Open the App**: Open `index.html` in your web browser

2. **Add People**:
   - Go to the "People Management" tab
   - Enter a person's name and click "Add Person"
   - Repeat for all people in your duty roster

3. **Mark Unavailability**:
   - Go to the "Availability" tab
   - Select a person and date when they're unavailable
   - Click "Mark Unavailable"

4. **Create Assignments**:
   - Go to the "Assignments" tab
   - Select a date for the duty assignment
   - Click "Assign Two People"
   - The app will randomly select two available people

## Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- No internet connection required after initial load
- JavaScript must be enabled

## Technical Details

- Built with vanilla HTML, CSS, and JavaScript
- Uses localStorage for data persistence
- Responsive design with CSS Grid and Flexbox
- Font Awesome icons for enhanced UI

## Data Storage

All data is stored locally in your browser using localStorage. This means:
- Your data persists between browser sessions
- Data is not shared between different browsers or devices
- Clearing browser data will remove all app data

## File Structure

- `index.html` - Main application interface
- `styles.css` - Application styling and responsive design
- `script.js` - Application logic and functionality
- `README.md` - This documentation file 