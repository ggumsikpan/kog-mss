-- ══════════════════════════════════════════════════════
-- KOG 직원 데이터 초기화
-- Supabase SQL Editor에서 실행
-- ══════════════════════════════════════════════════════

-- 1. users 테이블에 phone 컬럼 추가 (없으면)
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- 2. email UNIQUE 제약조건 제거 (이메일 중복 허용)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;

-- 3. 기존 샘플 데이터 삭제
DELETE FROM users;

-- 4. 부서 테이블 초기화 (부서 없이 운영)
DELETE FROM departments;

-- 5. 직원 데이터 삽입 (초기 비밀번호: 0000)
INSERT INTO users (name, position, role, phone, email, password_hash, is_active) VALUES
  ('강현수', '대표이사', 'admin', '010-6418-3763', 'ds5300@hanmail.net', '0000', true),
  ('송지숙', '이사', 'manager', '010-2479-3127', 'dsonebill@gmail.com', '0000', true),
  ('강승우', '대리', 'employee', '010-7623-8876', 'semusu@gmail.com', '0000', true),
  ('강승희', '주임', 'employee', '010-2484-7512', 'kasdf98721@gmail.com', '0000', true),
  ('이영미', '이사', 'manager', '010-4163-5778', 'semusu@gmail.com', '0000', true),
  ('이우영', '이사', 'manager', '010-5899-1448', 'dsoneqc@gmail.com', '0000', true),
  ('윤인호', '이사', 'manager', '010-9068-6861', 'daebukr@naver.com', '0000', true),
  ('오가와 도모꼬', '차장', 'employee', '010-5754-1642', 'dsoneqc@gmail.com', '0000', true),
  ('김영주', '부장', 'manager', '010-2879-1868', 'yjk3420@naver.com', '0000', true),
  ('이현근', '부장', 'manager', '010-5151-4445', 'koginweb@gmail.com', '0000', true),
  ('이석훈', '시스템 컨설턴트', 'admin', '010-6385-7545', 'ggumsikman@gmail.com', '0000', true);
