# Custom Countries World

Custom Countries World is a GitHub Pages strategy game using static HTML, CSS, JavaScript, Firebase Authentication, Firebase Firestore, and Leaflet.

## Deploy on GitHub Pages

1. Push this repository to GitHub.
2. Open repository settings.
3. Open Pages.
4. Choose Deploy from a branch.
5. Select the current branch and root folder.
6. Save and open the published Pages URL.

## Firebase setup

1. Create a Firebase project.
2. Enable Authentication.
3. Enable Email/password sign-in.
4. Create a Firestore database.
5. Register a web app in Firebase project settings.
6. Copy the web config into `js/firebase-config.js`.
7. Add admin emails to `adminEmails` in `js/firebase-config.js`.
8. Publish the Firestore rules from `firestore.rules`.

## Firestore collections

### users

```json
{
  "uid": "firebase-user-id",
  "email": "player@example.com",
  "leaderName": "Leader Coconut",
  "countryId": "country-document-id",
  "joinedAt": "serverTimestamp",
  "lastOnline": "serverTimestamp",
  "achievements": ["Founder"],
  "banned": false,
  "admin": false
}
```

### countries

```json
{
  "name": "The Coconut Republic",
  "flag": "https://example.com/flag.png",
  "color": "#2dd4bf",
  "description": "A custom country ruled by players.",
  "capital": "Coconut City",
  "leaderName": "Leader Coconut",
  "ownerUid": "firebase-user-id",
  "members": ["firebase-user-id"],
  "economy": 25,
  "population": 10,
  "technology": 1,
  "military": 10,
  "createdAt": "serverTimestamp",
  "updatedAt": "serverTimestamp"
}
```

### territories

```json
{
  "countryId": "country-document-id",
  "countryName": "The Coconut Republic",
  "color": "#2dd4bf",
  "ownerUid": "firebase-user-id",
  "polygon": [[10, 20], [10, 24], [14, 24], [14, 20]],
  "center": [12, 22],
  "claimedAt": "serverTimestamp",
  "economy": 10,
  "population": 2,
  "military": 2
}
```

### messages

```json
{
  "text": "Hello world",
  "type": "global",
  "countryId": "country-document-id",
  "uid": "firebase-user-id",
  "email": "player@example.com",
  "leaderName": "Leader Coconut",
  "createdAt": "serverTimestamp",
  "deleted": false
}
```

### alliances

```json
{
  "type": "Alliance",
  "fromCountry": "country-a",
  "toCountry": "country-b",
  "fromName": "Country A",
  "toName": "Country B",
  "requestedBy": "firebase-user-id",
  "status": "pending",
  "createdAt": "serverTimestamp"
}
```

### treaties

```json
{
  "type": "Peace Treaty",
  "fromCountry": "country-a",
  "toCountry": "country-b",
  "requestedBy": "firebase-user-id",
  "status": "pending",
  "createdAt": "serverTimestamp"
}
```

### leaderboards

```json
{
  "countryId": "country-document-id",
  "largestTerritory": 5,
  "highestPopulation": 50,
  "strongestEconomy": 70,
  "mostPowerfulMilitary": 60,
  "updatedAt": "serverTimestamp"
}
```

### adminActions

```json
{
  "action": "ban_user",
  "target": "firebase-user-id",
  "admin": "admin-user-id",
  "createdAt": "serverTimestamp"
}
```
