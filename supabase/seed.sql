-- Supabase seed data for 10 demo users
-- Safe to run multiple times (using INSERT ... ON CONFLICT DO NOTHING)

-- Users (10 demo users)
INSERT INTO auth.users (id, email, created_at, updated_at, email_confirmed_at) VALUES
('u_1', 'demo@artisan.app', now(), now(), now()),
('u_2', 'demo2@artisan.app', now(), now(), now()),
('u_3', 'demo3@artisan.app', now(), now(), now()),
('u_4', 'demo4@artisan.app', now(), now(), now()),
('u_5', 'demo5@artisan.app', now(), now(), now()),
('u_6', 'demo6@artisan.app', now(), now(), now()),
('u_7', 'demo7@artisan.app', now(), now(), now()),
('u_8', 'demo8@artisan.app', now(), now(), now()),
('u_9', 'demo9@artisan.app', now(), now(), now()),
('u_10', 'demo10@artisan.app', now(), now(), now())
ON CONFLICT (id) DO NOTHING;

-- Profiles
INSERT INTO public.profiles (id, user_id, name, username, avatar, bio, created_at) VALUES
('u_1', 'u_1', 'Demo User 1', 'demo_user', 'https://i.pravatar.cc/150?img=11', 'Exploring mediums and styles.', now()),
('u_2', 'u_2', 'Demo User 2', 'demo_user_2', 'https://i.pravatar.cc/150?img=12', 'Exploring mediums and styles.', now()),
('u_3', 'u_3', 'Demo User 3', 'demo_user_3', 'https://i.pravatar.cc/150?img=13', 'Exploring mediums and styles.', now()),
('u_4', 'u_4', 'Demo User 4', 'demo_user_4', 'https://i.pravatar.cc/150?img=14', 'Exploring mediums and styles.', now()),
('u_5', 'u_5', 'Demo User 5', 'demo_user_5', 'https://i.pravatar.cc/150?img=15', 'Exploring mediums and styles.', now()),
('u_6', 'u_6', 'Demo User 6', 'demo_user_6', 'https://i.pravatar.cc/150?img=16', 'Exploring mediums and styles.', now()),
('u_7', 'u_7', 'Demo User 7', 'demo_user_7', 'https://i.pravatar.cc/150?img=17', 'Exploring mediums and styles.', now()),
('u_8', 'u_8', 'Demo User 8', 'demo_user_8', 'https://i.pravatar.cc/150?img=18', 'Exploring mediums and styles.', now()),
('u_9', 'u_9', 'Demo User 9', 'demo_user_9', 'https://i.pravatar.cc/150?img=19', 'Exploring mediums and styles.', now()),
('u_10', 'u_10', 'Demo User 10', 'demo_user_10', 'https://i.pravatar.cc/150?img=20', 'Exploring mediums and styles.', now())
ON CONFLICT (id) DO NOTHING;

-- Artworks (2 per user)
INSERT INTO public.artworks (id, user_id, title, description, image_url, category, for_sale, price_amount, price_currency, privacy, created_at) VALUES
('a_1', 'u_1', 'Landscape by Demo User 1', 'Study of light and color', 'https://picsum.photos/seed/u1-a/800/600', 'painting', true, 35000, 'USD', 'public', now()),
('a_2', 'u_2', 'Landscape by Demo User 2', 'Study of light and color', 'https://picsum.photos/seed/u2-a/800/600', 'painting', false, null, null, 'public', now()),
('a_3', 'u_3', 'Landscape by Demo User 3', 'Study of light and color', 'https://picsum.photos/seed/u3-a/800/600', 'painting', true, 28000, 'USD', 'public', now()),
('a_4', 'u_4', 'Landscape by Demo User 4', 'Study of light and color', 'https://picsum.photos/seed/u4-a/800/600', 'sculpture', true, 45000, 'USD', 'public', now()),
('a_5', 'u_5', 'Landscape by Demo User 5', 'Study of light and color', 'https://picsum.photos/seed/u5-a/800/600', 'handicraft', false, null, null, 'public', now())
ON CONFLICT (id) DO NOTHING;

-- Follows (demo_user follows others, some follow back)
INSERT INTO public.follows (follower_id, followee_id, created_at) VALUES
('u_1', 'u_2', now()),
('u_1', 'u_3', now()),
('u_1', 'u_4', now()),
('u_1', 'u_5', now()),
('u_2', 'u_1', now()),
('u_4', 'u_1', now())
ON CONFLICT (follower_id, followee_id) DO NOTHING;

-- Purchases (demo_user buys from others)
INSERT INTO public.purchases (id, buyer_id, artwork_id, amount, currency, purchased_at) VALUES
('p_1', 'u_1', 'a_3', 28000, 'USD', now() - interval '2 days'),
('p_2', 'u_1', 'a_4', 45000, 'USD', now() - interval '5 days')
ON CONFLICT (id) DO NOTHING;