# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

Most endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### Check if PIN exists
```http
GET /auth/check-pin
```

#### Initialize PIN
```http
POST /auth/initialize-pin
Content-Type: application/json

{
  "pin": "1234"
}
```

#### Verify PIN
```http
POST /auth/verify-pin
Content-Type: application/json

{
  "pin": "1234"
}
```

#### Change PIN
```http
POST /auth/change-pin
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPin": "1234",
  "newPin": "5678"
}
```

### Videos

#### Search Videos
```http
GET /videos/search?query=educational&maxResults=12
```

#### Get Latest Videos
```http
GET /videos/latest?maxResults=12
```

#### Get Video Details
```http
GET /videos/details/:videoId
```

### Channels

#### Get Approved Channels
```http
GET /channels
Authorization: Bearer <token>
```

#### Add Approved Channel
```http
POST /channels
Authorization: Bearer <token>
Content-Type: application/json

{
  "channelId": "UC...",
  "channelName": "Channel Name"
}
```

#### Remove Channel
```http
DELETE /channels/:id
Authorization: Bearer <token>
```

### Keywords

#### Get Blocked Keywords
```http
GET /keywords
Authorization: Bearer <token>
```

#### Add Keyword
```http
POST /keywords
Authorization: Bearer <token>
Content-Type: application/json

{
  "keyword": "scary"
}
```

#### Bulk Add Keywords
```http
POST /keywords/bulk
Authorization: Bearer <token>
Content-Type: application/json

{
  "keywords": ["violence", "scary", "horror"]
}
```

### Watch History

#### Get History
```http
GET /history?limit=50&offset=0
Authorization: Bearer <token>
```

#### Get Statistics
```http
GET /history/stats
Authorization: Bearer <token>
```

#### Clear All History
```http
DELETE /history/clear
Authorization: Bearer <token>
```

### Video Requests

#### Submit Request (Kids - No Auth)
```http
POST /requests/submit
Content-Type: application/json

{
  "videoUrl": "https://www.youtube.com/watch?v=..."
}
```

#### Get My Requests (Kids - No Auth)
```http
GET /requests/my-requests
```

#### Get All Requests (Parents)
```http
GET /requests
Authorization: Bearer <token>
```

#### Approve Request
```http
PUT /requests/:id/approve
Authorization: Bearer <token>
```

#### Reject Request
```http
PUT /requests/:id/reject
Authorization: Bearer <token>
```

### API Settings

#### Get API Keys
```http
GET /settings
Authorization: Bearer <token>
```

#### Add API Key
```http
POST /settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "key_value": "AIzaSy..."
}
```

#### Toggle API Key
```http
PUT /settings/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "is_active": true
}
```

## Error Responses
```json
{
  "error": "Error message here"
}
```

Common status codes:
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error
