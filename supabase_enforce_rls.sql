-- ════════════════════════════════════════════════════════════
--  supabase_enforce_rls.sql  (kog-mss)
--  목적: Supabase Security Advisor 경고 대응
--        (rls_disabled_in_public / sensitive_columns_exposed)
--  실행: Supabase SQL Editor 에 통째로 붙여넣고 Run.
--
--  배경:
--    이 앱은 사내 직원 전용(구글 OAuth 화이트리스트). 비로그인(anon)
--    접근 경로가 없음. DB 접근은 로그인 세션이 실린 서버 클라이언트
--    (anon key + auth 쿠키 → role = authenticated)로 수행됨.
--
--  전략:
--    모든 public 테이블에 RLS 켜고, "로그인한 사용자(authenticated)는
--    전체 접근" 정책을 부여. 비로그인(anon)은 전면 차단 → 경고 해소.
--    service_role(미사용 admin 클라이언트)은 RLS 자체를 우회하므로 무관.
--
--    ※ auth/callback 이 로그인 직후 email 로 users 를 조회(첫 로그인 시
--      auth_user_id 가 아직 null)하므로, 본인행 한정이 아니라
--      authenticated 전체 허용이어야 화이트리스트 체크가 깨지지 않음.
--
--  멱등 — 여러 번 실행해도 안전.
-- ════════════════════════════════════════════════════════════

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.tablename);
    EXECUTE format('DROP POLICY IF EXISTS "authenticated_all_access" ON public.%I;', r.tablename);
    EXECUTE format(
      'CREATE POLICY "authenticated_all_access" ON public.%I '
      'FOR ALL TO authenticated USING (true) WITH CHECK (true);',
      r.tablename
    );
  END LOOP;
END $$;

-- ════════════════════════════════════════════════════════════
-- 검증: rls_enabled = true, policy_count >= 1 이어야 정상
-- ════════════════════════════════════════════════════════════
SELECT
  t.tablename,
  c.relrowsecurity AS rls_enabled,
  COUNT(p.polname)  AS policy_count
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
LEFT JOIN pg_policy p ON p.polrelid = c.oid
WHERE t.schemaname = 'public'
GROUP BY t.tablename, c.relrowsecurity
ORDER BY rls_enabled, t.tablename;

-- ════════════════════════════════════════════════════════════
-- (선택) 추가 하드닝 — 시간 날 때:
--   users.password_hash 컬럼은 구글 OAuth 전환 후 미사용 → 제거 권장
--   ALTER TABLE public.users DROP COLUMN IF EXISTS password_hash;
-- ════════════════════════════════════════════════════════════
