-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255),
  password TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  plan_id VARCHAR(50) DEFAULT 'basic',
  billing_cycle VARCHAR(20),
  storage_limit_bytes BIGINT DEFAULT 0,
  storage_used_bytes BIGINT DEFAULT 0,
  last_payment_at TIMESTAMPTZ,
  last_payment_amount DECIMAL(10,2),
  last_payment_order_id VARCHAR(255),
  last_payment_plan_id VARCHAR(50),
  last_payment_cycle VARCHAR(20),
  next_billing_at TIMESTAMPTZ,
  root_folder_id VARCHAR(255),
  shared_root_folder_ids TEXT[] DEFAULT '{}',
  shared_with_usernames TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Earnings table
CREATE TABLE earnings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  transaction_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Download earnings table
CREATE TABLE download_earnings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  username VARCHAR(255) REFERENCES users(username),
  file_id VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2),
  net_amount DECIMAL(10,2),
  gross_amount DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Withdraw requests table
CREATE TABLE withdraw_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  username VARCHAR(255) REFERENCES users(username),
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  method VARCHAR(20) NOT NULL, -- 'bank' or 'ewallet'
  bank_name VARCHAR(100),
  provider VARCHAR(100) NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Restrictions table
CREATE TABLE restrictions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  file_id VARCHAR(255) NOT NULL, -- Google Drive file ID
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_restricted BOOLEAN DEFAULT TRUE,
  restriction_type VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Download orders table
CREATE TABLE download_orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id VARCHAR(255) UNIQUE NOT NULL,
  file_id VARCHAR(255) NOT NULL, -- Google Drive file ID
  owner_username VARCHAR(255) REFERENCES users(username),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'IDR',
  status VARCHAR(20) DEFAULT 'pending',
  token VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Download tokens table
CREATE TABLE download_tokens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  token VARCHAR(255) UNIQUE NOT NULL,
  file_id VARCHAR(255) NOT NULL, -- Google Drive file ID
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_valid BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Paid downloads table
CREATE TABLE paid_downloads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  file_id VARCHAR(255) NOT NULL, -- Google Drive file ID
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  purchaser_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount_paid DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  transaction_id VARCHAR(255),
  download_count INTEGER DEFAULT 0,
  enabled BOOLEAN DEFAULT FALSE,
  price DECIMAL(10,2) DEFAULT 0,
  owner_username VARCHAR(255),
  preview_enabled BOOLEAN DEFAULT TRUE, -- Whether preview is enabled for this paid file
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to increment download count
CREATE OR REPLACE FUNCTION increment_download_count(row_file_id VARCHAR, new_updated_at TIMESTAMPTZ)
RETURNS void AS $$
BEGIN
  UPDATE paid_downloads
  SET download_count = COALESCE(download_count, 0) + 1,
      updated_at = new_updated_at
  WHERE file_id = row_file_id;
END;
$$ LANGUAGE plpgsql;

-- Indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_restrictions_file_id ON restrictions(file_id);
CREATE INDEX idx_paid_downloads_file_id ON paid_downloads(file_id);
CREATE INDEX idx_earnings_user_id ON earnings(user_id);
CREATE INDEX idx_download_earnings_username ON download_earnings(username);
CREATE INDEX idx_withdraw_requests_username ON withdraw_requests(username);
CREATE INDEX idx_download_orders_file_id ON download_orders(file_id);
CREATE INDEX idx_download_orders_order_id ON download_orders(order_id);
CREATE INDEX idx_download_tokens_token ON download_tokens(token);