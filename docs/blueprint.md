# **App Name**: AttendEase

## Core Features:

- Class Selection: Allows teachers to select a class/section to start the attendance process.
- Face Scan Attendance: Uses the device's camera to scan students' faces for attendance, using client-side recognition (face-api.js or TF.js) to avoid sending images. A tool decides when face recognition fails based on a confidence score.
- Manual Override: Allows teachers to manually mark students as present or absent, providing a fallback when face recognition fails.  A tool decides when face recognition fails based on a confidence score.
- RFID/QR Fallback: Integrates RFID/QR code scanning as a fallback for attendance marking when face recognition is not possible.
- Attendance Review: Displays a list of captured attendance events, allowing teachers to review and confirm the attendance records.
- Offline Data Storage & Sync: Stores attendance data locally using IndexedDB and synchronizes with the server when online.
- CSV Export: Enables exporting attendance reports in CSV format for administrative purposes.

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) to convey trust and reliability.
- Background color: Light gray (#F0F2F5), a desaturated near-white hue in the same family as the primary, creating a clean, professional backdrop.
- Accent color: Vibrant orange (#FF9800) to highlight important actions and calls to action.
- Body and headline font: 'PT Sans' (sans-serif) for readability and a modern, approachable feel.
- Simple, clear icons to represent attendance status and actions, aiding usability for teachers with low tech literacy.
- Mobile-first layout with large tappable buttons and high contrast text to ensure usability on low-end devices.
- Subtle animations to provide feedback on user interactions, enhancing the overall user experience.