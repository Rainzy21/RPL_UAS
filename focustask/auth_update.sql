-- ============================================================
-- SQL Update: Google Login & RLS Security
-- Jalankan ini di Supabase SQL Editor Anda
-- ============================================================

-- 1. Tambahkan kolom user_id ke tabel yang sudah ada
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE focus_logs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Hapus aturan lama (yang mengizinkan siapa saja)
DROP POLICY IF EXISTS "Allow all on tasks" ON tasks;
DROP POLICY IF EXISTS "Allow all on focus_logs" ON focus_logs;

-- 3. Buat aturan baru: Hanya pengguna yang sudah Login yang bisa mengakses datanya sendiri
CREATE POLICY "Enable ALL for users based on user_id" ON tasks
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable ALL for users based on user_id" ON focus_logs
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- PENTING: Jika sebelumnya ada data dummy di database Anda, data tersebut
-- akan hilang dari layar (karena user_id-nya kosong/berbeda dengan user yang login).
