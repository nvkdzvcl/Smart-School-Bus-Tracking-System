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
  'alert',         -- cảnh báo (ví dụ: xe trễ, tai nạn)
  'info',          -- thông tin chung (ví dụ: thay đổi lộ trình)
  'message',       -- tin nhắn từ nhà trường
  'system',        -- thông báo hệ thống (điểm danh, xác nhận)
  'reminder',       -- nhắc nhở (họp phụ huynh, sự kiện)
  'arrival',
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

-- Chuẩn hóa trạng thái người dùng thành ENUM thay vì VARCHAR
DO $$
BEGIN
  -- Đảm bảo enum tồn tại và có đầy đủ các giá trị
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
    CREATE TYPE user_status AS ENUM ('active', 'inactive', 'locked');
  ELSE
    -- Nếu enum đã tồn tại nhưng chưa có 'locked' thì thêm vào
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'user_status' AND e.enumlabel = 'locked'
    ) THEN
      ALTER TYPE user_status ADD VALUE 'locked';
    END IF;
  END IF;

  -- Nếu cột status đang là varchar thì chuyển sang enum (bao gồm cả 'locked')
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Users' AND column_name = 'status' AND data_type = 'character varying'
  ) THEN
    ALTER TABLE "Users"
      ALTER COLUMN "status" TYPE user_status USING (
        CASE LOWER("status")
          WHEN 'inactive' THEN 'inactive'::user_status
          WHEN 'locked'   THEN 'locked'::user_status
          ELSE 'active'   ::user_status
        END
      );
  END IF;
END $$;

-- Enum cho loại cảnh báo chuyến đi phù hợp với FE
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'trip_alert_type') THEN
    CREATE TYPE trip_alert_type AS ENUM (
      'delay',
      'pickup_complete',
      'dropoff_complete',
      'trip_complete'
    );
  END IF;
END $$;

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
  "license_class" VARCHAR(50), -- hạng bằng lái (ví dụ: B1, B2, C)
  "license_expiry" DATE,        -- ngày hết hạn bằng lái
  "status" user_status DEFAULT 'active', -- trạng thái người dùng (driver)
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
-- Buses
CREATE TABLE "Buses" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "license_plate" VARCHAR(50) UNIQUE NOT NULL,
  "capacity" INT NOT NULL,
  "status" bus_status NOT NULL DEFAULT 'active',
  "gps_device_id" VARCHAR(255), 
  "insurance_expiry" DATE,      
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Routes
CREATE TABLE "Routes" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) UNIQUE NOT NULL,
  "description" VARCHAR(255), -- NEW: mô tả tuyến đường
  "status" VARCHAR(20) DEFAULT 'active',
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

-- Trips: THÊM "session" + "scheduled_start_time"
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
  "scheduled_start_time" TIMESTAMPTZ, -- << ADDED for planned start
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

-- Bảng lưu cảnh báo theo chuyến
CREATE TABLE IF NOT EXISTS "Trip_Alerts" (
  "id" BIGSERIAL PRIMARY KEY,
  "trip_id" UUID REFERENCES "Trips"("id") ON DELETE CASCADE,
  "type" trip_alert_type NOT NULL,
  "message" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS trip_alerts_trip_idx ON "Trip_Alerts" ("trip_id", "created_at" DESC);

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
  "recipient_id" UUID, -- NULL nếu là thông báo broadcast
  "target_group" VARCHAR(20), -- 'parent', 'driver', 'all' (nếu broadcast)
  "title" VARCHAR(255),
  "message" TEXT NOT NULL,
  "type" notification_type NOT NULL,
  "is_read" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY ("recipient_id") REFERENCES "Users"("id") ON DELETE CASCADE
);

CREATE TABLE "Conversations" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Thêm 2 người tham gia (cho chat 1-1)
  "participant_1_id" UUID,
  "participant_2_id" UUID,

  -- Các cột này dùng để cache, giúp tải danh sách cực nhanh
  "last_message_preview" TEXT,
  "last_message_at" TIMESTAMPTZ DEFAULT NOW(),

  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW(),

  FOREIGN KEY ("participant_1_id") REFERENCES "Users"("id") ON DELETE SET NULL,
  FOREIGN KEY ("participant_2_id") REFERENCES "Users"("id") ON DELETE SET NULL
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
  FOREIGN KEY ("conversation_id") REFERENCES "Conversations"("id") ON DELETE CASCADE,
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
CREATE TRIGGER set_timestamp BEFORE UPDATE ON "Conversations" FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

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
CREATE UNIQUE INDEX "uq_idx_participants" ON "Conversations" (
  LEAST("participant_1_id", "participant_2_id"),
  GREATEST("participant_1_id", "participant_2_id")
);
CREATE INDEX IF NOT EXISTS routes_status_idx ON "Routes"("status");

-- Nếu DB hiện tại đã tồn tại bảng Routes, thêm ALTER để cập nhật khi chạy thủ công
ALTER TABLE "Routes" ADD COLUMN IF NOT EXISTS "description" VARCHAR(255);

-- Thêm cột hạng bằng lái và ngày hết hạn cho bảng Users nếu chạy thủ công
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "license_class" VARCHAR(50);
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "license_expiry" DATE;

-- ========== PHẦN 2: DỮ LIỆU MẪU (CÓ SÁNG/CHIỀU) ==========

DO $$
DECLARE
  -- Users
  v_driver_1_id UUID; -- Trần Văn B (Tài xế)
  v_driver_2_id UUID; -- Lê Thị C (Tài xế)
  v_parent_id UUID;
  v_manager_id UUID;  -- Nhà trường (Văn phòng)

  -- Stops, Bus, Route
  v_stop_1_id UUID;
  v_stop_2_id UUID;
  v_bus_1_id UUID;
  v_route_1_id UUID;

  -- Students
  v_student_1_id UUID; -- Nguyễn Văn An
  v_student_2_id UUID; -- Trần Thị Bình
  v_student_3_id UUID; -- Phạm Gia Huy

  -- Trips
  v_trip_pickup_morning   UUID;
  v_trip_pickup_afternoon UUID;
  v_trip_dropoff_afternoon UUID;
  
  -- Conversations
  v_convo_1_id UUID; -- Parent <-> Driver 1
  v_convo_2_id UUID; -- Parent <-> Manager (Nhà trường)
  v_convo_3_id UUID; -- Parent <-> Driver 2

BEGIN
  RAISE NOTICE '--- Seeding Users (with all chat participants) ---';
  -- Users (Sửa tên và thêm user cho đủ 3 hội thoại)
  INSERT INTO "Users"(full_name, phone, email, password_hash, role)
  VALUES
    ('Trần Văn B (Tài xế)', '0912345678', 'driver01@ssb.com', '$2b$10$dwiWofbHqGIITaPzXxhLQOA/I6mwmG4.6mtvWhetHs3VvcxPhscRO', 'driver'),
    ('Phụ huynh 01', '0922222222', 'parent01@ssb.com', '$2b$10$dwiWofbHqGIITaPzXxhLQOA/I6mwmG4.6mtvWhetHs3VvcxPhscRO', 'parent'),
    ('Nhà trường (Văn phòng)', '0933333333', 'manager01@ssb.com','$2b$10$dwiWofbHqGIITaPzXxhLQOA/I6mwmG4.6mtvWhetHs3VvcxPhscRO', 'manager'),
    ('Lê Thị C (Tài xế)', '0944444444', 'driver02@ssb.com', '$2b$10$dwiWofbHqGIITaPzXxhLQOA/I6mwmG4.6mtvWhetHs3VvcxPhscRO', 'driver'); -- Thêm tài xế 2

  -- Lấy ID
  SELECT id INTO v_driver_1_id FROM "Users" WHERE phone='0912345678';
  SELECT id INTO v_parent_id FROM "Users" WHERE phone='0922222222';
  SELECT id INTO v_manager_id FROM "Users" WHERE phone='0933333333';
  SELECT id INTO v_driver_2_id FROM "Users" WHERE phone='0944444444';

  RAISE NOTICE '--- Seeding Stops ---';
  INSERT INTO "Stops"(name, address, latitude, longitude)
  VALUES ('Nhà Thờ Đức Bà', 'Quận 1, TPHCM', 10.77978, 106.69943)
  RETURNING id INTO v_stop_1_id;
  INSERT INTO "Stops"(name, address, latitude, longitude)
  VALUES ('Chợ Bến Thành', 'Quận 1, TPHCM', 10.77250, 106.69800)
  RETURNING id INTO v_stop_2_id;

 RAISE NOTICE '--- Seeding Bus ---';
  -- Cập nhật thêm GPS và Hạn bảo hiểm (1 năm sau kể từ hôm nay)
  INSERT INTO "Buses"(license_plate, capacity, status, gps_device_id, insurance_expiry)
  VALUES ('51A-12345', 30, 'active', 'GPS-001-A', (CURRENT_DATE + interval '1 year'))
  RETURNING id INTO v_bus_1_id;

  -- Route
  INSERT INTO "Routes"(name, description, status) VALUES ('Tuyến A - Quận 1','Tuyến đường khu vực trung tâm','active')
  RETURNING id INTO v_route_1_id;
  INSERT INTO "Route_Stops"(route_id, stop_id, stop_order)
  VALUES (v_route_1_id, v_stop_1_id, 1);
  INSERT INTO "Route_Stops"(route_id, stop_id, stop_order)
  VALUES (v_route_1_id, v_stop_2_id, 2);

  RAISE NOTICE '--- Seeding Students ---';
  INSERT INTO "Students"(full_name, parent_id, pickup_stop_id, dropoff_stop_id)
  VALUES ('Nguyễn Văn An', v_parent_id, v_stop_1_id, v_stop_2_id)
  RETURNING id INTO v_student_1_id;
  INSERT INTO "Students"(full_name, parent_id, pickup_stop_id, dropoff_stop_id)
  VALUES ('Trần Thị Bình', v_parent_id, v_stop_2_id, v_stop_1_id)
  RETURNING id INTO v_student_2_id;
  INSERT INTO "Students"(full_name, parent_id, pickup_stop_id, dropoff_stop_id)
  VALUES ('Phạm Gia Huy', v_parent_id, v_stop_1_id, v_stop_2_id)
  RETURNING id INTO v_student_3_id;

  RAISE NOTICE '--- Seeding Trips ---';
  -- Gán các chuyến cho Tài xế 1
  INSERT INTO "Trips"(route_id, bus_id, driver_id, trip_date, session, type, status, actual_start_time, actual_end_time)
  VALUES (v_route_1_id, v_bus_1_id, v_driver_1_id, CURRENT_DATE - 1, 'morning', 'pickup', 'completed', ((CURRENT_DATE - 1) + interval '6 hours 30 minutes'), ((CURRENT_DATE - 1) + interval '12 hours 47 minutes'))
  RETURNING id INTO v_trip_pickup_morning;

  INSERT INTO "Trip_Students" VALUES (v_trip_pickup_morning, v_student_1_id, 'attended', (CURRENT_DATE - 1) + interval '6 hours 35 minutes');
  INSERT INTO "Trip_Students" VALUES (v_trip_pickup_morning, v_student_2_id, 'attended', (CURRENT_DATE - 1) + interval '6 hours 40 minutes');

  -- Chiều (Đón Huy)
  -- INSERT INTO "Trips"(route_id, bus_id, driver_id, trip_date, session, type, status, actual_start_time)
  -- VALUES (v_route_1_id, v_bus_1_id, v_driver_1_id, CURRENT_DATE - 1, 'afternoon', 'pickup', 'completed', ((CURRENT_DATE - 1) + interval '12 hours 30 minutes'))
  -- RETURNING id INTO v_trip_pickup_afternoon;

  -- INSERT INTO "Trip_Students" VALUES (v_trip_pickup_afternoon, v_student_3_id, 'attended', (CURRENT_DATE - 1) + interval '12 hours 35 minutes');

  -- Chiều (Trả 3 bé)
  INSERT INTO "Trips"(route_id, bus_id, driver_id, trip_date, session, type, status, actual_start_time, actual_end_time)
  VALUES (v_route_1_id, v_bus_1_id, v_driver_1_id, CURRENT_DATE - 1, 'afternoon', 'dropoff', 'completed', ((CURRENT_DATE - 1) + interval '16 hours 30 minutes'), ((CURRENT_DATE - 1) + interval '20 hours 21 minutes'))
  RETURNING id INTO v_trip_dropoff_afternoon;

  INSERT INTO "Trip_Students" VALUES (v_trip_dropoff_afternoon, v_student_1_id, 'attended', (CURRENT_DATE - 1) + interval '16 hours 35 minutes');
  INSERT INTO "Trip_Students" VALUES (v_trip_dropoff_afternoon, v_student_2_id, 'attended', (CURRENT_DATE - 1) + interval '16 hours 40 minutes');
  INSERT INTO "Trip_Students" VALUES (v_trip_dropoff_afternoon, v_student_3_id, 'attended', (CURRENT_DATE - 1) + interval '16 hours 45 minutes');


  -- ====================================================
  -- 2. HÔM NAY (TODAY) - Sáng xong, Chiều chưa
  -- ====================================================

  -- Sáng (Đón An & Bình) -> Đã xong
  INSERT INTO "Trips"(route_id, bus_id, driver_id, trip_date, session, type, status, actual_start_time, actual_end_time)
  VALUES (v_route_1_id, v_bus_1_id, v_driver_1_id, CURRENT_DATE, 'morning', 'pickup', 'completed', (CURRENT_DATE + interval '6 hours 30 minutes'), (CURRENT_DATE + interval '11 hours 59 minutes'))
  RETURNING id INTO v_trip_pickup_morning;

  INSERT INTO "Trip_Students" VALUES (v_trip_pickup_morning, v_student_1_id, 'attended', CURRENT_DATE + interval '6 hours 35 minutes');
  INSERT INTO "Trip_Students" VALUES (v_trip_pickup_morning, v_student_2_id, 'attended', CURRENT_DATE + interval '6 hours 40 minutes');
  INSERT INTO "Trip_Students" VALUES (v_trip_pickup_morning, v_student_3_id, 'attended', CURRENT_DATE + interval '6 hours 45 minutes');


  -- Chiều (Trả 3 bé) -> Sắp chạy (Scheduled)
  INSERT INTO "Trips"(route_id, bus_id, driver_id, trip_date, session, type, status, actual_start_time)
  VALUES (v_route_1_id, v_bus_1_id, v_driver_1_id, CURRENT_DATE, 'afternoon', 'dropoff', 'scheduled', (CURRENT_DATE + interval '16 hours 30 minutes'))
  RETURNING id INTO v_trip_dropoff_afternoon;

  INSERT INTO "Trip_Students" VALUES (v_trip_dropoff_afternoon, v_student_1_id, 'pending', NULL);
  INSERT INTO "Trip_Students" VALUES (v_trip_dropoff_afternoon, v_student_2_id, 'pending', NULL);
  INSERT INTO "Trip_Students" VALUES (v_trip_dropoff_afternoon, v_student_3_id, 'pending', NULL);


  -- ====================================================
  -- 3. NGÀY MAI (TOMORROW) - Tất cả SẮP CHẠY
  -- ====================================================

  -- Sáng (Đón An & Bình)
  INSERT INTO "Trips"(route_id, bus_id, driver_id, trip_date, session, type, status, actual_start_time)
  VALUES (v_route_1_id, v_bus_1_id, v_driver_1_id, CURRENT_DATE + 1, 'morning', 'pickup', 'scheduled', ((CURRENT_DATE + 1) + interval '6 hours 30 minutes'))
  RETURNING id INTO v_trip_pickup_morning;

  INSERT INTO "Trip_Students" VALUES (v_trip_pickup_morning, v_student_1_id, 'pending', NULL);
  INSERT INTO "Trip_Students" VALUES (v_trip_pickup_morning, v_student_2_id, 'pending', NULL);

  -- Chiều (Trả 3 bé)
  INSERT INTO "Trips"(route_id, bus_id, driver_id, trip_date, session, type, status, actual_start_time)
  VALUES (v_route_1_id, v_bus_1_id, v_driver_1_id, CURRENT_DATE + 1, 'afternoon', 'dropoff', 'scheduled', ((CURRENT_DATE + 1) + interval '16 hours 30 minutes'))
  RETURNING id INTO v_trip_dropoff_afternoon;

  INSERT INTO "Trip_Students" VALUES (v_trip_dropoff_afternoon, v_student_1_id, 'pending', NULL);
  INSERT INTO "Trip_Students" VALUES (v_trip_dropoff_afternoon, v_student_2_id, 'pending', NULL);
  INSERT INTO "Trip_Students" VALUES (v_trip_dropoff_afternoon, v_student_3_id, 'pending', NULL);


  RAISE NOTICE '--- Seeding Notifications (Parent) ---';
  INSERT INTO "Notifications"(recipient_id, title, message, type)
  VALUES
    (v_parent_id, 'Lịch đưa đón sáng', 'Hôm nay có chuyến đón sáng cho Nguyễn Văn An & Trần Thị Bình.', 'arrival'),
    (v_parent_id, 'Lịch đưa đón chiều', 'Hôm nay có chuyến đón chiều & trả chiều cho Phạm Gia Huy; trả chiều gồm cả An & Bình.', 'arrival');

  -- === PHẦN THÊM MỚI ĐỂ TEST CHAT ===
  RAISE NOTICE '--- Seeding Conversations & Messages (MOCK DATA) ---';

-- === PHẦN THÊM MỚI ĐỂ TEST CHAT ===
  RAISE NOTICE '--- Seeding Conversations & Messages (MOCK DATA) ---';

  -- 1. Hội thoại 1: Parent 1 <-> Driver 1 (Trần Văn B)
  -- (Sửa last_message_at để khớp với tin nhắn cuối cùng)
  INSERT INTO "Conversations"(participant_1_id, participant_2_id, last_message_at)
  VALUES (v_parent_id, v_driver_1_id, (NOW() - interval '1 hour 30 minutes')) -- 10:30 AM (Giả lập)
  RETURNING id INTO v_convo_1_id;

  -- (Sửa lại: Thêm 6 tin nhắn mẫu từ ChatBox)
  INSERT INTO "Messages"(conversation_id, sender_id, recipient_id, content, created_at)
  VALUES 
    (v_convo_1_id, v_driver_1_id, v_parent_id, 'Chào anh, tôi đang trên đường đến đón bé Anh.', (NOW() - interval '1 hour 36 minutes')),
    (v_convo_1_id, v_parent_id, v_driver_1_id, 'Vâng, cảm ơn tài xế. Nhờ anh 5 phút nữa nhé.', (NOW() - interval '1 hour 35 minutes')),
    (v_convo_1_id, v_driver_1_id, v_parent_id, 'Vâng, tôi sẽ cho bé xuống ở cổng sau theo yêu cầu.', (NOW() - interval '1 hour 34 minutes')),
    (v_convo_1_id, v_parent_id, v_driver_1_id, 'Ok anh.', (NOW() - interval '1 hour 33 minutes')),
    (v_convo_1_id, v_driver_1_id, v_parent_id, 'Tôi đến cổng rồi ạ.', (NOW() - interval '1 hour 31 minutes')),
    (v_convo_1_id, v_parent_id, v_driver_1_id, 'Tôi cho bé ra ngay.', (NOW() - interval '1 hour 30 minutes'));

  -- (Sửa lại: Cập nhật last_message_preview cho đúng tin nhắn cuối cùng)
  UPDATE "Conversations"
  SET last_message_preview = 'Bạn: Tôi cho bé ra ngay.'
  WHERE id = v_convo_1_id;
  
  -- 2. Hội thoại 2: Parent 1 <-> Nhà trường (Manager 1)
  -- (Tin nhắn này chưa được đọc: is_read = false)
  INSERT INTO "Conversations"(participant_1_id, participant_2_id, last_message_at)
  VALUES (v_parent_id, v_manager_id, (NOW() - interval '2 hours 45 minutes')) -- 9:15 AM
  RETURNING id INTO v_convo_2_id;

  INSERT INTO "Messages"(conversation_id, sender_id, recipient_id, content, created_at, is_read)
  VALUES 
    (v_convo_2_id, v_parent_id, v_manager_id, 'Vâng, tôi đã nhận được thông báo.', (NOW() - interval '2 hours 45 minutes'), false); -- CHƯA ĐỌC

  UPDATE "Conversations"
  SET last_message_preview = 'Bạn: Vâng, tôi đã nhận được thông báo.'
  WHERE id = v_convo_2_id;

  -- 3. Hội thoại 3: Parent 1 <-> Driver 2 (Lê Thị C)
  INSERT INTO "Conversations"(participant_1_id, participant_2_id, last_message_at)
  VALUES (v_parent_id, v_driver_2_id, (NOW() - interval '1 day')) -- Hôm qua
  RETURNING id INTO v_convo_3_id;

  INSERT INTO "Messages"(conversation_id, sender_id, recipient_id, content, created_at)
  VALUES 
    (v_convo_3_id, v_parent_id, v_driver_2_id, 'Cảm ơn chị.', (NOW() - interval '1 day'));

  UPDATE "Conversations"
  SET last_message_preview = 'Bạn: Cảm ơn chị.'
  WHERE id = v_convo_3_id;
  
  RAISE NOTICE '--- Seeding Part 2 Completed Successfully ---';

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
       'incident_vehicle', 
       'resolved',
       'http://localhost:3000/static/uploads/incidents/1763268349971-753592888.png'); -- << Báo cáo này không có ảnh
  END IF;

END $$;

-- Seed cảnh báo mẫu cho các chuyến đã có để phục vụ frontend /trips/alerts
DO $$
DECLARE
  v_trip_today_pickup UUID;
  v_trip_today_dropoff UUID;
BEGIN
  SELECT id INTO v_trip_today_pickup FROM "Trips"
    WHERE trip_date = CURRENT_DATE AND session = 'morning' AND type = 'pickup'
    ORDER BY created_at DESC LIMIT 1;
  SELECT id INTO v_trip_today_dropoff FROM "Trips"
    WHERE trip_date = CURRENT_DATE AND session = 'afternoon' AND type = 'dropoff'
    ORDER BY created_at DESC LIMIT 1;

  IF v_trip_today_pickup IS NOT NULL THEN
    INSERT INTO "Trip_Alerts"(trip_id, type, message, created_at)
    VALUES
      (v_trip_today_pickup, 'delay', 'Chuyến đón sáng chậm 10 phút tại điểm dừng đầu tiên', NOW() - interval '45 minutes')
    ON CONFLICT DO NOTHING;
    INSERT INTO "Trip_Alerts"(trip_id, type, message, created_at)
    VALUES
      (v_trip_today_pickup, 'pickup_complete', 'Hoàn tất đón học sinh trên tuyến sáng', NOW() - interval '10 minutes')
    ON CONFLICT DO NOTHING;
  END IF;

  IF v_trip_today_dropoff IS NOT NULL THEN
    INSERT INTO "Trip_Alerts"(trip_id, type, message, created_at)
    VALUES
      (v_trip_today_dropoff, 'delay', 'Kẹt xe nhẹ trên tuyến chiều, dự kiến trễ 15 phút', NOW() - interval '20 minutes')
    ON CONFLICT DO NOTHING;
    INSERT INTO "Trip_Alerts"(trip_id, type, message, created_at)
    VALUES
      (v_trip_today_dropoff, 'dropoff_complete', 'Đã trả học sinh xong trên tuyến chiều', NOW())
    ON CONFLICT DO NOTHING;
    INSERT INTO "Trip_Alerts"(trip_id, type, message, created_at)
    VALUES
      (v_trip_today_dropoff, 'trip_complete', 'Chuyến chiều hoàn tất. Tài xế báo cáo xong nhiệm vụ.', NOW())
    ON CONFLICT DO NOTHING;
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
    -- Thêm xe thứ 2 với GPS và hạn bảo hiểm
    INSERT INTO "Buses"(license_plate, capacity, status, gps_device_id, insurance_expiry) 
    VALUES ('51B-22222', 28, 'active', 'GPS-002-B', (CURRENT_DATE + interval '6 months'));
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

  -- SELECT id INTO v_pickup_afternoon
  -- FROM "Trips"
  -- WHERE driver_id=v_driver1 AND trip_date=CURRENT_DATE AND session='afternoon' AND type='pickup'
  -- LIMIT 1;
  -- IF v_pickup_afternoon IS NULL THEN
  --   INSERT INTO "Trips"(route_id, bus_id, driver_id, trip_date, session, type, status)
  --   VALUES (v_route_1, v_bus_1, v_driver1, CURRENT_DATE, 'afternoon', 'pickup', 'scheduled');
  --   SELECT id INTO v_pickup_afternoon
  --   FROM "Trips"
  --   WHERE driver_id=v_driver1 AND trip_date=CURRENT_DATE AND session='afternoon' AND type='pickup'
  --   LIMIT 1;
  -- END IF;

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
  -- PERFORM 1 FROM "Trip_Students" WHERE trip_id=v_pickup_afternoon AND student_id=v_student_huy;
  -- IF NOT FOUND THEN
  --   INSERT INTO "Trip_Students"(trip_id, student_id, status) VALUES (v_pickup_afternoon, v_student_huy, 'pending');
  -- END IF;

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
      'Khác', 'Phụ huynh góp ý tài xế gọi trước 5 phút.', 'other', 'resolved', NULL)
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
DO $$
DECLARE
  -- Cấu hình số lượng
  CONST_BUS_COUNT     INT := 400;
  CONST_DRIVER_COUNT  INT := 500;
  CONST_STUDENT_COUNT INT := 5000;
  CONST_ROUTE_COUNT   INT := 100;
  CONST_PARENT_COUNT  INT := 2000;
  CONST_STOP_COUNT    INT := 300;

  -- Biến chạy chung
  i INT;
  v_stop_id UUID;
  v_route_id UUID;
  v_parent_id UUID;
  
  -- Biến hỗ trợ Trip
  v_bus_id UUID;
  v_trip_id UUID;
  rec_route RECORD;
  v_trip_date DATE;
  v_trip_status trip_status;
  v_actual_start TIMESTAMPTZ;
  v_actual_end TIMESTAMPTZ;
  v_random_bus UUID;
  v_random_driver UUID;
  
  -- Mảng tên mẫu
  arr_ho    TEXT[] := ARRAY['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Huỳnh', 'Hoàng', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
  arr_dem   TEXT[] := ARRAY['Văn', 'Thị', 'Minh', 'Thanh', 'Quốc', 'Gia', 'Đình', 'Ngọc', 'Hồng', 'Thảo', 'Phương', 'Hữu', 'Đức'];
  arr_ten   TEXT[] := ARRAY['An', 'Bình', 'Cường', 'Dũng', 'Giang', 'Huy', 'Hùng', 'Khánh', 'Lan', 'Minh', 'Nam', 'Nga', 'Phúc', 'Quân', 'Sơn', 'Thảo', 'Trang', 'Tú', 'Uyên', 'Vy', 'Yến'];
  
  -- Biến tạm tạo tên
  v_random_ho TEXT; v_random_dem TEXT; v_random_ten TEXT; v_full_name TEXT;
  v_phone TEXT; v_email TEXT; v_license TEXT;

BEGIN
  -- (Tùy chọn) Xóa sạch dữ liệu cũ
  -- TRUNCATE "Trip_Students", "Trips", "Students", "Users", "Buses", "Routes", "Route_Stops", "Stops" CASCADE;

  RAISE NOTICE '=== BẮT ĐẦU QUÁ TRÌNH TẠO FULL DỮ LIỆU ===';

  ---------------------------------------------------------
  -- 1. TẠO STOPS
  ---------------------------------------------------------
  RAISE NOTICE '--> 1/7: Đang tạo % điểm dừng...', CONST_STOP_COUNT;
  FOR i IN 1..CONST_STOP_COUNT LOOP
    INSERT INTO "Stops"(name, address, latitude, longitude)
    VALUES ('Điểm dừng ' || i, 'Địa chỉ số ' || i || ', TP.HCM', 10.7 + (random() * 0.1), 106.6 + (random() * 0.1));
  END LOOP;

  ---------------------------------------------------------
  -- 2. TẠO ROUTES
  ---------------------------------------------------------
  RAISE NOTICE '--> 2/7: Đang tạo % tuyến đường...', CONST_ROUTE_COUNT;
  FOR i IN 1..CONST_ROUTE_COUNT LOOP
    INSERT INTO "Routes"(name, description, status) VALUES ('Tuyến Số ' || i, 'Lộ trình số ' || i, 'active') RETURNING id INTO v_route_id;
    INSERT INTO "Route_Stops"(route_id, stop_id, stop_order)
    SELECT v_route_id, id, row_number() OVER () FROM "Stops" ORDER BY random() LIMIT (5 + floor(random() * 5)::int);
  END LOOP;

  ---------------------------------------------------------
  -- 3. TẠO BUSES
  ---------------------------------------------------------
  RAISE NOTICE '--> 3/7: Đang tạo % xe buýt...', CONST_BUS_COUNT;
  FOR i IN 1..CONST_BUS_COUNT LOOP
    v_license := '50A-' || lpad(i::text, 5, '0');
    INSERT INTO "Buses"(license_plate, capacity, status, gps_device_id, insurance_expiry)
    VALUES (v_license, (CASE WHEN random() > 0.5 THEN 29 ELSE 45 END), 'active', 'GPS-' || v_license, (CURRENT_DATE + (floor(random() * 365) || ' days')::interval));
  END LOOP;

  ---------------------------------------------------------
  -- 4. TẠO DRIVERS
  ---------------------------------------------------------
  RAISE NOTICE '--> 4/7: Đang tạo % tài xế...', CONST_DRIVER_COUNT;
  FOR i IN 1..CONST_DRIVER_COUNT LOOP
    v_random_ho  := arr_ho[1 + floor(random() * array_length(arr_ho, 1))];
    v_random_dem := arr_dem[1 + floor(random() * array_length(arr_dem, 1))];
    v_random_ten := arr_ten[1 + floor(random() * array_length(arr_ten, 1))];
    v_full_name  := v_random_ho || ' ' || v_random_dem || ' ' || v_random_ten;
    v_phone := '090' || lpad(i::text, 7, '0');
    v_email := 'driver_' || i || '@mock.com';

    INSERT INTO "Users"(full_name, phone, email, password_hash, role, license_number, license_class, license_expiry)
    VALUES (v_full_name, v_phone, v_email, '$2b$10$dwiWofbHqGIITaPzXxhLQOA/I6mwmG4.6mtvWhetHs3VvcxPhscRO', 'driver', 'GPLX-' || i, 'D', (CURRENT_DATE + interval '2 years'));
  END LOOP;

  ---------------------------------------------------------
  -- 5. TẠO PARENTS
  ---------------------------------------------------------
  RAISE NOTICE '--> 5/7: Đang tạo % phụ huynh...', CONST_PARENT_COUNT;
  FOR i IN 1..CONST_PARENT_COUNT LOOP
    v_random_ho  := arr_ho[1 + floor(random() * array_length(arr_ho, 1))];
    v_random_ten := arr_ten[1 + floor(random() * array_length(arr_ten, 1))];
    v_full_name  := v_random_ho || ' Thị ' || v_random_ten || ' (PH)';
    v_phone := '091' || lpad(i::text, 7, '0');
    v_email := 'parent_' || i || '@mock.com';

    INSERT INTO "Users"(full_name, phone, email, password_hash, role)
    VALUES (v_full_name, v_phone, v_email, '$2b$10$dwiWofbHqGIITaPzXxhLQOA/I6mwmG4.6mtvWhetHs3VvcxPhscRO', 'parent');
  END LOOP;

  ---------------------------------------------------------
  -- 6. TẠO STUDENTS
  ---------------------------------------------------------
  RAISE NOTICE '--> 6/7: Đang tạo % học sinh...', CONST_STUDENT_COUNT;
  FOR i IN 1..CONST_STUDENT_COUNT LOOP
    v_random_ho  := arr_ho[1 + floor(random() * array_length(arr_ho, 1))];
    v_random_dem := arr_dem[1 + floor(random() * array_length(arr_dem, 1))];
    v_random_ten := arr_ten[1 + floor(random() * array_length(arr_ten, 1))];
    v_full_name  := v_random_ho || ' ' || v_random_dem || ' ' || v_random_ten;

    SELECT id INTO v_parent_id FROM "Users" WHERE role = 'parent' OFFSET floor(random() * CONST_PARENT_COUNT) LIMIT 1;
    SELECT id INTO v_route_id FROM "Routes" OFFSET floor(random() * CONST_ROUTE_COUNT) LIMIT 1;
    
    WITH route_points AS (SELECT stop_id FROM "Route_Stops" WHERE route_id = v_route_id ORDER BY stop_order)
    INSERT INTO "Students"(full_name, parent_id, route_id, pickup_stop_id, dropoff_stop_id, class, status)
    VALUES (
      v_full_name, v_parent_id, v_route_id,
      (SELECT stop_id FROM route_points LIMIT 1), 
      (SELECT stop_id FROM route_points ORDER BY stop_id DESC LIMIT 1),
      'Lớp ' || (1 + floor(random() * 12)), 'active'
    );
  END LOOP;

  ---------------------------------------------------------
  -- 7. TẠO TRIPS (Fix lỗi ép kiểu ENUM)
  ---------------------------------------------------------
  RAISE NOTICE '--> 7/7: Đang sinh dữ liệu Trips (Quá khứ & Tương lai)...';

  FOR i IN -3..3 LOOP
    v_trip_date := CURRENT_DATE + i;

    FOR rec_route IN (
      SELECT id FROM "Routes" ORDER BY random() LIMIT (CONST_ROUTE_COUNT / 2)
    ) LOOP

      -- Reset trạng thái
      IF v_trip_date < CURRENT_DATE THEN
          v_trip_status := 'completed';
      ELSIF v_trip_date = CURRENT_DATE THEN
          v_trip_status := 'in_progress'; 
      ELSE
          v_trip_status := 'scheduled';
      END IF;

      -- === A. SÁNG ===
      IF v_trip_status = 'scheduled' THEN
         v_actual_start := NULL;
         v_actual_end := NULL;
      ELSE
         v_actual_start := (v_trip_date + interval '06:30');
         v_actual_end   := (v_trip_date + interval '07:30');
      END IF;

      SELECT id INTO v_random_bus FROM "Buses" ORDER BY random() LIMIT 1;
      SELECT id INTO v_random_driver FROM "Users" WHERE role='driver' ORDER BY random() LIMIT 1;

      v_trip_id := NULL;
      INSERT INTO "Trips"(route_id, bus_id, driver_id, trip_date, session, type, status,
                          actual_start_time, actual_end_time, scheduled_start_time)
      VALUES (
        rec_route.id, v_random_bus, v_random_driver, v_trip_date,
        'morning', 'pickup', 
        -- [FIX]: Ép kiểu ::trip_status
        (CASE WHEN v_trip_date = CURRENT_DATE THEN 'completed'::trip_status ELSE v_trip_status END),
        v_actual_start, v_actual_end,
        (v_trip_date + interval '06:30')
      )
      ON CONFLICT DO NOTHING
      RETURNING id INTO v_trip_id;

      IF v_trip_id IS NOT NULL THEN
        INSERT INTO "Trip_Students"(trip_id, student_id, status)
        SELECT v_trip_id, id,
          CASE 
            -- [FIX]: Ép kiểu ::attendance_status cho từng giá trị chuỗi
            WHEN v_trip_status = 'scheduled' THEN 'pending'::attendance_status
            ELSE (CASE WHEN random() > 0.05 THEN 'attended'::attendance_status ELSE 'absent'::attendance_status END)
          END
        FROM "Students" WHERE route_id = rec_route.id;
      END IF;

      -- === B. CHIỀU ===
      IF v_trip_date = CURRENT_DATE THEN 
         v_trip_status := 'scheduled'; 
      END IF;

      IF v_trip_status = 'scheduled' THEN 
         v_actual_start := NULL;
         v_actual_end := NULL;
      ELSE
         v_actual_start := (v_trip_date + interval '16:00');
         v_actual_end   := (v_trip_date + interval '17:00');
      END IF;

      SELECT id INTO v_random_bus FROM "Buses" ORDER BY random() LIMIT 1;
      SELECT id INTO v_random_driver FROM "Users" WHERE role='driver' ORDER BY random() LIMIT 1;

      v_trip_id := NULL;
      INSERT INTO "Trips"(route_id, bus_id, driver_id, trip_date, session, type, status,
                          actual_start_time, actual_end_time, scheduled_start_time)
      VALUES (
        rec_route.id, v_random_bus, v_random_driver, v_trip_date,
        'afternoon', 'dropoff', v_trip_status,
        v_actual_start, v_actual_end,
        (v_trip_date + interval '16:00')
      )
      ON CONFLICT DO NOTHING
      RETURNING id INTO v_trip_id;

      IF v_trip_id IS NOT NULL THEN
        INSERT INTO "Trip_Students"(trip_id, student_id, status)
        SELECT v_trip_id, id,
          CASE 
            -- [FIX]: Ép kiểu ::attendance_status
            WHEN v_trip_status = 'scheduled' THEN 'pending'::attendance_status
            ELSE (CASE WHEN random() > 0.05 THEN 'attended'::attendance_status ELSE 'absent'::attendance_status END)
          END
        FROM "Students" WHERE route_id = rec_route.id;
      END IF;

    END LOOP;
  END LOOP;

  RAISE NOTICE '=== SUCCESSS: ĐÃ TẠO XONG TOÀN BỘ DỮ LIỆU ===';
END $$;