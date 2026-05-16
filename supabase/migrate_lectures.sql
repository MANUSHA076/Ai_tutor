-- Run in Supabase SQL Editor (keeps your title, description, content columns)
-- https://supabase.com/dashboard/project/wkdcypzmvcqemslxdkqv/sql/new

alter table lectures add column if not exists subject text;
alter table lectures add column if not exists duration text;
alter table lectures add column if not exists date date;
alter table lectures add column if not exists date_label text;
alter table lectures add column if not exists instructor text;
alter table lectures add column if not exists instructor_initials text;
alter table lectures add column if not exists thumb_class text default 'thumb-physics';

-- Sample rows (skip if you already have data)
insert into lectures (
  title, description, content, subject, duration, date, date_label,
  instructor, instructor_initials, thumb_class
) values
  (
    'Introduction to Quantum Physics',
    'Wave functions and measurement',
    'Full lecture script here...',
    'Physics', '45:20', '2023-10-24', 'Oct 24, 2023',
    'Dr. Einstein AI', 'DE', 'thumb-physics'
  ),
  (
    'Advanced React Hooks & Patterns',
    'Hooks, context, and performance',
    'Full lecture script here...',
    'CS', '32:15', '2023-10-18', 'Oct 18, 2023',
    'Prof. Code AI', 'PC', 'thumb-cs'
  ),
  (
    'Linear Algebra Fundamentals',
    'Vectors and matrices',
    'Full lecture script here...',
    'Math', '58:40', '2023-10-12', 'Oct 12, 2023',
    'Dr. Matrix AI', 'DM', 'thumb-math'
  );
