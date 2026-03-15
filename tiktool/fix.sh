#!/bin/bash
# TikTool Fix Script - Applique toutes les corrections
set -e

echo "🔧 TikTool Fix Script"
echo "===================="

cd "$(dirname "$0")"

# 1. Fix redisClient.ts - retryStrategy
echo "📝 Correction redisClient.ts..."
sed -i 's/retryDelayOnFailover: 100/retryStrategy: (times) => Math.min(times * 100, 3000)/' backend/src/cache/redisClient.ts

# 2. Fix server.ts - CORS permissif
echo "📝 Correction server.ts (CORS)..."
sed -i "s/origin: \[config.frontendOrigin, 'http:\/\/localhost:5173'\]/origin: true/" backend/src/server.ts

# 3. Fix .env - FRONTEND_ORIGIN
echo "📝 Correction .env..."
sed -i 's/FRONTEND_ORIGIN=http:\/\/localhost:5173/FRONTEND_ORIGIN=http:\/\/217.216.80.132:5173/' .env

# 4. Fix useVideos.ts - null safety
echo "📝 Correction useVideos.ts..."
sed -i 's/setVideos(data\.items);/setVideos(data?.items || []);/' frontend/src/hooks/useVideos.ts
sed -i 's/setNextCursor(data\.nextCursor);/setNextCursor(data?.nextCursor || null);/' frontend/src/hooks/useVideos.ts
sed -i 's/\.\.\.(data\.items)/...(data?.items || [])/' frontend/src/hooks/useVideos.ts

# 5. Fix useReposts.ts - null safety
echo "📝 Correction useReposts.ts..."
sed -i 's/setReposts(data\.items);/setReposts(data?.items || []);/' frontend/src/hooks/useReposts.ts
sed -i 's/setNextCursor(data\.nextCursor);/setNextCursor(data?.nextCursor || null);/' frontend/src/hooks/useReposts.ts
sed -i 's/\.\.\.(data\.items)/...(data?.items || [])/' frontend/src/hooks/useReposts.ts

# 6. Fix useStories.ts - null safety
echo "📝 Correction useStories.ts..."
sed -i 's/setStories(data\.items);/setStories(data?.items || []);/' frontend/src/hooks/useStories.ts

# 7. Fix VideoGrid.tsx - safe array access
echo "📝 Correction VideoGrid.tsx..."
if ! grep -q "const safeVideos" frontend/src/components/VideoGrid.tsx; then
  sed -i '/const { t } = useTranslation();/a\  const safeVideos = videos || [];' frontend/src/components/VideoGrid.tsx
  sed -i 's/videos\.length/safeVideos.length/g' frontend/src/components/VideoGrid.tsx
  sed -i 's/videos\.map/safeVideos.map/g' frontend/src/components/VideoGrid.tsx
fi

# 8. Fix RepostList.tsx - safe array access
echo "📝 Correction RepostList.tsx..."
if ! grep -q "const safeReposts" frontend/src/components/RepostList.tsx; then
  sed -i '/const { t } = useTranslation();/a\  const safeReposts = reposts || [];' frontend/src/components/RepostList.tsx
  sed -i 's/reposts\.length/safeReposts.length/g' frontend/src/components/RepostList.tsx
  sed -i 's/reposts\.map/safeReposts.map/g' frontend/src/components/RepostList.tsx
fi

# 9. Fix StoryCarousel.tsx - safe array access
echo "📝 Correction StoryCarousel.tsx..."
if ! grep -q "const safeStories" frontend/src/components/StoryCarousel.tsx; then
  sed -i '/const { t } = useTranslation();/a\  const safeStories = stories || [];' frontend/src/components/StoryCarousel.tsx
  sed -i 's/stories\.length/safeStories.length/g' frontend/src/components/StoryCarousel.tsx
  sed -i 's/stories\.map/safeStories.map/g' frontend/src/components/StoryCarousel.tsx
fi

# 10. Fix ProfileHeader.tsx - null safety stats
echo "📝 Correction ProfileHeader.tsx..."
if ! grep -q "const stats = profile" frontend/src/components/ProfileHeader.tsx; then
  sed -i '/const { t } = useTranslation();/a\  const stats = profile?.stats || { followers: 0, following: 0, likes: 0, videosCount: 0 };\n  if (!profile) return null;' frontend/src/components/ProfileHeader.tsx
  sed -i 's/profile\.stats\.followers/stats.followers/g' frontend/src/components/ProfileHeader.tsx
  sed -i 's/profile\.stats\.following/stats.following/g' frontend/src/components/ProfileHeader.tsx
  sed -i 's/profile\.stats\.likes/stats.likes/g' frontend/src/components/ProfileHeader.tsx
  sed -i 's/profile\.stats\.videosCount/stats.videosCount/g' frontend/src/components/ProfileHeader.tsx
fi

# 11. Fix VideoCard.tsx - null safety stats
echo "📝 Correction VideoCard.tsx..."
if ! grep -q "const stats = video" frontend/src/components/VideoCard.tsx; then
  sed -i '/const { t } = useTranslation();/a\  const stats = video?.stats || { plays: 0, likes: 0, comments: 0, shares: 0 };\n  if (!video) return null;' frontend/src/components/VideoCard.tsx
  sed -i 's/video\.stats\.plays/stats.plays/g' frontend/src/components/VideoCard.tsx
  sed -i 's/video\.stats\.likes/stats.likes/g' frontend/src/components/VideoCard.tsx
  sed -i 's/video\.stats\.comments/stats.comments/g' frontend/src/components/VideoCard.tsx
  sed -i 's/video\.stats\.shares/stats.shares/g' frontend/src/components/VideoCard.tsx
fi

# 12. Fix ProfilePage.tsx - safe videos access
echo "📝 Correction ProfilePage.tsx..."
sed -i 's/{videos\.length > 0 && /{(videos || []).length > 0 \&\& /g' frontend/src/pages/ProfilePage.tsx
sed -i 's/{videos\.slice/(videos || []).slice/g' frontend/src/pages/ProfilePage.tsx

echo ""
echo "✅ Toutes les corrections ont été appliquées!"
echo ""
echo "🚀 Relance les services:"
echo "   cd backend && npm run build && npm start &"
echo "   cd frontend && npm run dev"
