# A1: Friends Graph + Mutual-Friends Recommendation

## Project Overview
- **Project name**: SocialGraph - Friend Network System
- **Type**: Data Structures & Algorithms Implementation
- **Core functionality**: Manage friend relationships using graph data structure and provide mutual-friend recommendations using hash-based counting
- **Target users**: Developers learning graph algorithms and social network implementations

## Data Structures

### 1. FriendsGraph (Adjacency List + Hash Map)
- **Storage**: Map<UserId, Set<UserId>> for O(1) friend lookups
- **Operations**:
  - addFriend(userId, friendId) - O(1)
  - removeFriend(userId, friendId) - O(1)
  - getFriends(userId) - O(degree)
  - areFriends(userId, friendId) - O(1)

### 2. MutualFriendsRecommender (Hash Counting)
- **Algorithm**: Count mutual friends using hash map for O(n) average case
- **Operations**:
  - getMutualFriends(userId, otherUserId) - O(min(deg1, deg2))
  - getRecommendations(userId, limit) - O(n * min(deg))

## UI/UX Specification

### Layout Structure
- Single-page application with dark theme
- Three main sections:
  1. **Header**: Logo and title
  2. **Demo Panel**: Interactive visualization area
  3. **Control Panel**: Operations and results

### Visual Design
- **Color Palette**:
  - Background: `#0d1117` (deep dark)
  - Surface: `#161b22` (card background)
  - Primary: `#58a6ff` (bright blue)
  - Secondary: `#f78166` (coral orange)
  - Accent: `#7ee787` (green for success)
  - Text Primary: `#e6edf3`
  - Text Secondary: `#8b949e`
  - Border: `#30363d`

- **Typography**:
  - Font Family: "JetBrains Mono", "Fira Code", monospace
  - Headings: 24px bold
  - Body: 14px regular
  - Code/Data: 13px monospace

- **Spacing**: 8px base unit (8, 16, 24, 32)

- **Visual Effects**:
  - Card shadows: `0 4px 24px rgba(0,0,0,0.4)`
  - Hover transitions: 200ms ease
  - Border radius: 8px for cards, 4px for buttons

### Components
1. **User Cards**: Display user info with avatar
2. **Friend List**: Scrollable list with remove option
3. **Graph Visualization**: Canvas-based node visualization
4. **Recommendation Cards**: Show recommended friends with mutual count
5. **Action Buttons**: Add friend, remove friend, get recommendations
6. **Toast Notifications**: Success/error feedback

## Functionality Specification

### Core Features
1. **User Management**
   - Create users with name and avatar
   - Display all users in the network

2. **Friend Operations**
   - Add friend (bidirectional in graph)
   - Remove friend
   - Check if friends
   - View all friends

3. **Mutual Friends**
   - Calculate mutual friends between any two users
   - Display mutual friend names

4. **Recommendations**
   - Get friend recommendations for a user
   - Rank by number of mutual friends
   - Show top-k recommendations (default: 5)
   - Exclude already friends

### User Interactions
- Click user to select
- Click "Add Friend" to create connection
- Click "Remove Friend" to delete connection
- Click "Get Recommendations" to see suggestions
- Click recommendation to add as friend

### Edge Cases
- Cannot add self as friend
- Cannot add existing friend
- Cannot remove non-existent friend
- Handle disconnected users (no friends)
- Empty recommendations when no suggestions

## Acceptance Criteria
1. ✅ Graph correctly maintains bidirectional friend relationships
2. ✅ Mutual friends calculation returns correct count using hash map
3. ✅ Recommendations exclude already friends
4. ✅ Recommendations sorted by mutual friend count (descending)
5. ✅ All operations have appropriate time complexity
6. ✅ UI responds to all interactions with visual feedback
7. ✅ Works correctly with multiple users and complex friend networks
