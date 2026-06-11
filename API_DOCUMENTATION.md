# Summer Project App - API Documentation v1.0.0

Complete API platform with REST, GraphQL, and Webhook support for the Summer Project Finder application.

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [REST API Endpoints](#rest-api-endpoints)
4. [GraphQL API](#graphql-api)
5. [Webhook System](#webhook-system)
6. [Rate Limiting](#rate-limiting)
7. [Error Handling](#error-handling)

## Overview

### API Features

- **20+ REST Endpoints** - Full CRUD operations for projects, users, reviews, ratings, favorites, and more
- **GraphQL API** - Type-safe queries and mutations with subscription support
- **Webhook System** - Event-driven architecture with HMAC-SHA256 signatures and retry logic
- **API Key Management** - Secure authentication and usage tracking
- **Rate Limiting** - 1000 requests per hour per API key
- **Usage Analytics** - Detailed insights into API usage patterns
- **Developer Portal** - Interactive explorer and key management

### Base URLs

```
REST API: https://api.summerprojectapp.com/v1
GraphQL: https://api.summerprojectapp.com/graphql
Webhooks: https://api.summerprojectapp.com/v1/webhooks
```

## Authentication

All API requests (except health check and documentation) require an API key.

### Obtaining an API Key

1. Visit the Developer Portal
2. Navigate to "API Keys" section
3. Click "Create New Key"
4. Configure permissions and expiration
5. Copy the generated key (you won't be able to see it again)

### Using API Keys

Include your API key in the `Authorization` header:

```bash
curl -X GET https://api.summerprojectapp.com/v1/projects \
  -H "Authorization: Bearer spf_your_api_key_here" \
  -H "Content-Type: application/json"
```

### Permissions

Available permissions:
- `read:public` - Read public data
- `read:private` - Read private user data
- `write:projects` - Create/update/delete projects
- `write:reviews` - Create/update/delete reviews
- `write:users` - Create/update/delete users
- `admin` - Full access

## REST API Endpoints

### Projects (6 endpoints)

#### List Projects
```
GET /projects
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 20)
  - filter: JSON string for filtering
  - sort: JSON string for sorting
```

Example:
```bash
curl -X GET 'https://api.summerprojectapp.com/v1/projects?page=1&limit=20' \
  -H "Authorization: Bearer spf_key"
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "123",
      "name": "Build a Chat App",
      "description": "Create a real-time chat application",
      "category": "web",
      "difficulty": "intermediate",
      "skills": ["javascript", "node.js"],
      "createdAt": "2024-06-10T10:00:00Z",
      "updatedAt": "2024-06-10T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

#### Get Project
```
GET /projects/:id
```

#### Create Project
```
POST /projects
Permission: write:projects

Body:
{
  "name": "Project Name",
  "description": "Project description",
  "category": "web",
  "difficulty": "intermediate",
  "skills": ["javascript", "react"]
}
```

#### Update Project
```
PUT /projects/:id
Permission: write:projects
```

#### Delete Project
```
DELETE /projects/:id
Permission: write:projects
```

#### Search Projects
```
GET /projects/search?q=chat&limit=20
```

### Users (6 endpoints)

#### List Users
```
GET /users?page=1&limit=20
```

#### Get User
```
GET /users/:id
```

#### Create User
```
POST /users
Body: {
  "name": "John Doe",
  "email": "john@example.com"
}
```

#### Update User
```
PUT /users/:id
Body: { "name": "Jane Doe" }
```

#### Delete User
```
DELETE /users/:id
Permission: write:users
```

#### Get User Profile
```
GET /users/:id/profile
```

### Reviews (5 endpoints)

#### List Reviews
```
GET /reviews
```

#### Get Project Reviews
```
GET /projects/:id/reviews
```

#### Create Review
```
POST /reviews
Body: {
  "projectId": "123",
  "userId": "456",
  "rating": 5,
  "text": "Amazing project!"
}
```

#### Update Review
```
PUT /reviews/:id
Body: { "rating": 4, "text": "Updated text" }
```

#### Delete Review
```
DELETE /reviews/:id
```

### Ratings (4 endpoints)

#### List Ratings
```
GET /ratings
```

#### Create Rating
```
POST /ratings
Body: {
  "projectId": "123",
  "userId": "456",
  "score": 5
}
```

#### Update Rating
```
PUT /ratings/:id
Body: { "score": 4 }
```

#### Delete Rating
```
DELETE /ratings/:id
```

### Favorites (3 endpoints)

#### List Favorites
```
GET /favorites
```

#### Add Favorite
```
POST /favorites
Body: {
  "userId": "456",
  "projectId": "123"
}
```

#### Remove Favorite
```
DELETE /favorites/:id
```

### Analytics (3 endpoints)

#### Global Analytics
```
GET /analytics
Response includes: totalProjects, totalUsers, totalReviews, avgProjectRating
```

#### Project Analytics
```
GET /projects/:id/analytics
Response includes: views, likes, reviews, averageRating
```

#### User Analytics
```
GET /users/:id/analytics
Response includes: projectsCreated, reviewsLeft, favoritesCount, totalTimeSpent
```

### AI Features (2 endpoints)

#### Get Recommendations
```
GET /ai/recommendations?interests=javascript,web&skillLevel=intermediate&maxResults=10
```

#### Post Recommendations
```
POST /ai/recommendations
Body: {
  "interests": ["javascript", "web"],
  "skillLevel": "intermediate",
  "maxResults": 10
}
```

### API Management (5 endpoints)

#### List API Keys
```
GET /api/keys
```

#### Create API Key
```
POST /api/keys
Body: {
  "name": "Production Key",
  "permissions": ["read:public", "write:projects"],
  "expiresInDays": 365
}
```

#### Update API Key
```
PUT /api/keys/:id
Body: { "name": "New Name", "permissions": [...] }
```

#### Delete API Key
```
DELETE /api/keys/:id
```

#### Get Usage Statistics
```
GET /api/usage?hoursBack=24
Response includes: totalRequests, successfulRequests, failedRequests, averageResponseTime, topEndpoints
```

### Webhook Management (8 endpoints)

See [Webhook System](#webhook-system) section below.

## GraphQL API

### Endpoint
```
POST /graphql
```

### Authentication
```
Authorization: Bearer spf_your_api_key_here
```

### Example Queries

#### Get All Projects
```graphql
query {
  projects(first: 10) {
    nodes {
      id
      name
      description
      category
      difficulty
      skills
    }
    pageInfo {
      hasNextPage
    }
    totalCount
  }
}
```

#### Get Project Analytics
```graphql
query {
  projectAnalytics(projectId: "1") {
    views
    likes
    reviews
    averageRating
  }
}
```

#### Create Project
```graphql
mutation {
  createProject(
    name: "Mobile App"
    description: "Build an iOS app"
    category: "mobile"
    difficulty: "intermediate"
    skills: ["swift", "ios"]
  ) {
    id
    name
    description
    createdAt
  }
}
```

#### Get Recommendations
```graphql
query {
  getRecommendations(
    interests: ["javascript", "web"]
    skillLevel: "intermediate"
    maxResults: 5
  ) {
    projectId
    score
    reason
  }
}
```

#### Subscribe to Webhooks
```graphql
subscription {
  webhookTriggered(eventType: "project.created") {
    type
    timestamp
    data
  }
}
```

## Webhook System

### Event Types

Supported webhook events:
- `project.created` - New project created
- `project.updated` - Project updated
- `project.deleted` - Project deleted
- `user.registered` - New user registered
- `user.updated` - User profile updated
- `review.added` - New review added
- `review.updated` - Review updated
- `favorite.added` - Project added to favorites
- `favorite.removed` - Project removed from favorites
- `rating.submitted` - New rating submitted
- `progress.updated` - User progress updated
- `recommendation.generated` - Recommendation generated

### Creating a Webhook

```bash
curl -X POST https://api.summerprojectapp.com/v1/webhooks \
  -H "Authorization: Bearer spf_key" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/webhook",
    "events": ["project.created", "project.updated"],
    "rateLimit": 100
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "webhook_123",
    "url": "https://example.com/webhook",
    "events": ["project.created", "project.updated"],
    "active": true,
    "secret": "whsec_...",
    "createdAt": "2024-06-10T10:00:00Z",
    "failureCount": 0,
    "rateLimit": {
      "requestsPerMinute": 100,
      "requestsThisMinute": 0
    }
  }
}
```

### Webhook Payload

```json
{
  "type": "project.created",
  "timestamp": "2024-06-10T10:00:00Z",
  "data": {
    "id": "123",
    "name": "Build a Chat App",
    "description": "Create a real-time chat application",
    "category": "web",
    "difficulty": "intermediate",
    "skills": ["javascript", "node.js"]
  }
}
```

### Webhook Headers

All webhook requests include:
```
X-Webhook-Signature: sha256=...
X-Webhook-ID: webhook_123
X-Webhook-Event: project.created
X-Webhook-Timestamp: 2024-06-10T10:00:00Z
```

### Verifying Webhooks

Use HMAC-SHA256 signature verification:

```python
import hmac
import hashlib

def verify_webhook(payload, signature, secret):
    expected_signature = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(signature, expected_signature)
```

### Retry Logic

Webhooks use exponential backoff:
- Attempt 1: Immediate
- Attempt 2: 1 second delay
- Attempt 3: 2 second delay
- Attempt 4: 4 second delay
- Attempt 5: 8 second delay

Maximum of 5 attempts per delivery.

### Webhook Management

#### List Webhooks
```
GET /webhooks
```

#### Get Webhook
```
GET /webhooks/:id
```

#### Update Webhook
```
PUT /webhooks/:id
Body: {
  "url": "https://new.example.com/webhook",
  "active": true
}
```

#### Delete Webhook
```
DELETE /webhooks/:id
```

#### Test Webhook
```
POST /webhooks/:id/test
```

#### Delivery History
```
GET /webhooks/:id/deliveries?limit=20
```

#### Resend Delivery
```
POST /webhooks/:id/deliveries/:deliveryId/resend
```

## Rate Limiting

### Limits

- **1000 requests per hour** per API key
- Rate limit resets hourly

### Rate Limit Headers

All responses include:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1623307200
```

### Rate Limit Error

When you exceed your rate limit:
```
Status: 429 Too Many Requests

{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 45
}
```

## Error Handling

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Rate Limited
- `500` - Internal Server Error

### Error Response Format

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "MACHINE_READABLE_CODE",
  "timestamp": "2024-06-10T10:00:00Z"
}
```

### Common Error Codes

- `MISSING_AUTH_TOKEN` - No authorization header
- `INVALID_API_KEY` - Invalid or expired API key
- `INSUFFICIENT_PERMISSIONS` - Missing required permission
- `RATE_LIMIT_EXCEEDED` - Rate limit exceeded
- `INVALID_REQUEST` - Malformed request body
- `RESOURCE_NOT_FOUND` - Resource doesn't exist
- `INTERNAL_ERROR` - Server error

## Code Examples

### Python
```python
import requests

api_key = 'spf_your_api_key'
base_url = 'https://api.summerprojectapp.com/v1'

headers = {
    'Authorization': f'Bearer {api_key}',
    'Content-Type': 'application/json'
}

# Get projects
response = requests.get(f'{base_url}/projects', headers=headers)
projects = response.json()

# Create webhook
webhook_data = {
    'url': 'https://example.com/webhook',
    'events': ['project.created', 'project.updated'],
    'rateLimit': 100
}
response = requests.post(f'{base_url}/webhooks', json=webhook_data, headers=headers)
```

### JavaScript
```javascript
const apiKey = 'spf_your_api_key';
const baseUrl = 'https://api.summerprojectapp.com/v1';

// Get projects
fetch(`${baseUrl}/projects`, {
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log(data));

// Create webhook
fetch(`${baseUrl}/webhooks`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    url: 'https://example.com/webhook',
    events: ['project.created'],
    rateLimit: 100
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

### cURL
```bash
# Get projects
curl -X GET https://api.summerprojectapp.com/v1/projects \
  -H "Authorization: Bearer spf_key" \
  -H "Content-Type: application/json"

# Create project
curl -X POST https://api.summerprojectapp.com/v1/projects \
  -H "Authorization: Bearer spf_key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Project",
    "description": "Project description",
    "category": "web",
    "difficulty": "intermediate",
    "skills": ["javascript", "react"]
  }'
```

## Support

For API support:
- Documentation: https://api.summerprojectapp.com/api/docs
- Developer Portal: https://summerprojectapp.com/developer
- Email: api-support@summerprojectapp.com
- Status: https://status.summerprojectapp.com

---

**API Version:** 1.0.0  
**Last Updated:** June 2024
