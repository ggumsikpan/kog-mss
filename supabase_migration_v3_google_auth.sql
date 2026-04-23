-- ══════════════════════════════════════════════════════
-- KOG MSS v3 마이그레이션: Google OAuth 로그인 전환
--
-- 실행 전: Supabase Dashboard에서 아래 작업 선행 필수
--   1. Authentication → Providers → Google 활성화 + Client ID/Secret 입력
--   2. Authentication → URL Configuration
--      - Site URL: https://<app-domain>
--      - Redirect URLs: https://<app-domain>/auth/callback, http://localhost:3000/auth/callback
-- ══════════════════════════════════════════════════════

-- 1. users 테이블에 Supabase Auth 연결용 UUID 컬럼 추가
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE;

-- 2. 이메일 기준 인덱스 최적화 (이미 UNIQUE지만 로그인 조회가 많으므로 명시)
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- 3. password_hash 컬럼은 그대로 유지 (롤백 대비)
--    필요 시 1~2주 후 아래 쿼리로 제거 가능:
--    ALTER TABLE users DROP COLUMN password_hash;

-- 4. 기존 사용자 이메일 확인 (수동 점검용 쿼리 — 참고)
-- SELECT id, name, email, role FROM users WHERE email IS NULL OR email = '';

-- ── 참고: 기존 데이터 마이그레이션 ─────────────────────────
-- 각 직원이 처음 Google 로그인 시 email로 자동 매칭됩니다.
-- 기존 DB의 email이 Google 계정 이메일과 정확히 일치해야 역할/부서가 유지됩니다.
-- 불일치 시 staff 역할로 신규 row가 생성되므로 admin이 통합 정리 필요.
