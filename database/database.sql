-- ============================================
-- RESET TOÀN BỘ (tùy chọn, nếu tạo DB mới thì giữ nguyên)
-- CẢNH BÁO: lệnh dưới sẽ xóa sạch mọi thứ trong schema public
-- ============================================
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
COMMENT ON SCHEMA public IS 'standard public schema';

-- ========== PHẦN 1: TẠO BẢNG (SCHEMA) ==========

-- Kích hoạt extension để tạo UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- --- TẠO CÁC KIỂU DỮ LIỆU ENUM ---

CREATE TYPE user_role AS ENUM (
  'manager',
  'driver',
  'parent'
);

CREATE TYPE bus_status AS ENUM (
  'active',
  'maintenance',
  'inactive'
);

CREATE TYPE trip_type AS ENUM (
  'pickup',
  'dropoff'
);

-- CA MỚI: sáng/chiều
CREATE TYPE day_part AS ENUM (
  'morning',
  'afternoon'
);

CREATE TYPE trip_status AS ENUM (
  'scheduled',
  'in_progress',
  'completed',
  'cancelled'
);

CREATE TYPE attendance_status AS ENUM (
  'pending',
  'attended',
  'absent'
);

CREATE TYPE notification_type AS ENUM (
  'alert',
  'arrival',
  'message',
  'incident'
);

CREATE TYPE report_type AS ENUM (
  'student_absent',
  'incident_traffic',
  'incident_vehicle',
  'incident_accident',
  'complaint',
  'other'
);

CREATE TYPE report_status AS ENUM (
  'pending',
  'resolved'
);

CREATE TYPE student_status AS ENUM (
  'active',
  'inactive'
);

-- --- HÀM TỰ ĐỘNG CẬP NHẬT `updated_at` ---
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- --- TẠO CÁC BẢNG ---

-- Users
CREATE TABLE "Users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "full_name" VARCHAR(255),
  "phone" VARCHAR(20) UNIQUE NOT NULL,
  "email" VARCHAR(255) UNIQUE,
  "password_hash" VARCHAR(255),
  "role" user_role NOT NULL,
  "fcm_token" VARCHAR(255),
  "license_number" VARCHAR(255), -- số bằng lái (nullable)
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Stops
CREATE TABLE "Stops" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "address" VARCHAR(255),
  "latitude" DECIMAL(9, 6) NOT NULL,
  "longitude" DECIMAL(9, 6) NOT NULL,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Buses
CREATE TABLE "Buses" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "license_plate" VARCHAR(50) UNIQUE NOT NULL,
  "capacity" INT NOT NULL,
  "status" bus_status NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Routes
CREATE TABLE "Routes" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) UNIQUE NOT NULL,
  "description" VARCHAR(255), -- mô tả tuyến (nullable)
  "status" VARCHAR(20) DEFAULT 'active', -- active/inactive
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Route_Stops
CREATE TABLE "Route_Stops" (
  "route_id" UUID,
  "stop_id" UUID,
  "stop_order" INT NOT NULL,
  PRIMARY KEY ("route_id", "stop_id"),
  FOREIGN KEY ("route_id") REFERENCES "Routes"("id") ON DELETE CASCADE,
  FOREIGN KEY ("stop_id") REFERENCES "Stops"("id") ON DELETE CASCADE
);

-- Students
CREATE TABLE IF NOT EXISTS "Students" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "full_name" VARCHAR(255) NOT NULL,
  "parent_id" UUID,
  "pickup_stop_id" UUID,
  "dropoff_stop_id" UUID,
  "class" VARCHAR(20),
  "status" student_status DEFAULT 'active',
  "route_id" UUID,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY ("parent_id") REFERENCES "Users"("id") ON DELETE SET NULL,
  FOREIGN KEY ("pickup_stop_id") REFERENCES "Stops"("id") ON DELETE SET NULL,
  FOREIGN KEY ("dropoff_stop_id") REFERENCES "Stops"("id") ON DELETE SET NULL,
  FOREIGN KEY ("route_id") REFERENCES "Routes"("id") ON DELETE SET NULL
);

-- Trips: THÊM "session"
CREATE TABLE "Trips" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "route_id" UUID,
  "bus_id" UUID,
  "driver_id" UUID,
  "trip_date" DATE NOT NULL,
  "session" day_part NOT NULL DEFAULT 'morning', -- << NEW
  "type" trip_type NOT NULL,
  "status" trip_status NOT NULL DEFAULT 'scheduled',
  "actual_start_time" TIMESTAMPTZ,
  "actual_end_time" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY ("route_id") REFERENCES "Routes"("id") ON DELETE SET NULL,
  FOREIGN KEY ("bus_id") REFERENCES "Buses"("id") ON DELETE SET NULL,
  FOREIGN KEY ("driver_id") REFERENCES "Users"("id") ON DELETE SET NULL,
  CONSTRAINT uq_trip_driver UNIQUE ("driver_id", "trip_date", "session", "type"),
  CONSTRAINT uq_trip_bus    UNIQUE ("bus_id",    "trip_date", "session", "type")
);

-- Trip_Students
CREATE TABLE "Trip_Students" (
  "trip_id" UUID,
  "student_id" UUID,
  "status" attendance_status NOT NULL DEFAULT 'pending',
  "attended_at" TIMESTAMPTZ,
  PRIMARY KEY ("trip_id", "student_id"),
  FOREIGN KEY ("trip_id") REFERENCES "Trips"("id") ON DELETE CASCADE,
  FOREIGN KEY ("student_id") REFERENCES "Students"("id") ON DELETE CASCADE
);

-- Bus_Locations
CREATE TABLE "Bus_Locations" (
  "id" BIGSERIAL PRIMARY KEY,
  "trip_id" UUID,
  "latitude" DECIMAL(9, 6) NOT NULL,
  "longitude" DECIMAL(9, 6) NOT NULL,
  "timestamp" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("trip_id") REFERENCES "Trips"("id") ON DELETE CASCADE
);

-- Notifications
CREATE TABLE "Notifications" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "recipient_id" UUID,
  "title" VARCHAR(255),
  "message" TEXT NOT NULL,
  "type" notification_type NOT NULL,
  "is_read" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY ("recipient_id") REFERENCES "Users"("id") ON DELETE CASCADE
);

-- Messages
CREATE TABLE "Messages" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "conversation_id" UUID,
  "sender_id" UUID,
  "recipient_id" UUID,
  "content" TEXT NOT NULL,
  "is_read" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY ("sender_id") REFERENCES "Users"("id") ON DELETE SET NULL,
  FOREIGN KEY ("recipient_id") REFERENCES "Users"("id") ON DELETE SET NULL
);

-- Reports
CREATE TABLE "Reports" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "sender_id" UUID,
  "trip_id" UUID,
  "student_id" UUID,
  "title" VARCHAR(255) NOT NULL,
  "content" TEXT NOT NULL,
  "type" report_type NOT NULL,
  "status" report_status NOT NULL DEFAULT 'pending',
  "image_url" VARCHAR(255),
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY ("sender_id") REFERENCES "Users"("id") ON DELETE SET NULL,
  FOREIGN KEY ("trip_id") REFERENCES "Trips"("id") ON DELETE SET NULL,
  FOREIGN KEY ("student_id") REFERENCES "Students"("id") ON DELETE SET NULL
);

-- --- TRIGGERS ---
CREATE TRIGGER set_timestamp BEFORE UPDATE ON "Users"    FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp BEFORE UPDATE ON "Stops"    FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp BEFORE UPDATE ON "Students" FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp BEFORE UPDATE ON "Buses"    FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp BEFORE UPDATE ON "Routes"   FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp BEFORE UPDATE ON "Trips"    FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp BEFORE UPDATE ON "Reports"  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- --- INDEXES ---
CREATE INDEX IF NOT EXISTS students_parent_idx ON "Students" ("parent_id");
CREATE INDEX IF NOT EXISTS students_status_idx ON "Students"("status");
CREATE INDEX IF NOT EXISTS students_route_idx ON "Students"("route_id");
CREATE INDEX ON "Trips" ("driver_id", "trip_date", "session", "type");
CREATE INDEX ON "Trips" ("bus_id", "trip_date", "session", "type");
CREATE INDEX ON "Bus_Locations" ("trip_id", "timestamp" DESC);
CREATE INDEX ON "Notifications" ("recipient_id");
CREATE INDEX ON "Messages" ("conversation_id");
CREATE INDEX ON "Reports" ("sender_id");
CREATE INDEX ON "Reports" ("status");
CREATE INDEX IF NOT EXISTS routes_status_idx ON "Routes"("status");

-- ========== PHẦN 2: DỮ LIỆU MẪU (CÓ SÁNG/CHIỀU) ==========

DO $$
DECLARE
  v_driver_id UUID;
  v_parent_id UUID;

  v_stop_1_id UUID;
  v_stop_2_id UUID;

  v_bus_1_id UUID;
  v_route_1_id UUID;

  v_student_1_id UUID; -- Nguyễn Văn An (sáng)
  v_student_2_id UUID; -- Trần Thị Bình (sáng)
  v_student_3_id UUID; -- Phạm Gia Huy (chiều)

  v_trip_pickup_morning   UUID; -- đón sáng
  v_trip_pickup_afternoon UUID; -- đón chiều (Huy)
  v_trip_dropoff_afternoon UUID; -- trả chiều (An, Bình, Huy) -> CHỈ 1 TRIP
BEGIN
  -- Users
  INSERT INTO "Users"(full_name, phone, email, password_hash, role)
  VALUES
    ('Tài xế 01', '0912345678', 'driver01@ssb.com', '$2b$10$dwiWofbHqGIITaPzXxhLQOA/I6mwmG4.6mtvWhetHs3VvcxPhscRO', 'driver'),
    ('Phụ huynh 01', '0922222222', 'parent01@ssb.com', '$2b$10$dwiWofbHqGIITaPzXxhLQOA/I6mwmG4.6mtvWhetHs3VvcxPhscRO', 'parent'),
    ('Quản lý 01',  '0933333333', 'manager01@ssb.com','$2b$10$dwiWofbHqGIITaPzXxhLQOA/I6mwmG4.6mtvWhetHs3VvcxPhscRO', 'manager');

  SELECT id INTO v_driver_id FROM "Users" WHERE phone='0912345678';
  SELECT id INTO v_parent_id FROM "Users" WHERE phone='0922222222';

  -- Stops (tách 2 INSERT)
  INSERT INTO "Stops"(name, address, latitude, longitude)
  VALUES ('Nhà Thờ Đức Bà', 'Quận 1, TPHCM', 10.77978, 106.69943)
  RETURNING id INTO v_stop_1_id;

  INSERT INTO "Stops"(name, address, latitude, longitude)
  VALUES ('Chợ Bến Thành', 'Quận 1, TPHCM', 10.77250, 106.69800)
  RETURNING id INTO v_stop_2_id;

  -- Bus
  INSERT INTO "Buses"(license_plate, capacity, status)
  VALUES ('51A-12345', 30, 'active')
  RETURNING id INTO v_bus_1_id;

  -- Route
  INSERT INTO "Routes"(name, description, status) VALUES ('Tuyến A - Quận 1','Tuyến đường khu vực trung tâm','active')
  RETURNING id INTO v_route_1_id;

  -- Route_Stops
  INSERT INTO "Route_Stops"(route_id, stop_id, stop_order)
  VALUES (v_route_1_id, v_stop_1_id, 1);
  INSERT INTO "Route_Stops"(route_id, stop_id, stop_order)
  VALUES (v_route_1_id, v_stop_2_id, 2);

  -- Students (tách 3 INSERT)
  INSERT INTO "Students"(full_name, parent_id, pickup_stop_id, dropoff_stop_id)
  VALUES ('Nguyễn Văn An', v_parent_id, v_stop_1_id, v_stop_2_id)
  RETURNING id INTO v_student_1_id;

  INSERT INTO "Students"(full_name, parent_id, pickup_stop_id, dropoff_stop_id)
  VALUES ('Trần Thị Bình', v_parent_id, v_stop_2_id, v_stop_1_id)
  RETURNING id INTO v_student_2_id;

  INSERT INTO "Students"(full_name, parent_id, pickup_stop_id, dropoff_stop_id)
  VALUES ('Phạm Gia Huy', v_parent_id, v_stop_1_id, v_stop_2_id)
  RETURNING id INTO v_student_3_id;

  -- TRIPS (3 trip hợp lệ theo UNIQUE)
  -- 1) ĐÓN SÁNG
  INSERT INTO "Trips"(route_id, bus_id, driver_id, trip_date, session, type, status, actual_start_time)
  VALUES (v_route_1_id, v_bus_1_id, v_driver_id, CURRENT_DATE, 'morning', 'pickup', 'scheduled',
          (CURRENT_DATE + interval '6 hours 30 minutes'))
  RETURNING id INTO v_trip_pickup_morning;

  -- 2) ĐÓN CHIỀU (Huy)
  INSERT INTO "Trips"(route_id, bus_id, driver_id, trip_date, session, type, status, actual_start_time)
  VALUES (v_route_1_id, v_bus_1_id, v_driver_id, CURRENT_DATE, 'afternoon', 'pickup', 'scheduled',
          (CURRENT_DATE + interval '12 hours 30 minutes'))
  RETURNING id INTO v_trip_pickup_afternoon;

  -- 3) TRẢ CHIỀU (An, Bình, Huy) -> chỉ 1 trip
  INSERT INTO "Trips"(route_id, bus_id, driver_id, trip_date, session, type, status, actual_start_time)
  VALUES (v_route_1_id, v_bus_1_id, v_driver_id, CURRENT_DATE, 'afternoon', 'dropoff', 'scheduled',
          (CURRENT_DATE + interval '16 hours 30 minutes'))
  RETURNING id INTO v_trip_dropoff_afternoon;

  -- TRIP_STUDENTS
  -- Sáng: An & Bình chờ đón
  INSERT INTO "Trip_Students"(trip_id, student_id, status)
  VALUES (v_trip_pickup_morning, v_student_1_id, 'pending');
  INSERT INTO "Trip_Students"(trip_id, student_id, status)
  VALUES (v_trip_pickup_morning, v_student_2_id, 'pending');

  -- Chiều đón: Huy
  INSERT INTO "Trip_Students"(trip_id, student_id, status)
  VALUES (v_trip_pickup_afternoon, v_student_3_id, 'pending');

  -- Chiều trả: An, Bình, Huy
  INSERT INTO "Trip_Students"(trip_id, student_id, status)
  VALUES (v_trip_dropoff_afternoon, v_student_1_id, 'pending');
  INSERT INTO "Trip_Students"(trip_id, student_id, status)
  VALUES (v_trip_dropoff_afternoon, v_student_2_id, 'pending');
  INSERT INTO "Trip_Students"(trip_id, student_id, status)
  VALUES (v_trip_dropoff_afternoon, v_student_3_id, 'pending');

  -- Notifications mẫu
  INSERT INTO "Notifications"(recipient_id, title, message, type)
  VALUES
    (v_parent_id, 'Lịch đưa đón sáng', 'Hôm nay có chuyến đón sáng cho Nguyễn Văn An & Trần Thị Bình.', 'arrival'),
    (v_parent_id, 'Lịch đưa đón chiều', 'Hôm nay có chuyến đón chiều & trả chiều cho Phạm Gia Huy; trả chiều gồm cả An & Bình.', 'arrival');
END $$;

-- SELECT ... WHERE t.session='afternoon' AND t.type='dropoff';
-- ========== PHẦN 4: DỮ LIỆU BÁO CÁO & THÔNG BÁO MẪU (THÊM VÀO) ==========

DO $$
DECLARE
  -- Lấy lại ID của các đối tượng đã tạo ở Phần 2
  v_driver_id UUID;
  v_student_1_id UUID;
  v_trip_pickup_morning UUID;
  v_trip_dropoff_afternoon UUID;
BEGIN
  -- 1. Lấy ID tài xế 01
  SELECT "id" INTO v_driver_id FROM "Users" WHERE "phone" = '0912345678' LIMIT 1;
  
  -- 2. Lấy ID học sinh (Nguyễn Văn An)
  SELECT "id" INTO v_student_1_id FROM "Students" WHERE "full_name" = 'Nguyễn Văn An' LIMIT 1;

  -- 3. Lấy ID chuyến đi (Đón Sáng)
  SELECT "id" INTO v_trip_pickup_morning 
  FROM "Trips" 
  WHERE "driver_id" = v_driver_id 
    AND "trip_date" = CURRENT_DATE 
    AND "session" = 'morning' 
    AND "type" = 'pickup'
  LIMIT 1;

  -- 4. Lấy ID chuyến đi (Trả Chiều)
  SELECT "id" INTO v_trip_dropoff_afternoon
  FROM "Trips" 
  WHERE "driver_id" = v_driver_id 
    AND "trip_date" = CURRENT_DATE 
    AND "session" = 'afternoon' 
    AND "type" = 'dropoff'
  LIMIT 1;

  -- Kiểm tra xem có lấy được ID không
  IF v_driver_id IS NULL THEN
    RAISE NOTICE 'Không tìm thấy Tài xế 01. Bỏ qua chèn dữ liệu mẫu (Phần 4).';
    RETURN;
  END IF;

  -- === A. THÊM THÔNG BÁO (Notifications) CHO TÀI XẾ 01 ===

  INSERT INTO "Notifications" ("recipient_id", "title", "message", "type")
  VALUES
    (v_driver_id, 'Phân công lịch trình', 'Bạn đã được phân công 3 chuyến đi cho ngày hôm nay. Vui lòng kiểm tra lịch.', 'message'),
    (v_driver_id, 'Cảnh báo thời tiết', 'Dự báo có mưa lớn vào buổi chiều. Vui lòng lái xe cẩn thận.', 'alert'),
    (v_driver_id, 'Thông báo bảo trì', 'Xe 51A-12345 của bạn có lịch bảo trì vào ngày mai.', 'incident');

  -- === B. THÊM BÁO CÁO (Reports) MẪU TỪ TÀI XẾ 01 ===
  
-- Chỉ thêm nếu tìm thấy chuyến đi (để tránh lỗi FK)
  IF v_trip_pickup_morning IS NOT NULL THEN
    INSERT INTO "Reports" ("sender_id", "trip_id", "student_id", "title", "content", "type", "status", "image_url")
    VALUES
      (v_driver_id, v_trip_pickup_morning, v_student_1_id, 
       'Học sinh vắng', 
       'Học sinh Nguyễn Văn An không có mặt tại điểm đón Nhà Thờ Đức Bà lúc 06:35.', 
       'student_absent', 
       'pending',
       'http://localhost:3000/static/uploads/incidents/1762936472695-779613029.jpg'); -- << THÊM URL GIẢ ĐỊNH
  END IF;

IF v_trip_dropoff_afternoon IS NOT NULL THEN
    INSERT INTO "Reports" ("sender_id", "trip_id", "student_id", "title", "content", "type", "status", "image_url")
    VALUES
      (v_driver_id, v_trip_dropoff_afternoon, NULL, 
       'Tai nạn nhẹ', 
       'Té cầu thang nên không đi được.', 
       'incident_accident', 
       'pending',
       'http://localhost:3000/static/uploads/incidents/1762936561915-289432164.jpg'), -- << THÊM URL GIẢ ĐỊNH
      (v_driver_id, v_trip_dropoff_afternoon, NULL, 
       'Xe hỏng', 
       'Xe phụ huynh hỏng không chở học sinh tới điểm đón được.', 
       'complaint', 
       'resolved',
       'http://localhost:3000/static/uploads/incidents/1763268349971-753592888.png'); -- << Báo cáo này không có ảnh
  END IF;

END $$;

-- ========== PHẦN 5: SEED THÊM DỮ LIỆU MẪU (MỞ RỘNG) ==========
DO $$
DECLARE
  -- users
  v_driver1 UUID; v_driver2 UUID; v_manager UUID;
  v_parent1 UUID; v_parent2 UUID;

  -- stops
  v_stop_a UUID; v_stop_b UUID; v_stop_c UUID;

  -- buses
  v_bus_1 UUID; v_bus_2 UUID;

  -- routes
  v_route_1 UUID; v_route_2 UUID;

  -- students
  v_student_an UUID; v_student_binh UUID; v_student_huy UUID;
  v_student_nga UUID; v_student_khoa UUID;

  -- trips (today)
  v_pickup_morning UUID;
  v_pickup_afternoon UUID;
  v_dropoff_afternoon UUID;

  v_pickup_morning_r2 UUID;
  v_dropoff_afternoon_r2 UUID;
BEGIN
  -- ===== USERS =====
  -- lấy từ phần cũ (đã có)
  SELECT id INTO v_driver1 FROM "Users" WHERE phone='0912345678' LIMIT 1; -- driver01
  SELECT id INTO v_parent1 FROM "Users" WHERE phone='0922222222' LIMIT 1;
  SELECT id INTO v_manager FROM "Users" WHERE role='manager' LIMIT 1;

  -- thêm 1 driver + 1 parent mới (nếu chưa có)
  IF NOT EXISTS (SELECT 1 FROM "Users" WHERE phone='0944444444') THEN
    INSERT INTO "Users"(full_name, phone, email, password_hash, role)
    VALUES ('Tài xế 02', '0944444444', 'driver02@ssb.com',
            '$2b$10$dwiWofbHqGIITaPzXxhLQOA/I6mwmG4.6mtvWhetHs3VvcxPhscRO', 'driver');
  END IF;
  SELECT id INTO v_driver2 FROM "Users" WHERE phone='0944444444' LIMIT 1;

  IF NOT EXISTS (SELECT 1 FROM "Users" WHERE phone='0955555555') THEN
    INSERT INTO "Users"(full_name, phone, email, password_hash, role)
    VALUES ('Phụ huynh 02', '0955555555', 'parent02@ssb.com',
            '$2b$10$dwiWofbHqGIITaPzXxhLQOA/I6mwmG4.6mtvWhetHs3VvcxPhscRO', 'parent');
  END IF;
  SELECT id INTO v_parent2 FROM "Users" WHERE phone='0955555555' LIMIT 1;

  -- ===== STOPS =====
  -- tạo thêm 1-2 điểm dừng nếu chưa có
  IF NOT EXISTS (SELECT 1 FROM "Stops" WHERE name='UBND Quận 1') THEN
    INSERT INTO "Stops"(name, address, latitude, longitude)
    VALUES ('UBND Quận 1', 'Lê Duẩn, Q1, TPHCM', 10.77900, 106.70010);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM "Stops" WHERE name='Nhà Văn Hóa Thanh Niên') THEN
    INSERT INTO "Stops"(name, address, latitude, longitude)
    VALUES ('Nhà Văn Hóa Thanh Niên', 'Phạm Ngọc Thạch, Q1, TPHCM', 10.79010, 106.69990);
  END IF;

  SELECT id INTO v_stop_a FROM "Stops" WHERE name='Nhà Thờ Đức Bà' LIMIT 1;
  SELECT id INTO v_stop_b FROM "Stops" WHERE name='Chợ Bến Thành' LIMIT 1;
  SELECT id INTO v_stop_c FROM "Stops" WHERE name='UBND Quận 1' LIMIT 1;

  -- ===== BUSES =====
  SELECT id INTO v_bus_1 FROM "Buses" WHERE license_plate='51A-12345' LIMIT 1;
  IF NOT EXISTS (SELECT 1 FROM "Buses" WHERE license_plate='51B-22222') THEN
    INSERT INTO "Buses"(license_plate, capacity, status) VALUES ('51B-22222', 28, 'active');
  END IF;
  SELECT id INTO v_bus_2 FROM "Buses" WHERE license_plate='51B-22222' LIMIT 1;

  -- ===== ROUTES =====
  SELECT id INTO v_route_1 FROM "Routes" WHERE name='Tuyến A - Quận 1' LIMIT 1;
  IF NOT EXISTS (SELECT 1 FROM "Routes" WHERE name='Tuyến B - Trung Tâm') THEN
    INSERT INTO "Routes"(name, description, status) VALUES ('Tuyến B - Trung Tâm','Tuyến đường khu vực mở rộng','active');
  END IF;
  SELECT id INTO v_route_2 FROM "Routes" WHERE name='Tuyến B - Trung Tâm' LIMIT 1;

  -- gán stops cho route 2 nếu chưa có
  IF NOT EXISTS (SELECT 1 FROM "Route_Stops" WHERE route_id=v_route_2) THEN
    INSERT INTO "Route_Stops"(route_id, stop_id, stop_order)
    VALUES (v_route_2, v_stop_b, 1), (v_route_2, v_stop_c, 2);
  END IF;

  -- ===== STUDENTS =====
  -- các em từ seed cũ:
  SELECT id INTO v_student_an   FROM "Students" WHERE full_name='Nguyễn Văn An' LIMIT 1;
  SELECT id INTO v_student_binh FROM "Students" WHERE full_name='Trần Thị Bình' LIMIT 1;
  SELECT id INTO v_student_huy  FROM "Students" WHERE full_name='Phạm Gia Huy' LIMIT 1;

  -- thêm 2 em mới
  IF NOT EXISTS (SELECT 1 FROM "Students" WHERE full_name='Lê Thảo Nga') THEN
    INSERT INTO "Students"(full_name, parent_id, pickup_stop_id, dropoff_stop_id)
    VALUES ('Lê Thảo Nga', v_parent2, v_stop_b, v_stop_c);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM "Students" WHERE full_name='Võ Minh Khoa') THEN
    INSERT INTO "Students"(full_name, parent_id, pickup_stop_id, dropoff_stop_id)
    VALUES ('Võ Minh Khoa', v_parent2, v_stop_c, v_stop_b);
  END IF;
  SELECT id INTO v_student_nga  FROM "Students" WHERE full_name='Lê Thảo Nga' LIMIT 1;
  SELECT id INTO v_student_khoa FROM "Students" WHERE full_name='Võ Minh Khoa' LIMIT 1;

  -- ===== TRIPS HÔM NAY (ROUTE A: driver1, ROUTE B: driver2) =====
  -- Route A (driver1)
  SELECT id INTO v_pickup_morning
  FROM "Trips"
  WHERE driver_id=v_driver1 AND trip_date=CURRENT_DATE AND session='morning' AND type='pickup'
  LIMIT 1;

  IF v_pickup_morning IS NULL THEN
    INSERT INTO "Trips"(route_id, bus_id, driver_id, trip_date, session, type, status, actual_start_time)
    VALUES (v_route_1, v_bus_1, v_driver1, CURRENT_DATE, 'morning', 'pickup', 'in_progress',
            (CURRENT_DATE + interval '06:30'));
    SELECT id INTO v_pickup_morning
    FROM "Trips"
    WHERE driver_id=v_driver1 AND trip_date=CURRENT_DATE AND session='morning' AND type='pickup'
    LIMIT 1;
  END IF;

  SELECT id INTO v_pickup_afternoon
  FROM "Trips"
  WHERE driver_id=v_driver1 AND trip_date=CURRENT_DATE AND session='afternoon' AND type='pickup'
  LIMIT 1;
  IF v_pickup_afternoon IS NULL THEN
    INSERT INTO "Trips"(route_id, bus_id, driver_id, trip_date, session, type, status)
    VALUES (v_route_1, v_bus_1, v_driver1, CURRENT_DATE, 'afternoon', 'pickup', 'scheduled');
    SELECT id INTO v_pickup_afternoon
    FROM "Trips"
    WHERE driver_id=v_driver1 AND trip_date=CURRENT_DATE AND session='afternoon' AND type='pickup'
    LIMIT 1;
  END IF;

  SELECT id INTO v_dropoff_afternoon
  FROM "Trips"
  WHERE driver_id=v_driver1 AND trip_date=CURRENT_DATE AND session='afternoon' AND type='dropoff'
  LIMIT 1;
  IF v_dropoff_afternoon IS NULL THEN
    INSERT INTO "Trips"(route_id, bus_id, driver_id, trip_date, session, type, status)
    VALUES (v_route_1, v_bus_1, v_driver1, CURRENT_DATE, 'afternoon', 'dropoff', 'scheduled');
    SELECT id INTO v_dropoff_afternoon
    FROM "Trips"
    WHERE driver_id=v_driver1 AND trip_date=CURRENT_DATE AND session='afternoon' AND type='dropoff'
    LIMIT 1;
  END IF;

  -- Route B (driver2)
  SELECT id INTO v_pickup_morning_r2
  FROM "Trips"
  WHERE driver_id=v_driver2 AND trip_date=CURRENT_DATE AND session='morning' AND type='pickup'
  LIMIT 1;
  IF v_pickup_morning_r2 IS NULL THEN
    INSERT INTO "Trips"(route_id, bus_id, driver_id, trip_date, session, type, status)
    VALUES (v_route_2, v_bus_2, v_driver2, CURRENT_DATE, 'morning', 'pickup', 'scheduled');
    SELECT id INTO v_pickup_morning_r2
    FROM "Trips"
    WHERE driver_id=v_driver2 AND trip_date=CURRENT_DATE AND session='morning' AND type='pickup'
    LIMIT 1;
  END IF;

  SELECT id INTO v_dropoff_afternoon_r2
  FROM "Trips"
  WHERE driver_id=v_driver2 AND trip_date=CURRENT_DATE AND session='afternoon' AND type='dropoff'
  LIMIT 1;
  IF v_dropoff_afternoon_r2 IS NULL THEN
    INSERT INTO "Trips"(route_id, bus_id, driver_id, trip_date, session, type, status)
    VALUES (v_route_2, v_bus_2, v_driver2, CURRENT_DATE, 'afternoon', 'dropoff', 'scheduled');
    SELECT id INTO v_dropoff_afternoon_r2
    FROM "Trips"
    WHERE driver_id=v_driver2 AND trip_date=CURRENT_DATE AND session='afternoon' AND type='dropoff'
    LIMIT 1;
  END IF;

  -- ===== TRIP_STUDENTS (gán nhanh) =====
  -- Route A sáng: An, Bình
  PERFORM 1 FROM "Trip_Students" WHERE trip_id=v_pickup_morning AND student_id=v_student_an;
  IF NOT FOUND THEN
    INSERT INTO "Trip_Students"(trip_id, student_id, status) VALUES (v_pickup_morning, v_student_an, 'pending');
  END IF;
  PERFORM 1 FROM "Trip_Students" WHERE trip_id=v_pickup_morning AND student_id=v_student_binh;
  IF NOT FOUND THEN
    INSERT INTO "Trip_Students"(trip_id, student_id, status) VALUES (v_pickup_morning, v_student_binh, 'pending');
  END IF;

  -- Route A chiều đón: Huy
  PERFORM 1 FROM "Trip_Students" WHERE trip_id=v_pickup_afternoon AND student_id=v_student_huy;
  IF NOT FOUND THEN
    INSERT INTO "Trip_Students"(trip_id, student_id, status) VALUES (v_pickup_afternoon, v_student_huy, 'pending');
  END IF;

  -- Route A chiều trả: An, Bình, Huy
  FOREACH v_student_an IN ARRAY ARRAY[v_student_an, v_student_binh, v_student_huy] LOOP
    PERFORM 1 FROM "Trip_Students" WHERE trip_id=v_dropoff_afternoon AND student_id=v_student_an;
    IF NOT FOUND THEN
      INSERT INTO "Trip_Students"(trip_id, student_id, status) VALUES (v_dropoff_afternoon, v_student_an, 'pending');
    END IF;
  END LOOP;

  -- Route B sáng: Nga, Khoa
  IF v_pickup_morning_r2 IS NOT NULL THEN
    PERFORM 1 FROM "Trip_Students" WHERE trip_id=v_pickup_morning_r2 AND student_id=v_student_nga;
    IF NOT FOUND THEN
      INSERT INTO "Trip_Students"(trip_id, student_id, status) VALUES (v_pickup_morning_r2, v_student_nga, 'pending');
    END IF;
    PERFORM 1 FROM "Trip_Students" WHERE trip_id=v_pickup_morning_r2 AND student_id=v_student_khoa;
    IF NOT FOUND THEN
      INSERT INTO "Trip_Students"(trip_id, student_id, status) VALUES (v_pickup_morning_r2, v_student_khoa, 'pending');
    END IF;
  END IF;

  -- ===== NOTIFICATIONS (thêm mới cho cả 2 tài xế) =====
  INSERT INTO "Notifications"(recipient_id, title, message, type)
  VALUES
    (v_driver1, 'Nhắc nhở xuất phát', 'Vui lòng xuất phát đúng 06:30 để kịp lộ trình buổi sáng.', 'alert'),
    (v_driver2, 'Điều chỉnh tuyến', 'Tuyến B có kẹt xe nhẹ, đề nghị rẽ Nguyễn Thị Minh Khai.', 'message')
  ON CONFLICT DO NOTHING;

  -- ===== REPORTS (nhiều loại + có ảnh ngoài để FE hiển thị ngay) =====
  -- Route A (driver1)
  INSERT INTO "Reports"(sender_id, trip_id, student_id, title, content, type, status, image_url)
  VALUES
    (v_driver1, v_pickup_morning, v_student_binh,
      'Kẹt xe', 'Giờ cao điểm đông xe nên đi trễ 30 phút.', 'incident_traffic', 'pending',
      'http://localhost:3000/static/uploads/incidents/1762936384743-665078944.jpg'),
    (v_driver1, v_dropoff_afternoon, NULL,
      'Khác', 'Phụ huynh góp ý tài xế gọi trước 5 phút.', 'complaint', 'resolved', NULL)
  ON CONFLICT DO NOTHING;

  -- Route B (driver2)
  INSERT INTO "Reports"(sender_id, trip_id, student_id, title, content, type, status, image_url)
  VALUES
    (v_driver2, v_pickup_morning_r2, v_student_nga,
      'Học sinh vắng', 'Phụ huynh báo nghỉ đột xuất sáng nay.', 'student_absent', 'pending',
      NULL),
    (v_driver2, v_dropoff_afternoon_r2, v_student_khoa,
      'Tai nạn nhẹ', 'Quẹt gương xe khi lùi bãi, không thiệt hại người.', 'incident_accident', 'pending',
      NULL)
  ON CONFLICT DO NOTHING;

END $$;

-- ALTERs for existing database (run manually if migrating):
-- ALTER TYPE student_status ADD VALUE IF NOT EXISTS 'active'; -- enum created above
-- ALTER TYPE student_status ADD VALUE IF NOT EXISTS 'inactive';
-- ALTER TABLE "Students" ADD COLUMN IF NOT EXISTS "class" VARCHAR(20);
-- ALTER TABLE "Students" ADD COLUMN IF NOT EXISTS "status" student_status DEFAULT 'active';
-- ALTER TABLE "Students" ADD COLUMN IF NOT EXISTS "route_id" UUID REFERENCES "Routes"("id") ON DELETE SET NULL;
-- CREATE INDEX IF NOT EXISTS students_status_idx ON "Students"("status");
-- CREATE INDEX IF NOT EXISTS students_route_idx ON "Students"("route_id");
-- ALTER TABLE "Routes" ADD COLUMN IF NOT EXISTS description VARCHAR(255);
-- ALTER TABLE "Routes" ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
-- CREATE INDEX IF NOT EXISTS routes_status_idx ON "Routes"("status");
