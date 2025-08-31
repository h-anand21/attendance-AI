/**
 * This file contains the SQL script to set up the database schema.
 * You can run this script in your Neon SQL Editor to create the 'tasks' table.
 *
 * To connect your database, make sure you have the `DATABASE_URL`
 * environment variable set in your Netlify project settings.
 * The `@netlify/neon` build plugin will automatically make this
 * available to your functions.
 *
 * Example DATABASE_URL format:
 * postgres://<user>:<password>@<endpoint_hostname>.neon.tech/<project_name>?sslmode=require
 */

-- Create the tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  text VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Insert some sample data to get started
INSERT INTO tasks (text, completed) VALUES
('Set up Neon database with Netlify', true),
('Create a CRUD API route in Next.js', true),
('Test the API endpoints', false),
('Build a frontend to interact with the API', false);
