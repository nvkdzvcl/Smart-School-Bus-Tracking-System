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
  'incident',
  'complaint',
  'other'
);

CREATE TYPE report_status AS ENUM (
  'pending',
  'resolved'
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

-- Students
CREATE TABLE "Students" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "full_name" VARCHAR(255) NOT NULL,
  "parent_id" UUID,
  "pickup_stop_id" UUID,
  "dropoff_stop_id" UUID,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY ("parent_id") REFERENCES "Users"("id") ON DELETE SET NULL,
  FOREIGN KEY ("pickup_stop_id") REFERENCES "Stops"("id") ON DELETE SET NULL,
  FOREIGN KEY ("dropoff_stop_id") REFERENCES "Stops"("id") ON DELETE SET NULL
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
CREATE INDEX ON "Students" ("parent_id");
CREATE INDEX ON "Trips" ("driver_id", "trip_date", "session", "type");
CREATE INDEX ON "Trips" ("bus_id", "trip_date", "session", "type");
CREATE INDEX ON "Bus_Locations" ("trip_id", "timestamp" DESC);
CREATE INDEX ON "Notifications" ("recipient_id");
CREATE INDEX ON "Messages" ("conversation_id");
CREATE INDEX ON "Reports" ("sender_id");
CREATE INDEX ON "Reports" ("status");

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
  INSERT INTO "Routes"(name) VALUES ('Tuyến A - Quận 1')
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


-- ========== PHẦN 3: VÍ DỤ QUERY ==========

-- Lấy danh sách học sinh theo shift + session
-- Sáng: pickup (morning)
-- Chiều: dropoff (afternoon)
-- (Gợi ý dùng ở BE)
-- SELECT s.id, s.full_name, s.pickup_stop_id, s.dropoff_stop_id, ts.status
-- FROM "Trip_Students" ts
-- JOIN "Trips" t ON t.id = ts.trip_id
-- JOIN "Students" s ON s.id = ts.student_id
-- WHERE t.trip_date = CURRENT_DATE
--   AND t.session = 'morning'
--   AND t.type = 'pickup';

-- SELECT ... WHERE t.session='afternoon' AND t.type='dropoff';
-- ========== PHẦN 4: DỮ LIỆU BÁO CÁO & THÔNG BÁO MẪU (THÊM VÀO) ==========
-- (Dán khối này vào cuối file database.sql của bạn)

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
    INSERT INTO "Reports" ("sender_id", "trip_id", "student_id", "title", "content", "type", "status")
    VALUES
      (v_driver_id, v_trip_pickup_morning, v_student_1_id, 
       'Học sinh vắng mặt (Sáng)', 
       'Học sinh Nguyễn Văn An không có mặt tại điểm đón Nhà Thờ Đức Bà lúc 06:35.', 
       'student_absent', 
       'pending');
  END IF;

  IF v_trip_dropoff_afternoon IS NOT NULL THEN
    INSERT INTO "Reports" ("sender_id", "trip_id", "student_id", "title", "content", "type", "status")
    VALUES
      (v_driver_id, v_trip_dropoff_afternoon, NULL, 
       'Sự cố kẹt xe (Chiều)', 
       'Kẹt xe nghiêm trọng tại ngã tư Hàng Xanh, dự kiến trễ 15 phút.', 
       'incident', 
       'pending'),
      (v_driver_id, v_trip_dropoff_afternoon, NULL, 
       'Phụ huynh phàn nàn', 
       'Phụ huynh em Trần Thị Bình phàn nàn xe đến trễ 5 phút (đã giải quyết).', 
       'complaint', 
       'resolved');
  END IF;

END $$;