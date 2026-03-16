# NeoBeats — Missing Features Checklist

> **Ngày tạo:** 2026-03-16  
> **Trạng thái:** Audit toàn bộ codebase  
> **Mục tiêu:** Liệt kê tất cả tính năng còn thiếu hoặc chưa hoàn thiện (FE & BE)

---

## Tổng quan kiến trúc hiện tại

```
app/
├── page.tsx                          # Landing page (neobrutalism design system)
├── providers.tsx                     # SessionProvider + ThemeProvider
├── layout.tsx                        # Root layout (DM Sans font)
├── globals.css                       # Neobrutalism + Spotify skin tokens
├── components/
│   └── theme-toggle.tsx              # Dark/Light mode toggle
├── lib/
│   ├── spotify.ts                    # Spotify API client + types
│   └── hooks.ts                     # useFetch + Spotify hooks (client-side)
├── api/
│   ├── auth/[...nextauth]/route.ts   # NextAuth handler
│   └── spotify/
│       ├── top-tracks/route.ts       # GET /api/spotify/top-tracks
│       ├── top-artists/route.ts      # GET /api/spotify/top-artists
│       ├── playlists/route.ts        # GET /api/spotify/playlists
│       ├── saved-tracks/route.ts     # GET /api/spotify/saved-tracks
│       └── search/route.ts           # GET /api/spotify/search?q=
└── music/
    ├── page.tsx                      # Home dashboard (~1500 lines, kết nối Spotify)
    ├── components/
    │   └── MusicShell.tsx            # Layout shell (sidebar + header + right rail)
    ├── search/page.tsx               # ❌ Static hardcoded
    ├── library/page.tsx              # ❌ Static hardcoded
    ├── radio/page.tsx                # ❌ Static hardcoded
    └── profile/page.tsx              # ❌ Static hardcoded

auth.ts                               # NextAuth v5 config (Spotify OAuth + JWT refresh)
```

---

## 🔴 Backend — Thiếu

### 1. Middleware bảo vệ route
- **File:** `middleware.ts` (chưa tồn tại)
- **Vấn đề:** Không có middleware nào chặn truy cập `/music/*`. User chưa đăng nhập vẫn vào được tất cả route.
- **Giải pháp:** Tạo `middleware.ts` sử dụng `auth()` từ NextAuth, redirect về `/` hoặc login page khi chưa auth.

### 2. API: Recently Played
- **Spotify endpoint:** `GET /me/player/recently-played`
- **Vấn đề:** Profile page và Library page hiển thị "Recent plays" / "Recent activity" bằng data hardcoded.
- **Cần tạo:** `app/api/spotify/recently-played/route.ts`
- **Cần thêm scope:** `user-read-recently-played`

### 3. API: User Profile
- **Spotify endpoint:** `GET /me`
- **Vấn đề:** Hàm `getUserProfile()` đã viết trong `app/lib/spotify.ts` nhưng không có API route và không được sử dụng ở đâu.
- **Cần tạo:** `app/api/spotify/profile/route.ts`
- **Hook:** Thêm `useProfile()` vào `hooks.ts`

### 4. API: User Albums
- **Spotify endpoint:** `GET /me/albums`
- **Vấn đề:** Library page hiển thị stat "41 Albums" hardcoded.
- **Cần tạo:** `app/api/spotify/albums/route.ts`
- **Cần thêm:** Hàm `getUserAlbums()` trong `spotify.ts` + type `SpotifyAlbum` (đã có partial)

### 5. API: Search mở rộng (Artists / Albums / Podcasts)
- **Vấn đề:** Route `search/route.ts` chỉ search `type: "track"`. Search page FE có filter cho Artists, Albums, Podcasts nhưng không hoạt động.
- **Giải pháp:** Mở rộng search route hỗ trợ `type` param (`track,artist,album`).

### 6. API: Playback Control
- **Spotify endpoints:** `PUT /me/player/play`, `PUT /me/player/pause`, `POST /me/player/next`, `POST /me/player/previous`
- **Vấn đề:** Player bar hoàn toàn là UI giả. Chỉ có Spotify Embed iframe (không điều khiển được).
- **Cần scope:** `user-modify-playback-state`, `user-read-playback-state`
- **Lưu ý:** Yêu cầu Spotify Premium account.

### 7. API: Create / Edit Playlist
- **Spotify endpoints:** `POST /users/{user_id}/playlists`, `PUT /playlists/{id}`
- **Vấn đề:** Nút "New Playlist" ở Library page và "+" ở sidebar không có backend.
- **Cần scope:** `playlist-modify-public`, `playlist-modify-private`

### 8. API: Follow / Unfollow Artist
- **Spotify endpoints:** `PUT /me/following`, `DELETE /me/following`
- **Vấn đề:** Không có tính năng follow/unfollow artist.
- **Cần scope:** `user-follow-modify`, `user-follow-read`

### 9. API: Like / Unlike Track (persist)
- **Spotify endpoints:** `PUT /me/tracks`, `DELETE /me/tracks`
- **Vấn đề:** `toggleLike()` trong `music/page.tsx` chỉ lưu trong React `useState` (mất khi refresh). Không gọi Spotify API.
- **Cần tạo:** `app/api/spotify/like-track/route.ts` (PUT + DELETE)
- **Cần scope:** `user-library-modify`

### 10. Token refresh — Error recovery
- **Vấn đề:** Khi `auth.ts` trả `error: "RefreshTokenError"` hoặc `"NoRefreshToken"`, frontend (`session.error`) không xử lý gì — không tự động re-login hay hiện thông báo.
- **Giải pháp:** Trong `providers.tsx` hoặc hook, kiểm tra `session.error` → gọi `signIn("spotify")` lại.

---

## 🔴 Frontend — Thiếu

### 11. Search page không kết nối Spotify
- **File:** `app/music/search/page.tsx`
- **Vấn đề:** Toàn bộ data (TOP_RESULTS, RECENT_SEARCHES, BROWSE_CATEGORIES) là hardcoded. Không import hay sử dụng `useSearch` hook. Input search không gọi API.
- **Giải pháp:** Dùng `useSearch()` hook, hiển thị kết quả thật khi authenticated.

### 12. Library page không kết nối Spotify
- **File:** `app/music/library/page.tsx`
- **Vấn đề:** Stats (24 Playlists, 312 Liked Songs...), Pinned playlists, Recent activity — tất cả hardcoded.
- **Giải pháp:** Dùng `usePlaylists()`, `useSavedTracks()`, thêm `useRecentlyPlayed()`.

### 13. Profile page không kết nối Spotify
- **File:** `app/music/profile/page.tsx`
- **Vấn đề:** Tên "Nguyen Beats", stats (12.4k Followers), Top genres, Recent plays — tất cả hardcoded.
- **Giải pháp:** Fetch `/me` profile, dùng `useTopArtists()` để lấy genres, `useRecentlyPlayed()`.

### 14. Radio page hoàn toàn static
- **File:** `app/music/radio/page.tsx`
- **Vấn đề:** Live stations, "Made for you" mixes, Topics — tất cả hardcoded. Không có backend nào cho radio.
- **Giải pháp:** Có thể dùng Spotify `recommendations` API hoặc `browse/categories` API.

### 15. Player bar không phát nhạc thật
- **Vấn đề:** Nút Play/Pause chỉ toggle icon state. Không có `<audio>` element hay Spotify Web Playback SDK.
- **Giải pháp tối thiểu:** Dùng `preview_url` (30s preview) từ Spotify track data + `<audio>` element.
- **Giải pháp nâng cao:** Integrate Spotify Web Playback SDK (yêu cầu Premium).

### 16. Shuffle / Repeat buttons
- **Vấn đề:** Buttons tồn tại trong PlayerBar nhưng `onClick` không làm gì cả.

### 17. Volume slider
- **Vấn đề:** UI có icon volume + thanh slider nhưng không điều khiển âm lượng thật.

### 18. Progress bar / Seek
- **Vấn đề:** Thanh tiến trình track hiển thị nhưng không phản ánh vị trí phát thật, không click được để seek.

### 19. Mobile sidebar toggle
- **Vấn đề:** `MusicShell.tsx` có sidebar desktop (`hidden lg:flex`) nhưng không có hamburger button ở mobile header để mở sidebar. Có bottom nav nhưng không có sidebar toggle.

### 20. Sub-pages thiếu Player Bar
- **Vấn đề:** Chỉ `/music` (Home) truyền `footer={<PlayerBar .../>}` vào MusicShell. Khi navigate sang Search/Library/Radio/Profile → mất player bar.
- **Giải pháp:** Lift player state lên layout level hoặc dùng global state/context.

### 21. Sub-pages thiếu auth state
- **Vấn đề:** Các page Search, Library, Radio, Profile không gọi `useSession()`, không có nút "Connect Spotify", không phân biệt authenticated/unauthenticated.

### 22. Keyboard shortcuts
- **Vấn đề:** Header search input có hint phím `/` nhưng không có `onKeyDown` handler để focus input khi nhấn `/`.

### 23. Error boundary / Error UI
- **Vấn đề:** Khi Spotify API trả lỗi (401, 429 rate limit, 500...), user không thấy thông báo gì. Không có `error.tsx` boundary.

### 24. Loading states cho sub-pages
- **Vấn đề:** Home page có skeleton loading. Nhưng Search/Library/Profile/Radio không có loading state khi fetch data.

### 25. Sidebar library search
- **Vấn đề:** Input "Search in Library" trong `MusicShell.tsx` sidebar (line 82-86) không có logic filter — chỉ là UI placeholder.

---

## 📋 Đề xuất thứ tự ưu tiên

### Phase 1 — Kết nối data thật cho sub-pages
1. Tạo API routes thiếu: `profile`, `recently-played`, `albums`
2. Kết nối Spotify data cho **Search** page (item #11)
3. Kết nối Spotify data cho **Library** page (item #12)
4. Kết nối Spotify data cho **Profile** page (item #13)

### Phase 2 — Shared player & auth
5. Lift player bar lên layout level, hiển thị trên mọi sub-page (#20)
6. Thêm auth state + Connect Spotify cho sub-pages (#21)
7. Xử lý token refresh error → auto re-login (#10)

### Phase 3 — Middleware & bảo vệ route
8. Tạo `middleware.ts` (#1)

### Phase 4 — Player nâng cao
9. Tích hợp `preview_url` audio playback (#15)
10. Volume, progress bar, shuffle, repeat (#16–18)

### Phase 5 — Polish
11. Error boundary (#23)
12. Keyboard shortcuts (#22)
13. Mobile sidebar (#19)
14. Loading states (#24)
15. Sidebar search filter (#25)

### Phase 6 — Write operations (optional)
16. Like/Unlike persist (#9)
17. Create playlist (#7)
18. Follow artist (#8)
19. Search mở rộng artists/albums (#5)
20. Playback control API (#6)

---

## Scopes Spotify cần bổ sung

Hiện tại `auth.ts` chỉ request:
```
user-read-private, user-top-read, user-library-read,
playlist-read-private, playlist-read-collaborative
```

Cần thêm cho đầy đủ tính năng:
```
user-read-recently-played       # Recently played
user-library-modify             # Like/Unlike tracks
playlist-modify-public          # Create/Edit playlists
playlist-modify-private         # Create/Edit private playlists
user-follow-read                # Check following status
user-follow-modify              # Follow/Unfollow artists
user-read-playback-state        # Current playback info
user-modify-playback-state      # Play/Pause/Skip (Premium only)
streaming                       # Web Playback SDK (Premium only)
```
